#!/usr/bin/env python3
"""Site verification harness for the hiring-portfolio rebuild.

Run from the repo root after a Hugo build:

    python scripts/check_site.py

Prints a PASS/FAIL line per route and a summary (`OK 28/28`), exiting 0
when everything passes and 1 otherwise. Each task of the plan adds its
assertions to main()/check_route(). Stdlib only, plus PyMuPDF (fitz,
already installed) for the Task 11 CV PDF checks.
"""

import json
import re
import sys
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

try:
    import fitz  # PyMuPDF: Task 11 CV text/page checks only.
except ImportError:  # pragma: no cover - reported as a check failure.
    fitz = None

ROOT = Path(__file__).resolve().parent.parent

ROUTES = [
    # Spanish is the default language and lives at the root; English at /en/.
    "/", "/about/", "/projects/", "/contact/", "/privacy/",
    "/repositories/", "/cv/",
    "/en/", "/en/about/", "/en/projects/", "/en/contact/", "/en/privacy/",
    "/en/repositories/", "/en/cv/",
    # The blog only exists in English.
    "/en/blog/", "/en/blog/search/", "/en/blog/tags/", "/en/blog/tags/hls/",
    "/en/blog/archives/", "/en/blog/faq/",
    "/en/blog/2026/11/09/how-subany-video-works/",
    "/en/blog/2026/11/23/welding-defects-detection/",
    "/en/blog/index.json", "/en/blog/index.xml",
    "/index.xml", "/sitemap.xml",
    "/propovcs2/", "/cleanyourmail/",
    "/es/", "/es/blog/", "/blog/", "/blog/2026/11/09/como-funciona-subany-video/",
    # Preserved routes outside the rebuild: /work/ is a redirect stub;
    # /cs2pov/ and /murdoku/ are standalone app pages.
    "/work/", "/cs2pov/", "/murdoku/",
]

BASE_URL = "https://jparedesds.com"

# Task 2: EN/ES page pairs. Slugs are identical in both languages; the
# blog stays English-only and is deliberately absent from this list.
PAGE_PAIRS = [
    ("/", "/en/"),
    ("/about/", "/en/about/"),
    ("/projects/", "/en/projects/"),
    ("/contact/", "/en/contact/"),
    ("/privacy/", "/en/privacy/"),
    ("/repositories/", "/en/repositories/"),
    ("/cv/", "/en/cv/"),
]

# Controller ruling (Task 1 review, extended by the Task 7 review and
# the final review): these preserved static meta-refresh stubs are
# redirects, not content pages, so they may skip <main> and the
# social-card tags. The exemption is this explicit named list only;
# check_sharing() additionally proves each stub really is a noindex
# meta-refresh redirect to its approved target. The STANDALONE_PAGES
# below are likewise exempt from the social tags. Every other HTML
# route must contain <main and carry the full social tag set.
REDIRECT_STUBS = {
    "/propovcs2/",
    "/cleanyourmail/",
    "/blog/2026/11/09/como-funciona-subany-video/",
    "/es/",
    "/es/blog/",
    "/blog/",
    "/work/",
}

# Where each redirect stub must point (final review): the refresh target
# is asserted, not just its presence. Values compare after _norm().
REFRESH_TARGETS = {
    "/propovcs2/": "https://propovcs2.com/",
    "/cleanyourmail/": "https://cleanyourmail.org/",
    "/blog/2026/11/09/como-funciona-subany-video/":
        "/en/blog/2026/11/09/how-subany-video-works/?lang=es",
    "/es/": "/",
    "/es/blog/": "/en/blog/",
    "/blog/": "/en/blog/",
    "/work/": "/projects/",
}

# Preserved standalone app pages (final review): they ship their own
# markup, not the rebuilt dark shell, so they are exempt from the
# social-tag, menu, consent, footer and pulse assertions — but they are
# still routes that must exist and render <main>.
STANDALONE_PAGES = {
    "/cs2pov/",
    "/murdoku/",
}


class _RefreshParser(HTMLParser):
    """Collect url= targets from <meta http-equiv="refresh"> tags only."""

    def __init__(self):
        super().__init__()
        self.has_refresh = False
        self.targets = []

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        attrs = {name: value or "" for name, value in attrs}
        if attrs.get("http-equiv", "").strip().lower() != "refresh":
            return
        self.has_refresh = True
        for part in attrs.get("content", "").split(";"):
            part = part.strip()
            if part.lower().startswith("url="):
                target = part[4:].strip().strip("'\"")
                if target:
                    self.targets.append(target)


class _LangParser(HTMLParser):
    """Collect hreflang alternates, hreflang anchors, canonical and anchors."""

    def __init__(self):
        super().__init__()
        self.alternates = []  # (hreflang, href) from <link rel=alternate>
        self.lang_links = []  # (href, hreflang, aria-current) from <a>
        self.canonical = None
        self.anchors = []  # (href, visible text)
        self._anchor_href = None
        self._anchor_text = []

    def handle_starttag(self, tag, attrs):
        attrs = {name: value or "" for name, value in attrs}
        if tag == "link":
            rel = attrs.get("rel", "").strip().lower()
            if rel == "alternate" and attrs.get("hreflang"):
                self.alternates.append((attrs["hreflang"], attrs.get("href", "")))
            elif rel == "canonical":
                self.canonical = attrs.get("href", "")
        elif tag == "a":
            if attrs.get("hreflang"):
                self.lang_links.append(
                    (attrs.get("href", ""), attrs["hreflang"],
                     attrs.get("aria-current", "")))
            self._anchor_href = attrs.get("href", "")
            self._anchor_text = []

    def handle_data(self, data):
        if self._anchor_href is not None:
            self._anchor_text.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self._anchor_href is not None:
            self.anchors.append(
                (self._anchor_href, "".join(self._anchor_text).strip()))
            self._anchor_href = None


def page(route):
    """Map a route to its built file: dir routes end in index.html."""
    suffix = route + "index.html" if route.endswith("/") else route
    return ROOT / "dist" / suffix.lstrip("/")


def _norm(href):
    """Compare permalinks and root-relative URLs on equal footing."""
    if href.startswith(BASE_URL):
        return href[len(BASE_URL):] or "/"
    return href


def _has_selector(text):
    """True when the selector markup is rendered, not just its CSS.

    The .langSwitchSite styles ship in the shared <style> block on every
    page, so a bare substring match would also hit blog pages.
    """
    return 'class="langSwitchSite"' in text or "class=langSwitchSite" in text


def _parse(route):
    """Return (text, _LangParser) for a built HTML route, or (None, None)."""
    path = page(route)
    if not path.is_file():
        return None, None
    text = path.read_text(encoding="utf-8")
    parser = _LangParser()
    parser.feed(text)
    parser.close()
    return text, parser


def check_i18n():
    """Task 2 cross-language assertions: (label, failures) pairs."""
    checks = []

    for es_route, en_route in PAGE_PAIRS:
        failures = []
        en_text, en_parser = _parse(en_route)
        es_text, es_parser = _parse(es_route)
        if en_parser is None:
            failures.append("missing EN page " + en_route)
        if es_parser is None:
            failures.append("missing ES page " + es_route)
        if en_parser is not None and es_parser is not None:
            # Reciprocal hreflang: en, es and x-default (pointing at EN)
            # on both sides of the pair.
            for label, parser in (("EN", en_parser), ("ES", es_parser)):
                alternates = {lang: _norm(href)
                              for lang, href in parser.alternates}
                for lang, want in (("en", en_route), ("es", es_route),
                                   ("x-default", es_route)):
                    if alternates.get(lang) != want:
                        failures.append(
                            "%s page: hreflang=%s is %r, want %r"
                            % (label, lang, alternates.get(lang), want))
            # Selector links with hreflang and aria-current on the
            # active language only.
            for label, text, parser, active, other in (
                    ("EN", en_text, en_parser, en_route, es_route),
                    ("ES", es_text, es_parser, es_route, en_route)):
                if not _has_selector(text):
                    failures.append("%s page: no langSwitchSite selector" % label)
                links = {(_norm(href), lang): current
                         for href, lang, current in parser.lang_links}
                active_lang = "en" if label == "EN" else "es"
                other_lang = "es" if label == "EN" else "en"
                if links.get((active, active_lang)) != "true":
                    failures.append(
                        "%s page: active %s link lacks aria-current=true"
                        % (label, active_lang))
                if links.get((other, other_lang)) != "":
                    failures.append(
                        "%s page: inactive %s link must not set aria-current"
                        % (label, other_lang))
        checks.append(("i18n pair %s <-> %s" % (en_route, es_route), failures))

    # The blog keeps its own in-article EN/ES toggle: the site selector
    # must stay hidden on every /en/blog... page and visible on the root.
    for route in ("/en/blog/", "/en/blog/2026/11/09/how-subany-video-works/"):
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        elif _has_selector(text):
            failures.append("blog page must not render langSwitchSite")
        checks.append(("selector hidden on " + route, failures))
    text, _ = _parse("/")
    checks.append(("selector visible on /",
                   [] if text is not None and _has_selector(text)
                   else ["missing page or no langSwitchSite selector"]))

    # /es/blog/ is a static redirect back to the English-only blog.
    failures = []
    text, parser = _parse("/es/blog/")
    if parser is None:
        failures.append("missing /es/blog/index.html")
    else:
        refresh = _RefreshParser()
        refresh.feed(text)
        refresh.close()
        if not any(_norm(t) == "/en/blog/" for t in refresh.targets):
            failures.append("no meta refresh to /en/blog/")
        if _norm(parser.canonical or "") != "/en/blog/":
            failures.append("canonical is %r, want %s/en/blog/"
                            % (parser.canonical, BASE_URL))
        if not any(_norm(href) == "/en/blog/" and text_
                   for href, text_ in parser.anchors):
            failures.append("no visible link to /en/blog/")
    checks.append(("/es/blog/ redirect", failures))

    return checks


# Task 3: hiring strip on both home pages. Copy is the approved text,
# verbatim. Task 11: each language links its own CV (/resume.pdf EN,
# /resume-es.pdf ES). Hugo's minifier drops quotes around simple
# attribute values, so href checks accept both forms.
HIRE_COPY = {
    "/": {
        "lang": "es",
        "role": "Ingeniero de Computer Vision y ML",
        "bio": ("Construyo sistemas de visión artificial para control de "
                "calidad industrial y productos de IA que se ejecutan en "
                "local."),
        "availability": "Madrid · Abierto a oportunidades",
        "proof": ("Visión artificial industrial desde 2024 · 10+ modelos "
                  "en Hugging Face · DocFlow en producción"),
        "proof_marker": "desde 2024",
        "cv": "Descargar CV",
        "cv_url": "/cv/",
        "email": "Escríbeme",
        "projects": "Proyectos activos",
        "banned": ("cuatro años", "4 años"),
    },
    "/en/": {
        "lang": "en",
        "role": "Computer Vision & ML Engineer",
        "bio": ("I build computer-vision systems for industrial quality "
                "control and local-first AI products."),
        "availability": "Madrid · Open to opportunities",
        "proof": ("Industrial computer vision since 2024 · 10+ models on "
                  "Hugging Face · DocFlow in production"),
        "proof_marker": "since 2024",
        "cv": "Download CV",
        "cv_url": "/en/cv/",
        "email": "Email me",
        "projects": "Active projects",
        "banned": ("four years", "4 years"),
    },
}

HIRE_MAILTO = ("mailto:jparedescolmenarejo@gmail.com"
               "?subject=Oportunidad%20CV%20/%20ML")


def _href_present(text, href):
    """True for href="x" and the minified unquoted href=x alike."""
    return ('href="%s"' % href) in text or ("href=" + href) in text


def _class_pos(text, name):
    """Position of class="name" / class=name, or -1 when absent."""
    for needle in ('class="%s"' % name, "class=%s>" % name,
                   "class=%s " % name):
        pos = text.find(needle)
        if pos != -1:
            return pos
    return -1


