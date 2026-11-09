# Plan de implementación: portfolio bilingüe con al-folio v1

Fecha: 2026-11-10
Spec de referencia: `docs/superpowers/specs/2026-11-09-al-folio-portfolio-design.md` (aprobado el 2026-11-09)
Estado: pendiente de revisión del usuario antes de ejecutar

## 0. Cómo usar este plan

- Las tareas se ejecutan en orden, de T0 a T18. Cada tarea termina con un build o test ejecutado y un commit pequeño.
- No se hace `push`, no se cambia la rama por defecto de GitHub y no se tocan ajustes del repositorio sin autorización explícita.
- El contenido del sitio se escribe en inglés (idioma principal, canonical) y español (`/es/`). Las respuestas al usuario y este plan se escriben en español.
- Si una tarea descubre que una suposición técnica es falsa, se para, se anota el hallazgo en `docs/superpowers/notes/` y se ajusta el plan antes de seguir. No se declara nada como terminado sin ejecutar la verificación indicada.

## 1. Resultado esperado

Un sitio al-folio v1 con:

- Portada personalizada: About primero, `subany.video` destacado, 9 proyectos seleccionados y últimos tutoriales (máximo 3).
- Navegación: `about · blog · projects · repositories · CV`, más buscador, botón EN/ES y selector claro/oscuro.
- 38 fichas de proyecto en `_projects/`: 28 con traducción española y 10 publicaciones de modelos con fallback inglés.
- Blog de tutoriales con paginación, etiquetas, categorías y archivo por año.
- Primer tutorial real sobre `subany.video`, en inglés y español, basado en `C:\Users\xht\Desktop\web-subtitulos`.
- Página de repositorios curada, sin servicios externos de estadísticas.
- CV RenderCV generado desde `resume.pdf`, con enlace al PDF original.
- Rutas antiguas de categorías redirigidas a `/projects/#<categoria>`.
- Rutas standalone `/cleanyourmail/`, `/propovcs2/`, `/cs2pov/` y `/murdoku/` intactas.
- Build local reproducible en Windows, CI en Linux y despliegue a `gh-pages` desde `main`.

## 2. Decisiones cerradas que no se reabren

- al-folio v1 basado en gems; el runtime del tema no se copia al repositorio.
- Fuente en `main`; sitio construido y publicado en `gh-pages` por GitHub Actions.
- `jekyll-polyglot` con `default_lang: en`, `parallel_localization: false`, `lang_vars: ["lang"]`.
- Inglés canónico; español bajo `/es/`; `hreflang` EN/ES/x-default generado a mano.
- El botón EN/ES es independiente del tema. El tema es un toggle de dos estados (claro/oscuro) con preferencia del sistema en la primera visita.
- Paleta y fuentes de Subany; Inter para interfaz, Atkinson Hyperlegible para el cuerpo de los tutoriales.
- Sin Bootstrap compatibility (`al_folio.compat.bootstrap.enabled: false`). Los pocos estilos tipo Bootstrap que necesite el CV se añaden en `assets/css/subany.css`.
- Se mantiene `/images/` en la raíz, no se mueve a `assets/img/projects/`, porque `cleanyourmail/index.html` referencia `/images/...`.
- Las 10 publicaciones de modelos no se traducen en la primera entrega; usan fallback inglés visible y aviso.
- No se inventa stack, arquitectura ni funciones de proyectos privados o sin documentación.
- No se publica nada sin confirmación del usuario.

## 3. Entorno y prerrequisitos

Estado actual comprobado:

- Node `v24.13.0`, npm `11.9.0`, Git `2.55.0`, Python `3.14.3`.
- Ruby y Bundler **no están instalados**.
- `convert.exe` presente es una herramienta del sistema Windows, no ImageMagick.
- Rama actual: `gh-pages`. No existe `main`.
- `docs/` está sin trackear.

Instalación necesaria (requiere autorización del usuario):

```powershell
winget install --id RubyInstallerTeam.RubyWithDevKit.3.3 -e --accept-source-agreements --accept-package-agreements
```

Después, en una consola nueva:

```powershell
ruby -v
gem install bundler -v 4.0.6
bundle _4.0.6_ -v
```

Si el instalador no deja `ridk` disponible, ejecutar `ridk install` y elegir la opción de MSYS2 + MINGW. No se instala ImageMagick: `imagemagick.enabled` quedará en `false`.

## 4. Estructura final del repositorio

```text
.
├── .github/workflows/deploy.yml
├── .al-folio-overrides.yml
├── Gemfile
├── Gemfile.lock
├── _config.yml
├── _data/
│   ├── en/
│   │   ├── cv.yml
│   │   ├── home.yml
│   │   ├── repositories.yml
│   │   └── strings.yml
│   └── es/
│       ├── cv.yml
│       ├── home.yml
│       ├── repositories.yml
│       └── strings.yml
├── _includes/
│   ├── head.liquid                 # override: canonical/hreflang + subany.css
│   ├── header.liquid               # override: nav bilingüe fija
│   ├── footer.liquid               # override: footer traducido
│   ├── lang-switch.liquid          # nuevo
│   ├── home.liquid                 # nuevo
│   ├── blog-list.liquid            # nuevo
│   ├── project-card.liquid         # nuevo
│   ├── project-links.liquid        # nuevo
│   ├── related_posts.liquid        # override: heading traducido
│   ├── cv/render.liquid            # override: etiquetas + datos por idioma
│   └── plugins/al_search_assets.liquid  # override: buscador bilingüe
├── _layouts/
│   ├── default.liquid              # override: lang, skip link, fallback, home-container
│   ├── post.liquid                 # override: metadatos traducidos
│   ├── archive.liquid              # override: archivo traducido
│   └── project.liquid              # nuevo: layout de ficha
├── _pages/
│   ├── about.md / about-es.md
│   ├── blog.md / blog-es.md
│   ├── projects.md / projects-es.md
│   ├── repositories.md / repositories-es.md
│   ├── cv.md / cv-es.md
│   └── 404.md
├── _posts/
│   ├── 2026-11-09-how-subany-video-works-en.md
│   └── 2026-11-09-como-funciona-subany-video-es.md
├── _projects/
│   ├── <slug>.md                   # 38 fichas EN
│   └── <slug>-es.md                # 28 fichas ES
├── _sass/_themes.scss              # override: paleta Subany
├── assets/
│   ├── css/subany.css              # nuevo: tokens, portada, tarjetas, CV, focus
│   ├── js/theme.js                 # override: toggle claro/oscuro de dos estados
│   ├── js/search-i18n.js           # nuevo: placeholder/footer del buscador
│   └── pdf/resume.pdf              # copia del PDF
├── images/                         # se conserva en la raíz
├── cleanyourmail/ propovcs2/ cs2pov/ murdoku/  # intactos
├── projects/
│   ├── ai-vision/index.html        # redirect estático
│   ├── data-automation/index.html
│   ├── products/index.html
│   └── esports/index.html
├── google75a8559a473af765.html
├── tiktoktlkXmcJe9C9XczFLZBDaijGBy6abp0WB.txt
├── profile.jpg
├── resume.pdf
├── package.json / package-lock.json
├── test/
│   ├── content/
│   ├── a11y/
│   └── responsive/
└── docs/
```

## 5. Orden de tareas

| Tarea | Objetivo | Commit al terminar |
|---|---|---|
| T0 | Backup, rama `main`, commit del plan | `docs: add approved design and migration plan` |
| T1 | Instalar Ruby/Bundler (requiere autorización) | — |
| T2 | Scaffold de al-folio v1 y primer build | `chore: scaffold al-folio v1` |
| T3 | Paleta, fuentes, tema de dos estados | `feat: apply Subany palette, fonts and theme` |
| T4 | Infraestructura i18n y navegación bilingüe | `feat: add bilingual infrastructure` |
| T5 | Datos y shells de páginas EN/ES | `feat: add bilingual page shells and data contracts` |
| T6 | 38 fichas de proyecto EN | `feat: add 38 project pages` |
| T7 | 28 traducciones de fichas ES | `feat: add Spanish project translations` |
| T8 | Índice de proyectos, tarjetas y layout | `feat: build projects index and cards` |
| T9 | Blog y primer tutorial EN | `feat: add blog and Subany tutorial (EN)` |
| T10 | Primer tutorial ES | `feat: add Subany tutorial (ES)` |
| T11 | Página de repositorios | `feat: add curated repositories page` |
| T12 | CV RenderCV EN/ES | `feat: add bilingual CV` |
| T13 | Portada EN/ES | `feat: build bilingual homepage` |
| T14 | Redirects y rutas standalone | `feat: redirect legacy project categories` |
| T15 | Buscador bilingüe | `feat: add bilingual search` |
| T16 | Tests de contenido, a11y y responsive | `test: add content, a11y and responsive checks` |
| T17 | Workflow de despliegue y build de producción | `ci: deploy al-folio build to gh-pages` |
| T18 | Revisión final y autorización de publicación | — |

## 6. Detalle de tareas

### T0 — Backup, rama `main` y commit del plan

**Objetivo:** preservar el sitio actual y crear el punto de partida de la migración.

**Pasos:**

1. Comprobar que el árbol solo tiene `docs/` sin trackear y que la rama es `gh-pages`.
2. Crear un tag local del estado actual:
   ```powershell
   git tag -a legacy-site-2026-11-10 -m "Estado del portfolio antes de la migración a al-folio v1"
   ```
3. Crear `main` desde `gh-pages`:
   ```powershell
   git checkout -b main
   ```
4. Añadir y commitear el spec y este plan:
   ```powershell
   git add docs/
   git commit -m "docs: add approved design and migration plan"
   ```
5. Verificar:
   ```powershell
   git branch --show-current
   git tag --list "legacy-*"
   git status --short
   ```

**Criterio de aceptación:** rama `main`, tag `legacy-site-2026-11-10`, árbol limpio, commit del plan creado. No se ha hecho push.

**Nota:** el tag es local. Si el usuario quiere conservarlo en GitHub, se hará `git push origin legacy-site-2026-11-10` solo con autorización.

### T1 — Instalar Ruby y Bundler

**Objetivo:** poder ejecutar `bundle exec jekyll build` en local.

**Bloqueada por:** autorización del usuario para una instalación global con `winget`.

**Pasos:**

1. Ejecutar el comando de `winget` de la sección 3.
2. Abrir una consola nueva y comprobar:
   ```powershell
   ruby -v
   gem -v
   ```
3. Instalar la versión de Bundler del `Gemfile.lock` del starter (`4.0.6`):
   ```powershell
   gem install bundler -v 4.0.6
   bundle _4.0.6_ -v
   ```
4. Si `bundle` no encuentra las dependencias nativas, ejecutar `ridk install` y elegir MSYS2 + MINGW.

**Criterio de aceptación:** `ruby -v` muestra 3.3.x, `bundle _4.0.6_ -v` muestra 4.0.6. No se commitea nada.

**Alternativa si el usuario no autoriza la instalación global:** usar un Ruby portable dentro del proyecto o ejecutar el build solo en GitHub Actions. En ese caso, T2 a T18 se validan con el workflow y no se puede verificar el sitio en local; hay que decirlo explícitamente.

### T2 — Scaffold de al-folio v1 y primer build

**Objetivo:** sustituir el tema antiguo por el starter gem-based de al-folio v1 sin contenido de ejemplo.

**Fuente:** `C:\Users\xht\AppData\Local\Temp\opencode\al-folio-starter` (clon del starter v1). Si no existe, clonar de nuevo el repositorio oficial del starter v1.

**Copiar del starter:**

- `.github/workflows/deploy.yml` (se reescribe en T17)
- `Gemfile`, `Gemfile.lock`
- `_config.yml` (se edita en T3/T4)
- `package.json`, `package-lock.json`
- `.prettierrc`, `.prettierignore`, `.gitignore`
- `purgecss.config.js`, `tailwind.config.js`, `postcss.config.js` (si existe)
- `assets/` (se poda la media de ejemplo)
- `_data/` (se reemplaza en T5)
- `_pages/` (se reemplaza en T5)
- `_posts/` (se vacía)
- `_projects/` (se vacía)

**No copiar:** `_news/`, `_books/`, `_teachings/`, `_bibliography/`, `lighthouse_results/`, `readme_preview/`, `.devcontainer/`, `.claude/`, `.agents/`, `.codex/`, `.gemini/`, `bin/` (salvo que una tarea lo necesite), `test/` del starter (se crea el nuestro).

En `assets/`, eliminar la media de ejemplo (`prof_pic.jpg`, PDFs de ejemplo, imágenes de publicaciones) y conservar la estructura. Crear `assets/pdf/` y copiar `resume.pdf` allí.

**Eliminar del repositorio antiguo:**

