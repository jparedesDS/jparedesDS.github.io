# Blog separado — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el blog de Jose Paredes como sitio Jekyll independiente en `https://jparedesds.github.io/blog/`, conservando las URLs actuales de los dos posts y exponiendo `posts.json` para el portfolio.

**Architecture:** Repositorio público nuevo `jparedesDS/blog`. Jekyll 4 sin tema, cuatro layouts (`default`, `home`, `post`, `page`), una hoja CSS y cero JavaScript propio. GitHub Actions construye y publica en `gh-pages`; Pages sirve el proyecto bajo `/blog/`.

**Tech Stack:** Ruby 3.3, Jekyll 4, `jekyll-feed`, `jekyll-sitemap`, Markdown/kramdown, Rouge, Node `node:test` para comprobaciones del HTML construido, `html-validate`.

**Spec:** `docs/superpowers/specs/2026-11-10-vcard-portfolio-design.md` (secciones 8 y 13)

## Global Constraints

- `baseurl: /blog`; `permalink: /:year/:month/:day/:title/`.
- URLs que deben seguir respondiendo, sin cambios:
  - `/blog/2026/11/09/how-subany-video-works/`
  - `/blog/2026/11/09/como-funciona-subany-video/`
- Una entrada tiene un solo idioma (`lang: en` o `lang: es`). El índice `/blog/` lista todas; `/blog/es/` solo las españolas.
- Sin fuentes externas, sin JavaScript de terceros, sin comentarios, sin TOC, sin Mermaid, sin buscador.
- Tipografía del sistema; una sola hoja CSS; modo claro/oscuro según el sistema.
- Accesibilidad AA: skip link, un `h1` por página, `lang` correcto, foco visible, fechas con `<time datetime>`, contraste.
- El repo es público: `jparedesDS/blog`. No se toca el repo del portfolio en este plan.
- Ruby 3.3 y Bundler son necesarios en local. Si `ruby -v` falla, instalar antes de empezar y pedir confirmación al usuario.
- Los commits se hacen en `main` del repo del blog; el despliegue solo ocurre al hacer push.

## Review Focus

- **URLs antiguas**: un post debe responder en exactamente la misma ruta que hoy, sin doble `/blog/`.
- **Idioma por página**: el `<html lang>` y el índice ES deben coincidir con el idioma real de la entrada.
- **`posts.json`**: URLs con prefijo `/blog/`, fechas ISO y extractos sin HTML; el portfolio depende de este contrato.
- **Móvil 360 px**: bloques de código y tablas largas no deben romper el ancho de lectura.
- **Enlaces de idioma**: ningún enlace del header debe llevar a una ruta inexistente.

---

### Task 1: Repositorio vivo con placeholder

**Files:**
- Create: `C:\Users\xht\Desktop\blog\Gemfile`
- Create: `C:\Users\xht\Desktop\blog\_config.yml`
- Create: `C:\Users\xht\Desktop\blog\index.md`
- Create: `C:\Users\xht\Desktop\blog\_layouts\default.html`
- Create: `C:\Users\xht\Desktop\blog\assets\css\blog.css`
- Create: `C:\Users\xht\Desktop\blog\.github\workflows\deploy.yml`
- Create: `C:\Users\xht\Desktop\blog\.gitignore`

**Interfaces:**
- Consumes: nada.
- Produces: `https://jparedesds.github.io/blog/` responde 200 con un `h1`; el repo `jparedesDS/blog` existe con Pages activo sobre `gh-pages`.

- [ ] **Step 1: Comprobar Ruby y crear el repositorio**

```powershell
ruby -v
gh repo view jparedesDS/blog
```

Si `ruby` no existe, ejecutar `winget install --id RubyInstallerTeam.RubyWithDevKit.3.3 -e --accept-source-agreements --accept-package-agreements`, abrir una consola nueva y comprobar `ruby -v` y `gem install bundler`.

Si el repo no existe:

```powershell
cd C:\Users\xht\Desktop
gh repo create jparedesDS/blog --public --description "Blog de Jose Paredes" --clone
cd blog
```

