#!/usr/bin/env python3
"""Site verification harness for the hiring-portfolio rebuild.

Run from the repo root after a Hugo build:

    python scripts/check_site.py

Prints a PASS/FAIL line per route and a summary (`OK 23/23`), exiting 0
when everything passes and 1 otherwise. Each task of the plan adds its
assertions to main()/check_route(). Stdlib only.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ROUTES = [
    "/", "/about/", "/projects/", "/contact/", "/blog/", "/blog/search/",
    "/blog/tags/", "/blog/tags/hls/", "/blog/archives/", "/blog/faq/",
    "/blog/2026/11/09/how-subany-video-works/",
    "/blog/2026/11/09/como-funciona-subany-video/",
    "/blog/index.json", "/blog/index.xml", "/index.xml", "/sitemap.xml",
    "/propovcs2/", "/cleanyourmail/",
    "/es/", "/es/about/", "/es/projects/", "/es/contact/", "/es/privacy/",
]

BASE_URL = "https://jparedesds.github.io"

# Task 2: EN/ES page pairs. Slugs are identical in both languages; the
# blog stays English-only and is deliberately absent from this list.
PAGE_PAIRS = [
    ("/", "/es/"),
    ("/about/", "/es/about/"),
    ("/projects/", "/es/projects/"),
    ("/contact/", "/es/contact/"),
    ("/privacy/", "/es/privacy/"),
]

# Controller ruling (Task 1 review): only these two preserved static
# meta-refresh stubs may skip <main>, because they must not be modified.
# Every other HTML route must contain <main; there is no general
# "any refresh HTML" exemption.
REDIRECT_ROUTES = {"/propovcs2/", "/cleanyourmail/"}


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

    for en_route, es_route in PAGE_PAIRS:
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
                                   ("x-default", en_route)):
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
    # must stay hidden on every /blog... page and visible on /es/.
    for route in ("/blog/", "/blog/2026/11/09/how-subany-video-works/"):
        text, _ = _parse(route)
        failures = []
        if text is None:
            failures.append("missing page")
        elif _has_selector(text):
            failures.append("blog page must not render langSwitchSite")
        checks.append(("selector hidden on " + route, failures))
    text, _ = _parse("/es/")
    checks.append(("selector visible on /es/",
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
        if not any(_norm(t) == "/blog/" for t in refresh.targets):
            failures.append("no meta refresh to /blog/")
        if _norm(parser.canonical or "") != "/blog/":
            failures.append("canonical is %r, want %s/blog/"
                            % (parser.canonical, BASE_URL))
        if not any(_norm(href) == "/blog/" and text_
                   for href, text_ in parser.anchors):
            failures.append("no visible link to /blog/")
    checks.append(("/es/blog/ redirect", failures))

    return checks


# Task 3: hiring strip on both home pages. Copy is the approved text,
# verbatim. The ES CV link keeps pointing at the English /resume.pdf
# until Task 11 ships /resume-es.pdf. Hugo's minifier drops quotes
# around simple attribute values, so href checks accept both forms.
HIRE_COPY = {
    "/": {
        "lang": "en",
        "role": "Computer Vision & ML Engineer",
        "bio": ("I build computer-vision systems for industrial quality "
                "control and local-first AI products."),
        "availability": "Madrid · Open to opportunities",
        "proof": ("Industrial computer vision since 2024 · 10+ models on "
                  "Hugging Face · DocFlow in production"),
        "proof_marker": "since 2024",
        "cv": "Download CV",
        "email": "Email me",
        "projects": "Active projects",
        "banned": "four years",
    },
    "/es/": {
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
        "email": "Escríbeme",
        "projects": "Proyectos activos",
        "banned": "cuatro años",
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
        if copy["banned"].casefold() in text.casefold():
            failures.append("banned phrase present: %r" % copy["banned"])
        for cls in ("hireStrip", "hireAvailability", "hireProof",
                    "hireActions"):
            if _class_pos(text, cls) == -1:
                failures.append("no .%s markup" % cls)

        # CV button: /resume.pdf in both languages, with download.
        if not _href_present(text, "/resume.pdf"):
            failures.append('no href="/resume.pdf"')
        cv_tag = re.search(
            r'<a\b[^>]*href=(?:"/resume\.pdf"|/resume\.pdf)[^>]*>', text)
        if cv_tag is None:
            failures.append("no CV anchor tag")
        elif "download" not in cv_tag.group(0):
            failures.append("CV anchor lacks download attribute")
        if not any(_norm(href) == "/resume.pdf" and label == copy["cv"]
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

    # The CV link target must actually ship, in both languages.
    checks.append(("resume.pdf shipped",
                   [] if (ROOT / "dist" / "resume.pdf").is_file()
                   else ["dist/resume.pdf missing"]))
    return checks


# Task 4: three case studies on Projects. Facts are fixed by the plan;
# "500+" belongs to the correo->ERP automation and lives in About, so it
# is banned here. Each fact lists the accepted spellings (the minifier
# keeps text as authored, but en/em dashes may vary by copy).
CASE_ANCHORS = ("vision", "docflow", "subany")
# Diagrams are localized: each language must reference its own variants
# (review ruling); the subany capture is shared.
CASE_DIAGRAMS = {
    "/projects/": ("case-vision.svg", "case-docflow.svg"),
    "/es/projects/": ("case-vision-es.svg", "case-docflow-es.svg"),
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
        ("21 API routers",),
        ("24 services",),
        ("24 screens",),
        ("0–40 ms", "0-40 ms"),
        ("15.3",),
    ],
    "/es/projects/": [
        ("21 routers",),
        ("24 servicios",),
        ("24 pantallas",),
        ("0–40 ms", "0-40 ms"),
        ("15,3",),
    ],
}
SUBANY_ARTICLE = "/blog/2026/11/09/how-subany-video-works/"
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
        text, _ = _parse(route)
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
        if "500+" in text:
            failures.append("banned figure 500+ present (belongs in About)")
        lowered = text.casefold()
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
# equivalents. Kaggle is a "bronze medal", never a podium place. The ES
# CV link keeps /resume.pdf until Task 11 ships /resume-es.pdf (that
# task updates this check).
# Review round 1: facts are scoped to the section that owns them and
# matched as distinctive phrases, so a figure mentioned elsewhere on the
# page (Tableau in Stack, DocFlow in Projects, Kaggle in Contact) cannot
# mask a deleted bullet. "95%+" keeps its plus; the approved ES wording
# is "al menos el 95%".
ABOUT_INTRO_FACTS = {
    "/about/": [("Languages:",), ("native",), ("B2",)],
    "/es/about/": [("Idiomas:",), ("nativo",), ("B2",)],
}
ABOUT_SCOPE_FACTS = {
    "/about/": {
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
        "Open source": [
            ("33+",),
            ("268+",),
            ("10+",),
            ("Kaggle",),
            ("bronze medal in multilabel image classification",),
            ("ResNet152",),
        ],
    },
    "/es/about/": {
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
        "Código abierto": [
            ("33+",),
            ("268+",),
            ("10+",),
            ("Kaggle",),
            ("medalla de bronce en clasificación multilabel de imágenes",),
            ("ResNet152",),
        ],
    },
}
ABOUT_SECTIONS = {
    "/about/": ("Projects", "Experience", "Open source", "Education",
                "Stack", "Writing", "Contact"),
    "/es/about/": ("Proyectos", "Experiencia", "Código abierto", "Formación",
                   "Stack", "Blog", "Contacto"),
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
        if route == "/es/about/" and "provisional" in lowered:
            failures.append("provisional stub notice still present")
        for name in ABOUT_SECTIONS[route]:
            if re.search(r"<h2\b[^>]*>\s*%s\s*</h2>" % re.escape(name),
                         text) is None:
                failures.append("missing h2 section: %r" % name)

        # CV link sits right under the intro paragraph: after the h1 and
        # before the first section h2.
        cv = re.search(
            r'<a\b[^>]*href=(?:"/resume\.pdf"|/resume\.pdf)[^>]*>', text)
        h1_pos = text.find("<h1")
        h2_pos = text.find("<h2")
        if cv is None:
            failures.append('no href="/resume.pdf"')
        elif not (-1 < h1_pos < cv.start() < h2_pos):
            failures.append(
                "CV link not between h1 and first h2: h1@%d cv@%d h2@%d"
                % (h1_pos, cv.start(), h2_pos))

        # Legacy deep links (/about/#projects) keep resolving.
        if 'id="projects"' not in text and "id=projects" not in text:
            failures.append('no id="projects" anchor')
        checks.append(("about " + route, failures))

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
        if route in REDIRECT_ROUTES:
            parser = _RefreshParser()
            parser.feed(text)
            parser.close()
            if not parser.has_refresh:
                failures.append("redirect stub has no <meta http-equiv=refresh>")
            elif not parser.targets:
                failures.append("redirect stub has no nonempty url= target in refresh content")
        elif "<main" not in text:
            failures.append("HTML page has no <main")
    if route == "/blog/index.json":
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            failures.append("invalid JSON: %s" % exc)
        else:
            if not isinstance(data, list):
                failures.append("expected a list, got " + type(data).__name__)
            elif len(data) != 1:
                failures.append("expected exactly 1 element, got %d" % len(data))
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
    total = len(ROUTES)
    if (passed == total and i18n_passed == len(i18n_checks)
            and hire_passed == len(hire_checks)
            and case_passed == len(case_checks)
            and about_passed == len(about_checks)):
        print("OK %d/%d" % (passed, total))
        return 0
    print("FAIL %d/%d" % (passed, total))
    return 1


if __name__ == "__main__":
    sys.exit(main())
