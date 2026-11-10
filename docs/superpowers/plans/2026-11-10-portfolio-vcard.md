# Portfolio vCard — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir al-folio por un portfolio con el diseño y la estructura de vCard, bilingüe EN/ES, con una página por proyecto y el blog enlazado como sitio aparte.

**Architecture:** Jekyll limpio (sin tema) + `jekyll-polyglot`. Tres layouts (`shell`, `home`, `project`), includes pequeños, una hoja CSS basada en vCard y un JS sin dependencias para pestañas, filtro y tema. El blog vive en el repo `jparedesDS/blog` (plan `2026-11-10-blog-separado.md`) y el portfolio consume su `posts.json` en build.

**Tech Stack:** Ruby 3.3, Jekyll 4, `jekyll-polyglot`, `jekyll-sitemap`, Liquid, CSS moderno (custom properties), JavaScript vanilla, Playwright, `node:test`, `gray-matter`, `js-yaml`.

**Spec:** `docs/superpowers/specs/2026-11-10-vcard-portfolio-design.md`

## Global Constraints

- Sin al-folio: no `theme: al_folio_core`, no plugins `al_*`, no Tailwind, no PurgeCSS, no Bootstrap.
- 38 fichas EN, 28 fichas ES traducidas y 10 rutas ES con fallback inglés: **76 URLs de proyecto**.
- Las 10 rutas ES de fallback llevan `lang="en"`, `<meta name="robots" content="noindex">`, aviso visible y `hreflang` solo `en`/`x-default`.
- URLs que no pueden romperse: `/projects/<slug>/`, `/es/projects/<slug>/`, `/projects/<category>/`, `/cv/`, `/repositories/`, `/cleanyourmail/`, `/cs2pov/`, `/murdoku/`, `/propovcs2/`.
- Inglés canónico en `/`; español en `/es/`. `jekyll-polyglot` con `parallel_localization: false` y `lang_vars: ["lang"]`.
- Sin formulario de contacto, testimonios, logos de clientes, buscador, newsletter, comentarios ni página de repositorios.
- Iconos SVG inline; sin CDN de Ionicons. Poppins vía Google Fonts con `display=swap`.
- Una sola hoja CSS y un solo JS propios. Sin framework.
- El contenido funciona sin JS: las cinco secciones se apilan y todos los proyectos se ven.
- `LICENSE` sigue siendo GPL-3.0; añadir `NOTICE` con la atribución MIT de vCard.
- Ruby 3.3 y Bundler son necesarios en local. Si `ruby -v` falla, instalar antes de empezar y pedir confirmación.
- No se hace push a `main` hasta la última tarea; todo el trabajo va en la rama `feat/vcard-portfolio`.

## Review Focus

- **Fallbacks EN bajo `/es/`**: si pierden `lang="en"`, `noindex` o el aviso, se sirve contenido duplicado y el selector de idioma miente.
- **Proyectos sin imagen**: 14 tarjetas no tienen `img`; sin fallback la rejilla se rompe visualmente.
- **Redirecciones antiguas**: `/projects/ai-vision/` y `/projects/#ai-vision` deben acabar en la rejilla con el filtro aplicado, no en una pestaña vacía.
- **Pestañas sin JS y con historial**: cargar `/#resume`, usar flechas y volver atrás debe mostrar la sección correcta; sin JS no puede quedar una sola sección visible.
- **Markdown de proyecto en 360 px**: tablas, bloques de código e imágenes anchas no deben desbordar la columna.

---

## Estructura de ficheros

```text
_config.yml
Gemfile
_layouts/shell.liquid          # html, head, sidebar, navbar, footer
_layouts/home.liquid            # 5 pestañas
_layouts/project.liquid         # ficha de proyecto
_includes/head.liquid
_includes/sidebar.liquid
_includes/navbar.liquid
_includes/language-switch.liquid
_includes/icon.liquid
_includes/apps-strip.liquid
_includes/project-filter.liquid
_includes/project-card.liquid
_includes/project-links.liquid
_includes/skill-chips.liquid
_includes/blog-preview.liquid
_includes/contact-links.liquid
_pages/index.md
_pages/index-es.md
_pages/404.md
_data/en/{home,cv,strings}.yml
_data/es/{home,cv,strings}.yml
_data/blog_preview.yml
assets/css/style.css
assets/js/script.js
blog-preview-sync.mjs
test/content/*.test.mjs
test/e2e/*.spec.js
projects/index.html
projects/{ai-vision,data-automation,products,esports}/index.html
cv/index.html
es/cv/index.html
repositories/index.html
es/repositories/index.html
es/projects/index.html
NOTICE
```

Se conservan `_projects/`, `_data/`, `images/`, `assets/pdf/`, `profile.jpg`,
`resume.pdf`, los sub-sitios y los ficheros de verificación de la raíz.

---

### Task 1: Quitar al-folio y dejar un Jekyll mínimo que construye

**Files:**
- Modify: `Gemfile`
- Modify: `_config.yml`
- Delete: `_sass/`, `_includes/`, `_layouts/`, `_pages/`, `_posts/`, `assets/css/`, `assets/js/`
- Delete: `.al-folio-overrides.yml`, `al-folio-upgrade-report.md`, `purgecss.config.js`
- Create: `_layouts/shell.liquid`, `_layouts/home.liquid`
- Create: `_pages/index.md`, `_pages/index-es.md`
- Create: `assets/css/style.css`, `assets/js/script.js`
- Test: `test/content/build.test.mjs`

**Interfaces:**
- Consumes: nada.
- Produces: build Jekyll que genera `/` y `/es/`; `_layouts/shell.liquid` como layout base; `_layouts/home.liquid` como layout de la portada.

- [ ] **Step 1: Comprobar Ruby y crear la rama**

```powershell
cd C:\Users\xht\Desktop\jparedesDS.github.io
ruby -v
git switch -c feat/vcard-portfolio
```

Si `ruby` no existe: `winget install --id RubyInstallerTeam.RubyWithDevKit.3.3 -e --accept-source-agreements --accept-package-agreements`, abrir consola nueva, `gem install bundler`.

- [ ] **Step 2: Escribir el test que falla**

