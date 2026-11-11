# jparedesDS portfolio

Personal portfolio of Jose Paredes, live at <https://jparedesds.github.io/>.

A static [Hugo](https://gohugo.io/) site with the
[Nightfall](https://github.com/LordMathis/hugo-theme-nightfall) theme vendored in
`themes/nightfall`. Nightfall is dark-only; there is no light mode. The site
includes the blog at `/blog/`, with tags, an archive and a FAQ.

## Requirements

- Hugo Extended 0.169.0 or newer (`hugo version` must say `extended`).
- [Dart Sass](https://sass-lang.com/dart-sass/) available as `sass` on `PATH`;
  Nightfall compiles its SCSS at build time.
- Node.js only to install Dart Sass (`npm install -g sass`); the site itself has
  no JavaScript build step.

## Commands

| Command | What it does |
| --- | --- |
| `hugo server` | Serve the site at <http://localhost:1313/> with live reload. |
| `hugo --gc --minify` | Build the production site into `dist/`. |
| `sass --version` | Check that Dart Sass is available. |

## Structure

```text
content/
  _index.md            Home
  about.md             About, with #projects
  blog/                Posts, tags and section index
  archive.md           /blog/archives/
  faq.md               /blog/faq/
layouts/               Local overrides for Nightfall
themes/nightfall/      Vendored theme (MIT)
static/                Legacy routes, redirects and assets served as-is
  cs2pov/              Legal pages for the YouTube/TikTok integrations
  propovcs2/           Pro POV CS2 landing page
  murdoku/             Murdoku app
  images/              Shared images
  resume.pdf, profile.jpg
  work/, projects/, blog/*/   Redirect pages for retired URLs
hugo.toml
```

## Legacy routes

The old Astro `/work/` case studies are retired, but their URLs still resolve
through small `noindex` HTML pages with a `meta refresh`, a canonical URL and a
visible link:

- `/work/` and `/projects/*` → `/about/#projects`
- `/work/subany-video/` → <https://subany.video/>
- `/work/docflow-saas/` → <https://github.com/jparedesDS/docflow>
- `/work/pro-pov-cs2/` → `/propovcs2/`
- `/work/trtw-tv/` → <https://github.com/jparedesDS/trtw-tv>
- `/work/cleanyourphone/` → <https://cleanyourphone.org/>
- `/cleanyourmail/` → <https://cleanyourmail.org/>
- `/blog/posts/`, `/blog/categories/` and `/blog/search/` → `/blog/`
- `/blog/about/` → `/about/`

The active legacy pages `/cs2pov/`, `/propovcs2/` and `/murdoku/` are copied to
`static/` and served unchanged. Do not remove them: `/cs2pov/` holds privacy and
terms pages required by the YouTube and TikTok APIs.

## Deployment

Pushing to `main` runs the `Deploy portfolio` workflow
(`.github/workflows/deploy.yml`): it installs Dart Sass, sets up Hugo Extended
0.169.0, builds into `dist/`, adds `dist/.nojekyll` and publishes `dist/` to the
`gh-pages` branch with `clean: true`. GitHub Pages serves that branch, so every
deploy fully replaces the previous output.