- `_layouts/` antiguo (extensiones `.html`)
- `_includes/` antiguo
- `_sass/` antiguo (`_style.scss`, `_portfolio.scss`, `_vars.scss`)
- `css/` y `js/` antiguos
- `_posts/2016-02-12-sample-content.markdown`
- `index.md` antiguo
- `_config.yml` antiguo (sustituido)
- Los `projects/*/index.md` antiguos se conservan hasta T6/T14 para copiar su contenido; después se sustituyen por redirects.

**Ajustes mínimos:**

1. Añadir `gem 'jekyll-polyglot'` al grupo `:jekyll_plugins` del `Gemfile`.
2. Instalar:
   ```powershell
   bundle install
   bundle lock --add-platform x64-mingw-ucrt
   ```
3. Añadir a `.prettierignore` las rutas que no deben formatearse ni modificarse:
   ```text
   images/
   docs/
   cleanyourmail/
   propovcs2/
   cs2pov/
   murdoku/
   _site/
   test-results/
   playwright-report/
   *.pdf
   ```
4. Build inicial:
   ```powershell
   bundle exec jekyll build
   ```

**Criterio de aceptación:** `bundle exec jekyll build` termina con código 0 y existe `_site/index.html`. No quedan páginas de ejemplo de Einstein, publicaciones, teaching, books ni news.

**Commit:** `chore: scaffold al-folio v1`

**Riesgo conocido:** el `Gemfile.lock` del starter no incluye `x64-mingw-ucrt`; el comando `bundle lock --add-platform` lo añade sin quitar Linux. Si Bundler 4.0.6 no está disponible, usar la versión que instale Ruby 3.3 y anotarlo.

### T3 — Paleta, fuentes y tema de dos estados

**Objetivo:** aplicar la identidad de Subany y un toggle claro/oscuro de dos estados.

**Archivos:**

- `_config.yml`
- `_sass/_themes.scss` (override local)
- `assets/css/subany.css` (nuevo)
- `assets/js/theme.js` (override local)
- `_includes/head.liquid` (override local, solo la parte de fuentes/canonical/subany.css)

**Configuración exacta:** aplicar estos valores sobre el `_config.yml` del starter. No reemplazar el archivo completo por este bloque: conservar el resto de `third_party_libraries` (tocbot, highlightjs, leaflet, diff2html, etc.), `scholar`, `giscus` y las claves que no se mencionan.

```yaml
title: blank
first_name: Jose
middle_name:
last_name: Paredes
description: >-
  Data Scientist and AI Engineer building computer-vision systems, automation and local-first products.
footer_text: >-
  Data Scientist · AI Engineer · Madrid.
keywords: data science, computer vision, YOLO, automation, AI engineering, portfolio
lang: en
icon: "JP"
url: https://jparedesds.github.io
baseurl: ""
last_updated: false
back_to_top: true
navbar_fixed: true
footer_fixed: false
search_enabled: true
socials_in_search: false
posts_in_search: true
bib_search: false
max_width: 1100px
serve_og_meta: true
serve_schema_org: true
og_image: /profile.jpg

al_folio:
  api_version: 1
  style_engine: tailwind
  tailwind:
    version: 4.1.18
    preflight: false
    css_entry: assets/tailwind/app.css
  distill:
    engine: distillpub-template
    source: al-org-dev/distill-template#al-folio
    allow_remote_loader: false
  features:
    cv:
      enabled: true
  compat:
    bootstrap:
      enabled: false
  upgrade:
    channel: stable
    auto_apply_safe_fixes: false

sass:
  style: compressed
  sourcemap: never

imagemagick:
  enabled: false

lazy_loading_images: true
enable_masonry: false
enable_math: false
enable_tooltips: false
enable_darkmode: true
enable_navbar_social: false
enable_project_categories: true
enable_medium_zoom: true
enable_progressbar: false
enable_cookie_consent: false

third_party_libraries:
  google_fonts:
    url:
      fonts: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap"
```

Además, en el mismo `_config.yml`, sustituir el bloque de colecciones y archivos del starter por:

```yaml
collections:
  projects:
    output: true

permalink: /blog/:year/:month/:day/:title/
blog_name: Tutorials
blog_description: Technical write-ups on how the projects work.
display_tags: []
display_categories: []

jekyll-archives:
  posts:
    enabled: [year, tags, categories]
    permalinks:
      year: "/blog/:year/"
      tags: "/blog/:type/:name/"
      categories: "/blog/:type/:name/"
```

Añadir también `external_sources: []` para que el plugin de posts externos no intente descargar los ejemplos de Medium/Google del starter.

No deben quedar las colecciones `books`, `news` ni `teachings`, ni sus archivos de ejemplo.

En `exclude`, añadir `test/`, `node_modules/`, `playwright-report/` y `test-results/` a la lista del starter. Mantener excluidos `docs/`, `Gemfile`, `Gemfile.lock`, `package.json`, `package-lock.json`, `README.md` y `LICENSE`.

**`_sass/_themes.scss`:** copiar el archivo del gem (`bundle show al_folio_core` → `_sass/_themes.scss`) y sustituir los valores de color. Mantener los selectores `:root`, `html[data-theme="dark"]`, `html[data-theme-setting="light"]`, `html[data-theme-setting="dark"]` y las reglas de los iconos.

| Token | Claro | Oscuro |
|---|---|---|
| `--global-bg-color` | `#c9ae8c` | `#3a3633` |
| `--global-code-bg-color` | `#d6bfa0` | `#45403c` |
| `--global-text-color` | `#1c1915` | `#ede3d3` |
| `--global-text-color-light` | `#3f382f` | `#c4b9a8` |
| `--global-theme-color` | `#7a0c39` | `#ff8a00` |
| `--global-hover-color` | `#5f092c` | `#ffb35c` |
| `--global-hover-text-color` | `#d6bfa0` | `#1c1915` |
| `--global-footer-bg-color` | `#1c1915` | `#1c1915` |
| `--global-footer-text-color` | `#d6bfa0` | `#c4b9a8` |
| `--global-footer-link-color` | `#ffb35c` | `#ffb35c` |
| `--global-distill-app-color` | `#3f382f` | `#c4b9a8` |
| `--global-divider-color` | `#b69a75` | `#5a544f` |
| `--global-card-bg-color` | `#d6bfa0` | `#45403c` |
| `--global-highlight-color` | `#8e0f42` | `#ff5a94` |
| `--global-back-to-top-bg-color` | `rgba(28, 25, 21, 0.6)` | `rgba(237, 227, 211, 0.3)` |
| `--global-back-to-top-text-color` | `#d6bfa0` | `#1c1915` |
| `--global-newsletter-bg-color` | `#d6bfa0` | `#45403c` |
| `--global-newsletter-text-color` | `#1c1915` | `#ede3d3` |

Añadir tokens propios en `:root` y en `html[data-theme="dark"]`:

```scss
--global-surface-color: #d6bfa0;      /* oscuro: #45403c */
--global-border-color: #b69a75;       /* oscuro: #5a544f */
--global-text-soft: #3f382f;          /* oscuro: #c4b9a8 */
--global-focus-color: #8e0f42;        /* oscuro: #ff5a94 */
--global-accent-gradient: linear-gradient(90deg, #ff8a00 0%, #ff2d78 100%);
```

**Contraste comprobado:** texto/fondo 8.27:1 (claro) y 9.42:1 (oscuro); texto suave/fondo 5.45:1 y 6.18:1; botón 9.86:1 y 13.78:1; foco 4.32:1 y 4.07:1 (por encima del 3:1 exigido a indicadores no textuales). El degradado `#ff8a00 → #ff2d78` **no se usa como texto sobre fondo claro** (contraste 1.12:1 y 1.68:1); solo como detalle decorativo, borde o subrayado. Los enlaces en claro usan `#7a0c39` (5.11:1) y en oscuro `#ff8a00` (5.06:1).

**`assets/css/subany.css`:** cargar después de `main.css`. Debe incluir:

- `body`, `.navbar`, `.post-meta`, `.card`, formularios y botones con `font-family: "Inter", ...`.
- `.post-content`, `.post-content p`, `.post-content li`, `.post-content blockquote` con `"Atkinson Hyperlegible", ...`.
- `code, pre, kbd, samp` con monoespaciada del sistema.
- `:focus-visible` con `outline: 3px solid var(--global-focus-color); outline-offset: 2px;`.
- `.skip-link` visible al recibir foco.
- `.home-container` con `max-width: min(1180px, calc(100% - 48px));`.
- Estilos de portada, tarjetas de proyecto, índice de proyectos, blog, CV y repositorios (se completan en T8/T11/T12/T13).
- Reglas de `ninja-keys` para usar los colores del tema:
  ```css
  ninja-keys {
    --ninja-modal-background: var(--global-card-bg-color);
    --ninja-text-color: var(--global-text-color);
    --ninja-secondary-text-color: var(--global-text-soft);
    --ninja-selected-background: color-mix(in srgb, var(--global-theme-color) 18%, var(--global-card-bg-color));
    --ninja-selected-text-color: var(--global-text-color);
    --ninja-accent-color: var(--global-theme-color);
    --ninja-footer-background: var(--global-surface-color);
    --ninja-separate-border: 1px solid var(--global-border-color);
    --ninja-font-family: "Inter", sans-serif;
  }
  ```
- `@media (prefers-reduced-motion: reduce)` para desactivar transiciones.
- Ajustes de CV: `.cv .list-group { margin: 0; padding: 0; list-style: none; }` y `.cv .list-group-item { border-bottom: 1px solid var(--global-border-color); }` (no se activa Bootstrap compatibility).

**`assets/js/theme.js`:** sustituir el ciclo `system → light → dark` por dos estados. Requisitos:

- `localStorage.theme` solo contiene `light` o `dark` cuando el usuario elige.
- En la primera visita se usa `prefers-color-scheme` y no se escribe en `localStorage` hasta que el usuario pulse el botón.
- `document.documentElement` recibe `data-theme="light|dark"` y `data-theme-setting="light|dark"`.
- Definir `determineThemeSetting`, `determineComputedTheme`, `setThemeSetting`, `applyTheme`, `toggleThemeSetting` e `initTheme`, porque `search-setup.js` y otros scripts del tema las consultan.
- Implementar `setHighlight(theme)` para alternar los `media` de `#highlight_theme_light` y `#highlight_theme_dark`; sin esto, los bloques de código se quedan con el tema claro en modo oscuro.
- `initTheme()` engancha el click de `#light-toggle` en `DOMContentLoaded`.
- Al cambiar el tema, actualizar la clase `.dark` de `ninja-keys` si existe.
- Escuchar cambios de `prefers-color-scheme` solo mientras no haya elección guardada.

**`_includes/head.liquid`:** copiar el archivo del gem y hacer solo estos cambios:

- Mantener `metadata.liquid`, CSP, Tailwind, main.css, fuentes, iconos y el script `/assets/js/theme.js`.
- Añadir después de `main.css`:
  ```liquid
  <link rel="stylesheet" href="{{ '/assets/css/subany.css' | relative_url | bust_file_cache }}">
  ```
- Sustituir el canonical de la línea 126 por el bloque de T4 (canonical inglés + hreflang).
- Añadir `subany.css` también a las páginas CV (el CSS del CV del gem se sigue cargando).

**Verificación:**

```powershell
bundle exec jekyll build
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Abrir `/` y comprobar:

- Fondo `#c9ae8c` en claro y `#3a3633` en oscuro.
- El botón de tema alterna una vez claro → oscuro → claro; no hay tercer estado.
- La preferencia persiste al recargar.
- Inter se usa en la interfaz y Atkinson en el cuerpo de un post de prueba.
- El foco del teclado es visible.

**Commit:** `feat: apply Subany palette, fonts and theme`

### T4 — Infraestructura i18n y navegación bilingüe

**Objetivo:** generar inglés y español con Polyglot, con navegación, canonical, hreflang y botón EN/ES independientes del tema.

**Archivos:**

- `_config.yml`
- `_data/en/strings.yml`, `_data/es/strings.yml`
- `_includes/header.liquid` (override)
- `_includes/footer.liquid` (override)
- `_includes/lang-switch.liquid` (nuevo)
- `_layouts/default.liquid` (override)
- `_includes/head.liquid` (canonical/hreflang, ya abierto en T3)
- `_pages/about.md`, `_pages/about-es.md` (stubs para probar)

**Configuración Polyglot en `_config.yml`:**

```yaml
languages: ["en", "es"]
default_lang: "en"
parallel_localization: false
lang_vars: ["lang"]
exclude_from_localization:
  - assets
  - images
  - css
  - js
  - cleanyourmail
  - propovcs2
  - cs2pov
  - murdoku
  - projects/ai-vision
  - projects/data-automation
  - projects/products
  - projects/esports
  - google75a8559a473af765.html
  - tiktoktlkXmcJe9C9XczFLZBDaijGBy6abp0WB.txt
  - profile.jpg
  - resume.pdf
  - LICENSE
  - README.md
  - docs
  - test
```