def check_hiring():
    """Task 3 hiring-strip assertions: (label, failures) pairs."""
    checks = []

    for route, copy in HIRE_COPY.items():
        failures = []
        text, parser = _parse(route)
        if parser is None:
            checks.append(("hiring strip " + route, ["missing page"]))
            continue

        lang = copy["lang"]
        if not (("<html lang=%s>" % lang) in text
                or ('<html lang="%s">' % lang) in text):
            failures.append("html lang is not %r" % lang)
        for key in ("role", "bio", "availability", "proof", "projects"):
            # The minifier may render & as &amp; or bare; accept both.
            wanted = copy[key]
            if wanted not in text and wanted.replace("&", "&amp;") not in text:
                failures.append("missing %s copy: %r" % (key, wanted))
        if copy["proof_marker"] not in text:
            failures.append("proof lacks %r" % copy["proof_marker"])
        lowered = text.casefold()
        for phrase in copy["banned"]:
            if phrase.casefold() in lowered:
                failures.append("banned phrase present: %r" % phrase)
        # The role is a real h2 in the heading outline (final review),
        # not a styled paragraph.
        if re.search(r'<h2\b[^>]*\bclass=(?:"profileRole"'
                     r'|profileRole(?=[\s>]))', text) is None:
            failures.append("role is not an h2.profileRole")
        if re.search(r'<p\b[^>]*\bclass=(?:"profileRole"'
                     r'|profileRole(?=[\s>]))', text) is not None:
            failures.append("role still rendered as p.profileRole")
        for cls in ("hireStrip", "hireAvailability", "hireProof",
                    "hireActions"):
            if _class_pos(text, cls) == -1:
                failures.append("no .%s markup" % cls)

        # CV button: labelled "Download CV"/"Descargar CV" and linked to
        # the CV page, where the PDF lives.
        cv_url = copy["cv_url"]
        if not _href_present(text, cv_url):
            failures.append('no href="%s"' % cv_url)
        if not any(_norm(href) == cv_url and label == copy["cv"]
                   for href, label in parser.anchors):
            failures.append("no CV button labelled %r" % copy["cv"])

        # Email button: mailto with the approved subject.
        if not _href_present(text, HIRE_MAILTO):
            failures.append("no mailto with subject: %s" % HIRE_MAILTO)
        if not any(href == HIRE_MAILTO and label == copy["email"]
                   for href, label in parser.anchors):
            failures.append("no email button labelled %r" % copy["email"])

        # Role and proof must render before the active-project chips.
        role_pos = text.find(copy["role"])
        if role_pos == -1:
            role_pos = text.find(copy["role"].replace("&", "&amp;"))
        proof_pos = text.find(copy["proof"])
        chips_pos = _class_pos(text, "activeProjects")
        if not (-1 < role_pos < proof_pos < chips_pos):
            failures.append(
                "order wrong: role@%d proof@%d chips@%d"
                % (role_pos, proof_pos, chips_pos))
        checks.append(("hiring strip " + route, failures))

    # The CV link targets must actually ship, in both languages.
    failures = []
    for name in ("resume.pdf", "resume-es.pdf"):
        if not (ROOT / "dist" / name).is_file():
            failures.append("dist/%s missing" % name)
    checks.append(("CV PDFs shipped", failures))

    # Mobile CV/email buttons keep a 44px touch target (final review):
    # min-height:44px must sit in the .hireActions a rule inside the
    # max-width:768px media query, not in the desktop rule.
    failures = []
    text, _ = _parse("/")
    if text is None:
        failures.append("missing page")
    else:
        style = re.search(r"<style>([\s\S]*?)</style>", text)
        css = style.group(1) if style else ""
        found = False
        for m in re.finditer(r"@media[^{]*\{", css):
            if "max-width:768px" not in re.sub(r"\s+", "", m.group(0)):
                continue
            body = _brace_body(css, m.end() - 1)
            if body is None:
                continue
            compact = re.sub(r"\s+", "", body)
            pos = compact.find(".hireActionsa{")
            if pos == -1:
                continue
            rule = _brace_body(compact, pos + len(".hireActionsa"))
            if rule and "min-height:44px" in rule:
                found = True
        if not found:
            failures.append("no min-height:44px in the mobile "
                            ".hireActions a rule")
    checks.append(("hire buttons mobile touch target", failures))
    return checks


# Task 4: three case studies on Projects. Facts are fixed by the plan;
# "500+" belongs to the correo->ERP automation and lives in About, so it
# is banned here. Each fact lists the accepted spellings (the minifier
# keeps text as authored, but en/em dashes may vary by copy).
CASE_ANCHORS = ("vision", "docflow", "subany")
# Diagrams are localized: each language must reference its own variants
# (review ruling); the subany capture is shared.
CASE_DIAGRAMS = {
    "/projects/": ("case-vision-es.svg", "case-docflow-es.svg"),
    "/en/projects/": ("case-vision.svg", "case-docflow.svg"),
}
CASE_IMAGES = ("case-vision.svg", "case-docflow.svg",
               "case-vision-es.svg", "case-docflow-es.svg", "case-subany.png")
# Review ruling: only the fixed-fact stack may appear. "HLS" covers both
# "HLS player" (EN) and "reproductor HLS" (ES); matched case-insensitive.
CASE_BANNED = ("PyTorch", "hls.js", "HLS")
CASE_MODEL_URL = ("https://huggingface.co/jparedesDS/"
                  "fluorescent-penetrant-inspection")
CASE_FACTS = {
    "/projects/": [
        ("21 routers",),
        ("24 servicios",),
        ("24 pantallas",),
        ("0–40 ms", "0-40 ms"),
        ("15,3",),
    ],
    "/en/projects/": [
        ("21 API routers",),
        ("24 services",),
        ("24 screens",),
        ("0–40 ms", "0-40 ms"),
        ("15.3",),
    ],
}
SUBANY_ARTICLE = "/en/blog/2026/11/09/how-subany-video-works/"
# Final review: the public docflow repository is DocFlow Lite, a
# CustomTkinter desktop app — not the internal SaaS the case describes.
# The link label and the clarifying sentence are pinned; the old
# "Code on GitHub" wording must not return.
DOCFLOW_REPO_URL = "https://github.com/jparedesDS/docflow"
DOCFLOW_LITE = {
    "/projects/": {
        "label": "DocFlow Lite en GitHub",
        "sentence": ("El repositorio público es DocFlow Lite, una "
                     "aplicación de escritorio en CustomTkinter; el "
                     "SaaS descrito aquí es interno."),
        "old_label": "Código en GitHub",
    },
    "/en/projects/": {
        "label": "DocFlow Lite on GitHub",
        "sentence": ("The public repository is DocFlow Lite, a "
                     "CustomTkinter desktop app; the SaaS described "
                     "here is internal."),
        "old_label": "Code on GitHub",
    },
}
ACTIVE_PRODUCT_URLS = (
    "https://subany.video/",
    "https://subany.site/",
    "https://www.cleanyourphone.org/",
    "https://www.cleanyourmail.org/",
    "https://propovcs2.com/",
)


def _attr(tag, name):
    """Attribute value from a raw start tag, quoted or minified-bare."""
    match = re.search(r'\b%s=(?:"([^"]*)"|([^\s>]+))' % name, tag)
    if match is None:
        return None
    return match.group(1) if match.group(1) is not None else match.group(2)


def check_cases():
    """Task 4 case-study assertions: (label, failures) pairs."""
    checks = []

    for route, facts in CASE_FACTS.items():
        failures = []
        text, parser = _parse(route)
        if text is None:
            checks.append(("cases " + route, ["missing page"]))
            continue

        # Anchors must sit on the case h3 headings, in order, under an h2.
        h1_pos = text.find("<h1")
        h2_pos = text.find("<h2")
        h3_pos = text.find("<h3")
        if not (-1 < h1_pos < h2_pos < h3_pos):
            failures.append("heading order wrong: h1@%d h2@%d h3@%d"
                            % (h1_pos, h2_pos, h3_pos))
        anchor_positions = []
        for anchor in CASE_ANCHORS:
            match = re.search(
                r'<h3\b[^>]*\bid=(?:"%s"|%s(?=[\s>]))' % (anchor, anchor),
                text)
            if match is None:
                failures.append('no h3 with id="%s"' % anchor)
            else:
                anchor_positions.append(match.start())
        if len(anchor_positions) == len(CASE_ANCHORS):
            if anchor_positions != sorted(anchor_positions):
                failures.append("case anchors out of order")
            if h2_pos != -1 and anchor_positions[0] < h2_pos:
                failures.append("first case h3 precedes the section h2")

        for alternatives in facts:
            if not any(alt in text for alt in alternatives):
                failures.append("missing fact: %s" % " / ".join(alternatives))
        # The claim bans apply to the page copy (<main>), not to the
        # head: the shared social-card alt describes the card's stack
        # chips (PyTorch among them) on every page (final review).
        main = _main_html(text) or ""
        if "500+" in main:
            failures.append("banned figure 500+ present (belongs in About)")
        lowered = main.casefold()
        for claim in CASE_BANNED:
            if claim.casefold() in lowered:
                failures.append("unapproved claim present: %r" % claim)
        if not _href_present(text, CASE_MODEL_URL):
            failures.append("direct penetrant model URL missing: "
                            + CASE_MODEL_URL)

        if _class_pos(text, "caseList") == -1:
            failures.append("no .caseList markup")
        case_count = len(re.findall(
            r'<section\b[^>]*\bclass=(?:"case"|case(?=[\s>]))', text))
        if case_count != 3:
            failures.append("expected 3 .case sections, found %d" % case_count)
        if not _href_present(text, SUBANY_ARTICLE):
            failures.append("no link to the subany article %s" % SUBANY_ARTICLE)

        # Every referenced local image must ship; each case image must be
        # referenced with meaningful alt text, and diagrams must match the
        # page language (no EN diagrams on /es/, no ES diagrams on /).
        imgs = re.findall(r"<img\b[^>]*>", text)
        srcs = {}
        for tag in imgs:
            src = _attr(tag, "src") or ""
            srcs[src] = tag
            if src.startswith("/images/"):
                if not (ROOT / "dist" / src.lstrip("/")).is_file():
                    failures.append("referenced image missing: " + src)
        for name in CASE_DIAGRAMS[route] + ("case-subany.png",):
            src = "/images/" + name
            tag = srcs.get(src)
            if tag is None:
                failures.append("case image not referenced: " + src)
            elif not (_attr(tag, "alt") or "").strip():
                failures.append("case image lacks alt text: " + src)
        for other_route, names in CASE_DIAGRAMS.items():
            if other_route == route:
                continue
            for name in names:
                if "/images/" + name in srcs:
                    failures.append("foreign-language diagram referenced: "
                                    + name)

        # Active products and the archive/GitHub link stay below the cases.
        for url in ACTIVE_PRODUCT_URLS:
            if not _href_present(text, url):
                failures.append("active product link missing: " + url)
        if not _href_present(text, "https://github.com/jparedesDS"):
            failures.append("archive GitHub link missing")

        # The DocFlow evidence link names the Lite desktop repo, and the
        # case says the SaaS itself is internal (final review).
        lite = DOCFLOW_LITE[route]
        if not any(href == DOCFLOW_REPO_URL and label == lite["label"]
                   for href, label in parser.anchors):
            failures.append("no link labelled %r to %s"
                            % (lite["label"], DOCFLOW_REPO_URL))
        if lite["sentence"] not in text:
            failures.append("missing Lite clarification: %r"
                            % lite["sentence"])
        if lite["old_label"] in text:
            failures.append("old evidence label present: %r"
                            % lite["old_label"])
        checks.append(("cases " + route, failures))

    # The three case images ship at 1200x675 (SVG root size / PNG IHDR).
    failures = []
    for name in CASE_IMAGES:
        path = ROOT / "dist" / "images" / name
        if not path.is_file():
            failures.append("dist/images/%s missing" % name)
            continue
        if name.endswith(".svg"):
            svg = path.read_text(encoding="utf-8")
            if 'width="1200"' not in svg or 'height="675"' not in svg:
                failures.append("%s is not 1200x675" % name)
        else:
            data = path.read_bytes()
            size = (int.from_bytes(data[16:20], "big"),
                    int.from_bytes(data[20:24], "big"))
            if data[:8] != b"\x89PNG\r\n\x1a\n" or size != (1200, 675):
                failures.append("%s is not a 1200x675 PNG (got %r)"
                                % (name, size))
    checks.append(("case images shipped 1200x675", failures))
    return checks