`test/content/build.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("the minimal build produces an English and a Spanish home", () => {
  assert.ok(fs.existsSync(path.join(root, "_site/index.html")));
  assert.ok(fs.existsSync(path.join(root, "_site/es/index.html")));
});

test("no al-folio theme or plugins remain in the build config", () => {
  const config = fs.readFileSync(path.join(root, "_config.yml"), "utf8");
  const gemfile = fs.readFileSync(path.join(root, "Gemfile"), "utf8");
  assert.doesNotMatch(config, /al_folio|al-folio/);
  assert.doesNotMatch(gemfile, /al_folio|al-folio/);
});
```

- [ ] **Step 3: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/build.test.mjs
```

Expected: FAIL; el build actual depende de al-folio y el test no encuentra el HTML nuevo.

- [ ] **Step 4: Borrar el tema y los layouts antiguos**

Ejecutar solo después de que el plan del blog haya copiado `_posts/` a su repo.

```powershell
Remove-Item -Recurse -Force _sass, _includes, _layouts, _pages, _posts, assets/css, assets/js
Remove-Item -Force .al-folio-overrides.yml, al-folio-upgrade-report.md, purgecss.config.js
Remove-Item -Recurse -Force _site, .jekyll-cache -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force _layouts, _includes, _pages, assets/css, assets/js | Out-Null
```

No borrar `_data`, `_projects`, `images`, `assets/pdf`, `test`, `docs` ni los sub-sitios.

- [ ] **Step 5: Escribir `Gemfile` y `_config.yml` mínimos**

`Gemfile`:

```ruby
source "https://rubygems.org"
gem "jekyll", "~> 4.4"
group :jekyll_plugins do
  gem "jekyll-polyglot"
  gem "jekyll-sitemap"
end
```

`_config.yml`:

```yaml
title: "Jose Paredes"
first_name: Jose
last_name: Paredes
description: "Data Scientist and AI Engineer building computer-vision systems, automation and local-first products."
url: "https://jparedesds.github.io"
baseurl: ""
lang: en
languages: ["en", "es"]
default_lang: "en"
parallel_localization: false
lang_vars: ["lang"]

collections:
  projects:
    output: true

plugins:
  - jekyll-polyglot
  - jekyll-sitemap

include: ["_pages"]

exclude_from_localization:
  - assets
  - images
  - cleanyourmail
  - propovcs2
  - cs2pov
  - murdoku
  - projects
  - google75a8559a473af765.html
  - tiktoktlkXmcJe9C9XczFLZBDaijGBy6abp0WB.txt
  - profile.jpg
  - resume.pdf
  - LICENSE
  - NOTICE
  - README.md
  - docs
  - test

exclude:
  - docs
  - test
  - node_modules
  - Gemfile
  - Gemfile.lock
  - package.json
  - package-lock.json
  - playwright.config.js
  - README.md
  - NOTICE
  - blog-preview-sync.mjs
  - test-results
  - playwright-report

keep_files:
  - .nojekyll
```

- [ ] **Step 6: Crear el layout mínimo y las dos portadas**

`_layouts/shell.liquid`:

```html
<!doctype html>
<html lang="{{ site.active_lang | default: site.lang }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page.title | default: site.title }}</title>
    <meta name="description" content="{{ page.description | default: site.description }}">
    <link rel="canonical" href="{{ site.url }}{{ page.url }}">
    <link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    {{ content }}
  </body>
</html>
```

`_layouts/home.liquid`:

```html
---
layout: shell
---
<main id="main-content">
  <h1>{{ site.data[site.active_lang].home.name }}</h1>
</main>
```

`_pages/index.md`:

```markdown
---
layout: home
title: "Jose Paredes"
permalink: /
lang: en
page_id: home
---
```

`_pages/index-es.md`:

```markdown
---
layout: home
title: "Jose Paredes"
permalink: /
lang: es
page_id: home
---
```

`assets/css/style.css`: `body { font-family: system-ui, sans-serif; }` y `.skip-link` visible al enfocar.
`assets/js/script.js`: vacío por ahora.

- [ ] **Step 7: Instalar, construir y ver pasar**

```powershell
bundle install
bundle exec jekyll build
node --test test/content/build.test.mjs
```

Expected: PASS los dos tests.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "refactor: remove al-folio and add a minimal Jekyll build"
```

---

### Task 2: Shell de vCard, sidebar, navbar, iconos y tema

**Files:**
- Modify: `_layouts/shell.liquid`
- Create: `_includes/head.liquid`
- Create: `_includes/sidebar.liquid`
- Create: `_includes/navbar.liquid`
- Create: `_includes/language-switch.liquid`
- Create: `_includes/icon.liquid`
- Modify: `assets/css/style.css`
- Modify: `assets/js/script.js`
- Test: `test/content/shell.test.mjs`

**Interfaces:**
- Consumes: layouts de Task 1.
- Produces: `icon` acepta `name` y `class`; `navbar` acepta `mode` (`tabs` o `links`) y cada botón lleva `data-nav-link` y `data-target`; `sidebar` no recibe parámetros; `shell` decide `mode` según `page.layout`.

- [ ] **Step 1: Escribir el test**

`test/content/shell.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("the home uses the vCard shell and five tabs", () => {
  const html = read("index.html");
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /class="skip-link"/);
  assert.equal((html.match(/data-nav-link/g) || []).length, 5);
  assert.match(html, /data-theme-toggle/);
  assert.doesNotMatch(html, /ionicons/);
});

test("the English home switches to Spanish and the Spanish home to English", () => {
  assert.match(read("index.html"), /href="\/es\/"/);
  assert.match(read("es/index.html"), /hreflang="en"/);
});

test("the blog tab points at the separate blog", () => {
  assert.match(read("index.html"), /href="\/blog\/"/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/shell.test.mjs
```

Expected: FAIL; no existe `aside.sidebar`.

- [ ] **Step 3: Traer la base de vCard y adaptarla**

```powershell
$tmp = Join-Path $env:TEMP "vcard"
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
git clone --depth 1 https://github.com/codewithsadee/vcard-personal-portfolio.git $tmp
Copy-Item "$tmp\assets\css\style.css" "assets\css\style.css" -Force
Copy-Item "$tmp\assets\js\script.js" "assets\js\script.js" -Force
Copy-Item "$tmp\LICENSE" "NOTICE" -Force
```

Adaptar el CSS: sustituir selectores `ion-icon` por `svg.icon`; añadir variables
`--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--border` para claro y
`[data-theme="dark"]`; añadir `.js [data-page]:not(.active) { display: none; }`.
Adaptar el JS: quitar el modal de testimonios y el formulario; dejar sidebar,
tabs, filtro y tema.

