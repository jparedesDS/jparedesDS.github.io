#!/usr/bin/env python3
"""Site verification harness for the hiring-portfolio rebuild.

Run from the repo root after a Hugo build:

    python scripts/check_site.py

Prints a PASS/FAIL line per route and a summary (`OK 18/18`), exiting 0
when everything passes and 1 otherwise. Each task of the plan adds its
assertions to main()/check_route(). Stdlib only.
"""

import json
import re
import sys
from pathlib import Path

# Legacy redirect stubs (static/propovcs2/, static/cleanyourmail/) are kept
# verbatim by the plan and carry no <main>; they are verified as redirects.
REFRESH_RE = re.compile(r"<meta[^>]*http-equiv\s*=\s*[\"']?refresh[\"']?[^>]*>", re.I)

ROOT = Path(__file__).resolve().parent.parent

ROUTES = [
    "/", "/about/", "/projects/", "/contact/", "/blog/", "/blog/search/",
    "/blog/tags/", "/blog/tags/hls/", "/blog/archives/", "/blog/faq/",
    "/blog/2026/11/09/how-subany-video-works/",
    "/blog/2026/11/09/como-funciona-subany-video/",
    "/blog/index.json", "/blog/index.xml", "/index.xml", "/sitemap.xml",
    "/propovcs2/", "/cleanyourmail/",
]


def page(route):
    """Map a route to its built file: dir routes end in index.html."""
    suffix = route + "index.html" if route.endswith("/") else route
    return ROOT / "dist" / suffix.lstrip("/")


def check_route(route):
    """Return failure messages for one route (empty list = pass)."""
    path = page(route)
    if not path.is_file():
        return ["missing file " + str(path.relative_to(ROOT))]
    failures = []
    if path.suffix == ".html":
        text = path.read_text(encoding="utf-8")
        if REFRESH_RE.search(text):
            # Redirect stub: preserved verbatim, no <main>. Assert it points
            # somewhere instead of requiring a content landmark.
            if "url=" not in text.lower():
                failures.append("redirect stub has no refresh target")
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
    total = len(ROUTES)
    if passed == total:
        print("OK %d/%d" % (passed, total))
        return 0
    print("FAIL %d/%d" % (passed, total))
    return 1


if __name__ == "__main__":
    sys.exit(main())
