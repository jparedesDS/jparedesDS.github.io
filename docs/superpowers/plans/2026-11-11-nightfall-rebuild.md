# Nightfall Portfolio Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio on Hugo + Nightfall with home/About/blog, migrate the two posts with tags/archive/FAQ, keep the active static routes, and finish with a clean orphan history.

**Architecture:** Hugo site at the repo root with Nightfall vendored in `themes/nightfall`. Content lives in `content/`; legacy static routes/assets live in `static/`; the blog is `content/blog` at `/blog/` with taxonomy at `/blog/tags/`, archive at `/blog/archives/` and FAQ at `/blog/faq/`. The old Astro app and `/work/` pages are removed. After verification, `main` is replaced by an orphan commit and the PaperMod blog repo is retired.

**Tech Stack:** Hugo 0.169 Extended, Dart Sass, Nightfall, GitHub Pages, Playwright for visual/link checks.

**Spec:** `docs/superpowers/specs/2026-11-11-nightfall-rebuild-design.md`

## Global Constraints

- Nightfall is dark-only; no light mode/toggle is added.
- Root URL: `https://jparedesds.github.io/`; repo name stays `jparedesDS.github.io`.
- Blog URLs preserved: `/blog/`, `/blog/2026/11/09/...`, `/blog/tags/`, `/blog/tags/<term>/`, `/blog/archives/`, `/blog/faq/`, `/blog/index.xml`.
- Nightfall is MIT; vendor `LICENSE` and add attribution.
- Do not touch `/cs2pov/`, `/propovcs2/`, `/murdoku/`, DNS of `cleanyourmail.org`/`cleanyourphone.org`.
- `/cleanyourmail/` becomes a redirect to `https://cleanyourmail.org/`.
- No `/work/` pages or 5 cases; redirect old routes.
- No search; `/blog/search/` and `/blog/index.json` retire.
- Backup before the force-push; keep `gh-pages`.
- The repo may remain marked as a GitHub fork; option 2 only cleans history.

## Review Focus

- The home must match Nightfall’s terminal layout, not the old Astro design.
- Old blog post URLs and tag/archive/FAQ URLs must not 404.
- The `/blog/` cutover must not leave the old PaperMod site shadowing the new one.
- `cleanyourmail.org`/`www` and the legal/subsites must survive untouched.
- The force-push must have a verified backup and a rollback path.

---

### Task 1: Nightfall scaffold, home and About

**Files:**
- Create: `hugo.toml`, `content/_index.md`, `content/about.md`
- Create: `themes/nightfall/` (vendored theme)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: design + existing `src/data/site.ts` for content.
- Produces: Hugo site building to `dist/`, Nightfall home, About, menu.

- [ ] **Step 1: Copy the theme**

From `C:\Users\xht\AppData\Local\Temp\opencode\nightfall`, copy into `themes/nightfall`:
`archetypes`, `assets`, `i18n`, `layouts`, `static`, `theme.toml`, `LICENSE`.
Do not copy `.git`, `exampleSite`, `images`, `README.md`, `netlify.toml`.

- [ ] **Step 2: Create `hugo.toml`**