# Task 5: About aligned with the CV. Figures are fixed by the plan; the
# EIPSA tenure is "since 2024" — never "four years"/"4 years" or the ES
# equivalents. Kaggle is a "bronze medal", never a podium place. Task
# 11: the ES CV link points at /resume-es.pdf, EN keeps /resume.pdf.
# Review round 1: facts are scoped to the section that owns them and
# matched as distinctive phrases, so a figure mentioned elsewhere on the
# page (Tableau in Stack, DocFlow in Projects, Kaggle in Contact) cannot
# mask a deleted bullet. "95%+" keeps its plus; the approved ES wording
# is "al menos el 95%".
ABOUT_INTRO_FACTS = {
    "/about/": [("Idiomas:",), ("nativo",), ("B2",)],
    "/en/about/": [("Languages:",), ("native",), ("B2",)],
}
ABOUT_SCOPE_FACTS = {
    "/about/": {
        "Experiencia": [
            ("DocFlow",),
            ("SaaS interno en producción",),
            ("21 routers",),
            ("24 capas de servicio",),
            ("24 pantallas",),
            ("80% menos de tiempo de procesado manual",),
            ("500+ documentos entrantes al mes",),
            ("Cuadros de mando en Tableau para el seguimiento de la "
             "documentación de proyectos",),
            ("10.000+", "10,000+"),
            ("25%",),
            ("50+",),
            ("95%+", "al menos el 95%"),
        ],
        "Proyectos abiertos": [
            ("33+",),
            ("268+",),
            ("10+",),
            ("Kaggle",),
            ("medalla de bronce en clasificación multilabel de imágenes",),
            ("ResNet152",),
        ],
    },
    "/en/about/": {
        "Experience": [
            ("DocFlow",),
            ("internal SaaS in production",),
            ("21 API routers",),
            ("24 service layers",),
            ("24 frontend screens",),
            ("80% less manual processing time",),
            ("500+ incoming documents per month",),
            ("Tableau dashboards for project documentation tracking",),
            ("10,000+",),
            ("25%",),
            ("50+",),
            ("95%+",),
        ],
        "Open projects": [
            ("33+",),
            ("268+",),
            ("10+",),
            ("Kaggle",),
            ("bronze medal in multilabel image classification",),
            ("ResNet152",),
        ],
    },
}
ABOUT_SECTIONS = {
    "/about/": ("Proyectos", "Proyectos abiertos", "Stack", "Experiencia",
                "Formación"),
    "/en/about/": ("Projects", "Open projects", "Stack", "Experience",
                   "Education"),
}
ABOUT_BANNED = ("four years", "4 years", "cuatro años", "4 años",
                "3rd place", "3er puesto", "tercer puesto")


def _section_html(text, heading):
    """HTML of the h2 section titled `heading`, up to the next h2."""
    start = re.search(r"<h2\b[^>]*>\s*%s\s*</h2>" % re.escape(heading), text)
    if start is None:
        return None
    rest = text[start.end():]
    nxt = rest.find("<h2")
    return rest if nxt == -1 else rest[:nxt]


def check_about():
    """Task 5 About/CV assertions: (label, failures) pairs."""
    checks = []

    for route, intro_facts in ABOUT_INTRO_FACTS.items():
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("about " + route, ["missing page"]))
            continue

        for alternatives in intro_facts:
            if not any(alt in text for alt in alternatives):
                failures.append("missing fact: %s" % " / ".join(alternatives))
        for heading, facts in ABOUT_SCOPE_FACTS[route].items():
            section = _section_html(text, heading)
            if section is None:
                failures.append("missing section: %r" % heading)
                continue
            for alternatives in facts:
                if not any(alt in section for alt in alternatives):
                    failures.append("missing fact in %s: %s"
                                    % (heading, " / ".join(alternatives)))
        lowered = text.casefold()
        for phrase in ABOUT_BANNED:
            if phrase.casefold() in lowered:
                failures.append("banned phrase present: %r" % phrase)
        if route == "/about/" and "provisional" in lowered:
            failures.append("provisional stub notice still present")
        for name in ABOUT_SECTIONS[route]:
            if re.search(r"<h2\b[^>]*>\s*%s\s*</h2>" % re.escape(name),
                         text) is None:
                failures.append("missing h2 section: %r" % name)

        # CV link sits right under the intro paragraph: after the h1 and
        # before the first section h2. Each language links its own PDF.
        cv_url = "/resume-es.pdf" if route == "/about/" else "/resume.pdf"
        cv = re.search(
            r'<a\b[^>]*href=(?:"%s"|%s)[^>]*>'
            % (re.escape(cv_url), re.escape(cv_url)), text)
        h1_pos = text.find("<h1")
        h2_pos = text.find("<h2")
        if cv is None:
            failures.append('no href="%s"' % cv_url)
        elif not (-1 < h1_pos < cv.start() < h2_pos):
            failures.append(
                "CV link not between h1 and first h2: h1@%d cv@%d h2@%d"
                % (h1_pos, cv.start(), h2_pos))

        # Legacy deep links (/about/#projects) keep resolving.
        if 'id="projects"' not in text and "id=projects" not in text:
            failures.append('no id="projects" anchor')
        checks.append(("about " + route, failures))

    return checks


# Final review: the positioning is Computer Vision & ML, not the old
# "data scientist and AI engineer" wording. The About intros and the
# global sitedescription (localized per language) carry the approved
# copy, and the old wording must be gone from every built page.
SITE_DESCRIPTIONS = {
    "en": ("Computer Vision & ML Engineer in Madrid. Industrial quality "
           "control and local-first AI products."),
    "es": ("Ingeniero de Computer Vision y ML en Madrid. Control de "
           "calidad industrial y productos de IA local-first."),
}
POSITIONING_OLD = ("data scientist and ai engineer",
                   "científico de datos e ingeniero de ia")
POSITIONING_INTROS = {
    "/about/": "Soy ingeniero de computer vision y ML y vivo en Madrid.",
    "/en/about/": "I am a computer vision and ML engineer based in Madrid.",
    "/en/blog/faq/": "a computer vision and ML engineer in Madrid",
}
# Pages that inherit the global sitedescription (no description of
# their own in front matter), mapped to the language they must use.
DESCRIPTION_ROUTES = {
    "/": "es", "/about/": "es", "/projects/": "es", "/contact/": "es",
    "/privacy/": "es", "/repositories/": "es", "/cv/": "es",
    "/en/": "en", "/en/about/": "en", "/en/projects/": "en",
    "/en/contact/": "en", "/en/privacy/": "en",
    "/en/blog/": "en", "/en/blog/search/": "en",
    "/en/blog/tags/": "en", "/en/blog/tags/hls/": "en",
    "/en/blog/archives/": "en", "/en/blog/faq/": "en",
}


def check_positioning():
    """Final-review positioning assertions: (label, failures) pairs."""
    checks = []

    # The old wording is gone from every built HTML page.
    failures = []
    for route in ROUTES:
        if not route.endswith(("/", ".html")):
            continue
        text, _ = _parse(route)
        if text is None:
            continue  # missing files already fail in check_route
        lowered = text.casefold()
        for phrase in POSITIONING_OLD:
            if phrase in lowered:
                failures.append("%s still says %r" % (route, phrase))
    checks.append(("old positioning gone", failures))

    # The new intros are present, verbatim.
    for route, intro in POSITIONING_INTROS.items():
        failures = []
        text, _ = _parse(route)
        if text is None:
            failures.append("missing page")
        elif intro not in text:
            failures.append("missing intro: %r" % intro)
        checks.append(("positioning intro " + route, failures))

    # The inherited meta description is the approved sitedescription,
    # in the page's own language (ES pages no longer inherit the EN
    # one).
    for route, lang in DESCRIPTION_ROUTES.items():
        failures = []
        text, _ = _parse(route)
        if text is None:
            failures.append("missing page")
        else:
            values = _meta_values(text, "name", "description")
            want = SITE_DESCRIPTIONS[lang]
            if len(values) != 1:
                failures.append("meta description appears %d times, "
                                "want 1" % len(values))
            elif unescape(values[0]) != want:
                failures.append("meta description is %r, want %r"
                                % (values[0], want))
        checks.append(("sitedescription " + route, failures))

    return checks


# Task 6: the Contact pages open with the approved availability line and
# link the email with a prefilled subject. The subject is the plan's value
# and is NOT translated: both languages must carry the very same string.
# Availability dates, salary figures, work-mode and relocation claims are
# not approved, so they are banned on both pages.
CONTACT_COPY = {
    "/contact/": {
        "lang": "es",
        "availability": "Madrid · Abierto a oportunidades",
        "intro": ("proyectos selectos de IA, visión por computador y "
                  "productos local-first"),
    },
    "/en/contact/": {
        "lang": "en",
        "availability": "Madrid · Open to opportunities",
        "intro": ("select AI, computer-vision and local-first product "
                  "work"),
    },
}
CONTACT_MAILTO = ("mailto:jparedescolmenarejo@gmail.com"
                  "?subject=Oportunidad%20CV%20/%20ML")
CONTACT_EMAIL = "jparedescolmenarejo@gmail.com"
# Same networks and same products on both pages (plan, Task 6 Step 2).
# The email link is checked separately (its href carries the subject).
CONTACT_NETWORKS = (
    "https://github.com/jparedesDS",
    "https://www.linkedin.com/in/jparedesDS/",
    "https://x.com/xhitoCS",
    "https://www.instagram.com/xhitoCS/",
    "https://huggingface.co/jparedesDS",
    "https://www.kaggle.com/joseparedesc",
)
CONTACT_PROJECTS = (
    "https://subany.video/",
    "https://subany.site/",
    "https://www.cleanyourphone.org/",
    "https://www.cleanyourmail.org/",
    "https://propovcs2.com/",
)
CONTACT_PROPOV_SOCIALS = (
    "https://propovcs2.com/",
    "https://www.youtube.com/@Pro.POV.CS2",
    "https://www.tiktok.com/@propov_cs2",
    "https://www.instagram.com/propovcs2",
    "https://x.com/ProPOVCS2",
    "https://www.twitch.tv/propovcs2",
    "https://kick.com/propovcs2",
)
CONTACT_BANNED = (
    "salary", "salario", "remuneración", "remuneracion",
    "relocation", "relocate", "mudarse", "trasladarse",
    "immediately", "inmediatamente",
    "presencial", "híbrido", "hibrido", "hybrid",
    "onsite", "on-site", "remote", "remoto",
)


def _main_html(text):
    """HTML inside <main>...</main>: the page copy, without the chrome."""
    match = re.search(r"<main\b[^>]*>([\s\S]*?)</main>", text)
    return match.group(1) if match else None


def _visible_text(html):
    """Visible text of an HTML fragment (tags stripped, entities decoded)."""
    return unescape(re.sub(r"<[^>]+>", "", html)).strip()


def _lead_paragraph(text):
    """HTML of the first <p> after the page h1 (the content lead).

    Returns None when the page has no h1, or no paragraph after it: the
    caller then fails loudly instead of matching a paragraph that belongs
    to the site chrome.
    """
    h1 = re.search(r"<h1\b", text)
    if h1 is None:
        return None
    para = re.search(r"<p[ >]", text[h1.end():])
    if para is None:
        return None
    start = h1.end() + para.start()
    end = text.find("</p>", start)
    return None if end == -1 else text[start:end]


def check_contact():
    """Task 6 Contact assertions: (label, failures) pairs."""
    checks = []

    for route, copy in CONTACT_COPY.items():
        failures = []
        text, parser = _parse(route)
        if parser is None:
            checks.append(("contact " + route, ["missing page"]))
            continue

        # The page copy is the <main> region. The claim checks below are
        # scoped to it, so nav, footer and script text cannot trip them.
        main = _main_html(text)
        if main is None:
            failures.append("no <main> region")
            main = ""

        # The lead paragraph starts with the approved availability line.
        lead = _lead_paragraph(text)
        if lead is None:
            failures.append("no lead paragraph after the h1")
        else:
            visible = _visible_text(lead)
            if not visible.startswith(copy["availability"]):
                failures.append("lead does not start with availability: %r"
                                % copy["availability"])
            if copy["intro"] not in visible:
                failures.append("lead lacks: %r" % copy["intro"])
        # Availability is stated once in the page copy. The count is
        # scoped to <main>: the head's social-card alt quotes the
        # card's own availability line (final review).
        if main.count(copy["availability"]) != 1:
            failures.append("availability appears %d times, want 1"
                            % main.count(copy["availability"]))

        # No availability date is approved: none anywhere in the copy.
        if re.search(r"\b(19|20)\d{2}\b", _visible_text(main)):
            failures.append("page copy contains a date (not approved)")

        # The page language must match the copy.
        match = re.search(r"<html[^>]*\blang=(\"([^\"]*)\"|([^\s>]+))", text)
        lang_value = ""
        if match is not None:
            lang_value = match.group(2) or match.group(3) or ""
        if not lang_value.startswith(copy["lang"]):
            failures.append("html lang is %r, want %r"
                            % (lang_value, copy["lang"]))

        # The email link carries the plan's prefilled subject.
        if not _href_present(text, CONTACT_MAILTO):
            failures.append("no mailto with subject: %s" % CONTACT_MAILTO)
        if not any(href == CONTACT_MAILTO and label == CONTACT_EMAIL
                   for href, label in parser.anchors):
            failures.append("no email link labelled %r" % CONTACT_EMAIL)

        # Same networks and same products on both pages.
        for url in CONTACT_NETWORKS:
            if not _href_present(text, url):
                failures.append("network link missing: %s" % url)
        for url in CONTACT_PROJECTS:
            if not _href_present(text, url):
                failures.append("project link missing: %s" % url)
        for url in CONTACT_PROPOV_SOCIALS:
            if not _href_present(text, url):
                failures.append("Pro POV link missing: %s" % url)
        if not _href_present(text, "https://buymeacoffee.com/joseparedes"):
            failures.append("Buy me a coffee link missing")

        # Unapproved claims are scanned in the page copy only.
        lowered = main.casefold()
        for phrase in CONTACT_BANNED:
            if phrase.casefold() in lowered:
                failures.append("unapproved claim present: %r" % phrase)
        checks.append(("contact " + route, failures))

    # Both languages must carry the same prefilled subject.
    subjects = {}
    for route in CONTACT_COPY:
        text, _ = _parse(route)
        match = re.search(
            r"mailto:jparedescolmenarejo@gmail\.com\?subject=([^\"'&\s>]+)",
            text or "")
        subjects[route] = match.group(1) if match else None
    failures = []
    if None in subjects.values() or len(set(subjects.values())) != 1:
        failures.append("subject differs between languages: %r" % subjects)
    checks.append(("contact subject identical in both languages", failures))

    return checks