Añadir también `- jekyll-polyglot` a la lista `plugins` de `_config.yml` (además de estar en el grupo `:jekyll_plugins` del `Gemfile`), y mantener `- al_charts` para que Mermaid funcione en el tutorial. Quitar `- al_comments` (no hay comentarios; así la plantilla `page.liquid` del gem no incluye el partial) y `- al_math` (`enable_math: false`). El resto de plugins del starter puede quedarse; las funciones no usadas se desactivan por configuración.

**Importante:** no excluir `projects` entero. Las cuatro carpetas antiguas se excluyen individualmente; `/projects/` debe seguir recibiendo el prefijo `/es/`.

**`_data/en/strings.yml` y `_data/es/strings.yml`:** mismas claves en ambos. Contenido mínimo:

```yaml
nav:
  about: About
  blog: Blog
  projects: Projects
  repositories: Repositories
  cv: CV
nav_label: Main navigation
menu_toggle: Toggle navigation
theme_toggle: Change color theme
language_switch_label: View this page in Spanish
skip_to_content: Skip to content
fallback_notice: This page is not yet available in Spanish. Showing the English version.
fallback_link: Read the English version
search:
  placeholder: Type to start searching
  open: Open search
  select: to select
  navigate: to navigate
  close_hint: to close
  sections:
    navigation: Navigation
    tutorials: Tutorials
    projects: Projects
    categories: Project categories
project_categories:
  ai-vision: AI & Vision
  data-automation: Data & Automation
  products: Products & Tools
  esports: Esports & Content
project_links:
  code: Code
  model: Model
  github: GitHub
  kaggle: Kaggle
  website: Website
  web: Website
  case_study: Case study
  local_app: Local app
  release: Release
  demo: Demo
  youtube: YouTube
  tiktok: TikTok
  instagram: Instagram
  x: X
  tableau: Tableau Public
  private: Private repository
projects:
  all: All projects
  featured: Featured project
  read_tutorial: Read the tutorial
  private_repository: Private repository
  private_note: Private repository. Implementation details are not disclosed.
blog:
  title: Tutorials
  description: Technical write-ups on how the projects work.
  min_read: min read
  date_format: "%B %d, %Y"
  tags: Tags
  categories: Categories
  years: Years
  no_posts: No tutorials yet.
post:
  created_on: Published on
  by: by
  last_updated_on: last updated on
related_posts:
  title: Enjoy Reading This Article?
  description: Here are some more articles you might like to read next.
footer:
  tagline: Data Scientist · AI Engineer · Madrid.
  built_with: Built with al-folio.
archive:
  categories: an archive of {collection} in this category
  year: an archive of {collection} from this year
  tags: an archive of {collection} with this tag
  posts: tutorials
cv:
  contact_information: Contact Information
  name: Name
  professional_title: Professional Title
  email: Email
  phone: Phone
  location: Location
  website: Website
  professional_summary: Professional Summary
  sections:
    Experience: Experience
    Education: Education
    Skills: Skills
    Languages: Languages
    Projects: Projects
    Additional Information: Additional Information
```

Español: traducir todos los valores. `language_switch_label` en ES: `Ver esta página en inglés`. `date_format` en ES: `%d/%m/%Y`. `project_categories`: `IA y Visión`, `Datos y Automatización`, `Productos y Herramientas`, `Esports y Contenido`.

**Regla de scope:** cada layout o include que use `strings` debe asignarlo al principio; no confiar en que la variable del layout padre esté disponible:

```liquid
{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
```

Esto aplica a `header.liquid`, `footer.liquid`, `default.liquid`, `post.liquid`, `archive.liquid`, `related_posts.liquid`, `project.liquid`, `project-card.liquid`, `project-links.liquid`, `home.liquid`, `blog-list.liquid`, `cv/render.liquid` y `al_search_assets.liquid`.

**`_includes/lang-switch.liquid`:** debe resolver la URL de la otra lengua sin JavaScript.

```liquid
{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign other_lang = 'es' %}
{% if active_lang == 'es' %}{% assign other_lang = 'en' %}{% endif %}
{% assign other_path = page.permalink_lang[other_lang] %}
{% if other_path %}
  {% assign other_path = other_path | remove_first: '/' %}
  {% if other_lang == site.default_lang %}
    {% capture other_url %}/{% unless other_path == '' %}{{ other_path }}{% endunless %}{% endcapture %}
  {% else %}
    {% capture other_url %}/{{ other_lang }}/{% unless other_path == '' %}{{ other_path }}{% endunless %}{% endcapture %}
  {% endif %}
{% else %}
  {% assign fallback = page.lang_switch_fallback | default: '/' %}
  {% if other_lang == site.default_lang %}
    {% assign other_url = fallback %}
  {% else %}
    {% capture other_url %}/{{ other_lang }}{{ fallback }}{% endcapture %}
  {% endif %}
{% endif %}
{% assign other_strings = site.data[other_lang].strings %}
<a class="nav-link lang-switch" href="{% static_href %}{{ other_url }}{% endstatic_href %}" hreflang="{{ other_lang }}" lang="{{ other_lang }}" aria-label="{{ site.data[active_lang].strings.language_switch_label }}">{{ other_lang | upcase }}</a>
```

**`_includes/header.liquid`:** reescribir la nav con enlaces explícitos, sin recorrer `site.pages` (evita duplicados EN/ES). Requisitos:

- Brand `Jose Paredes` enlazando a `/` (Polyglot lo prefija en ES).
- Enlaces: About, Blog, Projects, Repositories, CV, en ese orden.
- Cada página lleva `nav_key` en front matter (`about`, `blog`, `projects`, `repositories`, `cv`); la clase `active` se calcula con `page.nav_key`.
- Botón de búsqueda `#search-toggle` con texto `ctrl k` y lupa; `aria-label` traducido.
- Botón de idioma `{% include lang-switch.liquid %}`.
- Botón `#light-toggle` con dos iconos: `#light-toggle-light` (sol) y `#light-toggle-dark` (luna). Sin icono de sistema. `aria-label` y `title` con `strings.theme_toggle`.
- El toggle móvil conserva `data-nav-toggle="navbarNav"`, `aria-controls="navbarNav"` y `aria-expanded`.
- `aria-current="page"` en el enlace activo.

**`_includes/footer.liquid`:** copiar el del gem y sustituir el copyright fijo por:

```liquid
{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
<footer class="sticky-bottom mt-5" role="contentinfo">
  <div class="container footer-content">
    <p>&copy; {{ site.time | date: '%Y' }} Jose Paredes. {{ strings.footer.tagline }}</p>
    <p>{{ strings.footer.built_with }}</p>
  </div>
</footer>
```

No incluir newsletter, "Last updated" ni el texto académico del starter.

**`_layouts/default.liquid`:** copiar el del gem y cambiar:

1. `<html lang="{{ page.lang | default: site.active_lang | default: site.lang }}">`.
2. Antes del header:
   ```liquid
   {% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
   {% assign strings = site.data[active_lang].strings %}
   <a class="skip-link" href="#main-content">{{ strings.skip_to_content }}</a>
   ```
3. El contenedor:
   ```liquid
   <div class="container mt-5{% if page.home %} home-container{% endif %}" id="main-content" role="main">
   ```
4. Dentro del contenedor, antes de `{{ content }}`, el aviso de fallback:
   ```liquid
   {% if page.rendered_lang and page.rendered_lang != active_lang and page.layout != 'archive' %}
     {% assign en_path = page.permalink_lang['en'] | default: page.url | remove_first: '/' %}
     <div class="fallback-notice" role="note">
       <p>{{ strings.fallback_notice }}
         <a href="{% static_href %}/{% unless en_path == '' %}{{ en_path }}{% endunless %}{% endstatic_href %}">{{ strings.fallback_link }}</a>
       </p>
     </div>
   {% endif %}
   ```
   Ajustar la URL si `page.permalink_lang['en']` no existe; en ese caso usar `page.url` y quitar el prefijo `/es/`.
5. Mantener el resto: TOC, footer, scripts.

**`_includes/head.liquid`:** sustituir el canonical por:

```liquid
{% assign canonical_path = page.permalink_lang['en'] | default: page.url | remove_first: '/' %}
{% capture canonical_url %}{{ site.url }}/{% unless canonical_path == '' %}{{ canonical_path }}{% endunless %}{% endcapture %}
{% assign es_path = page.permalink_lang['es'] %}
{% if es_path %}
  {% assign es_path = es_path | remove_first: '/' %}
{% else %}
  {% assign es_path = canonical_path %}
{% endif %}
{% capture es_url %}{{ site.url }}/es/{% unless es_path == '' %}{{ es_path }}{% endunless %}{% endcapture %}
<link rel="canonical" href="{{ canonical_url }}">
{% if page.permalink_lang %}
  <link rel="alternate" hreflang="en" href="{{ canonical_url }}">
  <link rel="alternate" hreflang="es" href="{{ es_url }}">
  <link rel="alternate" hreflang="x-default" href="{{ canonical_url }}">
{% endif %}
```

**Stubs de prueba:**

- `_pages/about.md`: `layout: default`, `title: About`, `permalink: /`, `lang: en`, `page_id: about`, `home: true`, `nav: true`, `nav_order: 1`, `nav_key: about`, body `{% include home.liquid %}`.
- `_pages/about-es.md`: mismos valores con `title: Sobre mí`, `lang: es`.

**Verificación:**

```powershell
bundle exec jekyll build
```

Comprobar en `_site`:

- `_site/index.html` y `_site/es/index.html` existen.
- La home EN tiene `<html lang="en">`; la ES `lang="es"`.
- `canonical` de `/es/` apunta a `https://jparedesds.github.io/`.
- `hreflang="en"`, `hreflang="es"` y `hreflang="x-default"` existen.
- El botón EN/ES lleva de `/` a `/es/` y viceversa.
- La nav no muestra enlaces duplicados.
- El aviso de fallback aparece solo en páginas sin traducción.

**Commit:** `feat: add bilingual infrastructure`

### T5 — Datos y shells de páginas EN/ES

**Objetivo:** crear los contratos de datos y las páginas vacías que se rellenan en T6-T13, sin contenido de ejemplo.

**Archivos nuevos:**

- `_data/en/home.yml`, `_data/es/home.yml`
- `_data/en/repositories.yml`, `_data/es/repositories.yml`
- `_data/en/cv.yml`, `_data/es/cv.yml`
- `_data/socials.yml` (compartido)
- `_pages/blog.md`, `_pages/blog-es.md`
- `_pages/projects.md`, `_pages/projects-es.md`
- `_pages/repositories.md`, `_pages/repositories-es.md`
- `_pages/cv.md`, `_pages/cv-es.md`
- `_pages/404.md`
- `_layouts/project.liquid` (layout básico; se completa en T8)
- `_includes/home.liquid`
- `_includes/blog-list.liquid`
- `_includes/project-card.liquid`
- `_includes/project-links.liquid`

**`_data/socials.yml`:** sustituir el de Einstein por los datos reales. Evita que `metadata.liquid` genere `sameAs` con enlaces ajenos:

```yaml
cv_pdf: /assets/pdf/resume.pdf
email: jparedescolmenarejo@gmail.com
github_username: jparedesDS
linkedin_username: jparedesDS
kaggle_id: joseparedesc
rss_icon: false
```

**Front matter común de páginas:**

```yaml
layout: page
title: Projects
permalink: /projects/
lang: en
page_id: projects
nav: true
nav_order: 3
nav_key: projects
description: "..."
```

Para las versiones ES: mismo `permalink`, mismo `page_id`, `lang: es`, `title` y `description` traducidos, `nav_key` igual. Polyglot las publica en `/es/...`.

**Blog:** `_pages/blog.md` y `_pages/blog-es.md` usan `layout: default` y el include `blog-list.liquid`. Front matter de paginación:

```yaml
pagination:
  enabled: true
  collection: posts
  per_page: 10
  permalink: /page/:num/
  sort_field: date
  sort_reverse: true
```

**CV:** `_pages/cv.md` y `_pages/cv-es.md` usan `layout: cv`, `cv_pdf: /assets/pdf/resume.pdf`, `cv_format: rendercv`, `toc: { sidebar: left }`.

**404:** `_pages/404.md` con `permalink: /404.html`, `layout: page`, `redirect: true`, texto bilingüe o solo inglés; el 404 no necesita traducción.

**Includes (interfaces):**