- [ ] **Step 4: Añadir etiquetas de pestañas y la fuente**

En `_data/en/strings.yml` y `_data/es/strings.yml`, añadir:

```yaml
tabs:
  about: About
  resume: Resume
  portfolio: Portfolio
  blog: Blog
  contact: Contact
```

En `_includes/head.liquid`, añadir `preconnect` a `fonts.googleapis.com` y
`fonts.gstatic.com`, y la hoja de Poppins 300/400/500/600 con `display=swap`.

- [ ] **Step 5: Implementar iconos y sidebar**

`_includes/icon.liquid`:

```liquid
{% case include.name %}
  {% when "mail" %}<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="m4 6 8 6 8-6"/></svg>
  {% when "github" %}<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.7-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>
  {% when "sun" %}<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
  {% when "moon" %}<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  {% else %}<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>
{% endcase %}
```

Completar los iconos que use la interfaz: `chevron-down`, `location`, `download`,
`code`, `external`, `copy`, `arrow-left`, `arrow-right`, `eye`, `close`.

`sidebar.liquid` usa `site.data[active_lang].home` para nombre, rol, contactos y
redes; pinta el avatar, el botón "Show contacts" con `aria-expanded="false"` y el
bloque de contactos.

- [ ] **Step 6: Implementar navbar y selector de idioma**

`navbar.liquid` pinta las cinco entradas; `mode == "tabs"` usa `<button role="tab"
data-nav-link data-target="about" aria-controls="about">`; `mode == "links"` usa
`<a href="{{ '/#about' | relative_url }}">`. La entrada Blog es siempre un enlace a
`/blog/`.

`language-switch.liquid` reproduce la lógica de `page.permalink_lang` /
`page.lang_switch_fallback` del include antiguo, con `hreflang`.

`shell.liquid` asigna `active_lang` y `strings`, incluye `sidebar` y `navbar`, y
elige `mode = 'tabs'` cuando `page.layout == 'home'`, `links` en el resto.

`head.liquid` añade el script inline que aplica el tema guardado antes del paint.

- [ ] **Step 7: Construir y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/shell.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "feat: add vCard shell, sidebar, navigation and theme"
```

---

### Task 3: About, servicios y franja de Apps

**Files:**
- Modify: `_layouts/home.liquid`
- Create: `_includes/apps-strip.liquid`
- Modify: `_data/en/home.yml`, `_data/es/home.yml`
- Modify: `_data/en/strings.yml`, `_data/es/strings.yml`
- Modify: `test/content/links.test.mjs`
- Test: `test/content/home.test.mjs`

**Interfaces:**
- Consumes: `sidebar`, `navbar` e `icon` de Task 2.
- Produces: `home.services` (4 objetos `{icon,title,text}`) y `home.apps` (4 objetos `{name,url,image,alt,text}`); `strings.sections`. Las etiquetas de pestañas ya existen desde Task 2.

- [ ] **Step 1: Escribir el test**

`test/content/home.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("about has four service cards and four app cards", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="service-item"/g) || []).length, 4);
  assert.equal((html.match(/class="app-item"/g) || []).length, 4);
});

test("the apps link to the four products", () => {
  const html = read("index.html");
  for (const href of [
    "/projects/cleanyourphone/",
    "/projects/cleanyourmail/",
    "https://subany.video/",
    "/projects/pro-pov-cs2/",
  ]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
});

test("no testimonials or client logos survive the port", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /testimonials|clients/);
});