# Task 7: social cards and Person structured data. Every rebuilt page
# (EN, ES and blog) carries the same 1200x630 card and, since the final
# review, the complete OG/Twitter object. The explicit REDIRECT_STUBS
# list is exempt (controller ruling, Task 7 review): those static
# documents are noindex meta-refresh redirects, not pages of the
# rebuilt site, and check_sharing() verifies each one as such. The
# STANDALONE_PAGES (cs2pov, murdoku) are preserved app pages outside
# the rebuild and keep their own markup, so they are exempt too.
# The Person JSON-LD lives on the home pages only, with the jobTitle
# translated. Home titles are the plan's exact strings (& may render
# as &amp;).
OG_IMAGE_URL = BASE_URL + "/og-image.png"
# The card is English-only: its alt describes the English wording on
# every page, in both languages (final review).
OG_IMAGE_ALT = ("Social card reading 'Jose Paredes — Computer Vision & "
                "ML Engineer' and 'Madrid · Open to opportunities', with "
                "Computer Vision, YOLO, PyTorch, FastAPI, React and "
                "Docker chips above jparedesds.com")
SHARING_ROUTES = [r for r in ROUTES
                  if r.endswith("/") and r not in REDIRECT_STUBS
                  and r not in STANDALONE_PAGES]
HOME_TITLES = {
    "/": "Jose Paredes — Ingeniero de Computer Vision y ML (Madrid)",
    "/en/": "Jose Paredes — Computer Vision & ML Engineer (Madrid)",
}
# Expected og:title per non-stub page (final review): the home pages
# share their full <title>, every other page its own .Title.
OG_TITLES = {
    "/": HOME_TITLES["/"],
    "/en/": HOME_TITLES["/en/"],
    "/about/": "Sobre mí",
    "/en/about/": "About",
    "/projects/": "Proyectos",
    "/en/projects/": "Projects",
    "/contact/": "Contacto",
    "/en/contact/": "Contact",
    "/privacy/": "Privacidad",
    "/en/privacy/": "Privacy",
    "/repositories/": "Repositorios",
    "/en/repositories/": "Repositories",
    "/cv/": "CV",
    "/en/cv/": "CV",
    "/en/blog/": "Blog",
    "/en/blog/search/": "Search",
    "/en/blog/tags/": "Tags",
    "/en/blog/tags/hls/": "Hls",
    "/en/blog/archives/": "Archive",
    "/en/blog/faq/": "FAQ",
    "/en/blog/2026/11/09/how-subany-video-works/":
        "How subany.video works: live subtitles in the browser",
    "/en/blog/2026/11/23/welding-defects-detection/":
        "Detecting welding defects with YOLO11x",
}
ARTICLE_ROUTES = {"/en/blog/2026/11/09/how-subany-video-works/",
                  "/en/blog/2026/11/23/welding-defects-detection/"}
PERSON_JOBTITLES = {
    "/": "Ingeniero de Computer Vision y ML",
    "/en/": "Computer Vision & ML Engineer",
}
PERSON_KNOWSABOUT = ("Computer Vision", "YOLO", "PyTorch", "FastAPI",
                     "React", "Docker")
PERSON_ALUMNI = ("The Bridge", "Padre Piquer")
# Approved-facts-only: the JSON-LD must carry exactly these top-level
# keys and exactly the approved collections — no extra facts (Task 7
# review).
PERSON_KEYS = {"@context", "@type", "name", "jobTitle", "url", "image",
               "address", "sameAs", "knowsAbout", "alumniOf"}
PERSON_ADDRESS_KEYS = {"@type", "addressLocality", "addressCountry"}


def _meta_values(text, key, name):
    """Content values of every <meta> whose `key` attribute equals name."""
    values = []
    for tag in re.findall(r"<meta\b[^>]*>", text):
        if _attr(tag, key) == name:
            values.append(_attr(tag, "content") or "")
    return values


def _jsonld_scripts(text):
    """Contents of every <script type=application/ld+json> block."""
    return re.findall(
        r"<script\b[^>]*\btype=(?:\"application/ld\+json\""
        r"|application/ld\+json(?=[\s>]))[^>]*>([\s\S]*?)</script>",
        text)


def check_sharing():
    """Task 7 social-card / JSON-LD assertions: (label, failures) pairs."""
    checks = []

    # The exemption is only legitimate while each listed stub really is
    # a noindex meta-refresh redirect (controller ruling, Task 7 review).
    for route in sorted(REDIRECT_STUBS):
        failures = []
        text, _ = _parse(route)
        if text is None:
            failures.append("missing page")
        else:
            refresh = _RefreshParser()
            refresh.feed(text)
            refresh.close()
            if not refresh.has_refresh or not refresh.targets:
                failures.append("no valid meta-refresh redirect")
            else:
                want_target = REFRESH_TARGETS.get(route)
                if want_target is not None and not any(
                        _norm(t) == _norm(want_target)
                        for t in refresh.targets):
                    failures.append("refresh targets %r, want %r"
                                    % (refresh.targets, want_target))
            robots = _meta_values(text, "name", "robots")
            if route != "/es/" and not any("noindex" in value for value in robots):
                failures.append("no noindex robots meta")
        checks.append(("redirect stub " + route, failures))

    for route in SHARING_ROUTES:
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("sharing " + route, ["missing page"]))
            continue

        # One absolute og:image pointing at a file that ships, plus the
        # alt text and the fixed dimensions.
        for prop, want in (("og:image", OG_IMAGE_URL),
                           ("og:image:width", "1200"),
                           ("og:image:height", "630")):
            values = _meta_values(text, "property", prop)
            if len(values) != 1:
                failures.append("%s appears %d times, want 1"
                                % (prop, len(values)))
            elif values[0] != want:
                failures.append("%s is %r, want %r" % (prop, values[0], want))
        alts = _meta_values(text, "property", "og:image:alt")
        if len(alts) != 1 or not alts[0].strip():
            failures.append("og:image:alt missing, empty or duplicated")
        elif unescape(alts[0]) != OG_IMAGE_ALT:
            failures.append("og:image:alt is %r, want the English card "
                            "description %r" % (alts[0], OG_IMAGE_ALT))
        images = _meta_values(text, "name", "twitter:image")
        if len(images) != 1 or images[0] != OG_IMAGE_URL:
            failures.append("twitter:image is %r, want one %s"
                            % (images, OG_IMAGE_URL))
        cards = _meta_values(text, "name", "twitter:card")
        if len(cards) != 1 or cards[0] != "summary_large_image":
            failures.append("twitter:card is %r, want one summary_large_image"
                            % cards)

        # No og:*/article:*/twitter:* meta may appear twice on a page.
        seen = {}
        for tag in re.findall(r"<meta\b[^>]*>", text):
            for key in ("property", "name"):
                value = _attr(tag, key) or ""
                if value.startswith(("og:", "article:", "twitter:")):
                    seen[value] = seen.get(value, 0) + 1
        for name, count in sorted(seen.items()):
            if count > 1:
                failures.append("duplicate meta %s (x%d)" % (name, count))

        # The complete OG/Twitter object, exactly once per tag (final
        # review): type, site_name, title, description, url, locale and
        # the twitter mirrors — not just the image tags.
        is_article = route in ARTICLE_ROUTES
        want_type = "article" if is_article else "website"
        want_locale = "en_US" if route.startswith("/en/") else "es_ES"
        for prop, want in (("og:type", want_type),
                           ("og:site_name", "Jose Paredes"),
                           ("og:title", OG_TITLES[route]),
                           ("og:url", BASE_URL + route),
                           ("og:locale", want_locale)):
            values = _meta_values(text, "property", prop)
            if len(values) != 1:
                failures.append("%s appears %d times, want 1"
                                % (prop, len(values)))
            elif unescape(values[0]) != want:
                failures.append("%s is %r, want %r"
                                % (prop, values[0], want))

        # og:description mirrors the page's own meta description (the
        # localized sitedescription where the page has none); the
        # twitter tags mirror their og counterparts.
        descriptions = _meta_values(text, "name", "description")
        og_desc = _meta_values(text, "property", "og:description")
        if len(descriptions) != 1 or not descriptions[0].strip():
            failures.append("meta description missing, empty or "
                            "duplicated")
        if len(og_desc) != 1:
            failures.append("og:description appears %d times, want 1"
                            % len(og_desc))
        elif descriptions and unescape(og_desc[0]) != unescape(descriptions[0]):
            failures.append("og:description %r differs from meta "
                            "description %r" % (og_desc[0], descriptions[0]))
        tw_titles = _meta_values(text, "name", "twitter:title")
        if len(tw_titles) != 1 or unescape(tw_titles[0]) != OG_TITLES[route]:
            failures.append("twitter:title is %r, want one %r"
                            % (tw_titles, OG_TITLES[route]))
        tw_descs = _meta_values(text, "name", "twitter:description")
        if len(tw_descs) != 1 or (og_desc and unescape(tw_descs[0])
                                  != unescape(og_desc[0])):
            failures.append("twitter:description is %r, want one copy of "
                            "og:description" % tw_descs)

        # Article-only tags: published_time and the ES alternate stay
        # on the article and appear nowhere else.
        published = _meta_values(text, "property", "article:published_time")
        alternates = _meta_values(text, "property", "og:locale:alternate")
        if is_article:
            if len(published) != 1 or not published[0].strip():
                failures.append("article:published_time missing, empty "
                                "or duplicated")
            if len(alternates) != 1 or alternates[0] != "es_ES":
                failures.append("og:locale:alternate is %r, want one "
                                "es_ES" % alternates)
        else:
            if published:
                failures.append("article:published_time off an article")
            if alternates:
                failures.append("og:locale:alternate off an article")

        # Person JSON-LD belongs to the home pages only.
        if route not in HOME_TITLES and _jsonld_scripts(text):
            failures.append("JSON-LD present off the home page")
        checks.append(("sharing " + route, failures))

    # The card assets ship: SVG source at 1200x630 in the Nightfall
    # palette, PNG rendered from it at the same size.
    failures = []
    svg_path = ROOT / "dist" / "og-image.svg"
    png_path = ROOT / "dist" / "og-image.png"
    if not svg_path.is_file():
        failures.append("dist/og-image.svg missing")
    else:
        svg = svg_path.read_text(encoding="utf-8")
        if 'width="1200"' not in svg or 'height="630"' not in svg:
            failures.append("og-image.svg is not 1200x630")
        for color in ("#292a2d", "#f8f8ff", "#80aadd"):
            if color not in svg:
                failures.append("og-image.svg lacks palette color " + color)
    if not png_path.is_file():
        failures.append("dist/og-image.png missing")
    else:
        data = png_path.read_bytes()
        size = (int.from_bytes(data[16:20], "big"),
                int.from_bytes(data[20:24], "big"))
        if data[:8] != b"\x89PNG\r\n\x1a\n" or size != (1200, 630):
            failures.append("og-image.png is not a 1200x630 PNG (got %r)"
                            % (size,))
    checks.append(("og card assets shipped 1200x630", failures))

    # Home titles, verbatim (entities decoded, whitespace trimmed).
    for route, want in HOME_TITLES.items():
        failures = []
        text, _ = _parse(route)
        if text is None:
            failures.append("missing page")
        else:
            match = re.search(r"<title>([\s\S]*?)</title>", text)
            got = unescape(match.group(1)).strip() if match else None
            if got != want:
                failures.append("title is %r, want %r" % (got, want))
        checks.append(("home title " + route, failures))

    # Person JSON-LD on both home pages: valid JSON, one script, the
    # plan's facts only.
    for route, job_title in PERSON_JOBTITLES.items():
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("person jsonld " + route, ["missing page"]))
            continue
        scripts = _jsonld_scripts(text)
        if len(scripts) != 1:
            failures.append("expected 1 ld+json script, found %d"
                            % len(scripts))
        else:
            try:
                data = json.loads(scripts[0])
            except json.JSONDecodeError as exc:
                failures.append("invalid JSON: %s" % exc)
                data = {}
            if not isinstance(data, dict):
                failures.append("JSON-LD is %s, want an object"
                                % type(data).__name__)
                data = {}
            if set(data) != PERSON_KEYS:
                failures.append("top-level keys are %r, want exactly %r"
                                % (sorted(data), sorted(PERSON_KEYS)))
            if data.get("@context") != "https://schema.org":
                failures.append("@context is %r" % data.get("@context"))
            if data.get("@type") != "Person":
                failures.append("@type is %r, want Person" % data.get("@type"))
            if data.get("name") != "Jose Paredes":
                failures.append("name is %r" % data.get("name"))
            if data.get("jobTitle") != job_title:
                failures.append("jobTitle is %r, want %r"
                                % (data.get("jobTitle"), job_title))
            address = data.get("address")
            if not isinstance(address, dict):
                failures.append("address is %r, want an object" % address)
            else:
                if set(address) != PERSON_ADDRESS_KEYS:
                    failures.append("address keys are %r, want exactly %r"
                                    % (sorted(address),
                                       sorted(PERSON_ADDRESS_KEYS)))
                if (address.get("addressLocality") != "Madrid"
                        or address.get("addressCountry") != "ES"):
                    failures.append("address is %r, want Madrid/ES" % address)
            if data.get("url") != BASE_URL + route:
                failures.append("url is %r, want %s"
                                % (data.get("url"), BASE_URL + route))
            if data.get("image") != OG_IMAGE_URL:
                failures.append("image is %r, want %s"
                                % (data.get("image"), OG_IMAGE_URL))
            # Exact collection comparison: extras and duplicates fail.
            for key, approved in (("sameAs", CONTACT_NETWORKS),
                                  ("knowsAbout", PERSON_KNOWSABOUT)):
                values = data.get(key)
                if (not isinstance(values, list)
                        or not all(isinstance(v, str) for v in values)
                        or sorted(values) != sorted(approved)):
                    failures.append("%s is %r, want exactly %r"
                                    % (key, values, list(approved)))
            alumni = data.get("alumniOf")
            names = ([a.get("name") for a in alumni
                      if isinstance(a, dict)]
                     if isinstance(alumni, list) else None)
            if (names is None or len(alumni) != len(PERSON_ALUMNI)
                    or not all(isinstance(n, str) for n in names)
                    or sorted(names) != sorted(PERSON_ALUMNI)):
                failures.append("alumniOf is %r, want exactly %r"
                                % (alumni, list(PERSON_ALUMNI)))
            elif any(a.get("@type") != "EducationalOrganization"
                     or set(a) != {"@type", "name"} for a in alumni):
                failures.append("alumniOf entries must be "
                                "{@type: EducationalOrganization, name}")
        checks.append(("person jsonld " + route, failures))

    return checks