- `project-links.liquid`: recibe `links` y `limit` opcional; usa `site.data[site.active_lang].strings.project_links`; pinta `<a class="project-link">` o `<span class="project-link project-link--private">`.
- `project-card.liquid`: recibe `project` y `featured` opcional; pinta imagen, título, descripción, categoría, badge privado, badge `EN` si `project.rendered_lang != site.active_lang`, y hasta 2 enlaces.
- `home.liquid`: usa `site.data[site.active_lang].home`; se completa en T13.
- `blog-list.liquid`: lista tags, categorías, años y posts paginados; se completa en T9.

**Verificación:**

```powershell
bundle exec jekyll build
```

- `/`, `/es/`, `/blog/`, `/es/blog/`, `/projects/`, `/es/projects/`, `/repositories/`, `/es/repositories/`, `/cv/`, `/es/cv/` existen.
- La nav muestra las etiquetas correctas en cada idioma.
- No aparece "Albert Einstein", "Your Name", "example.com", "Lorem ipsum", "prof_pic.jpg", "selected_papers" ni "announcements:".
- `_site/es/` no contiene copias de las páginas standalone.

**Commit:** `feat: add bilingual page shells and data contracts`

### T6 — 38 fichas de proyecto en inglés

**Objetivo:** convertir las 37 entradas antiguas + Subany en 38 fichas Markdown con un contrato común.

**Fuente de contenido:** las cuatro páginas antiguas `projects/<categoria>/index.md` (se conservan hasta T14) y los README públicos de GitHub. Para proyectos privados o sin README, usar solo la descripción antigua y marcar lo desconocido.

**Inventario exacto (38 fichas EN):**

| # | slug | Título EN | Categoría | Imagen | Enlaces principales | Privado | ES |
|---|---|---|---|---|---|---|---|
| 1 | `ocr-weapon-detection-cs2` | OCR Weapon Detection in Counter-Strike 2 | ai-vision | `/images/ocr-identification.png` | code `OCR-Identification-CS2-Weapons` | no | sí |
| 2 | `fluorescent-penetrant-inspection` | Fluorescent Penetrant Inspection Test | ai-vision | `/images/myyolo11.png` | model `fluorescent-penetrant-inspection`, code `fluorescent-penetrant-inspection` | no | sí |
| 3 | `dxf-data-extraction` | Data Extraction from DXF Files | ai-vision | `/images/mydxf.png` | code `extract-data-dxf` | no | sí |
| 4 | `welding-defects-detector` | Welding Defects Detector | ai-vision | `/images/mywelding.jpg` | model `welding-defects-detection`, code `welding-defects-detection` | no | sí |
| 5 | `futurama-image-classification` | Image & Vision Classification of Futurama Frames | ai-vision | `/images/myimage-classification.png` | kaggle `comp-mediavida-2-futurama`, code `image-classification-multilabel` | no | sí |
| 6 | `ai-yolo-object-detection` | AI-YOLO Object Detection | ai-vision | — | code `AI-YOLO` | no | sí |
| 7 | `lol-map-tracking` | LoL Map Tracking Object Detection | ai-vision | — | code `lol-map-tracking-object-detection` | no | sí |
| 8 | `cs2-weapon-detector-yolo12m` | Counter Strike 2 Weapon Detector (YOLO12m, 2025) | ai-vision | — | model `cs2-yolo12m-weapon-detection`, github `cs2-yolo12m-weapon-detection` | no | no |
| 9 | `welding-defects-detector-yolo11x` | Welding Defects Detector (YOLO11x, 2024) | ai-vision | — | model `welding-defects-detection`, github `welding-defects-detection` | no | no |
| 10 | `liquid-penetrant-test-yolo11l` | Liquid Penetrant Test (DP, LPI, PT) (YOLO11l, 2024) | ai-vision | — | model `liquid-penetrant-test-detection`, github `fluorescent-penetrant-inspection` | no | no |
| 11 | `cs2-players-detector-yolo12s` | Counter Strike 2 Players Detector (YOLO12s, 2025) | ai-vision | — | model `cs2_yolo12s`, github `cs2-object-dectection` | no | no |
| 12 | `cs2-players-detector-yolov9-v10-v11` | Counter Strike 2 Players Detector (YOLOv9/v10/v11, 2024) | ai-vision | — | model collection `cs2-yolo-object-detection-66f65a7fa395d5e5ede71489`, github `cs2-object-dectection` | no | no |
| 13 | `valorant-players-detector` | Valorant Players Detector (YOLOv10/v11, 2024) | ai-vision | — | model collection `valorant-yolo-object-detection-6708db8eda7c23b8859bcd3b`, github `valorant-object-detection` | no | no |
| 14 | `fortnite-players-detector` | Fortnite Players Detector (YOLO11, 2024) | ai-vision | — | model `fortnite-yolo11m`, github `fortnite-object-detection` | no | no |
| 15 | `overwatch-2-players-detector` | OverWatch 2 Players Detector (YOLO11, 2024) | ai-vision | — | model `ow2-yolo11m`, github `ow2-object-dectection` | no | no |
| 16 | `deadlock-players-detector` | Deadlock Players Detector (YOLO11, 2024) | ai-vision | — | model `deadlock-yolo11l`, github `deadlock-object-detection` | no | no |
| 17 | `lol-map-tracking-yolo11` | League of Legends Map Tracking (YOLO11, 2024) | ai-vision | — | github `lol-map-tracking-object-detection` | no | no |
| 18 | `docflow-saas` | DocFlow SaaS | data-automation | `/images/docflow-saas.svg` | code `docflow` | no | sí |
| 19 | `tableau-documentation-flow` | TABLEAU, Documentation Flow Dashboard | data-automation | `/images/tableau-logo.png` | tableau `https://public.tableau.com/app/profile/jose.paredes6369/viz/INFORMEDEPROGRESO/DASHDOCUMENTACIN` | no | sí |
| 20 | `docucontrol` | DocuControl | data-automation | `/images/docucontrol.png` | code `DocuControl` (private) | sí | sí |
| 21 | `email-mapi-automation` | Email MAPI Tools Automation | data-automation | `/images/myemailmapi.png` | code `email-mapi-automation` | no | sí |
| 22 | `eipsa-erp` | EIPSA ERP | data-automation | `/images/myERP.png` | code `ERP_EIPSA` | no | sí |
| 23 | `hltv-scraper` | HLTV Team and Player Stats Scraper | data-automation | `/images/myhltv.png` | code `hltv-scraper` | no | sí |
| 24 | `twitter-sentiment-emojis` | Twitter - Sentiment Analysis with Emojis | data-automation | `/images/myemoji.png` | code `NLP-sentiment-analysis-with-emojis` | no | sí |
| 25 | `twitter-sentiment-analysis` | Twitter Sentiment Analysis | data-automation | `/images/mytwittersentiment.png` | code `tensorflow-twitter-sentiment-analysis` | no | sí |
| 26 | `traffic-accidents-madrid` | Analysis of Traffic Accidents | data-automation | `/images/mytraffic.png` | code `lazy-classifier-traffic-accidents-madrid` | no | sí |
| 27 | `data-wrangling-titanic` | Data Wrangling Titanic | data-automation | — | code `data-wrangling-titanic` | no | sí |
| 28 | `monitoring-report-automation` | Monitoring Report Automation | data-automation | — | code `monitoring-report` | no | sí |
| 29 | `subany-video` | subany.video | products | `/images/subany-video-thumb.png` | website `https://subany.video/`, tutorial | no | sí |
| 30 | `cleanyourmail` | CleanYourMail — Reversible Inbox Cleanup for Coding Agents | products | `/images/cleanyourmail-thumb.png` | case study `/cleanyourmail/`, code `cleanyourmail`, website `cleanyourmail-web`, release `v1.1.5`, local app `cleanyourmail-app` | no | sí |
| 31 | `cleanyourphone` | CleanYourPhone — Reversible Android Debloat for Coding Agents | products | `/images/cleanyourphone-thumb.png` | code `clean-your-phone`, website `cleanyourphone-web` | no | sí |
| 32 | `workshop-scheduler` | Appointment Management for Auto Repair Shops | products | `/images/workshop-scheduler.svg` | code `talleres-ritmo` | no | sí |
| 33 | `trtw-tv` | trtw.tv — Live Spanish Subtitles for Twitch & YouTube | products | `/images/trtw-tv.png` | code `trtw-tv` | no | sí |
| 34 | `claude-telegram-bot` | Claude Telegram Bot | products | `/images/telegram-bot.png` | code `claude-telegram` | no | sí |
| 35 | `polymarket-autobetting` | Polymarket Auto-Betting Bot | products | `/images/polymarket.png` | code `polymarket-autobetting` (private) | sí | sí |
| 36 | `pro-pov-cs2` | Pro POV CS2 — Autonomous Esports Content Pipeline | esports | `/images/propov-cs2.png` | code `cs2data` (private), web `/propovcs2/`, youtube, tiktok, instagram, x | sí | sí |
| 37 | `clutchbot-ai` | ClutchBot.ai (CS2AI) | esports | `/images/cs2ai.svg` | code `CS2AI` (private) | sí | sí |
| 38 | `cs2-vrs-predictions` | CS2 VRS Predictions | esports | `/images/cs2-vrs.svg` | code `cs2-vrs-predictions` (private) | sí | sí |

Los enlaces abreviados con nombre de repo se construyen como `https://github.com/jparedesDS/<repo>`. Los enlaces de Hugging Face se construyen como `https://huggingface.co/jparedesDS/<modelo>` o `https://huggingface.co/collections/jparedesDS/<colección>`.

**Front matter exacto:**

```yaml
---
layout: project
title: "OCR Weapon Detection in Counter-Strike 2"
description: "Captures the screen and detects weapon names in Counter-Strike 2 using Optical Character Recognition."
img: /images/ocr-identification.png
img_alt: "Screenshot of the OCR weapon detection tool running over Counter-Strike 2"
importance: 1
category: ai-vision
project_key: ocr-weapon-detection-cs2
lang: en
page_id: project-ocr-weapon-detection-cs2
permalink: /projects/ocr-weapon-detection-cs2/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/OCR-Identification-CS2-Weapons
---
```

**Reglas de `importance`:**

- `subany-video`: `0`.
- AI & Vision principales: `1` a `7` en el orden de la tabla.
- Publicaciones de modelos AI: `8` a `17` en el orden de la tabla.
- Data & Automation: `1` a `11`.
- Products & Tools: `subany-video` `0`; el resto `1` a `6`.
- Esports & Content: `1` a `3`.

**Cuerpo de cada ficha principal (28):**

```markdown
## Overview

<2-4 frases basadas en la descripción antigua y el README>

## Problem

<qué problema resuelve, solo con datos verificados>

## Main features

- <feature verificada>
- <feature verificada>

## Stack

- <tecnología verificada>
```

Si el proyecto es privado o no tiene README:

```markdown
## Overview

<descripción antigua>

> Private repository. Implementation details are not disclosed.
```

No se inventan secciones, tecnologías ni métricas. Si no hay datos para "Stack", se omite la sección.

**Cuerpo de las 10 publicaciones de modelos:**

```markdown
## Model release

<descripción antigua: tarea, versión de YOLO y año>

This page indexes the model card and the repository for this release.
```

**Subany (`subany-video`):** usar la descripción de la portada actual. No incluir el enlace a `subtitle.me` (no es público). Los enlaces son la demo `https://subany.video/` y el tutorial; el layout muestra "Read the tutorial". No se afirma que sea open source.

**Verificación:**

```powershell
bundle exec jekyll build
```

- 38 archivos `_projects/*.md` con `lang: en`.
- Cada `page_id` es `project-<slug>` y cada `permalink` es `/projects/<slug>/`.
- Las imágenes existen en `images/`.
- No hay `TODO`, `example.com`, `localhost` ni descripciones inventadas.
- Los conteos por categoría son 17, 11, 7 y 3.

**Commit:** `feat: add 38 project pages`

### T7 — 28 traducciones de fichas al español

**Objetivo:** traducir las 28 fichas principales; las 10 publicaciones de modelos quedan con fallback inglés.

**Archivos:** `_projects/<slug>-es.md` para los 28 slugs con `ES = sí` de la tabla de T6. No crear los 10 archivos de modelos.

**Front matter:**

- Mismo `page_id: project-<slug>`, mismo `permalink: /projects/<slug>/`, misma `category`, `importance`, `img`, `project_key`, `private`, `tutorial` y `links`.
- `lang: es`.
- `title`, `description` e `img_alt` traducidos.
- `nav_key: projects`.

**Cuerpo:** mismas secciones que la ficha EN, con encabezados en español:

```markdown
## Resumen
## Problema
## Funcionalidades principales
## Stack
```

Para privados, el blockquote:

```markdown
> Repositorio privado. Los detalles de implementación no se divulgan.
```

**Regla de traducción:** solo se reformula información ya verificada en la ficha EN. No se añaden funciones, tecnologías ni métricas nuevas.

**Los 10 modelos EN-only:** añadir `lang_switch_fallback: /projects/` (sin prefijo de idioma) a su front matter EN. El include `lang-switch.liquid` añade `/es` cuando corresponde, así que el botón ES lleva a `/es/projects/` y el botón EN a `/projects/`.

**Verificación:**

```powershell
bundle exec jekyll build
```

- 28 archivos `-es.md` con `lang: es`.
- `/es/projects/<slug>/` existe para los 28.
- Los 10 modelos tienen `/es/projects/<slug>/` generado por Polyglot con `rendered_lang: en` y muestran el aviso de fallback.
- El botón EN/ES de una ficha traducida lleva a la ficha equivalente; en un modelo EN-only, el botón ES lleva a `/es/projects/`.

**Commit:** `feat: add Spanish project translations`

### T8 — Índice de proyectos, tarjetas y layout de ficha

**Objetivo:** que `/projects/` muestre las 38 fichas agrupadas, con Subany primero y anclas por categoría.

**Archivos:**

- `_layouts/project.liquid` (nuevo)
- `_pages/projects.md`, `_pages/projects-es.md` (contenido completo)
- `_includes/project-card.liquid` (contenido completo)
- `_includes/project-links.liquid` (contenido completo)
- `assets/css/subany.css` (estilos de tarjetas y ficha)

**`_layouts/project.liquid`:**

```liquid
---
layout: page
---
{% assign strings = site.data[site.active_lang].strings %}
<div class="project-page">
  <div class="project-meta">
    <span class="project-category">{{ strings.project_categories[page.category] }}</span>
    {% if page.private %}
      <span class="project-private">{{ strings.projects.private_repository }}</span>
    {% endif %}
  </div>
  {% if page.img %}
    <div class="project-hero-image">
      {% include figure.liquid path=page.img alt=page.img_alt %}
    </div>
  {% endif %}
  <div class="project-links">
    {% include project-links.liquid links=page.links %}
  </div>
  {% if page.tutorial %}
    <p class="project-tutorial">
      <a href="{{ page.tutorial | relative_url }}">{{ strings.projects.read_tutorial }}</a>
    </p>
  {% endif %}
  {{ content }}
</div>
```

**`_pages/projects.md`:**

```liquid
---
layout: page
title: Projects
permalink: /projects/
lang: en
page_id: projects
nav: true
nav_order: 3
nav_key: projects
description: "AI, data, products and esports projects built end to end."
---
{% assign strings = site.data[site.active_lang].strings %}
{% assign featured = site.projects | where: "project_key", "subany-video" | first %}
<div class="projects-index">
  {% if featured %}
    <section class="featured-project" aria-labelledby="featured-project-title">
      <h2 id="featured-project-title">{{ strings.projects.featured }}</h2>
      {% include project-card.liquid project=featured featured=true %}
    </section>
  {% endif %}
  {% assign categories = "ai-vision,data-automation,products,esports" | split: "," %}
  {% for category in categories %}
    {% assign projects = site.projects | where: "category", category | sort: "importance" %}
    {% if category == "products" %}
      {% assign projects = projects | where_exp: "p", "p.project_key != 'subany-video'" %}
    {% endif %}
    <section id="{{ category }}" class="project-category-section" aria-labelledby="{{ category }}-title">
      <h2 id="{{ category }}-title">{{ strings.project_categories[category] }}</h2>
      <div class="project-grid">
        {% for project in projects %}
          {% include project-card.liquid project=project %}
        {% endfor %}
      </div>
    </section>
  {% endfor %}
</div>
```

La versión ES es idéntica con `title: Proyectos`, `description` en español y `lang: es`; el `page_id` y el `permalink` no cambian.

**`project-card.liquid`:** imagen enlazada (si existe), título enlazado, descripción, categoría, badge privado, badge `EN` si `project.rendered_lang != site.active_lang`, y hasta 2 enlaces. Para la tarjeta destacada, clase `project-card--featured` y todos los enlaces (demo, código, tutorial).

**`project-links.liquid`:** usa `strings.project_links[link.type]`; si `link.private`, pinta el badge de repositorio privado; si `link.note`, añade una nota pequeña; si `link.url` es externa, `target="_blank" rel="noopener noreferrer"`.

**CSS mínimo:**

```css
.projects-index { display: flex; flex-direction: column; gap: 3rem; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.project-card { background: var(--global-card-bg-color); border: 1px solid var(--global-border-color); border-radius: 14px; overflow: hidden; }
.project-card-image img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
.project-card-body { padding: 1.1rem 1.2rem 1.3rem; }
.project-card--featured { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); }
@media (max-width: 720px) { .project-card--featured { grid-template-columns: 1fr; } }
```

**Verificación:**

- `/projects/` y `/es/projects/` existen.
- Hay 38 tarjetas en total (Subany + 17 + 11 + 6 + 3), sin duplicar Subany.
- Subany aparece primero; las categorías en orden AI, Data, Products, Esports.
- Las anclas `#ai-vision`, `#data-automation`, `#products`, `#esports` existen.
- Las tarjetas sin imagen no rompen la cuadrícula.
- No hay overflow horizontal a 320 px.

**Commit:** `feat: build projects index and cards`

### T9 — Blog y primer tutorial en inglés

**Objetivo:** publicar `/blog/` con paginación, etiquetas, categorías, años y el primer tutorial real.

**Archivos:**

- `_includes/blog-list.liquid`
- `_pages/blog.md`
- `_layouts/post.liquid` (override)
- `_layouts/archive.liquid` (override)
- `_includes/related_posts.liquid` (override)
- `_posts/2026-11-09-how-subany-video-works-en.md`

**`blog-list.liquid`:** muestra:

- Años: agrupar `site.posts` por año y enlazar a `/blog/<año>/`.
- Etiquetas: `site.tags` y enlaces a `/blog/tag/<slug>/`.
- Categorías: `site.categories` y enlaces a `/blog/category/<slug>/`.
- Lista paginada: `paginator.posts` si `page.pagination.enabled`, si no `site.posts`; título, descripción, fecha con `strings.blog.date_format`, tiempo de lectura (`number_of_words / 180 + 1`) y etiquetas.
- `{% include pagination.liquid %}` al final.

**`_pages/blog.md`:** `layout: default`, `title: Tutorials`, `permalink: /blog/`, `lang: en`, `page_id: blog`, `nav: true`, `nav_order: 2`, `nav_key: blog`, paginación `per_page: 10`, `sort_field: date`, `sort_reverse: true`. Body: header + `{% include blog-list.liquid %}`.

**Tutorial EN:** front matter:

```yaml
---
layout: post
title: "How subany.video works: live subtitles in the browser"
description: "A technical tour of the fixed-delay player, in-browser speech recognition, translation and subtitle timing behind subany.video."
date: 2026-11-09 10:00:00 +0100
lang: en
page_id: subany-video-tutorial
nav_key: blog
permalink: /blog/2026/11/09/how-subany-video-works/
categories: [tutorials]
tags: [subany, hls, whisper, onnx, webgpu, translation]
author: Jose Paredes
toc:
  beginning: true
mermaid:
  enabled: true
---
```

El contenido sigue el desglose de la sección 12 de este plan. Debe incluir un diagrama Mermaid, bloques de código reales y una tabla de mediciones. No se inventan cifras.

**`_layouts/post.liquid`:** copiar el del gem y:

- Traducir "Created on", "by", "last updated on" con `strings.post.*`.
- Usar `{% assign is_blog_post = page.collection == 'posts' %}` en lugar de `url_beginning == '/blog/'` para que los enlaces de año/etiqueta/categoría funcionen también en `/es/`.
- Eliminar las secciones de `citation`, `related_publications` y `plugins/al_comments.liquid` (no hay bibliografía ni comentarios).
- Mantener TOC, contenido, `related_posts` y estilos de página.

**`_layouts/archive.liquid`:** copiar el del gem y traducir las descripciones con `strings.archive.*` y `strings.blog.date_format`. Sustituir el placeholder `{collection}` por `strings.archive.posts` con `replace`. El título de año/tag/categoría se mantiene. No mostrar el aviso de fallback en archivos (ya se excluye en `default.liquid`).

**`_includes/related_posts.liquid`:** copiar el del gem y traducir el heading y la frase introductoria con `strings.related_posts.*`. No incluir newsletter.

**Verificación:**

- `/blog/` existe y lista el tutorial.
- `/blog/2026/`, `/blog/tag/subany/`, `/blog/category/tutorials/` existen.
- El tutorial renderiza TOC, Mermaid, código y tabla.
- El tiempo de lectura y la fecha se muestran en inglés.
- No hay enlaces a `publications`, `teaching`, `books` ni `news`.

**Commit:** `feat: add blog and Subany tutorial (EN)`

### T10 — Primer tutorial en español

**Objetivo:** publicar la traducción española con el mismo `page_id` y distinto `permalink`.

**Archivo:** `_posts/2026-11-09-como-funciona-subany-video-es.md`

```yaml
---
layout: post
title: "Cómo funciona subany.video: subtítulos en directo en el navegador"
description: "Un recorrido técnico por el reproductor con retardo fijo, el reconocimiento de voz en el navegador, la traducción y la sincronización de subtítulos de subany.video."
date: 2026-11-09 10:00:00 +0100
lang: es
page_id: subany-video-tutorial
nav_key: blog
permalink: /blog/2026/11/09/como-funciona-subany-video/
categories: [tutorials]
tags: [subany, hls, whisper, onnx, webgpu, traduccion]
author: Jose Paredes
toc:
  beginning: true
mermaid:
  enabled: true
---
```

Traducir el contenido EN sin cambiar cifras, nombres de modelos ni conclusiones. Los bloques de código se mantienen iguales; los comentarios y el texto sí se traducen.

**Verificación:**

- `/es/blog/2026/11/09/como-funciona-subany-video/` existe.
- El botón EN/ES lleva del tutorial EN al ES y viceversa.
- `canonical` de ambos apunta al EN.
- `hreflang` EN/ES/x-default correctos.
- La página ES tiene `<html lang="es">`; la EN `lang="en"`.

**Commit:** `feat: add Subany tutorial (ES)`

### T11 — Página de repositorios

**Objetivo:** representar la presencia pública en GitHub con tarjetas curadas, sin servicios externos.

**Archivos:**

- `_data/en/repositories.yml`, `_data/es/repositories.yml`
- `_pages/repositories.md`, `_pages/repositories-es.md`
- `assets/css/subany.css` (estilos de repositorios)

**Esquema:**

```yaml
github_users: [jparedesDS]
profile:
  name: Jose Paredes
  username: jparedesDS
  url: https://github.com/jparedesDS
  description: "Data Scientist and AI Engineer. Computer vision, automation and local-first products."
repos:
  - name: OCR-Identification-CS2-Weapons
    url: https://github.com/jparedesDS/OCR-Identification-CS2-Weapons
    description: "OCR weapon detection for Counter-Strike 2."
    language: Python
    private: false
```

**Selección mínima:** los repositorios públicos de los 28 proyectos principales, más los 10 repositorios de modelos que existan. No incluir forks vacíos ni repositorios sin contenido. Los privados se listan con `private: true` y sin descripción inventada.

**Regla:** no usar `repository/repo.liquid`, `repository/repo_user.liquid`, `github-stats-extended.vercel.app` ni trophies. Las tarjetas son HTML/Liquid estático.

**Página:** header con nombre, descripción y botón "View GitHub profile" / "Ver perfil de GitHub"; lista de tarjetas con nombre, descripción, lenguaje y badge privado. Enlace al perfil al final.

**Verificación:**

- `/repositories/` y `/es/repositories/` existen.
- No aparece `github-stats-extended.vercel.app` ni `github-profile-trophy.vercel.app` en el HTML.
- Los enlaces externos abren en pestaña nueva con `rel="noopener noreferrer"`.
- Las descripciones están traducidas en ES; los nombres y lenguajes no.

**Commit:** `feat: add curated repositories page`

### T12 — CV bilingüe RenderCV

**Objetivo:** renderizar el CV real desde `resume.pdf` en EN/ES, con descarga del PDF.

**Archivos:**

- `_data/en/cv.yml`, `_data/es/cv.yml`
- `_includes/cv/render.liquid` (override del gem)
- `_pages/cv.md`, `_pages/cv-es.md`
- `assets/pdf/resume.pdf` (copia de `resume.pdf`)

**Datos:** usar `docs/superpowers/notes/2026-11-09-resume-extracted.txt`. Esquema:

```yaml
cv:
  name: Jose Paredes Colmenarejo
  label: Data Scientist | AI Engineer | ML Engineer
  location: Madrid, Spain
  email: jparedescolmenarejo@gmail.com
  website: https://jparedesds.github.io
  summary: >
    Data Scientist and AI Engineer ...
  sections:
    Experience:
      - company: EIPSA - Española de Instrumentación Primaria S.A.
        position: Data Analyst & AI Engineer
        start_date: 2024-01
        end_date: Present
        location: Madrid, Spain
        highlights:
          - ...
    Education:
      - institution: The Bridge | Digital Talent Accelerator
        area: Data Science
        studyType: Bootcamp
        start_date: 2021-09
        end_date: 2022-06
        location: Madrid, Spain
        highlights:
          - ...
    Skills:
      - name: Programming
        keywords: [Python, JavaScript, SQL, Bash, HTML/CSS]
    Languages:
      - name: Spanish
        summary: Native
      - name: English
        summary: Professional working proficiency (B2)
    Projects:
      - name: DocFlow SaaS
        summary: ...
        start_date: 2024-01
        end_date: Present
        url: https://github.com/jparedesDS/docflow
    Additional Information:
      - bullet: "Platforms: HuggingFace (jparedesDS), Kaggle (joseparedesc), Tableau Public."
```

**Teléfono:** no incluir `phone` en el HTML del CV (ni en EN ni en ES). El PDF `resume.pdf` se conserva con el teléfono para quien lo descargue, pero la página no lo expone a scrapers.

**Claves canónicas:** mantener `Experience`, `Education`, `Skills`, `Languages`, `Projects`, `Additional Information` en ambos idiomas. Traducir solo los valores y las etiquetas de visualización.

**Fechas:** poner `end_date` explícito en todas las entradas (`Present` en EN, `Actualidad` en ES) porque `experience.liquid` y `projects.liquid` usan `Present` como fallback.

**`_includes/cv/render.liquid`:** copiar de `bundle show al_folio_cv` → `templates/cv/render.liquid` y:

- Cambiar `site.data.cv.cv` por `site.data[site.active_lang].cv.cv` (y las comprobaciones de `site.data.cv`).
- Traducir las etiquetas fijas: "Contact Information", "Name", "Professional Title", "Email", "Phone", "Location", "Website", "Professional Summary", "Experience" con `strings.cv.*`.
- Para los títulos de sección, usar `strings.cv.sections[section_title] | default: section_title`.
- El `render.liquid` del gem comprueba `cv.location` pero solo pinta `cv.address`; añadir una fila para `cv.location` cuando `cv.address` no exista.
- Cambiar los `h3.card-title` de las secciones por `h2` para no saltar de `h1` a `h3` (axe/heading-order y accesibilidad).
- Mantener la lógica de dispatch por claves canónicas.

**Páginas:** `layout: cv`, `permalink: /cv/`, `lang`, `page_id: cv`, `nav: true`, `nav_order: 5`, `nav_key: cv`, `cv_pdf: /assets/pdf/resume.pdf`, `cv_format: rendercv`, `toc: { sidebar: left }`.

**Verificación:**

- `/cv/` y `/es/cv/` existen.
- El botón del PDF descarga `/assets/pdf/resume.pdf`.
- EN muestra "Experience", "Education", "Skills"; ES muestra "Experiencia", "Formación", "Habilidades".
- En ES no aparece "Present" ni "Professional Summary".
- Los datos coinciden con `resume.pdf`; no hay experiencia, formación ni métricas inventadas.
- El CV no tiene overflow horizontal a 320 px.

**Commit:** `feat: add bilingual CV`

### T13 — Portada bilingüe

**Objetivo:** construir la portada personalizada aprobada (opción A): About primero, Subany destacado, 9 proyectos y últimos tutoriales.

**Archivos:**

- `_includes/home.liquid` (contenido completo)
- `_data/en/home.yml`, `_data/es/home.yml` (contenido completo)
- `_pages/about.md`, `_pages/about-es.md` (contenido completo)
- `assets/css/subany.css` (estilos de portada)

**`_data/en/home.yml`:**

```yaml
eyebrow: About
name: Jose Paredes
role: Data Scientist · Madrid, Spain
summary: >-
  At EIPSA, I build computer-vision systems and automation for engineering and
  manufacturing. I also develop practical AI products and local-first tools.
profile_alt: Portrait of Jose Paredes
contact_label: Contact and professional profiles
contact:
  - label: Email
    url: mailto:jparedescolmenarejo@gmail.com
    external: true
  - label: CV
    url: /assets/pdf/resume.pdf
    external: false
  - label: LinkedIn
    url: https://www.linkedin.com/in/jparedesDS/
    external: true
  - label: GitHub
    url: https://github.com/jparedesDS
    external: true
  - label: Hugging Face
    url: https://huggingface.co/jparedesDS
    external: true
  - label: Kaggle
    url: https://www.kaggle.com/joseparedesc
    external: true
featured:
  label: Featured project
  title: subany.video
  tagline: Any video, in your language.
  description: >-
    Live subtitles and translation for streams and videos, processed privately
    in your browser. No account needed.
  image: /images/subany-video-thumb.png
  image_alt: "subany.video showing a video link ready to be subtitled"
  preview_label: Open subany.video
  links:
    - label: Try subany.video
      url: https://subany.video/
      style: primary
    - label: How it works
      url: /blog/2026/11/09/how-subany-video-works/
      style: secondary
projects_title: Projects
projects_all_label: All projects
selected_note: Selected work. Browse all projects for the complete archive.
selected_projects:
  - cleanyourmail
  - cleanyourphone
  - pro-pov-cs2
  - trtw-tv
  - docflow-saas
  - polymarket-autobetting
  - workshop-scheduler
  - claude-telegram-bot
  - ocr-weapon-detection-cs2
latest_title: Latest tutorials
latest_all_label: All tutorials
latest_note: Technical write-ups on how the projects work.
latest_limit: 3
```

La versión ES traduce `eyebrow`, `role`, `summary`, `contact_label`, `featured.label`, `featured.tagline`, `featured.description`, `featured.links[].label`, `projects_title`, `projects_all_label`, `selected_note`, `latest_title`, `latest_all_label` y `latest_note`. Mantiene las mismas claves, URLs y `selected_projects`. El enlace "How it works" en ES apunta a `/blog/2026/11/09/como-funciona-subany-video/`.

**`_includes/home.liquid`:**

- Asignar `home = site.data[site.active_lang].home` y `strings`.
- Cabecera `<header class="profile-header" id="about">` con `profile.jpg`, nombre, rol, resumen y enlaces de contacto. Los enlaces externos con `target="_blank" rel="noopener noreferrer"`; los internos con `relative_url`.
- Sección destacada `<section class="hero-project">` con etiqueta, título, tagline, descripción, imagen y los tres enlaces. El enlace primario con `button button-primary`, el secundario con `button button-secondary`, el tutorial como enlace de texto.
- Sección `#projects` con `section-heading`, enlace a `/projects/` y lista de los 9 proyectos. Para cada clave:
  ```liquid
  {% assign project = site.projects | where: "project_key", key | first %}
  ```
  Mostrar título enlazado, descripción y `{% include project-links.liquid links=project.links limit=2 %}`.
- Sección de últimos tutoriales: `{% for post in site.posts limit: home.latest_limit %}`; título enlazado, descripción, fecha (`strings.blog.date_format`) y tiempo de lectura. Si no hay posts, no renderizar la sección.
- No incluir News, publications, teaching, books ni enlaces a categorías antiguas.

**Estilos:** portar las clases de `_sass/_portfolio.scss` (aún disponible hasta T14) a `assets/css/subany.css`, sustituyendo colores fijos por variables:

- `.home-container` máximo 1180 px.
- `.profile-header` grid 96 px + 1fr, gap 24 px; en móvil una columna y foto más pequeña.
- `.hero-project` grid 1.1fr + 0.9fr, fondo `var(--global-card-bg-color)`, borde, radio 18 px; en móvil una columna.
- `.hero-project-label` con el degradado como barra/underline, no como texto.
- `.button-primary` fondo `#1c1915`, texto `#d6bfa0`/`#ede3d3`; `.button-secondary` borde y texto del tema.
- `.project-list` lista de una columna, separadores con `var(--global-border-color)`.
- `.section-heading` con título y enlace "All projects"/"All tutorials".
- `.latest-tutorials` lista de 3 columnas en desktop, una en móvil.

**Verificación:**

- `/` y `/es/` existen.
- About es la primera sección.
- Subany aparece como proyecto destacado con imagen, demo y tutorial.
- Hay exactamente 9 proyectos seleccionados.
- Hay como máximo 3 tutoriales; con un solo tutorial, se muestra uno.
- No aparece la sección News.
- A 320, 390, 768, 1024 y 1440 px no hay overflow horizontal.
- El enlace CV descarga `/assets/pdf/resume.pdf` también en `/es/`.

**Commit:** `feat: build bilingual homepage`

### T14 — Redirects de categorías antiguas y rutas standalone

**Objetivo:** que las URLs antiguas no devuelvan 404 y que las aplicaciones standalone sigan intactas.

**Archivos:**

- `projects/ai-vision/index.html`
- `projects/data-automation/index.html`
- `projects/products/index.html`
- `projects/esports/index.html`

**Plantilla de redirect** (cambiar categoría y título):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=/projects/#ai-vision">
    <link rel="canonical" href="/projects/#ai-vision">
    <title>Redirecting to Projects</title>
  </head>
  <body>
    <p>Redirecting to <a href="/projects/#ai-vision">Projects</a>…</p>
  </body>
</html>
```

Destinos:

- `/projects/ai-vision/` → `/projects/#ai-vision`
- `/projects/data-automation/` → `/projects/#data-automation`
- `/projects/products/` → `/projects/#products`
- `/projects/esports/` → `/projects/#esports`

**Pasos:**

1. Crear los cuatro `index.html`.
2. Eliminar los cuatro `projects/*/index.md` antiguos.
3. No tocar `cleanyourmail/`, `propovcs2/`, `cs2pov/`, `murdoku/`.
4. Comprobar que `cleanyourmail/index.html` sigue referenciando `/images/...`.
5. Añadir `projects/ai-vision`, `projects/data-automation`, `projects/products`, `projects/esports` a `exclude_from_localization` (ya en T4) para que Polyglot no los prefije.

**Verificación:**

- `Invoke-WebRequest http://127.0.0.1:4000/projects/ai-vision/` devuelve 200 y el HTML contiene `http-equiv="refresh"`.
- Las cuatro URLs hacen el redirect en un navegador.
- `/cleanyourmail/`, `/propovcs2/`, `/cs2pov/`, `/murdoku/` devuelven 200.
- `/images/subany-video-thumb.png` devuelve 200.
- El índice `/projects/` contiene las anclas de las cuatro categorías.

**Commit:** `feat: redirect legacy project categories`

### T15 — Buscador bilingüe

**Objetivo:** replicar el buscador de al-folio con Ctrl/Cmd+K, indexando páginas, proyectos y tutoriales, con URLs y textos en el idioma activo.

**Archivos:**

- `_includes/plugins/al_search_assets.liquid` (override)
- `assets/js/search-i18n.js` (nuevo)
- `assets/css/subany.css` (tema de `ninja-keys`, ya en T3)

**`_includes/plugins/al_search_assets.liquid`:** no usar el tag `{% al_search_assets %}` porque fija el placeholder en inglés y no conoce Polyglot. Generar el markup equivalente:

```liquid
{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
{% assign lang_prefix = '' %}
{% if active_lang != site.default_lang %}
  {% assign lang_prefix = '/' | append: active_lang %}
{% endif %}
<script type="module" src="{{ '/assets/al_search/js/search/ninja-keys.min.js' | relative_url }}"></script>
<ninja-keys
  hideBreadcrumbs
  noAutoLoadMdIcons
  placeholder="{{ strings.search.placeholder }}"
  data-placeholder="{{ strings.search.placeholder }}"
  data-select="{{ strings.search.select }}"
  data-navigate="{{ strings.search.navigate }}"
  data-close="{{ strings.search.close_hint }}"
></ninja-keys>
<script src="{{ '/assets/al_search/js/search-setup.js' | relative_url }}"></script>
<script>
  const ninja = document.querySelector('ninja-keys');
  ninja.data = [
    {
      id: 'nav-about',
      title: '{{ strings.nav.about | escape }}',
      section: '{{ strings.search.sections.navigation | escape }}',
      handler: () => { window.location.href = '{{ lang_prefix }}/'; },
    },
    {
      id: 'nav-blog',
      title: '{{ strings.nav.blog | escape }}',
      section: '{{ strings.search.sections.navigation | escape }}',
      handler: () => { window.location.href = '{{ lang_prefix }}/blog/'; },
    },
    {
      id: 'nav-projects',
      title: '{{ strings.nav.projects | escape }}',
      section: '{{ strings.search.sections.navigation | escape }}',
      handler: () => { window.location.href = '{{ lang_prefix }}/projects/'; },
    },
    {
      id: 'nav-repositories',
      title: '{{ strings.nav.repositories | escape }}',
      section: '{{ strings.search.sections.navigation | escape }}',
      handler: () => { window.location.href = '{{ lang_prefix }}/repositories/'; },
    },
    {
      id: 'nav-cv',
      title: '{{ strings.nav.cv | escape }}',
      section: '{{ strings.search.sections.navigation | escape }}',
      handler: () => { window.location.href = '{{ lang_prefix }}/cv/'; },
    },
    {% assign categories = 'ai-vision,data-automation,products,esports' | split: ',' %}
    {% for category in categories %}
      {
        id: 'category-{{ category }}',
        title: '{{ strings.project_categories[category] | escape }}',
        section: '{{ strings.search.sections.categories | escape }}',
        handler: () => { window.location.href = '{{ lang_prefix }}/projects/#{{ category }}'; },
      },
    {% endfor %}
    {% for post in site.posts %}
      {% assign item_url = post.url | relative_url %}
      {% unless active_lang == site.default_lang %}
        {% unless item_url contains lang_prefix %}
          {% assign item_url = lang_prefix | append: item_url %}
        {% endunless %}
      {% endunless %}
      {
        id: 'post-{{ post.url | slugify }}',
        title: '{{ post.title | escape }}{% if post.rendered_lang and post.rendered_lang != active_lang %} · EN{% endif %}',
        description: '{{ post.description | strip_html | strip_newlines | escape }}',
        section: '{{ strings.search.sections.tutorials | escape }}',
        handler: () => { window.location.href = '{{ item_url }}'; },
      },
    {% endfor %}
    {% for project in site.projects %}
      {% assign item_url = project.url | relative_url %}
      {% unless active_lang == site.default_lang %}
        {% unless item_url contains lang_prefix %}
          {% assign item_url = lang_prefix | append: item_url %}
        {% endunless %}
      {% endunless %}
      {
        id: 'project-{{ project.project_key | slugify }}',
        title: '{{ project.title | escape }}{% if project.rendered_lang and project.rendered_lang != active_lang %} · EN{% endif %}',
        description: '{{ project.description | strip_html | strip_newlines | escape }}',
        section: '{{ strings.search.sections.projects | escape }}',
        handler: () => { window.location.href = '{{ item_url }}'; },
      },
    {% endfor %}
  ];
</script>
<script src="{{ '/assets/js/search-i18n.js' | relative_url }}"></script>
<script src="{{ '/assets/al_search/js/shortcut-key.js' | relative_url }}"></script>
```

**`assets/js/search-i18n.js`:**

- Lee `ninja.dataset.placeholder` y asigna `ninja.placeholder`.
- Localiza los textos del footer del componente (`to select`, `to navigate`, `to close`) dentro del shadow DOM. Usar un guard para no entrar en bucle con `MutationObserver`.
- No traducir los nombres de modelos ni los títulos; solo la interfaz.
- Si el shadow DOM no está disponible, no fallar; el buscador sigue funcionando en inglés.

**Notas técnicas:**

- El componente maneja Ctrl/Cmd+K por sí mismo (`openHotkey="cmd+k,ctrl+k"`), y `search-setup.js` abre el modal al pulsar `#search-toggle`.
- `shortcut-key.js` cambia el texto a `⌘ k` en Mac.
- Polyglot no reescribe strings dentro de `<script>`; por eso las URLs se construyen con `lang_prefix` y se comprueba `contains` para no duplicar `/es/`.
- `search_enabled: true`, `posts_in_search: true`, `bib_search: false`, `socials_in_search: false` (T3).

**Verificación (manual + Playwright en T16):**

- En `/`, pulsar Ctrl+K (y Cmd+K en Mac) abre el buscador.
- Buscar "subany" muestra el proyecto y el tutorial.
- En `/es/`, el placeholder está en español y los resultados llevan a `/es/...`.
- Buscar "clean" muestra CleanYourMail/CleanYourPhone.
- Los resultados de páginas sin traducción muestran `· EN`.
- La navegación con flechas y Enter funciona.
- El foco es visible.
- Cambiar de tema actualiza la apariencia del modal.

**Commit:** `feat: add bilingual search`

### T16 — Tests de contenido, accesibilidad y responsive

**Objetivo:** convertir las comprobaciones manuales en tests repetibles antes de publicar.

**Dependencias nuevas (`package.json`):**

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.10.2",
    "@playwright/test": "^1.56.1",
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0"
  }
}
```

Ejecutar `npm install` para actualizar `package-lock.json`.

**Scripts de `package.json`:**

```json
{
  "scripts": {
    "lint:prettier": "prettier . --check",
    "test:content": "node --test test/content/inventory.test.mjs test/content/i18n.test.mjs test/content/content.test.mjs test/content/links.test.mjs test/content/redirects.test.mjs",
    "test:a11y": "playwright test test/a11y",
    "test:responsive": "playwright test test/responsive",
    "test:e2e": "playwright test test/e2e",
    "test": "npm run test:content && npm run test:a11y && npm run test:responsive && npm run test:e2e"
  }
}
```

**`test/content/projects.json`:** manifiesto esperado generado a partir de la tabla de T6. Esquema:

```json
{
  "categories": [
    { "key": "ai-vision", "count": 17 },
    { "key": "data-automation", "count": 11 },
    { "key": "products", "count": 7 },
    { "key": "esports", "count": 3 }
  ],
  "projects": [
    {
      "slug": "ocr-weapon-detection-cs2",
      "title_en": "OCR Weapon Detection in Counter-Strike 2",
      "category": "ai-vision",
      "img": "/images/ocr-identification.png",
      "private": false,
      "es": true
    }
  ]
}
```

**`test/content/inventory.test.mjs`:** leer el manifiesto y los `_projects/*.md` con `gray-matter`; comprobar:

- 38 fichas EN con `lang: en`; 28 fichas ES con `lang: es`.
- Conteos por categoría: 17, 11, 7 y 3.
- `subany-video` tiene `importance: 0`.
- Cada ficha EN tiene `page_id: project-<slug>`, `permalink: /projects/<slug>/`, `category` correcta, `title` no vacío y `description` no vacía.
- Cada ficha ES tiene el mismo `page_id`, `permalink`, `category`, `importance` y `links` que su EN.
- Las 10 publicaciones de modelos no tienen archivo `-es.md`.
- Cada `img` declarada existe en `images/`.
- No hay `TODO`, `undefined`, `example.com` ni `localhost`.

**`test/content/i18n.test.mjs`:**

- `_data/en/strings.yml` y `_data/es/strings.yml` tienen exactamente las mismas claves.
- `_data/en/home.yml` y `_data/es/home.yml` tienen las mismas claves y los mismos `selected_projects` (9).
- `_data/en/repositories.yml` y `_data/es/repositories.yml` tienen los mismos repositorios en el mismo orden.
- `_data/en/cv.yml` y `_data/es/cv.yml` tienen las mismas claves de sección canónicas.
- Cada página de `_pages` con `page_id` tiene su pareja EN/ES (excepto 404) y comparte `permalink`.
- Los dos tutoriales comparten `page_id` y tienen `permalink` distintos.

**`test/content/content.test.mjs`:**

- Existen las páginas EN/ES de about, blog, projects, repositories y CV.
- Existen los dos tutoriales y los cuatro redirects.
- Existen `cleanyourmail/`, `propovcs2/`, `cs2pov/` y `murdoku/` con su `index.html`.
- `cleanyourmail/index.html` sigue conteniendo `/images/`.
- No existen `_sass/_style.scss`, `_sass/_portfolio.scss`, `_sass/_vars.scss`, `_layouts/default.html` ni `_includes/header.html`.
- `_config.yml` tiene `baseurl: ""`, `url: https://jparedesds.github.io`, `languages: ["en", "es"]`, `default_lang: "en"`, `parallel_localization: false`, `lang_vars: ["lang"]`, `imagemagick.enabled: false`, `al_folio.compat.bootstrap.enabled: false`, `search_enabled: true`, `posts_in_search: true`, `bib_search: false`, `max_width: 1100px`, `footer_fixed: false`, `enable_darkmode: true`.
- `Gemfile` contiene `jekyll-polyglot`.
- No hay contenido de ejemplo: "Albert Einstein", "Your Name", "example.com", "Lorem ipsum", "prof_pic.jpg", "selected_papers", "announcements:".

**`test/content/links.test.mjs`:**

- Todos los `links` de `_projects`, `_data/*/home.yml` y `_data/*/repositories.yml` empiezan por `https://` o `/`.
- No hay `localhost`, `127.0.0.1`, `example.com`, `TODO` ni `undefined`.
- Los enlaces privados tienen `private: true` o `note`.
- Los enlaces internos `/projects/<slug>/` existen en el manifiesto.

**`test/content/redirects.test.mjs`:**

- Los cuatro `projects/*/index.html` contienen `http-equiv="refresh"` y el destino correcto.
- El destino usa `/projects/#<categoria>`.

**`test/playwright.config.js`:**

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bundle exec jekyll serve --host 127.0.0.1 --port 4000",
    url: "http://127.0.0.1:4000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

**`test/a11y/a11y.spec.js`:** recorrer estas rutas y ejecutar axe con `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`:

- `/`, `/projects/`, `/blog/`, `/blog/2026/11/09/how-subany-video-works/`, `/repositories/`, `/cv/`
- `/es/`, `/es/projects/`, `/es/blog/`, `/es/blog/2026/11/09/como-funciona-subany-video/`, `/es/repositories/`, `/es/cv/`

Para portada, projects, tutorial y CV, repetir en claro y oscuro. `expect(results.violations).toEqual([])`. Corregir contraste, nombres accesibles, jerarquía de headings, `aria-current`, foco y labels.

**`test/responsive/responsive.spec.js`:** para 320, 390, 768, 1024 y 1440 px, comprobar en `/`, `/projects/`, `/blog/`, tutorial, `/repositories/` y `/cv/` (EN/ES) que:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
```

También abrir/cerrar el menú móvil y comprobar que no queda contenido cortado.

**`test/e2e/search.spec.js`:**

- `/`: `Control+k` (o `Meta+k`) abre `ninja-keys`; escribir "subany"; comprobar que aparece el proyecto y el tutorial.
- `/es/`: el placeholder está en español; buscar "clean"; comprobar resultados y que los enlaces apuntan a `/es/...`.
- `/es/`: buscar un modelo EN-only y comprobar el sufijo `· EN`.

**`test/e2e/theme.spec.js`:**

- Estado inicial claro u oscuro según el sistema.
- Click en `#light-toggle`: `data-theme` cambia y `localStorage.theme` se guarda.
- Recargar: la preferencia persiste.
- No existe un tercer estado "system" tras pulsar.

**`test/e2e/lang.spec.js`:**

- `/`: click en `ES` lleva a `/es/`.
- `/es/`: click en `EN` lleva a `/`.
- Tutorial EN → tutorial ES → tutorial EN.
- Una ficha traducida conserva la ruta equivalente.
- Un modelo EN-only: desde EN, el botón ES lleva a `/es/projects/`; desde `/es/projects/<slug>/`, el botón EN lleva a `/projects/<slug>/`.
- `document.documentElement.lang` es correcto en cada caso.

**Comandos:**

```powershell
npx playwright install chromium
npm run test:content
npm run test:a11y
npm run test:responsive
npm run test:e2e
```

**Commit:** `test: add content, a11y and responsive checks`

### T17 — Workflow de despliegue y build de producción

**Objetivo:** construir desde `main` y publicar solo `_site` en `gh-pages`.

**Archivo:** `.github/workflows/deploy.yml`

**Contenido final:**

```yaml
name: Deploy site

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3.5"
          bundler-cache: true

      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: "20"
          cache: "npm"

      - name: Install JS dependencies
        run: npm ci

      - name: Build site
        run: |
          export JEKYLL_ENV=production
          bundle exec jekyll build

      - name: Purge unused CSS
        run: |
          npm install -g purgecss
          purgecss -c purgecss.config.js

      - name: Add .nojekyll
        run: touch _site/.nojekyll

      - name: Deploy to gh-pages
        if: github.event_name != 'pull_request'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: _site
          branch: gh-pages
          clean: true
```

**Cambios respecto al starter:**