- [ ] **Step 2: Escribir el esqueleto mínimo**

`Gemfile`:

```ruby
source "https://rubygems.org"
gem "jekyll", "~> 4.4"
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
end
```

`_config.yml`:

```yaml
title: "Jose Paredes — Blog"
description: "Notas técnicas sobre IA, computer vision y productos."
url: "https://jparedesds.github.io"
baseurl: "/blog"
lang: en
permalink: /:year/:month/:day/:title/
markdown: kramdown
highlighter: rouge
plugins:
  - jekyll-feed
  - jekyll-sitemap
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - package.json
  - package-lock.json
  - test
  - README.md
```

`_layouts/default.html`:

```html
<!doctype html>
<html lang="{{ page.lang | default: 'en' }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page.title }} — {{ site.title }}</title>
    <meta name="description" content="{{ page.description | default: site.description }}">
    <link rel="canonical" href="{{ site.url }}{{ site.baseurl }}{{ page.url }}">
    <link rel="stylesheet" href="{{ '/assets/css/blog.css' | relative_url }}">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <a class="site-name" href="{{ '/' | relative_url }}">Jose Paredes</a>
      <nav aria-label="Blog">
        <a href="{{ '/' | relative_url }}">posts</a>
        <a href="{{ '/about/' | relative_url }}">about</a>
        <a href="{{ '/es/' | relative_url }}">ES</a>
      </nav>
    </header>
    <main id="main-content">{{ content }}</main>
    <footer><p>© 2026 Jose Paredes</p></footer>
  </body>
</html>
```

`index.md`:

```markdown
---
layout: default
title: Posts
lang: en
permalink: /
---

<h1>Posts</h1>
<p>Blog en construcción.</p>
```

`assets/css/blog.css`: cuerpo de máximo `65ch`, `font-family: system-ui, sans-serif`, `line-height: 1.6`, `.skip-link` visible al enfocar.

`.gitignore`: `_site/`, `.jekyll-cache/`, `node_modules/`, `Gemfile.lock.bak`.

- [ ] **Step 3: Construir y comprobar el HTML**

```powershell
bundle install
bundle exec jekyll build
Select-String -Path _site\index.html -Pattern "<h1>Posts</h1>"
```

Expected: `bundle install` termina sin error y el `Select-String` encuentra el `h1`.

- [ ] **Step 4: Commit**

```powershell
git add Gemfile _config.yml index.md _layouts assets .github .gitignore
git commit -m "chore: scaffold minimal Jekyll blog"
```

- [ ] **Step 5: Añadir el workflow de despliegue**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy blog
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
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3"
          bundler-cache: true
      - run: bundle exec jekyll build
      - run: touch _site/.nojekyll
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: _site
          branch: gh-pages
          clean: true
```

- [ ] **Step 6: Publicar y activar Pages**

```powershell
git add .github
git commit -m "ci: deploy blog to gh-pages"
git push -u origin main
gh run watch
```

Cuando exista la rama `gh-pages`:

```powershell
gh api -X POST repos/jparedesDS/blog/pages -f build_type=legacy -f "source[branch]=gh-pages" -f "source[path]=/"
curl.exe -s -o NUL -w "%{http_code}" https://jparedesds.github.io/blog/
```

Expected: `200`.

- [ ] **Step 7: Commit de cualquier ajuste**

Si Pages necesitó un fichero o un cambio de configuración, commitearlo con `ci: enable GitHub Pages`.

---

### Task 2: Shell, home e índice

**Files:**
- Create: `_layouts/home.html`
- Create: `_layouts/page.html`
- Modify: `_layouts/default.html`
- Modify: `assets/css/blog.css`
- Create: `test/build.test.mjs`
- Create: `package.json`
- Modify: `index.md`

**Interfaces:**
- Consumes: `_layouts/default.html` de Task 1.
- Produces: layout `home` (lista `site.posts`), layout `page` (contenido estático), y el contrato de marcado `<article class="post-list-item">` que usan los tests y el CSS.

- [ ] **Step 1: Escribir el test que falla**

`test/build.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const site = path.join(process.cwd(), "_site");
const read = (file) => fs.readFileSync(path.join(site, file), "utf8");