# Task 8: the bilingual 404. GitHub Pages serves only /404.html, so the
# build must ship exactly one 404 document, built from the default
# language, showing both languages and the approved links. The copy is
# the plan's wording and is asserted verbatim.
NF_TITLE = {"en": "Not found", "es": "No encontrado"}
NF_TEXT = {
    "en": ("The page you are looking for does not exist or has moved. "
           "Use the links below to get back on track."),
    "es": ("La página que buscas no existe o se ha movido. "
           "Usa los enlaces de abajo para continuar explorando el sitio."),
}
# href -> the visible label the link must carry.
NF_LINKS = {
    "/": "Volver al inicio",
    "/projects/": "Proyectos",
    "/contact/": "Contacto",
    "/en/": "Back to the home page",
    "/en/projects/": "Projects",
    "/en/contact/": "Contact",
    "/en/blog/": "Blog",
}


def _headings(html):
    """(level, attrs, inner html) of every heading in an HTML fragment."""
    return re.findall(r"<h([1-6])([^>]*)>([\s\S]*?)</h\1>", html)


def _dist_target(path):
    """The built file a site-absolute path points at."""
    target = ROOT / "dist" / path.lstrip("/")
    return target / "index.html" if path.endswith("/") else target


def check_404():
    """Task 8 bilingual 404 assertions: (label, failures) pairs."""
    checks = []

    # Exactly one 404 document ships, and it is the root one GitHub
    # Pages serves.
    failures = []
    found = sorted(p.relative_to(ROOT).as_posix()
                   for p in (ROOT / "dist").rglob("404.html"))
    if found != ["dist/404.html"]:
        failures.append("404 outputs are %r, want exactly ['dist/404.html']"
                        % (found,))
    checks.append(("single 404 output", failures))

    # GitHub Pages does not serve /es/404.html, so it must not exist.
    failures = []
    if (ROOT / "dist" / "es" / "404.html").is_file():
        failures.append("dist/es/404.html exists")
    checks.append(("no /es/404.html", failures))

    text, parser = _parse("/404.html")
    if text is None:
        checks.append(("bilingual 404", ["missing dist/404.html"]))
        return checks

    main = _main_html(text)
    if main is None:
        checks.append(("bilingual 404", ["no <main> region"]))
        return checks

    # Both languages are visible: a title and a short explanation each.
    failures = []
    visible = _visible_text(main)
    for lang in ("en", "es"):
        if NF_TITLE[lang] not in visible:
            failures.append("missing %s title %r" % (lang, NF_TITLE[lang]))
        if NF_TEXT[lang] not in visible:
            failures.append("missing %s text %r" % (lang, NF_TEXT[lang]))
    checks.append(("bilingual 404 copy", failures))

    # A real heading per language; the Spanish block is marked lang="es".
    failures = []
    heads = _headings(main)
    h1s = [head for head in heads if head[0] == "1"]
    if len(h1s) != 1:
        failures.append("expected 1 h1, found %d" % len(h1s))
    elif NF_TITLE["en"] not in _visible_text(h1s[0][2]):
        failures.append("the h1 is not the English title %r"
                        % NF_TITLE["en"])
    # The Spanish block is a section marked lang="es" (so its paragraph
    # and links are announced in Spanish too) with its own heading.
    es_blocks = re.findall(
        r"<section\b[^>]*\blang=(?:\"es\"|es)[^>]*>([\s\S]*?)</section>",
        main)
    if len(es_blocks) != 1:
        failures.append("expected 1 section marked lang=es, found %d"
                        % len(es_blocks))
    else:
        es_heads = _headings(es_blocks[0])
        if len(es_heads) != 1:
            failures.append("expected 1 heading in the lang=es block, "
                            "found %d" % len(es_heads))
        elif NF_TITLE["es"] not in _visible_text(es_heads[0][2]):
            failures.append("the lang=es heading is not the Spanish title %r"
                            % NF_TITLE["es"])
    checks.append(("404 headings", failures))

    # The two language blocks are separated by a horizontal rule.
    failures = []
    rule = main.find("<hr")
    en_pos = main.find(NF_TITLE["en"])
    es_pos = main.find(NF_TITLE["es"])
    if rule == -1:
        failures.append("no <hr> between the two language blocks")
    elif not (en_pos < rule < es_pos):
        failures.append("the rule does not separate the blocks "
                        "(en@%d rule@%d es@%d)" % (en_pos, rule, es_pos))
    checks.append(("404 rule", failures))

    # The approved links, each with visible text.
    failures = []
    body = _LangParser()
    body.feed(main)
    body.close()
    anchors = [(href, label) for href, label in body.anchors]
    for href, label in NF_LINKS.items():
        matching = [(h, l) for h, l in anchors if _norm(h) == href]
        if not matching:
            failures.append("no link to %s" % href)
        elif not any(l.strip() for _, l in matching):
            failures.append("the link to %s has no text" % href)
        elif not any(l.strip() == label for _, l in matching):
            failures.append("the link to %s is labelled %r, want %r"
                            % (href, matching[0][1].strip(), label))
    checks.append(("404 links", failures))

    # The page works without JavaScript: no script and no inline
    # handlers in the content.
    failures = []
    if re.search(r"<script\b", main, re.IGNORECASE):
        failures.append("the 404 content contains a <script>")
    if re.search(r"<[^>]+\son[a-z]+\s*=", main, re.IGNORECASE):
        failures.append("the 404 content contains an inline event handler")
    checks.append(("404 without JS", failures))

    # No meta refresh: the page must not redirect anywhere.
    failures = []
    refresh = _RefreshParser()
    refresh.feed(text)
    refresh.close()
    if refresh.has_refresh:
        failures.append("the 404 page uses a meta refresh")
    checks.append(("404 without meta refresh", failures))

    # The dark shell of the site survives: header, footer, stylesheet.
    failures = []
    if "<header" not in text:
        failures.append("no <header> (site shell lost)")
    if "<footer" not in text:
        failures.append("no <footer> (site shell lost)")
    if not re.search(r"<link[^>]*rel=stylesheet[^>]*>", text):
        failures.append("no stylesheet link (dark shell lost)")
    checks.append(("404 keeps the site shell", failures))

    # Every site-absolute link on the page resolves in the build.
    failures = []
    targets = [href for href, _ in parser.anchors]
    targets += [href for _, href in parser.alternates]
    targets.append(parser.canonical or "")
    for href in targets:
        path = _norm(href)
        if not path.startswith("/"):
            continue
        path = path.split("#")[0].split("?")[0]
        if not path:
            continue
        if not _dist_target(path).exists():
            failures.append("dangling link to %s" % path)
    checks.append(("404 links resolve", failures))

    return checks


# Task 9: the accessible mobile menu. The shared header replaces the
# checkbox/label hack with a real <button aria-expanded aria-controls>
# plus a small inline JS (Escape closes and refocuses the button, true
# outside clicks close, the closed panel is inert on mobile). Every page
# that carries the site header must ship the new markup; the redirect
# stubs have no header and are exempt.
MENU_ROUTES = [r for r in ROUTES
               if r.endswith("/") and r not in REDIRECT_STUBS
               and r not in STANDALONE_PAGES]
MENU_ROUTES += ["/404.html"]
MENU_LABELS = {"en": "Menu", "es": "Menú"}


def _brace_body(text, open_pos):
    """Content between the brace at open_pos and its matching close.

    The menu script and the menu CSS contain no braces inside string
    literals, so depth counting is exact for them.
    """
    if open_pos < 0 or open_pos >= len(text) or text[open_pos] != "{":
        return None
    depth = 0
    for i in range(open_pos, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[open_pos + 1:i]
    return None


def _fn_body(text, anchor):
    """Brace-matched body of the first function at/after `anchor`."""
    pos = text.find(anchor)
    if pos == -1:
        return None
    fpos = text.find("function", pos)
    if fpos == -1:
        return None
    return _brace_body(text, text.find("{", fpos))


def _menu_script_failures(text):
    """Code-path assertions on the inline menu script.

    The build is minified (identifiers renamed, single quotes turned to
    double), so the assertions are structural: they locate the function
    bodies by brace matching instead of by name. A substring search for
    "Escape" alone would pass even with the focus restore or the state
    sync removed; these checks fail in that case.
    """
    failures = []
    scripts = [s for s in re.findall(r"<script>([\s\S]*?)</script>", text)
               if "menuToggle" in s]
    if len(scripts) != 1:
        return ["expected 1 inline menu script, found %d" % len(scripts)]
    script = scripts[0].replace("'", '"')

    # data-open and aria-expanded are set together in the state function.
    pos = script.find('"data-open"')
    fpos = script.rfind("function", 0, pos) if pos != -1 else -1
    body = _brace_body(script, script.find("{", fpos)) if fpos != -1 else None
    if body is None or "setAttribute" not in body or '"aria-expanded"' not in body:
        failures.append("state function does not set both data-open "
                        "and aria-expanded")

    # A keydown listener handles Escape and refocuses the button on close.
    body = _fn_body(script, 'addEventListener("keydown"')
    if body is None:
        failures.append("no keydown listener registered")
    else:
        if '"Escape"' not in body:
            failures.append("keydown listener does not handle Escape")
        if ".focus()" not in body:
            failures.append("Escape close does not refocus the button")

    # A document click listener closes on true outside clicks only: its
    # body must exempt both the button and the panel via contains().
    if 'document.addEventListener("click"' not in script:
        failures.append("no document click listener registered")
    else:
        body = _fn_body(script, 'document.addEventListener("click"')
        if body is None or body.count(".contains(") < 2:
            failures.append("outside-click handler must exempt the button "
                            "and the panel")
    return failures


def check_menu():
    """Task 9 mobile-menu assertions: (label, failures) pairs."""
    checks = []

    for route in MENU_ROUTES:
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("menu " + route, ["missing page"]))
            continue

        # The legacy checkbox/label markup must be gone (quoted and
        # minified-bare forms alike).
        for needle in ('class="side-menu"', "class=side-menu",
                       '<label class="hamb"', "<label class=hamb"):
            if needle in text:
                failures.append("legacy markup present: %s" % needle)

        # Exactly one toggle button with the required attributes.
        toggles = [t for t in re.findall(r"<button\b[^>]*>", text)
                   if _attr(t, "class") == "menuToggle"]
        if len(toggles) != 1:
            failures.append("expected 1 button.menuToggle, found %d"
                            % len(toggles))
        else:
            tag = toggles[0]
            for name, want in (("type", "button"),
                               ("aria-expanded", "false"),
                               ("aria-controls", "site-menu")):
                if _attr(tag, name) != want:
                    failures.append("menuToggle %s is %r, want %r"
                                    % (name, _attr(tag, name), want))
            want_label = MENU_LABELS["en" if route.startswith("/en/")
                                     else "es"]
            if _attr(tag, "aria-label") != want_label:
                failures.append("menuToggle aria-label is %r, want %r"
                                % (_attr(tag, "aria-label"), want_label))
            body = re.search(
                r"<button\b[^>]*\bclass=(?:\"menuToggle\""
                r"|menuToggle(?=[\s>]))[^>]*>([\s\S]*?)</button>", text)
            if body is None or "hamb-line" not in body.group(1):
                failures.append("menuToggle lacks the hamb-line icon span")

        # The panel is a labelled nav the button can control.
        navs = [t for t in re.findall(r"<nav\b[^>]*>", text)
                if _attr(t, "id") == "site-menu"]
        if len(navs) != 1:
            failures.append("expected 1 nav#site-menu, found %d" % len(navs))
        elif _attr(navs[0], "class") != "headerLinks":
            failures.append("nav#site-menu class is %r, want headerLinks"
                            % _attr(navs[0], "class"))

        # The inline script's actual code paths (state sync, Escape +
        # focus restore, outside-click listener), not just substrings.
        failures += _menu_script_failures(text)
        checks.append(("menu " + route, failures))

    # The panel/button CSS ships in the shared custom-head style block.
    # The declarations must sit in the right rules: display:block inside
    # the 768px media query (a desktop regression otherwise) and
    # max-height:100% inside the [data-open] panel rule. The minifier
    # drops quotes around simple attribute values and spaces in preludes.
    failures = []
    text, _ = _parse("/")
    if text is None:
        failures.append("missing page")
    else:
        style = re.search(r"<style>([\s\S]*?)</style>", text)
        css = style.group(1) if style else ""
        if ".menuToggle:focus-visible" not in css:
            failures.append("no .menuToggle:focus-visible rule")
        if "outline:2px solid #80aadd" not in css:
            failures.append("no 2px #80aadd focus outline")
        if not re.search(r"\.menuToggle\{[^}]*display:none", css):
            failures.append("menuToggle is not hidden by default (desktop)")
        shown_in_query = False
        for m in re.finditer(r"@media[^{]*\{", css):
            if "max-width:768px" not in re.sub(r"\s+", "", m.group(0)):
                continue
            body = _brace_body(css, m.end() - 1)
            if body and ".menuToggle{display:block" in re.sub(r"\s+", "", body):
                shown_in_query = True
        if not shown_in_query:
            failures.append("menuToggle display:block is not inside the "
                            "max-width:768px media query")
        rule = re.search(r'\[data-open=(?:"true"|true)\]\s*\.headerLinks\s*\{',
                         css)
        body = _brace_body(css, rule.end() - 1) if rule else None
        if body is None or "max-height:100%" not in re.sub(r"\s+", "", body):
            failures.append("max-height:100% is not inside the "
                            "[data-open=true] .headerLinks rule")
    checks.append(("menu CSS", failures))

    return checks


