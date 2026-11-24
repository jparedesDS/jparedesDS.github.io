# Projects Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-heavy three-case Projects page with a single column of nine uniform, image-led project cards in both languages.

**Architecture:** Content lives in the two Markdown files; all layout lives in the shared `custom-head.html` style block; `scripts/check_site.py` owns verification. A centred breakout widens only the gallery, leaving `.main` and every page heading untouched. Cards are a two-column CSS grid (text left, fixed image right) that collapses to one column on narrow screens.

**Tech Stack:** Hugo 0.169 extended, Dart Sass, Python 3 verification harness, headless Chromium for geometry checks.

**Spec:** `docs/superpowers/specs/2026-11-24-projects-page-design.md`

## Global Constraints

- Default language ES at `/`, EN at `/en/`; both must have identical project sets, images and links.
- No light mode, no Astro, no `/work/` routes, no header menu changes.
- Do not widen `.main` globally; only the gallery gets the breakout.
- Do not touch Repositories, Contact, CV, About or blog pages.
- Keep `python scripts/check_site.py` at zero failures after each task.
- Build with Dart Sass prepended to PATH; deploy by pushing `main` and waiting for the GitHub Actions run.

## Review Focus

- **Whole-page heading position:** widening the gallery must not shift the page title — test that `.main` width is unchanged and the gallery breakout is centred.
- **Rows with long titles/explanations:** nine cards must stay identical in height — test `min-height` plus fixed image box, and measure row heights in Chromium.
- **Narrow screens:** the image must drop below the text and no horizontal scroll may appear — test at 1440 px and 390 px.
- **Missing or foreign images:** every row needs a local image with alt text; ES must not use EN-only diagrams — test each image `src` exists in `dist/images/`.
- **Stale case-study checks:** old `.caseList`/`.case` assertions must be replaced, not left failing — test that no check references `.caseList`, `.caseMedia`, `CASE_ANCHORS` or `CASE_DIAGRAMS`.

---

### Task 1: Gallery CSS and UI CSS checks

**Files:**
- Modify: `layouts/_partials/custom-head.html` (replace the `.case*` block around lines 1285–1369)
- Modify: `scripts/check_site.py` (replace the CSS assertions at lines 2360–2365)

**Interfaces:**
- Produces: `.projectGallery`, `.projectRow`, `.projectBody`, `.projectLinks`, `.projectChips`, `.projectRow img` class contract consumed by both Markdown files.
- Produces: harness check group `ui gallery layout` with zero failures.

- [ ] **Step 1: Write the failing CSS assertions**

In `check_ui()` replace the two `.case` assertions with:

```python
css_rules = (
    ".projectGallery{position:relative;left:50%;transform:translateX(-50%)",
    ".projectGallery{display:grid",
    ".projectRow{",
    "grid-template-columns:minmax(0,1fr) 320px",
    ".projectRow img{display:block;width:320px;height:180px;object-fit:cover",
)
for rule in css_rules:
    if rule not in css:
        failures.append("gallery CSS missing: " + rule)
```

- [ ] **Step 2: Run the harness to confirm the new assertions fail**

Run: `python scripts/check_site.py`
Expected: FAIL for `ui gallery layout`, plus pre-existing case failures in other groups.

- [ ] **Step 3: Implement the CSS**

Replace the `.case`, `.case h3`, `.caseMedia`, `.caseMedia img`, `.caseMedia figcaption`, `.case p`, `.case p strong`, `.caseChips`, `.caseChips li`, `.case p:last-of-type`, `.case a`, `.case a:hover` and the `@media (max-width:768px)` `.case`/`.caseMedia` rules with:

- `.projectGallery` breakout: `position: relative; left: 50%; transform: translateX(-50%); width: 1200px; max-width: calc(100vw - 40px); display: grid; gap: 1rem; margin: 1.2rem 0 2rem;`
- `.projectRow`: `display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 1.5rem; align-items: center; min-height: 210px; box-sizing: border-box; padding: 1.25rem 1.4rem; border: 1px solid #3a3b3d; border-radius: 10px; background: #2e2e33;`
- `.projectBody h3`: Fira Mono, 1.2rem, `color: #f8f8ff`, margin bottom 0.5rem.
- `.projectBody p`: `color: #c9c9cf`, `line-height: 1.6`, margin bottom 0.65rem.
- `.projectChips` / `.projectChips li`: reuse the existing `.caseChips` visual values (flex wrap, no bullets, pill border `#3a3b3d`, `#80aadd` text, 0.72rem Fira Mono).
- `.projectLinks`: flex wrap, gap 0.5rem; anchors get the button-like styling already used by `.hireActions a`.
- `.projectRow img`: `display: block; width: 320px; height: 180px; object-fit: cover; border: 1px solid #3a3b3d; border-radius: 8px; background: #292a2d;`
- Media query `@media (max-width: 900px)`: `.projectRow { grid-template-columns: 1fr; }` and `.projectRow img { width: 100%; max-width: 320px; height: 180px; }`.
- Keep the `.reposColumns` and `.contactProject` rules inside the existing media query intact.

- [ ] **Step 4: Rebuild and verify the CSS checks**

Run: `python scripts/check_site.py`
Expected: `ui gallery layout` passes; case-related groups still fail until Tasks 2–4 land.

- [ ] **Step 5: Commit**

```bash
git add layouts/_partials/custom-head.html scripts/check_site.py
git commit -m "style: add wide one-column project gallery cards"
```

---

### Task 2: Spanish gallery content

**Files:**
- Modify: `content/es/projects.md` (replace lines 8–111)

**Interfaces:**
- Consumes: the Task 1 class contract.
- Produces: nine `<section class="projectRow">` blocks in ES and the final archive line.

- [ ] **Step 1: Write the Spanish cards**

Replace the page body with: a one-line intro, `<div class="projectGallery">`, then nine `<section class="projectRow">` blocks, each with `<div class="projectBody">` containing `<h3>`, one `<p>`, `<ul class="projectChips">` (2–4 chips), `<p class="projectLinks">` with the project's links, and an `<img>` as the last child of the row. Order and links:

1. Visión artificial industrial — `case-vision-es.svg`, alt in Spanish; HF penetrant model + HF profile + welding detector GitHub.
2. DocFlow — `case-docflow-es.svg`, alt in Spanish; DocFlow Lite GitHub link labelled `DocFlow Lite en GitHub`; mention the SaaS is internal.
3. subany.video — `case-subany.png`; demo link and `/en/blog/2026/11/09/how-subany-video-works/`.
4. CleanYourPhone — `cleanyourphone-thumb.png`; `https://www.cleanyourphone.org/`.
5. CleanYourMail — `cleanyourmail-thumb.png`; `https://www.cleanyourmail.org/`.
6. Pro POV CS2 — `propov-cs2.png`; `https://propovcs2.com/` and `https://www.tiktok.com/@propov_cs2`.
7. HLTV scraper — `myhltv.png`; `https://github.com/jparedesDS/hltv-scraper`.
8. Extracción de datos DXF — `mydxf.png`; `https://github.com/jparedesDS/extract-data-dxf`.
9. Detección de armas en CS2 — `ocr-identification.png`; `https://github.com/jparedesDS/cs2-yolo12m-weapon-detection`.

All images use `/images/<name>` with meaningful Spanish `alt` text. Finish with one archive sentence linking to `https://github.com/jparedesDS` and `https://huggingface.co/jparedesDS`. Keep facts consistent with CV/About (10+ models, 15.3 s delay, 0–40 ms, 21 routers, 24 services, 24 screens); do not introduce `500+`, `PyTorch`, `hls.js` or `HLS`.

- [ ] **Step 2: Commit**