test("both home data files define the same four apps", () => {
  for (const lang of ["en", "es"]) {
    const home = yaml.load(fs.readFileSync(path.join(root, `_data/${lang}/home.yml`), "utf8"));
    assert.equal(home.apps.length, 4);
    assert.equal(home.services.length, 4);
  }
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/home.test.mjs
```

Expected: FAIL; `home.apps` no existe.

- [ ] **Step 3: Reestructurar `home.yml`**

Forma final (EN; el ES traduce los textos, no las URLs):

```yaml
name: Jose Paredes
role: Data Scientist · Madrid, Spain
eyebrow: About
intro:
  - "At EIPSA I build computer-vision systems and automation for engineering and manufacturing."
  - "I also develop practical AI products and local-first tools."
availability: "Open to interesting AI and computer-vision work."
services:
  - icon: vision
    title: Computer Vision
    text: "Defect detection, inspection and tracking with YOLO in production."
  - icon: ai
    title: AI Engineering
    text: "LLM integrations, agentic workflows and AI-assisted product development."
  - icon: automation
    title: Automation
    text: "Pipelines that remove manual document and data work."
  - icon: product
    title: Products
    text: "Local-first tools and SaaS built end to end."
apps:
  - name: CleanYourPhone
    url: /projects/cleanyourphone/
    image: /images/cleanyourphone-thumb.png
    alt: "CleanYourPhone"
    text: "Reversible Android debloat."
  - name: CleanYourMail
    url: /projects/cleanyourmail/
    image: /images/cleanyourmail-thumb.png
    alt: "CleanYourMail"
    text: "Reversible inbox cleanup."
  - name: subany.video
    url: https://subany.video/
    image: /images/subany-video-thumb.png
    alt: "subany.video"
    text: "Live subtitles in the browser."
  - name: Pro POV CS2
    url: /projects/pro-pov-cs2/
    image: /images/propov-cs2.png
    alt: "Pro POV CS2"
    text: "Autonomous esports content pipeline."
```

Conservar `contact` y `contact_label`. Eliminar `featured`, `selected_projects` y
`latest_*`; ya no se usan.

- [ ] **Step 4: Implementar About y la franja de Apps**

En `_layouts/home.liquid`, asigna al principio
`{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}` y
`{% assign strings = site.data[active_lang].strings %}`. El artículo
`data-page="about"` contiene: intro, cuatro `.service-item` con
`{% include icon.liquid name=service.icon %}`, la franja
`{% include apps-strip.liquid apps=home.apps %}` con cuatro `.app-item` (imagen,
nombre, texto y enlace) y la disponibilidad.

`_includes/apps-strip.liquid` recibe `include.apps` y pinta la lista; reutiliza la
estructura de scroll horizontal de la sección "Clients" de vCard.

- [ ] **Step 5: Actualizar `strings.yml` y el test de enlaces**

Añadir a ambos `strings.yml`:

```yaml
sections:
  services: What I'm doing
  apps: Apps
  contact: Contact
  all_posts: All posts
```

En `test/content/links.test.mjs`, sustituir la lectura de `home.featured.links`
por `home.apps` y `home.contact`, y mantener la comprobación de URLs absolutas o
root-relative.

- [ ] **Step 6: Construir y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/home.test.mjs test/content/links.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: add about, services and apps strip"
```

---

### Task 4: Resume con timeline y skills

**Files:**
- Modify: `_layouts/home.liquid`
- Create: `_includes/skill-chips.liquid`
- Modify: `assets/css/style.css`
- Test: `test/content/resume.test.mjs`

**Interfaces:**
- Consumes: `cv.yml` de ambos idiomas.
- Produces: artículo `data-page="resume"` con `#resume-experience`, `#resume-education` y `.skill-group`.

- [ ] **Step 1: Escribir el test**

```js
test("resume renders the real CV, not placeholder content", () => {
  const html = read("index.html");
  assert.match(html, /EIPSA/);
  assert.match(html, /The Bridge/);
  assert.match(html, /YOLO/);
  assert.match(html, /href="\/assets\/pdf\/resume.pdf"/);
});

test("skills are chips, not invented percentage bars", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="skill-group"/g) || []).length, 11);
  assert.doesNotMatch(html, /skill-progress-fill/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/resume.test.mjs
```

Expected: FAIL; no existe `data-page="resume"`.

- [ ] **Step 3: Implementar el timeline y los chips**

En `_layouts/home.liquid`, artículo `resume`:

```liquid
{% assign cv = site.data[site.active_lang].cv.cv %}
<section class="timeline" aria-labelledby="resume-experience">
  <h3 id="resume-experience">{{ strings.cv.sections.Experience }}</h3>
  <ol class="timeline-list">
    {% for job in cv.sections.Experience %}
      <li class="timeline-item">
        <h4>{{ job.position }}</h4>
        <p class="timeline-meta">{{ job.company }} · {{ job.start_date }} — {{ job.end_date }}</p>
        <ul>{% for point in job.highlights %}<li>{{ point }}</li>{% endfor %}</ul>
      </li>
    {% endfor %}
  </ol>
</section>
```

Repetir para `Education` (institución, área, fechas). Para `Skills`, iterar
`cv.sections.Skills` e incluir `skill-chips.liquid` con `include.group`.

`_includes/skill-chips.liquid`:

```liquid
<li class="skill-group">
  <h4>{{ include.group.name }}</h4>
  <ul class="chip-list">
    {% for keyword in include.group.keywords %}<li class="chip">{{ keyword }}</li>{% endfor %}
  </ul>
</li>
```

Añadir un enlace "Download CV" a `/assets/pdf/resume.pdf` con `download`.

- [ ] **Step 4: Construir y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/resume.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: render the resume timeline and skill chips"
```

---

### Task 5: Rejilla de proyectos, filtros y fallback de imagen

**Files:**
- Create: `_includes/project-filter.liquid`
- Create: `_includes/project-card.liquid`
- Modify: `_layouts/home.liquid`
- Modify: `assets/css/style.css`
- Modify: `assets/js/script.js`
- Test: `test/content/portfolio.test.mjs`
- Test: `test/e2e/portfolio.spec.js`

**Interfaces:**
- Consumes: `site.projects` (Polyglot ya lo filtra por idioma) y `strings.project_categories`.
- Produces: `<li class="project-item" data-category="...">`; botones `data-filter` con valores `all`, `ai-vision`, `data-automation`, `products`, `esports`.

- [ ] **Step 1: Escribir los tests**

`test/content/portfolio.test.mjs`:

```js
test("the grid renders 38 projects and five filters", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="project-item"/g) || []).length, 38);
  for (const filter of ["all", "ai-vision", "data-automation", "products", "esports"]) {
    assert.match(html, new RegExp(`data-filter="${filter}"`));
  }
});

test("the 14 projects without an image use the fallback tile", () => {
  const html = read("index.html");
  assert.equal((html.match(/project-img--fallback/g) || []).length, 14);
});

test("every card links to its project page", () => {
  const html = read("index.html");
  assert.match(html, /href="\/projects\/cleanyourmail\/"/);
  assert.match(html, /href="\/projects\/docflow-saas\/"/);
});
```

`test/e2e/portfolio.spec.js`:

```js
const { test, expect } = require("@playwright/test");