# Task 10: bilingual privacy pages, linked from the consent banner and
# the footer. The consent script carries a language-aware data-privacy
# attribute (/privacy/ EN, /es/privacy/ ES); the footer keeps the
# existing copyright/built-with line and appends a localized
# Privacy/Privacidad link. Pulse (first-party, cookieless) is
# disclose-only per the controller ruling: it must keep loading
# untouched, so the checks prove its tag survives and the consent
# script never references it. The copy may only use the verified facts:
# no legal entity, VAT number or retention claims.
PRIVACY_PAGES = ("/privacy/", "/en/privacy/")
PRIVACY_LABELS = {"en": "Privacy", "es": "Privacidad"}
PRIVACY_EMAIL = "jparedescolmenarejo@gmail.com"
PRIVACY_GA_ID = "G-Y85VJ3E6W4"
PULSE_SRC = "https://pulse.subtitleme.workers.dev/t.js"
PULSE_SITE = "pk_42a58793b14cbd7af3c6"
PRIVACY_FACTS = {
    "/en/privacy/": [
        ("Jose Paredes",), ("Madrid",),
        ("Google Analytics",), ("G-Y85VJ3E6W4",), ("_ga",),
        ("consent",),
        ("pulse.subtitleme.workers.dev/t.js",), ("cookieless",),
        ("localStorage",), ("pulse_vid",), ("sessionStorage",),
        ("Do Not Track",),
        ("ga_consent_v1",),
        (PRIVACY_EMAIL,),
    ],
    "/privacy/": [
        ("Jose Paredes",), ("Madrid",),
        ("Google Analytics",), ("G-Y85VJ3E6W4",), ("_ga",),
        ("consentimiento",),
        ("pulse.subtitleme.workers.dev/t.js",), ("sin cookies",),
        ("localStorage",), ("pulse_vid",), ("sessionStorage",),
        ("Do Not Track",),
        ("ga_consent_v1",),
        (PRIVACY_EMAIL,),
    ],
}
PRIVACY_STUB_WORDS = ("placeholder", "being written", "provisional",
                      "en redacción")
PRIVACY_BANNED = (r"\bVAT\b", r"\bCIF\b", r"\bNIF\b", r"\bS\.L\.",
                  r"\bLtd\b", r"\bInc\b", r"\bretention\b",
                  r"\bretención\b")
# Task 10 review: the required disclosures are asserted as whole
# polarity-sensitive phrases on the normalized visible text, not as
# bare keywords — deleting "If you decline, it never loads", dropping
# the revocation steps or reversing the Do Not Track sentence must
# fail. "banned" lists the reversed polarities explicitly.
PRIVACY_DISCLOSURES = {
    "/en/privacy/": {
        "required": [
            "only after you accept",
            "if you decline, it never loads",
            "the legal basis is your consent",
            "to understand how the site is used",
            "delete the cookies and site data",
            "reload the page",
            "the banner will appear again",
            "declining keeps google analytics off",
            "page views, engagement and outbound clicks",
            "respects the do not track",
            "with do not track enabled, it does not track you",
        ],
        "banned": [
            "does not respect the do not track",
            "ignores do not track",
            "loads before you accept",
            "without your consent",
        ],
        # Unverified operational promises trimmed by the Task 10 review
        # ruling; they must not return.
        "unverified": [
            "i do not combine it with any other data source",
            "no server-side record of your choice",
            "no advertising networks run on this site",
            "i only use your message to reply",
        ],
    },
    "/privacy/": {
        "required": [
            "solo después de que aceptes",
            "si lo rechazas, no se carga nunca",
            "la base legal es tu consentimiento",
            "para entender cómo se usa el sitio",
            "elimina las cookies y los datos de sitio",
            "recarga la página",
            "el banner volverá a aparecer",
            "rechazar mantiene google analytics desactivado",
            "páginas vistas, interacción y clics hacia sitios externos",
            "respeta la señal do not track",
            "si la tienes activada, no te rastrea",
        ],
        "banned": [
            "no respeta la señal do not track",
            "ignora do not track",
            "se carga antes de que aceptes",
            "sin tu consentimiento",
        ],
        # Promesas operativas no verificadas, retiradas por la revisión
        # de la Task 10; no deben volver.
        "unverified": [
            "no los combino con ninguna otra fuente de datos",
            "no guarda ningún registro de tu elección en un servidor",
            "no hay redes publicitarias en este sitio",
            "solo uso tu mensaje para responderte",
        ],
    },
}
# The consent and pulse tags must stay functionally identical (defer,
# same URLs/attributes, nothing added): the full ordered attribute list
# is pinned, quoted and minified-bare forms alike.
CONSENT_SRC = "/consent.js?v=2"
PULSE_ATTRS = [("defer", None), ("src", PULSE_SRC),
               ("data-site", PULSE_SITE)]


def _norm_text(html):
    """Visible text of a fragment, whitespace collapsed, casefolded."""
    return re.sub(r"\s+", " ", _visible_text(html)).casefold()


_TAG_ATTR_RE = re.compile(
    r"\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)"
    r"(?:\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s\"'>]+)))?")


def _tag_attrs(tag):
    """Ordered (name, value) pairs of a raw start tag.

    Boolean attributes (defer) get None; quoted and minified-bare
    values are unquoted, so the list compares equal across builds.
    """
    body = tag[tag.find(" ") + 1:] if " " in tag else ""
    if body.endswith(">"):
        body = body[:-1]
    attrs = []
    # Pad so the first attribute also has the leading whitespace the
    # tokenizer expects.
    for match in _TAG_ATTR_RE.finditer(" " + body):
        value = match.group(2)
        if value is None:
            value = match.group(3)
        if value is None:
            value = match.group(4)
        attrs.append((match.group(1).lower(), value))
    return attrs


def _script_tags(text):
    """Every raw <script ...> start tag in a built page."""
    return re.findall(r"<script\b[^>]*>", text)


def _footer_html(text):
    """Inner HTML of the site <footer class="footer">, or None.

    Blog pages also carry per-post <footer class="entry-footer"> cards,
    so the class is matched explicitly (quoted and minified-bare).
    """
    match = re.search(
        r'<footer\b[^>]*\bclass=(?:"footer"|footer(?=[\s>]))[^>]*>'
        r"([\s\S]*?)</footer>", text)
    return match.group(1) if match else None


def check_privacy():
    """Task 10 privacy assertions: (label, failures) pairs."""
    checks = []

    # The pages exist and carry the verified facts, not the stub notice.
    for route in PRIVACY_PAGES:
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("privacy page " + route, ["missing page"]))
            continue
        main = _main_html(text) or ""
        for alternatives in PRIVACY_FACTS[route]:
            if not any(alt in main for alt in alternatives):
                failures.append("missing fact: %s"
                                % " / ".join(alternatives))
        visible = _visible_text(main)
        lowered = visible.casefold()
        for word in PRIVACY_STUB_WORDS:
            if word in lowered:
                failures.append("stub wording still present: %r" % word)
        for pattern in PRIVACY_BANNED:
            if re.search(pattern, visible, re.IGNORECASE):
                failures.append("unapproved claim matches %r" % pattern)
        normalized = _norm_text(main)
        for phrase in PRIVACY_DISCLOSURES[route]["required"]:
            if phrase not in normalized:
                failures.append("missing disclosure: %r" % phrase)
        for phrase in PRIVACY_DISCLOSURES[route]["banned"]:
            if phrase in normalized:
                failures.append("reversed disclosure present: %r" % phrase)
        for phrase in PRIVACY_DISCLOSURES[route]["unverified"]:
            if phrase in normalized:
                failures.append("unverified promise present: %r" % phrase)
        if not _href_present(main, "mailto:" + PRIVACY_EMAIL):
            failures.append("no mailto link to " + PRIVACY_EMAIL)
        checks.append(("privacy page " + route, failures))

    # The consent script tag stays functionally identical (defer, same
    # src/data-ga) and carries the right data-privacy per language on
    # every page that ships the site shell (the blog is EN).
    for route in MENU_ROUTES:
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("consent data-privacy " + route,
                           ["missing page"]))
            continue
        want = "/en/privacy/" if route.startswith("/en/") else "/privacy/"
        want_attrs = [("defer", None), ("src", CONSENT_SRC),
                      ("data-ga", PRIVACY_GA_ID), ("data-privacy", want)]
        tags = [t for t in _script_tags(text)
                if "/consent.js" in (_attr(t, "src") or "")]
        if len(tags) != 1:
            failures.append("expected 1 consent script tag, found %d"
                            % len(tags))
        else:
            attrs = _tag_attrs(tags[0])
            if attrs != want_attrs:
                failures.append("consent tag attrs are %r, want %r"
                                % (attrs, want_attrs))
        checks.append(("consent data-privacy " + route, failures))

    # The footer keeps the existing line and appends the localized link.
    for route in MENU_ROUTES:
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("footer privacy " + route, ["missing page"]))
            continue
        footer = _footer_html(text)
        if footer is None:
            checks.append(("footer privacy " + route, ["no <footer>"]))
            continue
        is_en = route.startswith("/en/")
        want = "/en/privacy/" if is_en else "/privacy/"
        label = PRIVACY_LABELS["en" if is_en else "es"]
        for needle in ("2026 Jose Paredes", "Built with"):
            if needle not in footer:
                failures.append("existing footer line lost: %r" % needle)
        for href in ("https://gohugo.io",
                     "https://github.com/LordMathis/hugo-theme-nightfall"):
            if not _href_present(footer, href):
                failures.append("built-with link lost: " + href)
        parser = _LangParser()
        parser.feed(footer)
        parser.close()
        links = [(h, l) for h, l in parser.anchors if _norm(h) == want]
        if not links:
            failures.append("no footer link to " + want)
        elif not any(l.strip() == label for _, l in links):
            failures.append("footer privacy link labelled %r, want %r"
                            % (links[0][1].strip(), label))
        checks.append(("footer privacy " + route, failures))

    # Pulse is disclose-only (controller ruling): the complete tag
    # (defer, same src/data-site, nothing added) must survive untouched
    # on every shell page, and the consent script must not gate it.
    for route in MENU_ROUTES:
        failures = []
        text, _ = _parse(route)
        if text is None:
            checks.append(("pulse untouched " + route, ["missing page"]))
            continue
        tags = [t for t in _script_tags(text)
                if (_attr(t, "src") or "") == PULSE_SRC]
        if len(tags) != 1:
            failures.append("expected 1 pulse script tag, found %d"
                            % len(tags))
        else:
            attrs = _tag_attrs(tags[0])
            if attrs != PULSE_ATTRS:
                failures.append("pulse tag attrs are %r, want %r"
                                % (attrs, PULSE_ATTRS))
        checks.append(("pulse untouched " + route, failures))
    consent_js = (ROOT / "static" / "consent.js").read_text(encoding="utf-8")
    checks.append(("consent.js does not touch pulse",
                   ["consent.js references pulse"]
                   if "pulse" in consent_js.lower() else []))

    return checks