```bash
git add content/es/projects.md
git commit -m "content: rebuild Spanish projects as visual gallery"
```

---

### Task 3: English gallery content

**Files:**
- Modify: `content/en/projects.md` (replace lines 8–111)

**Interfaces:**
- Consumes: the Task 1 class contract.
- Produces: the English mirror of Task 2 with English alt text and link labels.

- [ ] **Step 1: Write the English cards**

Mirror Task 2 exactly: same nine projects in the same order, same images, same links; English copy, English alt text, chips in English, DocFlow link labelled `DocFlow Lite on GitHub`, same archive links. Preserve the same facts and banned-claim rules.

- [ ] **Step 2: Commit**

```bash
git add content/en/projects.md
git commit -m "content: rebuild English projects as visual gallery"
```

---

### Task 4: Replace the case-study harness

**Files:**
- Modify: `scripts/check_site.py` (constants lines 443–505 and `check_cases()` lines 516–642)

**Interfaces:**
- Produces: `check_projects()` registered in the same runner position as `check_cases()`; harness reports zero failures.

- [ ] **Step 1: Write the new assertions before deleting the old ones**

For each route, assert: `projectGallery` markup present; exactly nine `<section class="projectRow">`; every row has one `/images/` img with non-empty alt; each of the nine expected URLs present via `_href_present`; no `caseList`, `class=case`, `caseMedia`, `caseChips`; no `EIPSA`; no dead OCR repo URL; live weapon-detection repo URL present; foreign-language diagram names absent; archive GitHub and HF links present. Keep the existing `1200x675` shipped-image check for the three case images (they are still served even if no longer on this page) or drop it only if it references removed constants.

- [ ] **Step 2: Run the harness to confirm the new check fails against the old content**

Run: `python scripts/check_site.py`
Expected: FAIL for the new `projects` groups while the old content is still present.

- [ ] **Step 3: Implement `check_projects()`**

Delete `CASE_ANCHORS`, `CASE_DIAGRAMS`, `CASE_IMAGES`, `CASE_BANNED`, `CASE_MODEL_URL`, `CASE_FACTS`, `DOCFLOW_LITE`, `SUBANY_ARTICLE` and `check_cases()`; define the new constants and `check_projects()` from Step 1; update the runner to call `check_projects()`. Preserve `ACTIVE_PRODUCT_URLS`-equivalent coverage inside the new per-project URL list.

- [ ] **Step 4: Rebuild and run the full harness**

Run: `python scripts/check_site.py`
Expected: `OK` with zero failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/check_site.py
git commit -m "test: verify the new projects gallery"
```

---

### Task 5: Build, visual verification and deploy

**Files:**
- No source changes expected; fix-forward in the owning task if a check fails.

**Interfaces:**
- Consumes: all previous tasks.

- [ ] **Step 1: Clean build**

Run:
```bash
$env:PATH = "C:\Users\xht\AppData\Local\Temp\opencode\dart-sass\dart-sass;$env:PATH"
Remove-Item -Recurse -Force dist
hugo --gc --minify
python scripts/check_site.py
```
Expected: build completes, harness `OK`.

- [ ] **Step 2: Measure geometry with headless Chromium**

Serve `dist` locally and evaluate at 1440 px and 390 px for both routes: all `.projectRow` heights equal; `.projectRow img` is 320×180 at desktop; gallery centre matches viewport centre; `document.documentElement.scrollWidth <= window.innerWidth`; page `<h1>` x-position unchanged from the pre-change build.

- [ ] **Step 3: Screenshot and review both languages**

Capture desktop screenshots of `/projects/` and `/en/projects/`; confirm one column, image on the right, uniform rows, all nine projects visible when scrolling, no clipped text.

- [ ] **Step 4: Deploy and verify live**

Commit any fix-forward, push `main`, wait for the Actions run to complete, then fetch the live ES and EN pages and assert nine `projectRow` markers and the expected links.

```bash
git push origin main
```