```toml
baseURL = "https://jparedesds.github.io/"
locale = "en-us"
title = "Jose Paredes"
theme = "nightfall"
publishDir = "dist"

[module]
  [module.hugoVersion]
    min = "0.158.0"

[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true

[pagination]
  pagerSize = 10

[permalinks]
  blog = "/blog/:year/:month/:day/:slug/"
  tags = "/blog/tags/:slug/"

[menu]
  [[menu.header]]
    name = "about"
    weight = 0
    url = "about"
  [[menu.header]]
    name = "blog"
    weight = 1
    url = "blog"
  [[menu.header]]
    name = "tags"
    weight = 2
    url = "blog/tags"
  [[menu.header]]
    name = "archive"
    weight = 3
    url = "blog/archives"
  [[menu.header]]
    name = "faq"
    weight = 4
    url = "blog/faq"

[params]
user = "jparedesDS"
hostname = "portfolio"
openLinksInNewTab = true
displayDateFormat = "2006-01-02"
showMetadata = true
showPublishedDate = true
showReadingTime = true
showTags = true
showAuthors = false
showCategories = false
sitedescription = "Data scientist and AI engineer in Madrid."
footerHtml = '© 2026 Jose Paredes · Built with <a href="https://gohugo.io" class="footerLink">Hugo</a> and <a href="https://github.com/LordMathis/hugo-theme-nightfall" class="footerLink">Nightfall</a>'

[params.author]
  name = "Jose Paredes"
  email = "jparedescolmenarejo@gmail.com"

[params.styles]
  color = "blue"

[[params.social]]
key = 0
name = "github"
url = "https://github.com/jparedesDS"
target = "_blank"
aria = "GitHub Profile"

[[params.social]]
key = 1
name = "linkedin"
url = "https://www.linkedin.com/in/jparedesDS/"
target = "_blank"
aria = "LinkedIn Profile"

[[params.social]]
key = 2
name = "x"
url = "https://x.com/xhitoCS"
target = "_blank"
aria = "X Profile"

[[params.social]]
key = 3
name = "instagram"
url = "https://www.instagram.com/xhitoCS/"
target = "_blank"
aria = "Instagram Profile"

[[params.social]]
key = 4
name = "email"
url = "mailto:jparedescolmenarejo@gmail.com"
aria = "Email"
```

- [ ] **Step 3: Create `content/_index.md`**

```toml
+++
title = "Jose Paredes"
+++
```

- [ ] **Step 4: Create `content/about.md`**

Use Markdown with `title = "About"` and `showMetadata = false`. Sections:
- Intro: data scientist / AI engineer in Madrid; EIPSA; local-first AI.
- `## Projects` with `id="projects"` and links to subany.video,
  cleanyourmail.org, cleanyourphone.org, `/propovcs2/`, GitHub.
- `## Experience`: EIPSA 2024—Now; Comunicación Permanente 2021—2023; Grupo
  ANOVO 2015—2020.
- `## Education`: The Bridge 2021—2022; Padre Piquer 2010—2012.
- `## Stack`: the 33 tokens from `src/data/site.ts`.
- `## Writing`: link to `/blog/`.
- `## Contact`: email, GitHub, LinkedIn, X, Instagram, Hugging Face, Kaggle.
- Resume link `/resume.pdf`.

Use raw `<span id="projects"></span>` before the Projects heading (Goldmark
`unsafe` is enabled).

- [ ] **Step 5: Build**

Install/locate Dart Sass and run:
```powershell
$env:PATH = "C:\Users\xht\AppData\Local\Temp\opencode\dart-sass\dart-sass;$env:PATH"
hugo --gc --minify
```
Expected: `dist/index.html` and `dist/about/index.html` exist; home has
`jparedesDS@portfolio`, `Jose Paredes`, social links; About has EIPSA,
The Bridge, 33 stack items.

- [ ] **Step 6: Commit**

```powershell
git add hugo.toml content themes .gitignore
git commit -m "feat: scaffold the Nightfall portfolio"
```

---

### Task 2: Blog migration, tags, archive and FAQ

**Files:**
- Create: `content/blog/_index.md`
- Create: `content/blog/2026-11-09-how-subany-video-works.md`
- Create: `content/blog/2026-11-09-como-funciona-subany-video.md`
- Create: `content/tags/_index.md`
- Create: `content/archive.md`
- Create: `content/faq.md`
- Create: `layouts/archive.html`
- Modify: `test/...`? no test dir after Task 3; use a temporary script.

**Interfaces:**
- Consumes: Task 1, `C:\Users\xht\Desktop\blog\content\posts\*`.
- Produces: `/blog/`, two post URLs, `/blog/tags/`, `/blog/tags/<term>/`,
  `/blog/archives/`, `/blog/faq/`, `/blog/index.xml`.

- [ ] **Step 1: Migrate the two posts**

Copy the two Markdown files, keep their YAML frontmatter (`title`, `date`,
`description`, `tags`, `slug`, `lang`). Replace `/work/subany-video/` with
`https://subany.video/`. Keep the bodies unchanged. The `slug` values must be
`how-subany-video-works` and `como-funciona-subany-video`.

- [ ] **Step 2: Blog index and tags**

`content/blog/_index.md`:
```toml
+++
title = "Blog"
+++
```
`content/tags/_index.md`:
```toml
+++
title = "Tags"
url = "/blog/tags/"
+++
```

