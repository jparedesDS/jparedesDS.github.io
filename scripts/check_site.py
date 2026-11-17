#!/usr/bin/env python3
"""Site verification harness for the hiring-portfolio rebuild.

Run from the repo root after a Hugo build:

    python scripts/check_site.py

Prints a PASS/FAIL line per route and a summary (`OK 23/23`), exiting 0
when everything passes and 1 otherwise. Each task of the plan adds its
assertions to main()/check_route(). Stdlib only.
"""

import json
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
    total = len(ROUTES)
    if passed == total and i18n_passed == len(i18n_checks):
        print("OK %d/%d" % (passed, total))
        return 0
    print("FAIL %d/%d" % (passed, total))
    return 1


if __name__ == "__main__":
    sys.exit(main())