- Eliminar por completo el bloque `paths` de `push` y `pull_request`. No ampliarlo: si se deja, los cambios solo de assets no despliegan.
- Eliminar el step de `giscus`/`yaml-update-action`.
- Eliminar `Setup Python`, `pip install nbconvert` y `apt-get install imagemagick`.
- Añadir `touch _site/.nojekyll`.
- Dejar solo `push` a `main` y `workflow_dispatch`; no desplegar en pull requests.
- `permissions: contents: write` para que la action pueda escribir en `gh-pages`.
- `folder: _site`, `branch: gh-pages`, `clean: true`.

**Verificación local:**

```powershell
$env:JEKYLL_ENV = "production"
bundle exec jekyll build
New-Item -ItemType File -Force _site/.nojekyll
ruby -e "require 'yaml'; YAML.load_file('.github/workflows/deploy.yml'); puts 'workflow yaml ok'"
```

- `_site/index.html`, `_site/es/index.html`, `_site/projects/index.html`, `_site/cv/index.html` y `_site/.nojekyll` existen.
- `_site` no contiene `_config.yml`, `Gemfile` ni `_projects`.
- `purgecss` no elimina las clases de `subany.css` usadas en el HTML; revisar que la portada y las tarjetas conservan estilos.

**Commit:** `ci: deploy al-folio build to gh-pages`

### T18 — Revisión final y autorización de publicación

**Objetivo:** verificar todo y pedir permiso antes de tocar GitHub.

**Comandos obligatorios:**

```powershell
npm run lint:prettier
bundle exec al-folio upgrade audit --no-fail
bundle exec al-folio upgrade overrides audit
bundle exec jekyll build
npm run test:content
npm run test:a11y
npm run test:responsive
npm run test:e2e
```

Revisar cada override con `bundle exec al-folio upgrade overrides diff <ruta>` y, cuando el diff sea intencionado, ejecutar `bundle exec al-folio upgrade overrides accept --all`. Commitear `.al-folio-overrides.yml`.

**Comprobaciones manuales:**

- 38 fichas EN, 28 ES, 10 fallbacks con aviso.
- Subany primero en `/projects/`; 9 proyectos en la portada.
- Navegación exacta: about, blog, projects, repositories, CV + search + EN/ES + tema.
- Buscador con ratón, Ctrl+K y Cmd+K; resultados EN/ES; enlaces correctos.
- Cambio de tema y persistencia; sin tercer estado.
- Cambio de idioma en portada, páginas, fichas, tutorial, CV y repositorios.
- Rutas antiguas redirigen; standalone intactas.
- `/images/`, `profile.jpg`, `resume.pdf`, verificación de Google y TikTok intactos.
- Sin enlaces a publications, teaching, books, news, people ni submenús.
- Sin contenido de ejemplo.
- Desktop y móvil en 320, 390, 768, 1024 y 1440 px; claro y oscuro.
- axe WCAG AA sin violaciones.
- Workflow YAML válido; `gh-pages` sigue siendo la fuente de GitHub Pages.

**Si todo pasa:**

1. Mostrar al usuario un resumen del diff, los conteos, las rutas y los tests.
2. Pedir autorización explícita para `git push -u origin main`.
3. Solo con autorización:
   ```powershell
   git push -u origin main
   ```
4. Verificar en GitHub Actions que el workflow termina en verde.
5. Verificar `https://jparedesds.github.io/` y una muestra de `/es/`, `/projects/`, tutorial, `/cv/`, `/repositories/`.
6. Confirmar que `gh-pages` contiene el sitio construido, no el código fuente.
7. Cambiar la rama por defecto a `main` solo si el usuario lo autoriza.
8. Si se quiere conservar el estado antiguo en remoto: `git push origin legacy-site-2026-11-10`.

**Criterio de aceptación:** el sitio público funciona, el workflow está en verde y el usuario ha autorizado cada cambio de GitHub.

## 7. Primer tutorial: desglose y hechos verificados

**Fuentes obligatorias:**

- `C:\Users\xht\Desktop\web-subtitulos\docs\traspaso.md`
- `C:\Users\xht\Desktop\web-subtitulos\docs\fase0\informe.md`
- `C:\Users\xht\Desktop\web-subtitulos\docs\fase0\decisiones.md`
- `C:\Users\xht\Desktop\web-subtitulos\docs\fase0\resultados\*.json`
- Código real: `reproductor/retraso.ts`, `directo/vad.ts`, `directo/segmentador.ts`, `directo/trabajador.ts`, `directo/subtitulos.ts`, `modelos/transcriptor.ts`, `modelos/catalogo.ts`, `twitch/acceso.ts`.

**Estructura del artículo (EN y ES):**

1. **Qué es y qué restricción manda.** Pegar un enlace de Twitch y ver subtítulos traducidos; sin cuenta, sin instalación, todo en el navegador. La simplicidad manda.
2. **Arquitectura de un vistazo.** Diagrama Mermaid:
   ```mermaid
   flowchart LR
     A[Twitch URL] --> B[PlaybackAccessToken]
     B --> C[HLS playlist]
     C --> D[Fixed-delay player]
     D --> E[Audio 16 kHz]
     E --> F[Silero VAD]
     F --> G[Phrase segments]
     G --> H[Whisper via Transformers.js]
     H --> I[Hallucination filter]
     I --> J[Translation]
     J --> K[Subtitle queue]
     K --> D
   ```
3. **El reproductor con retardo fijo.** Explicar por qué se sacrifica 15 s de directo: da margen para transcribir frases completas y sincronizarlas. Configuración real de hls.js:
   - `liveSyncDuration = objetivo` (10, 15 o 20 s; por defecto 15).
   - `liveMaxLatencyDuration = objetivo + 20`.
   - `maxLiveSyncPlaybackRate: 1`.
   - `maxBufferLength = objetivo * 2`.
   - `lowLatencyMode: false`.
   - Resincronización cuando la latencia supera el objetivo + 2 s; muestreo cada 5 s; modo pausa/acumulación hasta alcanzar el objetivo.
4. **Acceso al directo de Twitch.** `PlaybackAccessToken` vía GQL con Client-ID público; URL HLS de usher; modos `directo`, `proxy-listas`, `proxy-todo`; CORS. El proxy mínimo solo reenvía listas de texto; vídeo y audio van directos.
5. **Voz a frases: Silero VAD.** Audio a 16 kHz; frames de 512 muestras (32 ms); Silero VAD v5 ONNX; estado `[2, 1, 128]`; WASM. Segmentador: umbral de inicio 0.5, de fin 0.35, 500 ms de silencio, mínimo 250 ms, máximo 8 s; corte en el frame de menor probabilidad de los últimos 3 s.
6. **Whisper en el navegador.** Transformers.js; modelos tiny, base, small, large-v3-turbo y large-v3; WebGPU fp16 con decoder q4 y WASM q8. Límite de tokens `min(440, max(16, ceil(segundos * 10)))`; chunking de 30 s con stride de 5 s para audios largos; filtro de alucinaciones; warm-up de inferencia.
7. **Traducción.** Browser Translator API; Opus-MT directo o vía inglés; NLLB-600M (no comercial); Qwen3 0.6B/1.7B/4B. Explicar el pivote por inglés y cuándo se usa cada opción.
8. **Sincronización de subtítulos.** Pipeline del worker: VAD → frases → Whisper → filtro → traducción → subtítulo. Admisión: `a-tiempo`, `tarde-mostrado` si quedan ≥1 s, `tarde-descartado`; 42 caracteres por línea; contador de puntualidad.
9. **Privacidad y recursos.** Todo se procesa en local; descarga y caché de modelos; WebGPU frente a WASM; Firefox 4–8× más lento.
10. **Mediciones reales.** Tabla:
    | Métrica | Resultado |
    |---|---|
    | Retardo fijo | 15.27–15.62 s con objetivo de 15 s |
    | Ventana HLS | 28–30 s |
    | Desfase mediano de subtítulos | 0–40 ms |
    | Nivel alto a tiempo | 99.0 %, 100 %, 100 % en tres canales |
    | Primer subtítulo | 11–13 s con caché; 66–108 s en primera visita |
    | Precisión de turnos de hablante | 56 % |
11. **Límites y siguientes pasos.** Diarización de hablantes (56 %), latencia de primera visita, móvil, licencia no comercial de NLLB, fragilidad del acceso a Twitch, ausencia de cuentas.
12. **Pruébalo.** Enlace a `https://subany.video/` y a la ficha `/projects/subany-video/`.

**Reglas de redacción:**

- No inventar métricas, modelos ni decisiones. Si un dato no está en las fuentes, omitirlo.
- Los bloques de código deben ser reales y citar el archivo de origen en un comentario.
- El artículo ES traduce el EN; no cambia cifras ni conclusiones.
- No afirmar que el repositorio es open source. El enlace de código existe, pero el repositorio no es público en el momento de escribir.

## 8. Verificación final contra el spec

- [ ] Portada: About primero, Subany destacado con captura/descripción/demo/código/tutorial, 9 proyectos, máximo 3 tutoriales, sin News.
- [ ] Navegación exacta: about, blog, projects, repositories, CV + buscador + EN/ES + claro/oscuro.
- [ ] 38 fichas EN: 17 AI, 11 Data, 7 Products (incluida Subany), 3 Esports.
- [ ] 28 fichas ES; 10 modelos con fallback inglés visible y aviso.
- [ ] Subany primero globalmente y con ficha propia.
- [ ] Fichas con resumen, problema, características, stack y enlaces; privados sin datos inventados.
- [ ] Blog con paginación, etiquetas, categorías y archivo por año.
- [ ] Tutorial EN/ES con `page_id` compartido, Mermaid, código, TOC y mediciones reales.
- [ ] Repositorios curados, `github_users: [jparedesDS]`, sin trophies ni stats externas.
- [ ] CV RenderCV desde `resume.pdf`, PDF descargable, etiquetas EN/ES, sin datos inventados.
- [ ] Paleta clara/oscura de Subany, Inter + Atkinson, contraste AA, foco visible.
- [ ] Inglés canónico, `/es/` para español, hreflang EN/ES/x-default, botón EN/ES independiente.
- [ ] Buscador Ctrl/Cmd+K, páginas/proyectos/tutoriales, URLs por idioma, teclado y lector de pantalla.
- [ ] Rutas antiguas redirigidas; standalone intactas; `resume.pdf`, `profile.jpg`, `images/`, verificaciones conservadas.
- [ ] Sin layouts/Sass/posts de ejemplo del tema anterior.
- [ ] `main` como fuente, `gh-pages` como sitio construido, permisos de escritura, sin cambios de GitHub sin autorización.
- [ ] Prettier, upgrade audit, build, tests de contenido, enlaces, redirects, a11y, responsive, tema, idioma y buscador ejecutados.
- [ ] Nada publicado sin autorización explícita.

## 9. Decisiones de ejecución y pendientes

Resuelto antes de ejecutar:

1. **Método de ejecución:** subagent-driven. Cada tarea del plan se asigna a un subagente con contexto suficiente; el agente principal revisa el resultado, ejecuta la verificación y hace el commit.
2. **Ruby 3.3 + DevKit:** autorizado con `winget` (T1).
3. **Teléfono en el CV:** omitido en el HTML; el PDF se conserva.
4. **Enlace de código de Subany:** sustituido por "How it works" → tutorial; no se enlaza `subtitle.me` (404).

Pendiente:

5. **Publicación:** no se hará `git push`, ni cambio de rama por defecto, ni modificación de GitHub Pages sin autorización explícita en T18.

## 10. Notas de riesgo

- **Polyglot + jekyll-archives:** los archivos generados no tienen `lang`; se comprobará que Polyglot los publica en `/es/blog/...` como fallback. Si no lo hace, la alternativa es limitar los enlaces de archivo en ES al índice `/es/blog/` y dejar los archivos EN solo en inglés, sin romper la navegación.
- **Paginación ES:** con un solo tutorial no hay página 2. Cuando se añada el segundo, verificar `/es/blog/page/2/`; si Polyglot no lo genera, ajustar el `pagination.permalink` de la página ES.
- **PurgeCSS:** puede eliminar clases generadas dinámicamente. Las clases de `subany.css` que aparezcan en el HTML se conservan; las que solo use JS deben añadirse a `safelist` en `purgecss.config.js`.
- **Gemfile.lock en Windows:** añadir `x64-mingw-ucrt` sin quitar las plataformas Linux. El CI usa Ruby 3.3.5 en Ubuntu.
- **Rutas standalone:** no se reescriben. Si alguna enlaza a las categorías antiguas, los redirects cubren la transición.
- **Bootstrap compatibility:** prohibido por el spec. No activar `al_folio.compat.bootstrap.enabled`; los estilos de lista del CV se añaden a mano.
- **Fuentes:** la URL de Google Fonts debe incluir Inter y Atkinson Hyperlegible; si la red del build no carga la fuente, el CSS local debe tener fallbacks del sistema.