test("a filter query preselects the category and shows its projects", async ({ page }) => {
  await page.goto("/?filter=products#portfolio");
  await expect(page.locator('[data-filter="products"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".project-item:visible")).toHaveCount(7);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/portfolio.test.mjs
```

Expected: FAIL; no hay tarjetas.

- [ ] **Step 3: Implementar la rejilla**

`_includes/project-card.liquid`:

```liquid
<li class="project-item" data-category="{{ include.project.category }}">
  <a class="project-card" href="{{ include.project.url | relative_url }}">
    {% if include.project.img %}
      <figure class="project-img">
        <img src="{{ include.project.img | relative_url }}" alt="{{ include.project.img_alt }}" width="480" height="300" loading="lazy">
      </figure>
    {% else %}
      <figure class="project-img project-img--fallback" aria-hidden="true">
        <span>{{ include.project.title | slice: 0 }}</span>
      </figure>
    {% endif %}
    <h3 class="project-title">{{ include.project.title }}</h3>
    <p class="project-category">{{ strings.project_categories[include.project.category] }}</p>
    <p class="project-text">{{ include.project.description }}</p>
    {% if include.project.rendered_lang and include.project.rendered_lang != site.active_lang %}
      <span class="lang-badge">EN</span>
    {% endif %}
  </a>
</li>
```

En `_layouts/home.liquid`:

```liquid
{% include project-filter.liquid %}
<ul class="project-list">
  {% assign projects = site.projects | sort: "importance" %}
  {% for project in projects %}{% include project-card.liquid project=project %}{% endfor %}
</ul>
```

`project-filter.liquid` contiene la lista de botones (y la versión `<select>` móvil
de vCard): `all`, `ai-vision`, `data-automation`, `products`, `esports`, con
`aria-pressed` en el activo. El JS: lee `?filter=`, valida contra los cuatro
valores, marca `aria-pressed`, oculta tarjetas y actualiza la query con
`replaceState`.

- [ ] **Step 4: Ejecutar y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/portfolio.test.mjs
npx playwright test test/e2e/portfolio.spec.js
```

Expected: PASS. El test de Playwright necesita `bundle exec jekyll serve` en el
puerto 4000; `playwright.config.js` ya lo arranca.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add project grid, filters and image fallback"
```

---

### Task 6: Páginas de proyecto con el armazón de vCard

**Files:**
- Create: `_layouts/project.liquid`
- Create: `_includes/project-links.liquid`
- Modify: `assets/css/style.css`
- Modify: los 10 `_projects/*.md` EN-only (todos son `category: ai-vision`)
- Test: `test/content/project.test.mjs`

**Interfaces:**
- Consumes: front matter de `_projects/*.md` (`title`, `description`, `img`, `img_alt`, `category`, `links`, `private`, `rendered_lang`) y `page.lang_switch_fallback`.
- Produces: 76 rutas; en las 10 de fallback, `lang="en"`, `noindex`, `.fallback-notice`; enlace `.next-project`.

- [ ] **Step 1: Escribir el test**

```js
test("all 38 English and 38 Spanish project routes build", () => {
  const skip = new Set(["ai-vision", "data-automation", "products", "esports"]);
  const en = fs.readdirSync(path.join(root, "_site/projects"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !skip.has(entry.name));
  const es = fs.readdirSync(path.join(root, "_site/es/projects"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  assert.equal(en.length, 38);
  assert.equal(es.length, 38);
});

test("a translated project renders title, links and markdown", () => {
  const html = read("projects/cleanyourmail/index.html");
  assert.match(html, /CleanYourMail/);
  assert.match(html, /Case study/);
  assert.match(html, /Overview/);
  assert.match(html, /href="https:\/\/github.com\/jparedesDS\/cleanyourmail"/);
});

test("the ten fallback routes are English, noindex and flagged", () => {
  const html = read("es/projects/valorant-players-detector/index.html");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /name="robots" content="noindex"/);
  assert.match(html, /fallback-notice/);
});

test("a project page links to the next project in its category", () => {
  const html = read("projects/cleanyourmail/index.html");
  assert.match(html, /class="next-project"/);
  assert.match(html, /href="\/projects\/[^"]+\/"/);
});

test("all fourteen link types have a label in both languages", () => {
  const types = ["case_study", "code", "github", "model", "web", "website", "release", "local_app", "tableau", "kaggle", "youtube", "tiktok", "instagram", "x"];
  for (const lang of ["en", "es"]) {
    const strings = yaml.load(fs.readFileSync(path.join(root, `_data/${lang}/strings.yml`), "utf8"));
    for (const type of types) assert.ok(strings.project_links[type], `${lang}: ${type}`);
  }
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/project.test.mjs
```

Expected: FAIL; las páginas no usan el layout nuevo.

- [ ] **Step 3: Implementar el layout**

`_layouts/project.liquid`:

```html
---
layout: shell
---
{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
<main id="main-content">
  <article class="project-page">
    <a class="back-link" href="{{ '/#portfolio' | relative_url }}">← {{ strings.tabs.portfolio }}</a>
    <p class="project-category">{{ strings.project_categories[page.category] }}</p>
    <h1>{{ page.title }}</h1>
    <p class="project-summary">{{ page.description }}</p>
    {% if page.img %}<img class="project-hero" src="{{ page.img | relative_url }}" alt="{{ page.img_alt }}" width="1200" height="630">{% endif %}
    {% include project-links.liquid links=page.links %}
    <div class="prose">{{ content }}</div>
  </article>
</main>
```

`project-links.liquid` reproduce el include antiguo: etiqueta desde
`strings.project_links[link.type]`, enlaces externos con `rel="noopener noreferrer"`,
y los privados como `<span>` no interactivo.

Añadir al final del artículo el siguiente proyecto de la misma categoría:

```liquid
{% assign same = site.projects | where: "category", page.category | sort: "importance" %}
{% assign current = 0 %}
{% for item in same %}{% if item.url == page.url %}{% assign current = forloop.index0 %}{% endif %}{% endfor %}
{% assign next_index = current | plus: 1 | modulo: same.size %}
{% assign next = same[next_index] %}
<a class="next-project" href="{{ next.url | relative_url }}">
  {{ strings.tabs.portfolio }} → {{ next.title }}
</a>
```

En los 10 ficheros EN-only (`cs2-players-detector-yolo12s`,
`cs2-players-detector-yolov9-v10-v11`, `cs2-weapon-detector-yolo12m`,
`deadlock-players-detector`, `fortnite-players-detector`,
`liquid-penetrant-test-yolo11l`, `lol-map-tracking-yolo11`,
`overwatch-2-players-detector`, `valorant-players-detector`,
`welding-defects-detector-yolo11x`) cambiar
`lang_switch_fallback: /projects/` por
`lang_switch_fallback: /?filter=ai-vision#portfolio`. El include añade el prefijo
`/es` al cambiar de idioma, así que el destino final es
`/es/?filter=ai-vision#portfolio`.

En `shell.liquid`, el `<html>` usa `page.rendered_lang | default: site.active_lang`
para que las 10 rutas de fallback declaren `lang="en"`. En `head.liquid`, si
`page.rendered_lang` existe y difiere de `site.active_lang`, añadir
`<meta name="robots" content="noindex">`. En `project.liquid`, añadir ese mismo
caso un `<p class="fallback-notice">This project is only available in English.</p>`
al principio del artículo.

- [ ] **Step 4: Construir y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/project.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: render project pages with the vCard shell"
```

---

### Task 7: Pestaña Blog y sincronización con el blog

**Files:**
- Create: `blog-preview-sync.mjs`
- Create: `_data/blog_preview.yml`
- Create: `_includes/blog-preview.liquid`
- Modify: `_layouts/home.liquid`
- Modify: `package.json`
- Test: `test/content/blog-preview.test.mjs`

**Interfaces:**
- Consumes: `GET https://jparedesds.github.io/blog/posts.json`.
- Produces: `selectLatest(posts, lang, limit)` y `renderYaml(posts)` exportadas; `_data/blog_preview.yml` con `posts`.

- [ ] **Step 1: Escribir el test**

```js
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { selectLatest, renderYaml, sync } from "../../blog-preview-sync.mjs";

const fixture = [
  { lang: "en", date: "2026-11-09T10:00:00+01:00", title: "A", url: "/blog/a/", excerpt: "a" },
  { lang: "es", date: "2026-11-10T10:00:00+01:00", title: "B", url: "/blog/b/", excerpt: "b" },
  { lang: "en", date: "2026-11-08T10:00:00+01:00", title: "C", url: "/blog/c/", excerpt: "c" },
  { lang: "en", date: "2026-11-07T10:00:00+01:00", title: "D", url: "/blog/d/", excerpt: "d" },
  { lang: "en", date: "2026-11-06T10:00:00+01:00", title: "E", url: "/blog/e/", excerpt: "e" },
];

test("selectLatest filters by language and returns the newest three", () => {
  assert.deepEqual(selectLatest(fixture, "en", 3).map((post) => post.title), ["A", "C", "D"]);
});

test("renderYaml produces a posts list with escaped titles", () => {
  const yamlText = renderYaml([{ ...fixture[0], title: 'A "quoted" title' }]);
  assert.match(yamlText, /^- title: 'A "quoted" title'$/m);
});

test("sync leaves the fallback file untouched when the blog is unreachable", async () => {
  const out = path.join(process.cwd(), "test", "tmp-blog-preview.yml");
  fs.writeFileSync(out, "posts: []\n");
  const result = await sync({
    url: "https://example.invalid/posts.json",
    outFile: out,
    fetchImpl: async () => { throw new Error("offline"); },
  });
  assert.equal(result.ok, false);
  assert.equal(fs.readFileSync(out, "utf8"), "posts: []\n");
  fs.rmSync(out);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
node --test test/content/blog-preview.test.mjs
```

Expected: FAIL; no existe `blog-preview-sync.mjs`.

- [ ] **Step 3: Implementar el script y el fallback**

`blog-preview-sync.mjs`:

```js
import { writeFileSync } from "node:fs";

export function selectLatest(posts, lang, limit = 3) {
  return posts
    .filter((post) => post.lang === lang)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function renderYaml(posts) {
  const lines = posts.map((post) => [
    `- title: '${String(post.title).replaceAll("'", "''")}'`,
    `  url: '${post.url}'`,
    `  date: '${post.date}'`,
    `  excerpt: '${String(post.excerpt).replaceAll("'", "''")}'`,
    `  lang: '${post.lang}'`,
  ].join("\n"));
  return `posts:\n${lines.join("\n")}\n`;
}

export async function sync({ url, outFile, fetchImpl = fetch }) {
  try {
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    writeFileSync(outFile, renderYaml([...selectLatest(posts, "en"), ...selectLatest(posts, "es")]));
    return { ok: true, count: posts.length };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

if (process.argv[1]?.endsWith("blog-preview-sync.mjs")) {
  const result = await sync({
    url: process.env.BLOG_POSTS_URL || "https://jparedesds.github.io/blog/posts.json",
    outFile: "_data/blog_preview.yml",
  });
  console.log(result.ok ? `Blog preview: ${result.count} posts` : `Blog preview: fallback (${result.error})`);
}
```

`_data/blog_preview.yml` de arranque con las dos entradas actuales:

```yaml
posts:
  - title: 'How subany.video works: live subtitles in the browser'
    url: '/blog/2026/11/09/how-subany-video-works/'
    date: '2026-11-09T10:00:00+01:00'
    excerpt: 'A technical tour of the fixed-delay player and in-browser speech recognition.'
    lang: 'en'
  - title: 'Cómo funciona subany.video: subtítulos en directo en el navegador'
    url: '/blog/2026/11/09/como-funciona-subany-video/'
    date: '2026-11-09T10:00:00+01:00'
    excerpt: 'Un recorrido técnico por el reproductor con retardo fijo y el reconocimiento de voz.'
    lang: 'es'
```

`_includes/blog-preview.liquid` filtra `site.data.blog_preview.posts` por
`site.active_lang`, limita a 3 y pinta tarjetas con fecha, título y extracto,
más un botón "All posts" a `/blog/`.

- [ ] **Step 4: Ejecutar y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/blog-preview.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: show the latest blog posts and sync them at build time"
```

---

### Task 8: Contacto, pestañas, historial y accesibilidad

**Files:**
- Modify: `_layouts/home.liquid`
- Create: `_includes/contact-links.liquid`
- Modify: `assets/js/script.js`
- Modify: `assets/css/style.css`
- Test: `test/e2e/tabs.spec.js`
- Test: `test/e2e/theme.spec.js`
- Test: `test/a11y/a11y.spec.js`

**Interfaces:**
- Consumes: `home.contact` y `strings.sections.contact`.
- Produces: cinco `article[data-page]`; tabs con `role="tab"`, `aria-selected`, `aria-controls`; Contact sin `<form>`.

- [ ] **Step 1: Escribir los tests**

`test/e2e/tabs.spec.js`:

```js
const { test, expect } = require("@playwright/test");

test("a hash opens the matching tab", async ({ page }) => {
  await page.goto("/#resume");
  await expect(page.locator('[data-page="resume"]')).toHaveClass(/active/);
  await expect(page.getByRole("tab", { name: "Resume" })).toHaveAttribute("aria-selected", "true");
});

test("arrow keys move between tabs and update the hash", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "About" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#resume$/);
});

test("back returns to the previous tab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Portfolio" }).click();
  await page.getByRole("tab", { name: "Contact" }).click();
  await page.goBack();
  await expect(page).toHaveURL(/#portfolio$/);
});

test("the contact section has no form and copies the email", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#contact");
  await expect(page.locator('[data-page="contact"] form')).toHaveCount(0);
  await page.getByRole("button", { name: /copy/i }).click();
  await expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("@");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all sections and all projects stay visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-page="about"]')).toBeVisible();
    await expect(page.locator('[data-page="contact"]')).toBeVisible();
    await expect(page.locator(".project-item")).toHaveCount(38);
  });
});
```

En `test/a11y/a11y.spec.js`, añadir `/`, `/es/`, `/projects/cleanyourmail/` y
`/es/projects/cleanyourmail/` a la lista de páginas analizadas con axe.

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npx playwright test test/e2e/tabs.spec.js
```

Expected: FAIL; no existen las pestañas ni el contacto.

- [ ] **Step 3: Implementar Contacto y las pestañas**

`_layouts/home.liquid` envuelve las cinco secciones en `<article role="tabpanel" data-page="...">`
con `id="about"`, `id="resume"`, etc. La navbar usa
`{% include navbar.liquid mode="tabs" %}`.

`contact-links.liquid` pinta email, LinkedIn, GitHub, Hugging Face, Kaggle y
ubicación desde `home.contact`; el email va en un `<button data-copy-email>` con
`aria-label`, y un enlace `mailto:` visible.

JS:

```js
const tabs = [...document.querySelectorAll("[data-nav-link]")];
const pages = [...document.querySelectorAll("[data-page]")];

function activate(name, push = true) {
  for (const page of pages) page.classList.toggle("active", page.dataset.page === name);
  for (const tab of tabs) {
    const active = tab.dataset.target === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  if (push) history.pushState({ tab: name }, "", `#${name}`);
}

const initial = location.hash.slice(1) || "about";
activate(pages.some((page) => page.dataset.page === initial) ? initial : "about", false);
window.addEventListener("popstate", () => activate(location.hash.slice(1) || "about", false));
```

Añadir manejo de `ArrowLeft`, `ArrowRight`, `Home` y `End`; sin JS, el CSS no
oculta ninguna sección.

- [ ] **Step 4: Ejecutar y ver pasar**

```powershell
bundle exec jekyll build
npx playwright test test/e2e/tabs.spec.js test/e2e/theme.spec.js test/a11y/a11y.spec.js
```

Expected: PASS. Corregir contraste o nombres accesibles si axe falla.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add contact section, accessible tabs and clipboard email"
```

---

### Task 9: Redirecciones y 404

**Files:**
- Create: `projects/index.html`
- Modify: `projects/{ai-vision,data-automation,products,esports}/index.html`
- Create: `cv/index.html`, `es/cv/index.html`
- Create: `repositories/index.html`, `es/repositories/index.html`
- Create: `es/projects/index.html`
- Create: `_pages/404.md`
- Modify: `test/content/redirects.test.mjs`

**Interfaces:**
- Consumes: `?filter` implementado en Task 5.
- Produces: redirecciones estáticas con `meta refresh`, canonical y enlace visible.

- [ ] **Step 1: Actualizar el test**

`test/content/redirects.test.mjs`:

```js
test("category redirects preselect the filter on the home", () => {
  for (const category of ["ai-vision", "data-automation", "products", "esports"]) {
    const html = fs.readFileSync(path.join(root, "projects", category, "index.html"), "utf8");
    assert.match(html, new RegExp(`url=/\\?filter=${category}#portfolio`));
  }
});

test("cv and repositories redirect to their new homes", () => {
  assert.match(fs.readFileSync(path.join(root, "cv/index.html"), "utf8"), /url=\/#resume/);
  assert.match(fs.readFileSync(path.join(root, "repositories/index.html"), "utf8"), /github\.com\/jparedesDS/);
});

test("a 404 page exists", () => {
  assert.ok(fs.existsSync(path.join(root, "_pages/404.md")));
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
node --test test/content/redirects.test.mjs
```

Expected: FAIL; los destinos siguen siendo `/projects/#...`.

- [ ] **Step 3: Implementar las redirecciones estáticas**

Todas las redirecciones son HTML estático (sin front matter y sin layout), con
`meta refresh`, canonical y un enlace visible. Ejemplo para
`cv/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=/#resume">
    <link rel="canonical" href="/#resume">
    <title>Redirecting to the resume</title>
  </head>
  <body>
    <p><a href="/#resume">Continue to the resume</a></p>
  </body>
</html>
```

- `repositories/index.html` → `https://github.com/jparedesDS`.
- `es/cv/index.html` → `/es/#resume`.
- `es/repositories/index.html` → `https://github.com/jparedesDS`.
- `es/projects/index.html` → `/es/#portfolio`.
- Las cuatro páginas de categoría cambian su `meta refresh` a
  `/?filter=<category>#portfolio`.

Para `/projects/index.html`, añadir un script que lea el hash antiguo:

```html
<script>
  const filter = location.hash.replace("#", "");
  if (["ai-vision", "data-automation", "products", "esports"].includes(filter)) {
    location.replace(`/?filter=${filter}#portfolio`);
  }
</script>
```

El `meta refresh` de esa página usa `content="1; url=/#portfolio"` para que el
script tenga ocasión de ejecutarse.

`_pages/404.md` con `permalink: /404.html`, `layout: shell` y un enlace a `/`.

- [ ] **Step 4: Ejecutar y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/redirects.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: retarget legacy redirects and add a 404"
```

---

### Task 10: SEO, hreflang y JSON-LD

**Files:**
- Modify: `_includes/head.liquid`
- Modify: `_layouts/shell.liquid`
- Modify: `_layouts/project.liquid`
- Test: `test/content/seo.test.mjs`

**Interfaces:**
- Consumes: `page.url`, `page.lang`, `page.rendered_lang`, `site.active_lang`.
- Produces: canonical, `hreflang` recíproco, `noindex` en fallback, JSON-LD `Person`/`CreativeWork`.

- [ ] **Step 1: Escribir el test**

```js
test("the English home declares canonical, hreflang and Person JSON-LD", () => {
  const html = read("index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/jparedesds\.github\.io\/">/);
  assert.match(html, /hreflang="es" href="https:\/\/jparedesds\.github\.io\/es\/"/);
  assert.match(html, /"@type": "Person"/);
});

test("a translated project points at its Spanish twin", () => {
  const html = read("projects/cleanyourmail/index.html");
  assert.match(html, /hreflang="es" href="https:\/\/jparedesds\.github\.io\/es\/projects\/cleanyourmail\/"/);
  assert.match(html, /"@type": "CreativeWork"/);
});

test("a fallback page is noindex and has no Spanish alternate", () => {
  const html = read("es/projects/valorant-players-detector/index.html");
  assert.match(html, /content="noindex"/);
  assert.doesNotMatch(html, /hreflang="es"/);
});

test("the sitemap lists both language variants", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /\/projects\/cleanyourmail\//);
  assert.match(sitemap, /\/es\/projects\/cleanyourmail\//);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
bundle exec jekyll build
node --test test/content/seo.test.mjs
```

Expected: FAIL; faltan canonical/hreflang/JSON-LD.

- [ ] **Step 3: Implementar el head**

En `head.liquid`, calcular las rutas:

```liquid
{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign canonical = site.url | append: page.url %}
{% assign en_url = site.url | append: page.url | remove_first: '/es' %}
{% if page.rendered_lang and page.rendered_lang != active_lang %}
  <link rel="canonical" href="{{ en_url }}">
  <link rel="alternate" hreflang="en" href="{{ en_url }}">
  <link rel="alternate" hreflang="x-default" href="{{ en_url }}">
{% else %}
  {% if active_lang == 'en' %}
    <link rel="alternate" hreflang="es" href="{{ site.url }}/es{{ page.url }}">
    <link rel="alternate" hreflang="x-default" href="{{ site.url }}{{ page.url }}">
  {% else %}
    <link rel="alternate" hreflang="en" href="{{ en_url }}">
    <link rel="alternate" hreflang="x-default" href="{{ en_url }}">
  {% endif %}
  <link rel="canonical" href="{{ canonical }}">
{% endif %}
```

El `noindex` de las páginas de fallback ya se añadió en Task 6; no duplicarlo.

Añadir Open Graph (`og:title`, `og:description`, `og:image`; `og:type=article` en
proyectos) y JSON-LD: `Person` en la home, `CreativeWork` en proyectos. Usar
`jsonify` para escapar.

- [ ] **Step 4: Ejecutar y ver pasar**

```powershell
bundle exec jekyll build
node --test test/content/seo.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add canonical, hreflang and structured data"
```

---

### Task 11: Adaptar el resto de tests y limpiar restos

**Files:**
- Modify: `test/content/inventory.test.mjs`
- Modify: `test/content/i18n.test.mjs`
- Modify: `test/content/content.test.mjs`
- Modify: `test/responsive/responsive.spec.js`
- Delete: `test/e2e/search.spec.js`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `NOTICE`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: `npm test` en verde; repo sin restos de al-folio.

- [ ] **Step 1: Adaptar inventario e i18n**

`inventory.test.mjs`: mantener 38 EN y 28 ES; añadir la comprobación de 76 rutas
construidas y las 10 de fallback. `i18n.test.mjs`: permitir la allowlist de 10
proyectos EN-only y comprobar `hreflang` solo en parejas. `content.test.mjs`:
sustituir selectores de al-folio por los nuevos (`.profile-name` → `.sidebar .name`,
etc.).

- [ ] **Step 2: Adaptar responsive y a11y**

En `responsive.spec.js`, comprobar a 360, 768 y 1440 px: sidebar colapsable,
rejilla 1/2/3 columnas y `document.documentElement.scrollWidth <= window.innerWidth`
en `/` y en `/projects/cleanyourmail/` (este último cubre tablas y código del
Markdown). En `a11y.spec.js`, mantener las páginas añadidas en Task 8.

- [ ] **Step 3: Eliminar el test de buscador y scripts muertos**

```powershell
Remove-Item -Force test/e2e/search.spec.js
```

En `package.json`, eliminar `lint:style-contract` y `test:visual` si sus ficheros
no existen; conservar `lint:prettier`, `test:content`, `test:a11y`,
`test:responsive`, `test:e2e` y `test`.

- [ ] **Step 4: Revisar el aviso de licencia y actualizar README**

`NOTICE` ya contiene la licencia MIT de vCard copiada en Task 2. Añadir al
principio una línea con la atribución:

```text
This site uses the design of vCard Personal Portfolio by codewithsadee:
https://github.com/codewithsadee/vcard-personal-portfolio
```

`README.md`: describir la estructura (portfolio Jekyll + blog externo), los
comandos (`bundle exec jekyll build`, `npm test`) y dónde se edita el contenido
(`_projects/`, `_data/{en,es}/`).

- [ ] **Step 5: Ejecutar la suite completa**

```powershell
bundle exec jekyll build
npm test
```

Expected: PASS. Actualizar snapshots visuales si el proyecto conserva
`test:visual`; si no existe, no reintroducirlo.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "test: align the suite with the vCard portfolio and document it"
```

---

### Task 12: Desplegar y verificar en producción

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: blog desplegado en Task 7 del plan del blog.
- Produces: `https://jparedesds.github.io/` con el portfolio nuevo.

- [ ] **Step 1: Actualizar el workflow**

En `deploy.yml`, antes de `bundle exec jekyll build`, añadir:

```yaml
- name: Sync blog preview
  run: node blog-preview-sync.mjs
```

Eliminar el paso `Purge unused CSS` y la instalación de `purgecss`. Mantener
`npm ci` solo si algún test o script lo necesita; el script de sync usa solo
Node.

- [ ] **Step 2: Verificar el build de producción en local**

```powershell
node blog-preview-sync.mjs
$env:JEKYLL_ENV = "production"
bundle exec jekyll build
npm test
```

Expected: PASS.

- [ ] **Step 3: Publicar la rama y fusionar**

```powershell
git push -u origin feat/vcard-portfolio
gh pr create --fill
```

Revisar el PR, fusionar a `main` y esperar el workflow `Deploy site`.

- [ ] **Step 4: Verificar las rutas públicas**

```powershell
$urls = @(
  "https://jparedesds.github.io/",
  "https://jparedesds.github.io/es/",
  "https://jparedesds.github.io/projects/cleanyourmail/",
  "https://jparedesds.github.io/es/projects/cleanyourmail/",
  "https://jparedesds.github.io/es/projects/valorant-players-detector/",
  "https://jparedesds.github.io/projects/ai-vision/",
  "https://jparedesds.github.io/cv/",
  "https://jparedesds.github.io/repositories/",
  "https://jparedesds.github.io/blog/",
  "https://jparedesds.github.io/propovcs2/",
  "https://jparedesds.github.io/404.html"
)
foreach ($url in $urls) {
  $code = curl.exe -s -o NUL -w "%{http_code}" $url
  Write-Output "$code $url"
}
```

Expected: `200` en todas. La de fallback debe contener `noindex`; `/projects/ai-vision/`
debe redirigir a `/?filter=ai-vision#portfolio`.

- [ ] **Step 5: Comprobar el contenido en vivo**

- Home EN y ES: cinco pestañas, cuatro apps, 38 tarjetas, resumen del CV y contacto.
- Una ficha traducida y una de fallback: título, enlaces, cuerpo y aviso.
- Pestaña Blog: dos entradas distintas (EN/ES) y enlace a `/blog/`.
- Modo claro/oscuro persiste tras recargar.
- Sin JS: las cinco secciones se ven apiladas y la rejilla muestra 38 proyectos.

- [ ] **Step 6: Commit final**

Si hubo correcciones:

```powershell
git add -A
git commit -m "fix: verify the vCard portfolio in production"
git push
```
