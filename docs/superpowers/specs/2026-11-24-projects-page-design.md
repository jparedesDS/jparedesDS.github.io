# Projects page — visual gallery redesign

**Date:** 2026-11-24
**Status:** approved by partner

## Intent

Rebuild `/projects/` (ES) and `/en/projects/` (EN) from scratch so each project is immediately understandable and visual: title, short explanation, photo and links in a single uniform row. This follows the card style of the first portfolio (Krishan-era `project-cards`: screenshot + bold title + description + `[code]`/`[model]` links), adapted to the current dark Nightfall shell. The partner explicitly chose the full rebuild (option B) over recycling the three text-heavy case studies.

## Goals

- One column of wide, evenly sized cards stacked vertically.
- Each card: text on the left (title, 1–2 sentence explanation, tech chips, link row) and a fixed-size image on the right, so every row is identical in shape.
- Content widened enough to fit comfortably, without moving the page title or other pages' layout.
- Nine projects at launch, easy to extend by copying one block in each language file.
- Bilingual parity: same projects, images and links in ES and EN.

## Non-goals / anti-goals

- No light mode, no Astro, no `/work/` routes.
- Do not widen `.main` globally: earlier attempts shifted headings on other pages. Use a centred breakout on the card list only.
- Do not keep the old `.caseList` / `.caseMedia` text-case layout or the old case-study harness assertions.
- Do not change the header menu, repositories, contact or CV pages.

## Constraints

- Hugo static site, default language ES at `/`, EN at `/en/`.
- Existing images in `static/images/`; no new image generation required.
- Verification harness `scripts/check_site.py` currently asserts the three case studies; those checks must be replaced, not left stale.
- Build: Hugo extended + Dart Sass on PATH; deploy via GitHub Actions.

## Approaches considered

- **A — Recycle the three case studies as visual cards.** Lower risk, but only three projects and still diagram-led. Rejected: partner asked to start from zero.
- **B — Full gallery of ~9 real projects.** Chosen: gives the clear, visual result the partner wants and a simple pattern for adding more later.

## Design

### Layout

- `.projectGallery` is a centred breakout: `position: relative; left: 50%; transform: translateX(-50%); width: 1200px; max-width: calc(100vw - 40px);` so the card list can be wider than the theme's `.main` while the page title stays in its original place.
- `.projectGallery` is a single column (`display: grid; gap: 1rem`), one `.projectRow` per project.
- `.projectRow`: CSS grid `minmax(0, 1fr) 320px`, `align-items: center`, `min-height: 210px`, padding `1.25rem 1.4rem`, border/radius/background matching the Nightfall cards. On screens ≤ 900 px the image drops below the text (`grid-template-columns: 1fr`) and the image becomes full width.
- `.projectRow img`: fixed `width: 320px; height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid #3a3b3d`.
- Text column: `<h3>` (Fira Mono, ~1.2rem), one paragraph of explanation, `<ul class="projectChips">` with tech tags, and `<p class="projectLinks">` with one link per project (button-like anchors).
- Every row has the same structure and size; adding a project means copying one `<section class="projectRow">` block into both language files.

### Content (nine projects, ordered)

1. Industrial computer vision — `case-vision.svg` / `case-vision-es.svg` — model + GitHub links.
2. DocFlow (document-control SaaS) — `case-docflow.svg` / `case-docflow-es.svg` — DocFlow Lite GitHub link.
3. subany.video — `case-subany.png` — demo + how-it-works article.
4. CleanYourPhone — `cleanyourphone-thumb.png` — site link.
5. CleanYourMail — `cleanyourmail-thumb.png` — site link.
6. Pro POV CS2 — `propov-cs2.png` — site + community links.
7. HLTV scraper — `myhltv.png` — GitHub link.
8. DXF data extraction — `mydxf.png` — GitHub link.
9. CS2 weapon detection — `ocr-identification.png` — GitHub/HF link.

A final short "archive" line links to GitHub and Hugging Face profiles. Factual claims in the explanations stay consistent with the existing CV/About content.

### Verification

- Rewrite `check_projects` and the UI CSS checks in `scripts/check_site.py` for the new structure: nine `.projectRow` sections per route, one image with alt text per row, expected links present, no leftover `.caseList` markup, breakout CSS present, uniform row height rules present.
- Keep the global harness at `OK` with no failures; build locally, check card geometry with headless Chromium at desktop and mobile widths, verify no horizontal scroll.
- Commit, push to `main`, wait for the deploy run, verify the live ES and EN pages.