test("the English home has the shell, a skip link and one h1", () => {
  const html = read("index.html");
  assert.match(html, /<html lang="en">/);
  assert.match(html, /class="skip-link"/);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
});

test("the shell links to the English index, about and Spanish index", () => {
  const html = read("index.html");
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /href="\/blog\/about\/"/);
  assert.match(html, /href="\/blog\/es\/"/);
});

test("the Spanish home declares lang es", () => {
  const html = read("es/index.html");
  assert.match(html, /<html lang="es">/);
});
```

`package.json`:

```json
{
  "name": "jparedesds-blog",
  "private": true,
  "scripts": {
    "build": "bundle exec jekyll build",
    "test": "npm run build && node --test test/*.test.mjs"
  }
}
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL con `ENOENT` en `_site/es/index.html` o en `_site/index.html`.

- [ ] **Step 3: Implementar `home` y `page`**

`_layouts/home.html`:

```html
---
layout: default
---
<h1>{{ page.title }}</h1>
{% if page.intro %}<p>{{ page.intro }}</p>{% endif %}
<ol class="post-list">
  {% for post in site.posts %}
    <li>
      <article class="post-list-item">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {% if post.lang == "es" %}<span class="lang-badge">ES</span>{% else %}<span class="lang-badge">EN</span>{% endif %}
      </article>
    </li>
  {% endfor %}
</ol>
```

`_layouts/page.html`:

```html
---
layout: default
---
<article class="prose">
  <h1>{{ page.title }}</h1>
  {{ content }}
</article>
```

`index.md` pasa a `layout: home` con `title: Posts`; crear `es/index.md` con `layout: home`, `title: Entradas`, `lang: es`, `permalink: /es/`.

- [ ] **Step 4: Ejecutar y ver que pasa**

```powershell
npm test
```

Expected: PASS los tres tests. El índice ES todavía no lista posts porque aún no hay `_posts`; es correcto.

- [ ] **Step 5: Commit**

```powershell
git add _layouts index.md es package.json test
git commit -m "feat: add blog shell and post index"
```

---

### Task 3: Migrar los dos posts y sustituir Mermaid

**Files:**
- Create: `_posts/2026-11-09-how-subany-video-works.md`
- Create: `_posts/2026-11-09-como-funciona-subany-video.md`
- Create: `_layouts/post.html`
- Modify: `assets/css/blog.css`
- Modify: `test/build.test.mjs`

**Interfaces:**
- Consumes: layouts y CSS de Task 2.
- Produces: dos posts publicados en las URLs antiguas; bloque `<figure class="flow">` que sustituye al diagrama Mermaid.

- [ ] **Step 1: Añadir los tests de los posts**

Añadir a `test/build.test.mjs`:

```js
test("both legacy post URLs are generated", () => {
  for (const file of [
    "2026/11/09/how-subany-video-works/index.html",
    "2026/11/09/como-funciona-subany-video/index.html",
  ]) {
    assert.ok(fs.existsSync(path.join(site, file)), `${file} must exist`);
  }
});

test("the Spanish post declares lang es and a machine-readable date", () => {
  const html = read("2026/11/09/como-funciona-subany-video/index.html");
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<time datetime="2026-11-09/);
});

test("the two posts appear in the English index", () => {
  const html = read("index.html");
  assert.equal((html.match(/<article class="post-list-item">/g) || []).length, 2);
});

test("the architecture diagram is a flow figure, not a mermaid code block", () => {
  const html = read("2026/11/09/how-subany-video-works/index.html");
  assert.match(html, /<figure class="flow">/);
  assert.doesNotMatch(html, /language-mermaid/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL porque no existen `_posts/*.md`.

- [ ] **Step 3: Copiar los posts y adaptar el front matter**

Copiar desde `C:\Users\xht\Desktop\jparedesDS.github.io\_posts\` a `_posts\`:

- `2026-11-09-how-subany-video-works-en.md` → `2026-11-09-how-subany-video-works.md`
- `2026-11-09-como-funciona-subany-video-es.md` → `2026-11-09-como-funciona-subany-video.md`

Front matter final del EN (el ES es equivalente con `lang: es`, su título y `permalink`):

```yaml
---
layout: post
title: "How subany.video works: live subtitles in the browser"
description: "A technical tour of the fixed-delay player, in-browser speech recognition, translation and subtitle timing behind subany.video."
date: 2026-11-09 10:00:00 +0100
lang: en
permalink: /2026/11/09/how-subany-video-works/
tags: [subany, hls, whisper, onnx, webgpu, translation]
author: Jose Paredes
---
```

Eliminar `page_id`, `nav_key`, `permalink_lang`, `toc` y `mermaid` del front matter. No cambiar el cuerpo salvo el bloque Mermaid del paso siguiente.

- [ ] **Step 4: Sustituir el bloque Mermaid por el diagrama HTML**

En ambos posts, reemplazar el bloque ```` ```mermaid ... ``` ```` de "Architecture at a glance" por:

```html
<figure class="flow">
  <ol>
    <li>Twitch URL</li>
    <li>PlaybackAccessToken</li>
    <li>HLS playlist</li>
    <li>Fixed-delay player</li>
    <li>Audio 16 kHz</li>
    <li>Silero VAD</li>
    <li>Phrase segments</li>
    <li>Whisper via Transformers.js</li>
    <li>Hallucination filter</li>
    <li>Translation</li>
    <li>Subtitle queue</li>
    <li>Back to the player</li>
  </ol>
  <figcaption>subany.video audio-to-subtitle pipeline.</figcaption>
</figure>
```

En el post ES, traducir los elementos y el `figcaption` (`Pipeline de audio a subtítulos de subany.video.`).

- [ ] **Step 5: Implementar el layout de post y los estilos**

`_layouts/post.html`:

```html
---
layout: default
---
<article class="prose">
  <h1>{{ page.title }}</h1>
  <p class="post-meta">
    <time datetime="{{ page.date | date_to_xmlschema }}">{{ page.date | date: "%Y-%m-%d" }}</time>
    · {{ page.author }}
  </p>
  {{ content }}
  <p><a href="{{ '/' | relative_url }}">← All posts</a></p>
</article>
```

CSS: `.flow ol` en flex con wrap y flechas `→` mediante `li + li::before`; `.prose pre` con `overflow-x: auto`; `.prose table` con `display: block; overflow-x: auto`; `.prose img { max-width: 100% }`; `.prose a` subrayado.

- [ ] **Step 6: Ejecutar y ver que pasa**

```powershell
npm test
```

Expected: PASS los siete tests.

- [ ] **Step 7: Commit**

```powershell
git add _posts _layouts/post.html assets/css/blog.css test/build.test.mjs
git commit -m "feat: migrate posts and replace mermaid with an accessible flow"
```

---

### Task 4: About, índice ES y enlaces de idioma

**Files:**
- Create: `about.md`
- Create: `es/sobre-mi.md`
- Modify: `_layouts/default.html`
- Modify: `test/build.test.mjs`

**Interfaces:**
- Consumes: layouts de Tasks 2 y 3.
- Produces: `/blog/about/`, `/blog/es/sobre-mi/` y un header cuyos enlaces de idioma dependen de `page.lang`.

- [ ] **Step 1: Añadir los tests**

```js
test("the about pages exist in both languages", () => {
  assert.ok(fs.existsSync(path.join(site, "about/index.html")));
  assert.ok(fs.existsSync(path.join(site, "es/sobre-mi/index.html")));
});

test("the Spanish pages link to the Spanish index and about", () => {
  const html = read("es/index.html");
  assert.match(html, /href="\/blog\/es\/"/);
  assert.match(html, /href="\/blog\/es\/sobre-mi\/"/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL porque no existen las páginas about.

- [ ] **Step 3: Crear las páginas**

`about.md`:

```markdown
---
layout: page
title: About
lang: en
permalink: /about/
description: "Data scientist and AI engineer in Madrid."
---

I'm Jose Paredes, a data scientist and AI engineer in Madrid. I build computer-vision
systems, automation and local-first products. This is where I write about how they work.

- [Portfolio](https://jparedesds.github.io/)
- [GitHub](https://github.com/jparedesDS)
- [Email](mailto:jparedescolmenarejo@gmail.com)
```

`es/sobre-mi.md` con `title: Sobre mí`, `lang: es`, `permalink: /es/sobre-mi/` y el mismo contenido en español:

```markdown
Soy Jose Paredes, data scientist e ingeniero de IA en Madrid. Construyo sistemas de
visión por computador, automatización y productos local-first. Aquí escribo sobre cómo
funcionan.
```

- [ ] **Step 4: Hacer que el header dependa del idioma**

En `_layouts/default.html`, sustituir el bloque `<nav>` por:

```html
<nav aria-label="Blog">
  {% if page.lang == "es" %}
    <a href="{{ '/es/' | relative_url }}">entradas</a>
    <a href="{{ '/es/sobre-mi/' | relative_url }}">quién soy</a>
    <a href="{{ '/' | relative_url }}" hreflang="en" lang="en">EN</a>
  {% else %}
    <a href="{{ '/' | relative_url }}">posts</a>
    <a href="{{ '/about/' | relative_url }}">about</a>
    <a href="{{ '/es/' | relative_url }}" hreflang="es" lang="es">ES</a>
  {% endif %}
</nav>
```

- [ ] **Step 5: Ejecutar y ver que pasa**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add about.md es _layouts/default.html test/build.test.mjs
git commit -m "feat: add bilingual about pages and language-aware header"
```

---

### Task 5: `posts.json`, feed y sitemap

**Files:**
- Create: `posts.json`
- Create: `test/posts-json.test.mjs`
- Modify: `test/build.test.mjs`

**Interfaces:**
- Consumes: `site.posts` y `post.lang`.
- Produces: `GET /blog/posts.json` → array de `{ title, url, date, excerpt, lang }`; `GET /blog/feed.xml`; `GET /blog/sitemap.xml`.

- [ ] **Step 1: Escribir el test**

`test/posts-json.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "_site/posts.json"), "utf8"));

test("posts.json exposes both posts with the contract the portfolio consumes", () => {
  assert.equal(posts.length, 2);
  for (const post of posts) {
    assert.ok(typeof post.title === "string" && post.title.length > 0);
    assert.match(post.url, /^\/blog\/2026\/11\/09\//);
    assert.match(post.date, /^2026-11-09T/);
    assert.ok(["en", "es"].includes(post.lang));
    assert.ok(typeof post.excerpt === "string" && post.excerpt.length > 0);
    assert.doesNotMatch(post.excerpt, /<[^>]+>/);
  }
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL con `ENOENT` en `_site/posts.json`.

- [ ] **Step 3: Implementar `posts.json`**

`posts.json`:

```liquid
---
layout: null
permalink: /posts.json
---
[
  {% for post in site.posts %}
  {
    "title": {{ post.title | jsonify }},
    "url": {{ post.url | relative_url | jsonify }},
    "date": {{ post.date | date_to_xmlschema | jsonify }},
    "excerpt": {{ post.excerpt | strip_html | normalize_whitespace | truncate: 180 | jsonify }},
    "lang": {{ post.lang | default: "en" | jsonify }}
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
```

- [ ] **Step 4: Verificar feed y sitemap**

```powershell
npm test
Test-Path _site\feed.xml
Test-Path _site\sitemap.xml
Select-String -Path _site\feed.xml -Pattern "how-subany-video-works"
```

Expected: tests PASS y ambos ficheros existen.

- [ ] **Step 5: Commit**

```powershell
git add posts.json test
git commit -m "feat: publish posts.json feed for the portfolio"
```

---

### Task 6: Calidad, enlaces y responsive

**Files:**
- Create: `.htmlvalidate.json`
- Create: `test/links.test.mjs`
- Modify: `package.json`
- Modify: `assets/css/blog.css`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: `npm test` ejecuta build, tests de Node y `html-validate`; ningún enlace interno roto.

- [ ] **Step 1: Añadir el test de enlaces**

`test/links.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const site = path.join(process.cwd(), "_site");
const pages = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) pages.push(full);
  }
};
walk(site);

const targetFor = (href) => {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean.startsWith("/blog/")) return null;
  const relative = clean.replace(/^\/blog\//, "").replace(/\/$/, "");
  if (relative === "") return path.join(site, "index.html");
  const asDir = path.join(site, relative, "index.html");
  return fs.existsSync(asDir) ? asDir : path.join(site, relative);
};

test("every internal link resolves to a built file", () => {
  for (const page of pages) {
    const html = fs.readFileSync(page, "utf8");
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const target = targetFor(match[1]);
      if (target) assert.ok(fs.existsSync(target), `${page}: broken link ${match[1]}`);
    }
  }
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL si algún enlace apunta a una ruta no construida (por ejemplo el about antes de Task 4).

- [ ] **Step 3: Añadir `html-validate`**

```powershell
npm install --save-dev html-validate
```

`.htmlvalidate.json`:

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-inline-style": "off",
    "require-sri": "off",
    "attribute-boolean-style": "off"
  }
}
```

`package.json`:

```json
"scripts": {
  "build": "bundle exec jekyll build",
  "test": "npm run build && node --test test/*.test.mjs && html-validate \"_site/**/*.html\""
}
```

- [ ] **Step 4: Ajustar CSS móvil**

Añadir a `assets/css/blog.css`:

```css
@media (max-width: 480px) {
  body { padding-inline: 1rem; }
  .prose pre { font-size: 0.8rem; padding: 0.75rem; }
  .prose table { display: block; overflow-x: auto; }
  .flow ol { flex-direction: column; align-items: flex-start; }
  .flow li + li::before { content: "↓"; }
}
```

- [ ] **Step 5: Ejecutar y ver que pasa**

```powershell
npm test
```

Expected: PASS tests y `html-validate` sin errores. Si `html-validate` señala `wcag/h37` por imágenes sin `alt`, corregir la imagen; no desactivar la regla.

- [ ] **Step 6: Commit**

```powershell
git add .htmlvalidate.json test package.json package-lock.json assets/css/blog.css
git commit -m "test: check built links and validate HTML"
```

---

### Task 7: Desplegar y verificar en vivo

**Files:**
- Modify: ninguno si todo pasó; solo correcciones puntuales.

**Interfaces:**
- Consumes: repo y Pages de Task 1.
- Produces: blog en producción con las dos URLs y `posts.json`.

- [ ] **Step 1: Ejecutar la suite completa**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 2: Publicar**

```powershell
git push origin main
gh run watch
```

Expected: workflow `Deploy blog` en verde.

- [ ] **Step 3: Verificar las rutas públicas**

```powershell
$urls = @(
  "https://jparedesds.github.io/blog/",
  "https://jparedesds.github.io/blog/es/",
  "https://jparedesds.github.io/blog/about/",
  "https://jparedesds.github.io/blog/es/sobre-mi/",
  "https://jparedesds.github.io/blog/2026/11/09/how-subany-video-works/",
  "https://jparedesds.github.io/blog/2026/11/09/como-funciona-subany-video/",
  "https://jparedesds.github.io/blog/posts.json",
  "https://jparedesds.github.io/blog/feed.xml"
)
foreach ($url in $urls) {
  $code = curl.exe -s -o NUL -w "%{http_code}" $url
  Write-Output "$code $url"
}
```

Expected: `200` en las ocho.

- [ ] **Step 4: Comprobar el contrato de `posts.json` en vivo**

```powershell
curl.exe -s https://jparedesds.github.io/blog/posts.json
```

Expected: dos objetos, URLs que empiezan por `/blog/2026/11/09/`, `lang` correcto y extractos sin HTML.

- [ ] **Step 5: Commit final**

Si hubo correcciones:

```powershell
git add -A
git commit -m "fix: verify live blog routes"
git push origin main
```