# Task 11: the bilingual CV. Two A4 PDFs (two pages max) printed from
# the build-time HTML templates in scripts/cv/ via scripts/cv/print.ps1;
# the templates are sources, not published pages. Only the approved
# facts may appear; tenure phrases and podium places are banned exactly
# as in About. PyMuPDF verifies the shipped PDFs themselves: facts in
# the extracted text, page count, A4 geometry, no embedded images (no
# photos), no text outside the page (clipping) and a readable minimum
# font size.
CV_PDFS = {
    "en": {"static": "static/resume.pdf", "dist": "dist/resume.pdf",
           "template": "scripts/cv/cv-en.html"},
    "es": {"static": "static/resume-es.pdf", "dist": "dist/resume-es.pdf",
           "template": "scripts/cv/cv-es.html"},
}
CV_FACTS = {
    "en": [
        ("Jose Paredes Colmenarejo",),
        ("Computer Vision & ML Engineer",),
        ("Computer Vision",),
        ("Madrid",),
        ("+34 616 744 808",),
        ("jparedescolmenarejo@gmail.com",),
        ("linkedin.com/in/jparedesDS",),
        ("github.com/jparedesDS",),
        ("jparedesds.com",),
        ("local-first",),
        ("EIPSA",),
        ("Data Analyst & AI Engineer",),
        ("01/2024",), ("Present",),
        ("YOLO11",),
        ("penetrant inspection",),
        ("welding defect",),
        ("DocFlow",),
        ("internal SaaS in production",),
        ("21 API routers",),
        ("24 service layers",),
        ("24 frontend screens",),
        ("FastAPI",), ("React",), ("DocuSign",), ("JWT",),
        ("Docker",), ("Claude",),
        ("DXF",), ("80%",),
        ("ERP",), ("500+",),
        ("Tableau",),
        ("Comunicación Permanente",),
        ("Data Management Technician",),
        ("01/2021",), ("12/2023",),
        ("10,000+",), ("25%",),
        ("Grupo ANOVO",),
        ("Electronics Lab Technician",),
        ("01/2015",), ("12/2020",),
        ("50+",), ("95%",),
        ("Subany",), ("CleanYourMail",), ("CleanYourPhone",),
        ("Pro POV CS2",),
        ("Python",), ("PyTorch",), ("OpenCV",), ("scikit-learn",),
        ("Data Science Bootcamp",), ("The Bridge",),
        ("09/2021",), ("06/2022",),
        ("Advanced Vocational Degree in Telecommunications",),
        ("Padre Piquer",), ("2010",), ("2012",),
        ("Spanish (native)",), ("English (B2)",),
        ("33+",), ("268+",), ("10+",),
        ("Hugging Face",), ("v9",), ("v12",),
        ("Kaggle",),
        ("bronze medal in multilabel image classification",),
        ("ResNet152",),
    ],
    "es": [
        ("Jose Paredes Colmenarejo",),
        ("Ingeniero de Computer Vision y ML",),
        ("Visión artificial",),
        ("Madrid",),
        ("+34 616 744 808",),
        ("jparedescolmenarejo@gmail.com",),
        ("linkedin.com/in/jparedesDS",),
        ("github.com/jparedesDS",),
        ("jparedesds.com",),
        ("local-first",),
        ("EIPSA",),
        ("Analista de datos e ingeniero de IA",),
        ("01/2024",), ("actualidad",),
        ("YOLO11",),
        ("líquidos penetrantes",),
        ("defectos de soldadura",),
        ("DocFlow",),
        ("SaaS interno en producción",),
        ("21 routers",),
        ("24 capas de servicio",),
        ("24 pantallas",),
        ("FastAPI",), ("React",), ("DocuSign",), ("JWT",),
        ("Docker",), ("Claude",),
        ("DXF",), ("80%",),
        ("ERP",), ("500+",),
        ("Tableau",),
        ("Comunicación Permanente",),
        ("Técnico de gestión de datos",),
        ("01/2021",), ("12/2023",),
        ("10.000+", "10,000+"), ("25%",),
        ("Grupo ANOVO",),
        ("Técnico de laboratorio de electrónica",),
        ("01/2015",), ("12/2020",),
        ("50+",), ("95%",),
        ("Subany",), ("CleanYourMail",), ("CleanYourPhone",),
        ("Pro POV CS2",),
        ("Python",), ("PyTorch",), ("OpenCV",), ("scikit-learn",),
        ("Bootcamp de Data Science",), ("The Bridge",),
        ("09/2021",), ("06/2022",),
        ("Grado Superior en Telecomunicaciones",),
        ("Padre Piquer",), ("2010",), ("2012",),
        ("Español (nativo)",), ("Inglés (B2)",),
        ("33+",), ("268+",), ("10+",),
        ("Hugging Face",), ("v9",), ("v12",),
        ("Kaggle",),
        ("medalla de bronce en clasificación multilabel de imágenes",),
        ("ResNet152",),
    ],
}
# Final review: the CVs may only claim Spanish native + English B2 in
# the Languages section; the "Bilingual"/"Bilingüe" summary overstatement
# is banned alongside the tenure phrases and podium places.
CV_BANNED = ("four years", "4 years", "cuatro años", "4 años",
             "3rd place", "3er puesto", "tercer puesto",
             "bilingual", "bilingüe")


def _pdf_text(doc):
    """All PDF text, whitespace collapsed so line wraps join phrases."""
    return re.sub(r"\s+", " ", " ".join(p.get_text() for p in doc))


def check_cv():
    """Task 11 bilingual CV assertions: (label, failures) pairs."""
    checks = []

    # Build-time templates: A4 print CSS, the print-blue accent, the
    # page language, and no photos.
    for lang, spec in CV_PDFS.items():
        failures = []
        path = ROOT / spec["template"]
        if not path.is_file():
            failures.append("missing template " + spec["template"])
        else:
            html = path.read_text(encoding="utf-8")
            flat = re.sub(r"\s+", " ", html)
            if "size: A4" not in flat:
                failures.append("template lacks @page size: A4")
            if "margin: 14mm" not in flat:
                failures.append("template lacks @page margin: 14mm")
            if "#2f6db3" not in html:
                failures.append("template lacks the print accent #2f6db3")
            if re.search(r"<img\b", html, re.IGNORECASE):
                failures.append("template contains an <img> (no photos)")
            if ('lang="%s"' % lang) not in html:
                failures.append('template html lang is not "%s"' % lang)
        checks.append(("cv template " + lang, failures))

    if fitz is None:
        checks.append(("cv pdfs", ["PyMuPDF (fitz) is not installed"]))
        return checks

    for lang, spec in CV_PDFS.items():
        failures = []
        static = ROOT / spec["static"]
        dist = ROOT / spec["dist"]
        for path in (static, dist):
            if not path.is_file():
                failures.append("missing "
                                + path.relative_to(ROOT).as_posix())
        if failures:
            checks.append(("cv pdf " + lang, failures))
            continue
        if static.read_bytes() != dist.read_bytes():
            failures.append("dist copy differs from the static source "
                            "(stale build?)")
        try:
            doc = fitz.open(static)
        except Exception as exc:
            checks.append(("cv pdf " + lang,
                           ["cannot open PDF: %s" % exc]))
            continue
        if not 1 <= doc.page_count <= 2:
            failures.append("%d pages, want 1-2" % doc.page_count)
        text = _pdf_text(doc)
        for alternatives in CV_FACTS[lang]:
            if not any(alt in text for alt in alternatives):
                failures.append("missing fact: %s"
                                % " / ".join(alternatives))
        lowered = text.casefold()
        for phrase in CV_BANNED:
            if phrase.casefold() in lowered:
                failures.append("banned phrase present: %r" % phrase)
        min_size = None
        clipped = set()
        for pno, page in enumerate(doc, 1):
            rect = page.rect
            if abs(rect.width - 595) > 3 or abs(rect.height - 842) > 3:
                failures.append("page %d is %.0fx%.0f pt, want A4"
                                % (pno, rect.width, rect.height))
            if page.get_images():
                failures.append("page %d embeds an image (no photos)"
                                % pno)
            for block in page.get_text("dict")["blocks"]:
                for line in block.get("lines", []):
                    for span in line["spans"]:
                        if not span["text"].strip():
                            continue
                        size = span["size"]
                        min_size = (size if min_size is None
                                    else min(min_size, size))
                        x0, y0, x1, y1 = span["bbox"]
                        if (x0 < rect.x0 - 1 or y0 < rect.y0 - 1
                                or x1 > rect.x1 + 1
                                or y1 > rect.y1 + 1):
                            clipped.add("page %d: text outside the page "
                                        "(clipped): %r"
                                        % (pno, span["text"][:40]))
        failures.extend(sorted(clipped))
        if min_size is not None and min_size < 8:
            failures.append("font size %.1f pt < 8 pt (unreadable)"
                            % min_size)
        doc.close()
        checks.append(("cv pdf " + lang, failures))

    return checks


def check_repos():
    """Repositories page: every GitHub repo and Hugging Face model linked,
    al-folio-style dark pin cards, and the page reachable from the menu."""
    checks = []
    data = json.loads((ROOT / "data/repositories.json").read_text(encoding="utf-8"))
    repos, models = data["repos"], data["models"]
    for route, heading in (("/repositories/", "Repositorios"),
                           ("/en/repositories/", "Repositories")):
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
            checks.append(("repos " + route, failures))
            continue
        if not re.search(r"<h1[^>]*>\s*%s\s*</h1>" % re.escape(heading), text):
            failures.append("missing h1 %r" % heading)
        cards = len(re.findall(r'<a class=[^>]*repoCard', text))
        if cards != len(repos) + 1:  # +1 = the GitHub profile card
            failures.append("repo card count %d, expected %d"
                            % (cards, len(repos) + 1))
        model_cards = len(re.findall(r'<a class=[^>]*modelCard', text))
        if model_cards != len(models):
            failures.append("model card count %d, expected %d"
                            % (model_cards, len(models)))
        for repo in repos:
            if not _href_present(text, repo["url"]):
                failures.append("missing repo link: " + repo["url"])
            pin = ("github-stats-extended.vercel.app/api/pin/"
                   "?username=jparedesDS&amp;repo=" + repo["name"])
            if pin not in text:
                failures.append("missing dark pin for " + repo["name"])
        for model in models:
            if not _href_present(text, model["url"]):
                failures.append("missing model link: " + model["url"])
        if "theme=default" in text or "theme=light" in text:
            failures.append("non-dark card theme present")
        if "theme=dark" not in text:
            failures.append("dark card theme missing")
        if "modelPin" not in text or "data-testid=hearts" not in text:
            failures.append("Hugging Face cards do not mirror the GitHub pin with hearts")
        if not all(str(m["likes"]) in text for m in models):
            failures.append("Hugging Face like counts missing from the pin cards")
        menu_path = "/en/repositories/" if route.startswith("/en") \
            else "/repositories/"
        if not _href_present(text, menu_path):
            failures.append("repos page not linked in the menu")
        if len(re.findall(r"class=reposMore", text)) != 2:
            failures.append("expected two show-more buttons")
        page_css = (ROOT / "dist/index.html").read_text(encoding="utf-8")
        if not re.search(r"\.repoGrid\s+\.repoExtra\s*,\s*\.modelGrid\s+"
                         r"\.modelExtra\s*\{\s*display:\s*none", page_css):
            failures.append("extra repo cards are not hidden by default")
        if not re.search(r"\.repoGrid\.expanded\s+\.repoExtra\s*,\s*"
                         r"\.modelGrid\.expanded\s+\.modelExtra\s*\{\s*"
                         r"display:\s*block", page_css):
            failures.append("expanded repo cards do not become visible")
        if len(re.findall(r'class="repoCard repoExtra"', text)) != max(0, len(repos) - 10):
            failures.append("wrong number of collapsed repo cards")
        if len(re.findall(r'class="modelCard modelExtra"', text)) != max(0, len(models) - 10):
            failures.append("wrong number of collapsed model cards")
        card_hrefs = [m.group(1).strip('"') for m in re.finditer(
            r'class=repoCard[^>]*?href=([^ >]+)', text)]
        # The first card is the GitHub profile, then the top 10 by stars.
        expected = ["https://github.com/" + data["github_user"]] + [
            r["url"] for r in sorted(repos, key=lambda x: -x["stars"])[:10]]
        if card_hrefs[:len(expected)] != expected:
            failures.append("GitHub cards are not sorted by stars")
        model_hrefs = [m.group(1).strip('"') for m in re.finditer(
            r'class=modelCard[^>]*?href=([^ >]+)', text)]
        expected_models = [m["url"] for m in sorted(
            models, key=lambda x: -x["likes"])[:10]]
        if model_hrefs[:len(expected_models)] != expected_models:
            failures.append("Hugging Face cards are not sorted by likes")
        checks.append(("repos " + route, failures))
    return checks