- [ ] **Step 3: Archive page**

`content/archive.md`:
```toml
+++
title = "Archive"
url = "/blog/archives/"
layout = "archive"
showMetadata = false
+++
```
`layouts/archive.html`: list all `site.RegularPages` where `Section == "blog"`,
group by year descending, and render a Nightfall-style list (title, date,
reading time). Use `partial "pagination.html"` if pagination is needed; with two
posts it is not.

- [ ] **Step 4: FAQ page**

`content/faq.md` with `title = "FAQ"`, `url = "/blog/faq/"`, `showMetadata =
false`, and the 5 questions:
- Who are you?
- What do you write about?
- Can I use the code?
- How can I contact you?
- Why are some posts in Spanish?

- [ ] **Step 5: Build and verify**

```powershell
$env:PATH = "C:\Users\xht\AppData\Local\Temp\opencode\dart-sass\dart-sass;$env:PATH"
hugo --gc --minify
```
Check:
- `dist/blog/index.html`
- `dist/blog/2026/11/09/how-subany-video-works/index.html`
- `dist/blog/2026/11/09/como-funciona-subany-video/index.html`
- `dist/blog/tags/index.html`, `dist/blog/tags/subany/index.html`
- `dist/blog/archives/index.html`
- `dist/blog/faq/index.html`
- `dist/blog/index.xml`
- no `/work/subany-video/` in the posts.

- [ ] **Step 6: Commit**

```powershell
git add content layouts
git commit -m "feat: migrate the blog to Nightfall with tags, archive and FAQ"
```

---

### Task 3: Static legacy routes, redirects and remove Astro

**Files:**
- Create: `static/cs2pov/`, `static/propovcs2/`, `static/murdoku/`, `static/images/`, `static/profile.jpg`, `static/resume.pdf`, `static/google...html`, `static/tiktok...txt`
- Create: `static/cleanyourmail/index.html`
- Create: `static/work/.../index.html`, `static/projects/.../index.html`, `static/blog/posts/index.html`, `static/blog/about/index.html`, `static/blog/categories/index.html`, `static/blog/search/index.html`
- Replace: `.github/workflows/deploy.yml`
- Modify: `.gitignore`, `README.md`, `NOTICE`
- Delete: `src/`, `test/`, `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, old `public/` tracked files, old root assets, old Astro docs.

**Interfaces:**
- Consumes: Tasks 1-2; old `public/` assets.
- Produces: static routes, redirects, Hugo workflow.

- [ ] **Step 1: Copy legacy assets**

Copy from the old `public/` to `static/`:
`cs2pov`, `propovcs2`, `murdoku`, `images`, `profile.jpg`, `resume.pdf`,
`google75a8559a473af765.html`, `tiktoktlkXmcJe9C9XczFLZBDaijGBy6abp0WB.txt`.
Do not copy `cleanyourmail`, `css`, `js`, `projects`, `robots.txt`.

- [ ] **Step 2: Create redirects**

Each is a small noindex HTML page with meta refresh, canonical and visible link:
- `/cleanyourmail/` → `https://cleanyourmail.org/`
- `/work/` → `/about/#projects`
- `/work/subany-video/` → `https://subany.video/`
- `/work/docflow-saas/` → `https://github.com/jparedesDS/docflow`
- `/work/pro-pov-cs2/` → `/propovcs2/`
- `/work/trtw-tv/` → `https://github.com/jparedesDS/trtw-tv`
- `/work/cleanyourphone/` → `https://cleanyourphone.org/`
- `/projects/` and `/projects/{ai-vision,data-automation,products,esports}/`
  → `/about/#projects`
- `/blog/posts/` → `/blog/`
- `/blog/about/` → `/about/`
- `/blog/categories/` → `/blog/`
- `/blog/search/` → `/blog/`

`static/blog/*` paths must not collide with Hugo’s `/blog/` index, posts, tags,
archive or FAQ; they are distinct subdirectories.

- [ ] **Step 3: Hugo deploy workflow**

Replace `.github/workflows/deploy.yml`:
```yaml
name: Deploy portfolio
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: "22"
      - run: npm install -g sass
      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "0.169.0"
          extended: true
      - run: hugo --gc --minify
      - run: touch dist/.nojekyll
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
          clean: true
```

- [ ] **Step 4: Remove Astro and old assets**

Delete `src/`, `test/`, `package.json`, `package-lock.json`, `astro.config.mjs`,
`tsconfig.json`, the old tracked `public/`, old root `images/`, `profile.jpg`,
`resume.pdf`, verification files, `al-folio-upgrade-report.md`, and old Astro
design/plan docs. Keep `docs/superpowers/specs/2026-11-11-nightfall-rebuild-design.md`
and its plan. Keep `LICENSE`, update `NOTICE`, rewrite `README.md`.

`.gitignore`:
```text
dist/
resources/
.hugo_build.lock
.worktrees/
node_modules/
public/
```

- [ ] **Step 5: Build and audit**

```powershell
$env:PATH = "C:\Users\xht\AppData\Local\Temp\opencode\dart-sass\dart-sass;$env:PATH"
hugo --gc --minify
```
Audit `dist/` local links and check the redirects resolve. Confirm `dist/cs2pov`,
`dist/propovcs2`, `dist/murdoku`, `dist/resume.pdf`, `dist/profile.jpg`.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "chore: preserve legacy routes and replace the deploy workflow"
```

---

### Task 4: Full local verification

**Files:** none unless fixes are needed.

- [ ] **Step 1: Build and link audit**

Build with Dart Sass. Crawl `dist/` for local `href/src` targets; 0 missing.
Check the old blog post URLs, tags/terms, archive, FAQ, `/blog/index.xml`, and all
redirects.

- [ ] **Step 2: Visual review**

Start `hugo server --port 1313`, capture 1440/360 dark screenshots of:
`/`, `/about/`, `/blog/`, a post, `/blog/tags/`, `/blog/tags/subany/`,
`/blog/archives/`, `/blog/faq/`. Confirm home matches Nightfall, no overflow,
menu order, tags/archive/FAQ.

- [ ] **Step 3: External checks**

`curl` `https://cleanyourmail.org/` (200), `https://www.cleanyourmail.org/`
(301→apex), `/cs2pov/`, `/propovcs2/`, `/murdoku/`.

- [ ] **Step 4: Fix and commit**

Any fix gets a focused test and a commit.

---

### Task 5: Clean history + deploy

**Files:** none (git state).

- [ ] **Step 1: Backup**

From the main repo:
```powershell
git bundle create C:\Users\xht\Desktop\portfolio-backup-pre-nightfall.bundle --all
git tag pre-nightfall-rewrite
git bundle verify C:\Users\xht\Desktop\portfolio-backup-pre-nightfall.bundle
```
Do not push the tag. Keep the bundle outside the repo.

- [ ] **Step 2: Orphan main**

In the rebuild worktree, after Task 4 is green:
```powershell
git checkout --orphan main-clean
git add -A
git commit -m "Initial commit: Nightfall portfolio"
git push --force-with-lease origin main-clean:main
```
Wait for `Deploy portfolio`. Verify `/`, `/about/`, `/blog/` (still old PaperMod
until Task 6), `/cs2pov/`, `/propovcs2/`, `/murdoku/`, redirects.

- [ ] **Step 3: Clean refs**

Delete old remote feature branches and tags, keeping `main`, `gh-pages` and the
local backup tag/bundle. Confirm the remote `main` has one root commit.

---

### Task 6: Retire PaperMod and final live verification

**Files:** none.

- [ ] **Step 1: Disable blog Pages**

With the portfolio deployed, disable Pages on `jparedesDS/blog` (API DELETE).
The old project site currently shadows `/blog/`; after disabling, the portfolio
serves `/blog/`.

- [ ] **Step 2: Verify**

Check `/blog/`, both post URLs, `/blog/tags/`, `/blog/tags/subany/`,
`/blog/archives/`, `/blog/faq/`, `/blog/index.xml`, and the redirects.
If anything fails, re-enable Pages on `blog` (rollback) and fix.

- [ ] **Step 3: Archive blog**

Archive `jparedesDS/blog` (do not delete). Verify `cleanyourmail.org` and
`www.cleanyourmail.org` are still 200/301.

- [ ] **Step 4: Final report**

Record live statuses, the force-push backup path, the blog archive state, and
the fork-badge caveat.