def check_ui():
    """Local UI preferences: selector at the right, no page zoom, compact
    GitHub-style stack chips, narrower project cards, no client name on
    the Projects page. Checks the built output, not the templates."""
    checks = []
    css_parts = []
    for style in (ROOT / "dist").rglob("*.css"):
        css_parts.append(style.read_text(encoding="utf-8"))
    home = (ROOT / "dist/index.html").read_text(encoding="utf-8")
    inline = re.search(r"<style>(.*?)</style>", home, re.S)
    if inline:
        css_parts.append(inline.group(1))
    css = re.sub(r"\s+", "", "".join(css_parts))

    failures = []
    if "zoom:1.25" in css:
        failures.append("125% page zoom is still present")
    checks.append(("ui default zoom", failures))

    failures = []
    if ".stackList{display:flex" not in css:
        failures.append("stack list is not a flex row")
    if "flex-wrap:wrap" not in css or "list-style:none" not in css:
        failures.append("stack chips lack wrapping or no-bullet styling")
    checks.append(("ui stack chips", failures))

    failures = []
    css_rules = (
        ".projectGallery{position:relative;left:50%;transform:translateX(-50%)",
        ".projectGallery{display:grid",
        ".projectRow{",
        "grid-template-columns:minmax(0,1fr)320px",
        ".projectRowimg{display:block;width:320px;height:180px;object-fit:cover",
    )
    for rule in css_rules:
        if rule not in css:
            failures.append("gallery CSS missing: " + rule)
    checks.append(("ui gallery layout", failures))

    for route in ("/", "/en/"):
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        else:
            menu = re.search(r"<nav\b[^>]*\bid=site-menu", text)
            selector = re.search(r"<nav\b[^>]*\bclass=langSwitchSite", text)
            if menu is None or selector is None or selector.start() < menu.start():
                failures.append("EN/ES selector is not after the menu")
        checks.append(("ui selector order " + route, failures))

    failures = []
    if ".headerLinks{margin-left:auto" not in css:
        failures.append("menu is not pushed to the right edge")
    if ".langSwitchSite{display:flex;align-items:center;gap:.4rem;margin-left:1.2rem" not in css:
        failures.append("EN/ES selector is not spaced after the menu")
    checks.append(("ui header right aligned", failures))

    for route in ("/projects/", "/en/projects/"):
        text, _ = _parse(route)
        failures = []
        main = _main_html(text or "")
        if "EIPSA" in main:
            failures.append("client name present in the Projects page")
        dead_repo = "https://github.com/jparedesDS/OCR-Identification-CS2-Weapons"
        live_repo = "https://github.com/jparedesDS/cs2-yolo12m-weapon-detection"
        if _href_present(text or "", dead_repo):
            failures.append("dead OCR repository link present")
        if not _href_present(text or "", live_repo):
            failures.append("weapon-detection repository link missing")
        checks.append(("ui projects links " + route, failures))

    text, _ = _parse("/")
    failures = []
    if text is None:
        failures.append("missing home page")
    else:
        gh = text.find("GitHub Profile")
        hf = text.find("Hugging Face Profile")
        if gh < 0 or hf < 0 or hf < gh:
            failures.append("Hugging Face icon is not after GitHub")
        if text and "M12.025 1.13" not in text:
            failures.append("official Hugging Face icon path is missing")
    checks.append(("ui social icons", failures))

    failures = []
    match = re.search(r"\.activeProjectsLabel\{([^}]*)\}", css)
    if match is None or "font-size:.92rem" not in match.group(1):
        failures.append("Active projects label was not enlarged")
    checks.append(("ui active projects label", failures))

    for route, expected in ABOUT_SECTIONS.items():
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        else:
            heads = [m.group(1).strip() for m in re.finditer(
                r"<h2\b[^>]*>\s*([^<]+?)\s*</h2>", text)]
            if heads != list(expected):
                failures.append("section order %r, expected %r"
                                % (heads, list(expected)))
            if len(re.findall(r"class=resumeBlock", text)) < 5:
                failures.append("resume blocks missing")
            experience = ("Experience", "Education") if route == "/about/" \
                else ("Experiencia", "Formación")
            for heading in experience:
                section = _section_html(text, heading) or ""
                if "<ul" in section:
                    failures.append("bullets in %s; keep uniform explanations"
                                    % heading)
            repos_link = "/en/repositories/" if route == "/en/about/" \
                else "/repositories/"
            if not _href_present(text, repos_link):
                failures.append("no link to %s" % repos_link)
        checks.append(("ui about layout " + route, failures))

    for route in MENU_ROUTES:
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        else:
            if "footerContact" not in text or "footerName" not in text:
                failures.append("footer contact block missing")
            if not _href_present(text, "https://buymeacoffee.com/joseparedes"):
                failures.append("Buy me a coffee missing from footer")
        checks.append(("ui footer contact " + route, failures))

    blog_text, _ = _parse("/en/blog/")
    failures = []
    if blog_text is None or "profileSocial" not in blog_text:
        failures.append("blog social row is missing the shared icon list")
    if blog_text and "buymeacoffee.com/joseparedes" not in blog_text:
        failures.append("blog social row lacks Buy me a coffee")
    checks.append(("ui blog socials", failures))

    for route in CONTACT_COPY:
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        else:
            cards = len(re.findall(r"class=contactProject(?=[\s>])", text))
            if cards != 5:
                failures.append("expected 5 project cards, found %d" % cards)
            if "propovIcons" in text:
                failures.append("old Pro POV icon row still present")
            if len(re.findall(r'class="?contactLinks', text)) != 5:
                failures.append("each project card needs icon links")
            propov = re.search(r'<strong>Pro POV CS2</strong>.*?contactLinks>(.*?)</div>',
                               text, re.S)
            links = len(re.findall(r"<a\b", propov.group(1))) if propov else 0
            if links != 6:
                failures.append("expected 6 Pro POV links in the card, found %d"
                                % links)
            for src in re.findall(r'<img\b[^>]*src=([^ >]+)', text):
                src = src.strip('"')
                if src.startswith("/images/"):
                    if not (ROOT / "dist" / src.lstrip("/")).is_file():
                        failures.append("missing project image: " + src)
        checks.append(("ui contact cards " + route, failures))

    for route, pdf in (("/cv/", "/resume-es.pdf"), ("/en/cv/", "/resume.pdf")):
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        else:
            if not re.search(r"<h1[^>]*>\s*CV\s*</h1>", text):
                failures.append("missing CV h1")
            tag = re.search(
                r'<a\b[^>]*href=(?:"%s"|%s)[^>]*>'
                % (re.escape(pdf), re.escape(pdf)), text)
            if tag is None:
                failures.append("no PDF download link " + pdf)
            elif "download" not in tag.group(0):
                failures.append("PDF link lacks download attribute")
            if len(re.findall(r"<h3\b", text)) < 6:
                failures.append("too few CV sections")
            if len(re.findall(r'class="?cvEntry', text)) < 5:
                failures.append("too few CV entries")
            if "Download CV" in text or "Descargar CV" in text:
                failures.append("old CTA label still present")
            if "cvSidebar" not in text or "cv-toc" not in text:
                failures.append("left CV sidebar missing")
            toc = re.search(r'<nav id=cv-toc>(.*?)</nav>', text, re.S)
            toc_links = len(re.findall(r"<a\b", toc.group(1))) if toc else 0
            if toc_links != 9:
                failures.append("expected 9 CV TOC links, found %d" % toc_links)
            if len(re.findall(r'class="?cvCard', text)) < 9:
                failures.append("CV content cards missing")
        checks.append(("ui cv page " + route, failures))

    for route in MENU_ROUTES:
        text, _ = _parse(route)
        failures = []
        if text is None or "~/CV" in text:
            failures.append("CV link is back in the top menu")
        checks.append(("ui cv menu " + route, failures))

    failures = []
    if not (ROOT / "scripts/update_repositories.py").is_file():
        failures.append("repository refresh script missing")
    workflow = (ROOT / ".github/workflows/deploy.yml").read_text(encoding="utf-8")
    if "update_repositories.py" not in workflow:
        failures.append("deploy workflow does not refresh repository data")
    checks.append(("ui auto refresh", failures))
    return checks


def check_route(route):
    """Return failure messages for one route (empty list = pass)."""
    path = page(route)
    if not path.is_file():
        return ["missing file " + str(path.relative_to(ROOT))]
    failures = []
    if path.suffix == ".html":
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            return ["invalid UTF-8: %s" % exc]
        if route in REDIRECT_STUBS:
            parser = _RefreshParser()
            parser.feed(text)
            parser.close()
            if not parser.has_refresh:
                failures.append("redirect stub has no <meta http-equiv=refresh>")
            elif not parser.targets:
                failures.append("redirect stub has no nonempty url= target in refresh content")
        elif "<main" not in text:
            failures.append("HTML page has no <main")
    if route == "/en/blog/index.json":
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            failures.append("invalid JSON: %s" % exc)
        else:
            if not isinstance(data, list):
                failures.append("expected a list, got " + type(data).__name__)
            elif len(data) != 2:
                failures.append("expected exactly 2 elements, got %d" % len(data))
    return failures


def main():
    passed = 0
    for route in ROUTES:
        failures = check_route(route)
        if failures:
            print("FAIL %s: %s" % (route, "; ".join(failures)))
        else:
            print("PASS " + route)
            passed += 1
    i18n_checks = check_i18n()
    i18n_passed = 0
    for label, failures in i18n_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            i18n_passed += 1
    hire_checks = check_hiring()
    hire_passed = 0
    for label, failures in hire_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            hire_passed += 1
    case_checks = check_cases()
    case_passed = 0
    for label, failures in case_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            case_passed += 1
    about_checks = check_about()
    about_passed = 0
    for label, failures in about_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            about_passed += 1
    positioning_checks = check_positioning()
    positioning_passed = 0
    for label, failures in positioning_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            positioning_passed += 1
    contact_checks = check_contact()
    contact_passed = 0
    for label, failures in contact_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            contact_passed += 1
    sharing_checks = check_sharing()
    sharing_passed = 0
    for label, failures in sharing_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            sharing_passed += 1
    notfound_checks = check_404()
    notfound_passed = 0
    for label, failures in notfound_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            notfound_passed += 1
    menu_checks = check_menu()
    menu_passed = 0
    for label, failures in menu_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            menu_passed += 1
    privacy_checks = check_privacy()
    privacy_passed = 0
    for label, failures in privacy_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            privacy_passed += 1
    cv_checks = check_cv()
    cv_passed = 0
    for label, failures in cv_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            cv_passed += 1
    repos_checks = check_repos()
    repos_passed = 0
    for label, failures in repos_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            repos_passed += 1
    ui_checks = check_ui()
    ui_passed = 0
    for label, failures in ui_checks:
        if failures:
            print("FAIL %s: %s" % (label, "; ".join(failures)))
        else:
            print("PASS " + label)
            ui_passed += 1
    total = len(ROUTES)
    if (passed == total and i18n_passed == len(i18n_checks)
            and hire_passed == len(hire_checks)
            and case_passed == len(case_checks)
            and about_passed == len(about_checks)
            and positioning_passed == len(positioning_checks)
            and contact_passed == len(contact_checks)
            and sharing_passed == len(sharing_checks)
            and notfound_passed == len(notfound_checks)
            and menu_passed == len(menu_checks)
            and privacy_passed == len(privacy_checks)
            and cv_passed == len(cv_checks)
            and repos_passed == len(repos_checks)
            and ui_passed == len(ui_checks)):
        print("OK %d/%d" % (passed, total))
        return 0
    print("FAIL %d/%d" % (passed, total))
    return 1


if __name__ == "__main__":
    sys.exit(main())
