# Portfolio de contratación (Madrid, CV industrial) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorientar el portfolio a la contratación como Computer Vision / ML Engineer en Madrid, con tres casos con resultados, CV a un clic y versión española real de las páginas de contratación.

**Architecture:** Hugo multilingüe (`content/en`, `content/es`, EN en raíz y ES en `/es/`) sobre el tema Nightfall ya vendorizado. El blog se queda solo en inglés con su mecanismo de idioma actual. La verificación es un script Python sin dependencias que afirma rutas y contenido del build en `dist/`.

**Tech Stack:** Hugo 0.169 extended + Dart Sass, Python 3 (solo stdlib) para los checks, Chrome headless para capturas y para imprimir los PDF del CV.

**Spec:** `docs/superpowers/specs/2026-11-17-hiring-portfolio-design.md`

## Global Constraints

- Build: `hugo --gc --minify` desde la raíz del repo, con `C:\Users\xht\AppData\Local\Temp\opencode\dart-sass\dart-sass` al principio del `PATH`. Hugo vive en `C:\Users\xht\AppData\Local\Microsoft\WinGet\Packages\Hugo.Hugo.Extended_Microsoft.Winget.Source_8wekyb3d8bbwe\hugo.exe`. Salida en `dist/`.
- Ninguna cifra se publica sin estar en `static/resume.pdf`: hoy son **casi 3 años en EIPSA (desde 01/2024)**, **5 años en datos e IA (desde 2021)**, 33+ repos, 268+ seguidores, 10+ modelos en Hugging Face, 80% menos trabajo manual en DXF, 500+ documentos/mes en correo→ERP, DocFlow con 21 routers / 24 servicios / 24 pantallas. Prohibido "4 años" o "four years".
- El blog no se traduce. `/blog/`, `/blog/search/`, `/blog/tags/`, `/blog/archives/`, `/blog/faq/`, `/blog/index.json` y `/blog/2026/11/09/how-subany-video-works/` conservan ruta, comportamiento y toggle.
- No se toca el shell Nightfall: dark-only, orden del menú `~/about`, `~/projects`, `~/blog`, `~/contact`, zoom 125% a partir de 1280 px, terminal por página.
- Se conservan los redirects `static/propovcs2/`, `static/cleanyourmail/`, `static/work/` y los subsitios `static/cs2pov/`, `static/murdoku/`.
- Sin dependencias nuevas de JS. El único JS nuevo es el del botón de menú (vanilla, inline).
- `og:image` 1200×630, `Person` JSON-LD, `hreflang` recíproco y 404 único en la raíz.
- Slugs idénticos en ambos idiomas: `/about/`, `/projects/`, `/contact/`, `/privacy/` y sus versiones `/es/...`.

---

## Review Focus

- **Rutas existentes al mover contenido**: cualquier `slug`/`url` mal movido rompe URLs ya indexadas. Test en Task 2: la lista completa de rutas del baseline sigue devolviendo 200 tras el cambio.
- **Selector EN/ES apuntando a una página inexistente**: un `translationKey` desparejado produce 404 desde la cabecera. Test en Task 2: cada página tiene su pareja y el `href` del selector existe en `dist/`.
- **Dos controles de idioma en el blog**: el selector del sitio debe desaparecer del blog y el toggle del artículo debe seguir funcionando. Test en Task 2 y Task 12.
- **404 en GitHub Pages**: solo se sirve `/404.html` raíz. Test en Task 8: existe un único 404 y contiene texto en ambos idiomas.
- **Cifras divergentes entre EN, ES y CV**: un número inventado o desactualizado es el fallo más caro. Test en Tasks 5 y 11: las mismas cifras aparecen en ambos idiomas y en ambos PDF.
- **Consentimiento y privacidad**: el banner debe enlazar a `/privacy/` o `/es/privacy/` según idioma. Test en Task 10.
- **Menú móvil por teclado**: sustituir el checkbox por un botón real sin romper el layout colapsado. Test en Task 9 (markup) y comprobación manual con Tab/Esc.

---

## Task 1: Arnés de verificación y baseline

**Files:**
- Create: `scripts/check_site.py`
- Commit spec + plan: `docs/superpowers/specs/2026-11-17-hiring-portfolio-design.md`, `docs/superpowers/plans/2026-11-17-hiring-portfolio.md`

**Interfaces:**
- Produces: `python scripts/check_site.py` → exit 0 si todo pasa, 1 con la lista de fallos. Cada task añade asserts a `main()`.

- [ ] **Step 1: Escribir el check con las rutas actuales**

`scripts/check_site.py`, solo stdlib. Estructura:

```python
ROUTES = [
  "/", "/about/", "/projects/", "/contact/", "/blog/", "/blog/search/",
  "/blog/tags/", "/blog/tags/hls/", "/blog/archives/", "/blog/faq/",
  "/blog/2026/11/09/how-subany-video-works/",
  "/blog/2026/11/09/como-funciona-subany-video/",
  "/blog/index.json", "/blog/index.xml", "/index.xml", "/sitemap.xml",
  "/propovcs2/", "/cleanyourmail/",
]
def page(route):
    path = "dist" + ("/index.html" if route.endswith("/") else route)
    ...
```

Cada ruta: existe el fichero; si es HTML, contiene `<main`; `/blog/index.json` parsea como lista con 1 elemento.

- [ ] **Step 2: Compilar y comprobar que pasa**

Run: build + `python scripts/check_site.py`
Expected: `OK 18/18`.

- [ ] **Step 3: Commit**

`git add scripts/check_site.py docs/ && git commit -m "test: add site verification harness and hiring design"`

---

## Task 2: Andamiaje multilingüe

**Files:**
- Modify: `hugo.toml`
- Move: `content/*` → `content/en/` (incluye `blog/`, `tags/`, `archive.md`, `faq.md`, `search.md`, `_index.md`)
- Create: `content/es/_index.md`, `content/es/about.md`, `content/es/projects.md`, `content/es/contact.md` (stubs con `translationKey`, texto provisional)
- Create: `content/en/privacy.md` stub y `content/es/privacy.md` stub
- Create: `i18n/en.toml`, `i18n/es.toml`
- Create: `layouts/_partials/lang-switch.html`
- Modify: `layouts/_partials/header.html` (incluir selector; terminal con `relLangURL`)
- Modify: `layouts/_partials/custom-head.html` (hreflang recíproco)
- Create: `static/es/blog/index.html` (redirect a `/blog/`)

**Interfaces:**
- Consumes: harness de Task 1.
- Produces: `content/es` publicado en `/es/`; selector con clases `.langSwitchSite`, enlaces con `hreflang` y `aria-current="true"`; en `<head>` tres `link rel=alternate`: `en`, `es`, `x-default`.

- [ ] **Step 1: Añadir checks que fallan**

En `check_site.py`, añadir a `ROUTES`: `/es/`, `/es/about/`, `/es/projects/`, `/es/contact/`, `/es/privacy/`. Y asserts:
- `dist/index.html` contiene `hreflang="es"` hacia `/es/`.
- Toda página EN de la lista tiene su `/es/...` y viceversa.
- `/blog/` **no** contiene `langSwitchSite`; `/es/` sí.
Run: build (aún sin ES) + check → FAIL.

- [ ] **Step 2: Mover contenido y configurar idiomas**

`hugo.toml`:

```toml
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false

[languages.en]
  contentDir = "content/en"
  languageName = "English"
  languageCode = "en"
  weight = 1
[languages.es]
  contentDir = "content/es"
  languageName = "Español"
  languageCode = "es"
  weight = 2
```

Añadir `translationKey = "about" | "projects" | "contact" | "privacy" | "home"` en ambos idiomas. El menú global se mantiene; `absLangURL` produce `/es/about/`. En cada página ES, `title` y `user` propios (`user = "hello"`, etc.).

`layouts/_partials/header.html`: el enlace del terminal pasa a `href="{{ "" | relLangURL }}"`; el selector se inserta antes de `<nav>` con `{{ partial "lang-switch.html" . }}`.

`lang-switch.html`: si `hasPrefix .RelPermalink "/blog"` no imprime nada; si no, calcula EN y ES con `.AllTranslations` (fallback `"/"` y `"/es/"`) y pinta dos enlaces `EN`/`ES` con `aria-current` en el activo.

- [ ] **Step 3: hreflang en `custom-head.html`**

Dentro de un `{{ if not (hasPrefix .RelPermalink "/blog") }}`, recorrer `.AllTranslations` y emitir `hreflang` por idioma; `x-default` apunta a la versión `en`. No tocar el bloque de hreflang existente del artículo.

- [ ] **Step 4: Redirect `/es/blog/`**

`static/es/blog/index.html`: `<meta http-equiv="refresh" content="0; url=/blog/">` + `<link rel="canonical" href="https://jparedesds.github.io/blog/">` + enlace visible.

- [ ] **Step 5: Compilar y verificar**

Run: build + check.
Expected: PASS, 23 rutas, blog intacto (mismo HTML y mismo `index.json`).

- [ ] **Step 6: Commit**

`feat: add the Spanish site structure and language switcher`

---

## Task 3: Home orientada a contratación

**Files:**
- Modify: `layouts/home.html`
- Modify: `i18n/en.toml`, `i18n/es.toml`
- Modify: `layouts/_partials/custom-head.html` (estilos de `.hireStrip`, `.hireProof`, `.hireActions`)

**Interfaces:**
- Consumes: i18n y selector de Task 2; `resumeUrl` por idioma.
- Produces: claves `hire_role`, `hire_bio`, `hire_availability`, `hire_proof`, `hire_cv`, `hire_email`, `active_projects` en ambos idiomas.

- [ ] **Step 1: Checks que fallan**

Afirmar en `dist/index.html` y `dist/es/index.html`:
- rol correcto (`Computer Vision & ML Engineer` / `Ingeniero de Computer Vision y ML`),
- `href="/resume.pdf"` en ambos (la versión ES apunta al CV inglés hasta Task 11),
- `href="mailto:jparedescolmenarejo@gmail.com?subject=` en ambos,
- proof line con `since 2024` / `desde 2024`,
- ausencia de `four years` / `cuatro años`.

- [ ] **Step 2: Sustituir el texto fijo por i18n**

`home.html`: `.Site.Language.Locale` → `.Site.Language.Lang`; rol, bio, label de proyectos y CTA desde `i18n`. Copy aprobado:

EN: rol `Computer Vision & ML Engineer`; bio `I build computer-vision systems for industrial quality control and local-first AI products.`; disponibilidad `Madrid · Open to opportunities`; proof `Industrial computer vision since 2024 · 10+ models on Hugging Face · DocFlow in production`; botones `Download CV`, `Email me`.
ES: rol `Ingeniero de Computer Vision y ML`; bio `Construyo sistemas de visión artificial para control de calidad industrial y productos de IA que se ejecutan en local.`; disponibilidad `Madrid · Abierto a oportunidades`; proof `Visión artificial industrial desde 2024 · 10+ modelos en Hugging Face · DocFlow en producción`; botones `Descargar CV`, `Escríbeme`.

- [ ] **Step 3: Maquetar la franja**

Bajo el bio: `<p class="hireAvailability">`, proof en `<p class="hireProof">`, acciones en `<div class="hireActions">` con enlace al CV (`{{ .Site.Params.resumeUrl }}`, con `download`) y `mailto` con `?subject=Oportunidad%20CV%20/%20ML`. Añadir en `hugo.toml` `[languages.en.params] resumeUrl = "/resume.pdf"` y `[languages.es.params] resumeUrl = "/resume.pdf"` (Task 11 lo cambiará a `/resume-es.pdf`). Estilos en custom-head: tipografía mono para el rol, botón primario con borde `#80aadd`, botón secundario con borde `var(--border)`, `:focus-visible` visible, y en móvil los botones a ancho completo.

- [ ] **Step 4: Verificar y capturar**

Run: build + check. Capturas 1440 y 390 de `/` y `/es/` con Chrome headless.
Expected: sin overflow, dos botones legibles, rol y prueba visibles antes de los chips.

- [ ] **Step 5: Commit**

`feat: add the hiring strip and CV call to action`

---

## Task 4: Tres casos en Projects

**Files:**
- Modify: `content/en/projects.md`, `content/es/projects.md`
- Create: `static/images/case-vision.svg`, `static/images/case-docflow.svg`, `static/images/case-subany.png` (captura de subany.video)
- Modify: `layouts/_partials/custom-head.html` (estilos `.caseList`, `.case`, `.caseMedia`)

**Interfaces:**
- Consumes: cifras del Global Constraints.
- Produces: anclas `#vision`, `#docflow`, `#subany`; cada caso con `h3`, imagen, `Problema`/`Problema`, `Qué hice`/`Qué hice`, `Resultado`/`Resultado`, chips y enlaces.

- [ ] **Step 1: Checks que fallan**

Afirmar en ambos idiomas: existen `id="vision"`, `id="docflow"`, `id="subany"`; aparecen `21 API routers` / `21 routers`, `24 services` / `24 servicios`, `0–40 ms`/`0-40 ms` y `15.3`/`15,3`; **no** aparece `500+` (esa cifra pertenece a la automatización correo→ERP y vive en About); las imágenes referenciadas existen en `dist/images/`.

- [ ] **Step 2: Generar imágenes**

`case-subany.png`: captura de `https://subany.video/` a 1440×900 y recorte 1200×675. `case-vision.svg` y `case-docflow.svg`: diagramas 1200×675 dibujados a mano en SVG con fondo `#292a2d`, borde `#3a3b3d`, mono `#80aadd` (visión: cámara → dataset → YOLO11 → inspección; DocFlow: correo/ERP ↔ FastAPI ↔ React, DocuSign, Docker).

- [ ] **Step 3: Redactar los casos**

Cada caso, 4–6 líneas + chips. Hechos fijados:
1. **Visión artificial industrial (EIPSA)** — YOLO11 para penetrantes y soldadura; modelos desplegados y 10+ publicados en Hugging Face. Sin mAP (no confirmado): "en uso en producción".
2. **DocFlow** — 21 routers, 24 servicios, 24 pantallas, DocuSign, JWT, Docker + CI, en uso diario. Imagen: diagrama.
3. **subany.video** — retardo 15,3 s sobre objetivo de 15 s, desfase mediano 0–40 ms, Whisper + Silero VAD + ONNX/WebGPU, sin servidores; enlace al artículo.

- [ ] **Step 4: Verificar**

Run: build + check. Captura de `/projects/` a 1440 y 390.
Expected: tres bloques, imágenes cargan, ningún 404, español correcto.

- [ ] **Step 5: Commit**

`feat: turn Projects into three case studies with results`

---

## Task 5: About alineado con el CV

**Files:**
- Modify: `content/en/about.md`, `content/es/about.md`
- Modify: `content/en/_index.md`? No. Solo about.

**Interfaces:**
- Consumes: cifras globales.
- Produces: secciones `Experience`, `Education`, `Stack` con los hitos añadidos; enlace al CV arriba.

- [ ] **Step 1: Checks que fallan**

Afirmar en ambos: `80%`, `500+`, `33+`, `268`, `10+`, `Kaggle`, `DocFlow`; ausencia de `four years`/`cuatro años`. En ES: `medalla de bronce` (no "3er puesto").

- [ ] **Step 2: Reescribir**

Añadir a EIPSA: DocFlow (21/24/24, en producción), DXF −80%, correo→ERP 500+/mes. Añadir bloque "Open source" con 33+ repos, 268+ seguidores, 10+ modelos HF, bronce en Kaggle (clasificación multilabel, ResNet152). Idiomas: español nativo, inglés B2. Enlace al CV justo bajo el párrafo inicial. Mantener el tono y la estructura actual.

- [ ] **Step 3: Verificar y commit**

Run: build + check. `git commit -m "content: align About with the CV and its numbers"`

---

## Task 6: Contacto

**Files:**
- Modify: `content/en/contact.md`, `content/es/contact.md`

**Interfaces:**
- Consumes: disponibilidad aprobada.
- Produces: primer párrafo con `Madrid · Open to opportunities` / `Madrid · Abierto a oportunidades`; `mailto` con `?subject=Oportunidad%20CV%20/%20ML`.

- [ ] **Step 1: Checks:** subject en ambos idiomas y disponibilidad presente.
- [ ] **Step 2: Editar** ambos ficheros; misma lista de proyectos y redes.
- [ ] **Step 3: Verificar + commit** (`content: add availability and prefilled subject to Contact`).

---

## Task 7: Compartir y datos estructurados

**Files:**
- Create: `static/og-image.svg`, `static/og-image.png`
- Create: `layouts/_partials/person-jsonld.html`
- Modify: `layouts/_partials/custom-head.html`
- Modify: `layouts/home.html` (título)

**Interfaces:**
- Produces: `og:image`, `og:image:alt`, `twitter:card=summary_large_image`, `<script type="application/ld+json">` con `@type: Person`.

- [ ] **Step 1: Checks:** todas las páginas tienen `og:image` absoluta que existe en `dist`; el JSON-LD parsea y contiene `"@type": "Person"`, `sameAs` con GitHub/LinkedIn/X/Hugging Face/Kaggle; título de home exacto `Jose Paredes — Computer Vision & ML Engineer (Madrid)` y su versión ES.
- [ ] **Step 2: Crear la tarjeta** 1200×630 (fondo `#292a2d`, nombre, rol, chips); renderizar a PNG con Chrome (`--window-size=1200,630 --screenshot`).
- [ ] **Step 3: Añadir al head** las etiquetas sociales para todas las páginas y el partial `person-jsonld.html` solo en home (EN y ES, con `jobTitle` traducido).
- [ ] **Step 4: Verificar + commit** (`feat: add social cards and Person structured data`).

---

## Task 8: 404 bilingüe

**Files:**
- Create: `layouts/404.html`
- Modify: `i18n/en.toml`, `i18n/es.toml` (claves `nf_title`, `nf_text`, `nf_home`)

- [ ] **Step 1: Check:** un solo `dist/404.html`; contiene `Not found` y `No encontrado`, enlaces a `/`, `/es/`, `/projects/`, `/blog/`.
- [ ] **Step 2: Implementar** con el shell del tema y dos bloques separados por una regla; sin JS.
- [ ] **Step 3: Verificar + commit** (`feat: replace the theme 404 with a bilingual one`).

---

## Task 9: Menú móvil accesible

**Files:**
- Modify: `layouts/_partials/header.html`
- Modify: `layouts/_partials/custom-head.html` (estilos del botón y del panel)
- Modify: `themes/nightfall/assets/sass/components/_header.scss` (solo si hace falta; preferir override en custom-head)

- [ ] **Step 1: Checks:** `dist/index.html` no contiene `class="side-menu"` ni `<label class="hamb"`; contiene `button class="menuToggle"` con `aria-expanded="false"`, `aria-controls="site-menu"`, y `<nav id="site-menu" class="headerLinks">`; el script define cierre con `Escape`.
- [ ] **Step 2: Implementar** botón + JS inline (~20 líneas) que alterna `aria-expanded`, `data-open` en `.header` y foco; `Esc` cierra y devuelve el foco. CSS: mismo icono de tres líneas, `@media (max-width: 768px)` con `[data-open="true"] .headerLinks { max-height: 100% }`, `:focus-visible` con outline 2px `#80aadd`.
- [ ] **Step 3: Verificar a mano** 390 px: abrir con teclado, cerrar con Esc, foco visible; captura abierta y cerrada.
- [ ] **Step 4: Commit** (`fix: make the mobile menu keyboard accessible`).

---

## Task 10: Privacidad

**Files:**
- Modify: `content/en/privacy.md`, `content/es/privacy.md`
- Create: `layouts/_partials/footer.html` (override del tema)
- Modify: `layouts/_partials/custom-head.html` (`data-privacy` en el script de consentimiento)

- [ ] **Step 1: Checks:** `/privacy/` y `/es/privacy/` existen; el `<script src="/consent.js...">` lleva `data-privacy="/privacy/"` (EN) y `/es/privacy/` (ES); el pie enlaza a la privacidad del idioma.
- [ ] **Step 2: Redactar** (GA4, finalidad, base legal, cookies `_ga`, cómo revocar, contacto). Enlazar `data-privacy` según idioma.
- [ ] **Step 3: Auditar terceros**: comprobar si `https://pulse.subtitleme.workers.dev/t.js` es intencional; si lo es, debe cargarse solo tras consentimiento. **Preguntar antes de tocarlo.**
- [ ] **Step 4: Verificar + commit** (`feat: add bilingual privacy pages and link them from consent`).

---

## Task 11: CV en inglés y español

**Files:**
- Create: `scripts/cv/cv-en.html`, `scripts/cv/cv-es.html`, `scripts/cv/print.ps1`
- Replace: `static/resume.pdf`
- Create: `static/resume-es.pdf`
- Modify: `hugo.toml` (`[languages.es.params] resumeUrl = "/resume-es.pdf"`)

**Interfaces:**
- Consumes: `resumeUrl` (Task 3) y `hire_cv`.
- Produces: dos PDF A4 de 2 páginas máximo, con el mismo contenido que el sitio.

- [ ] **Step 1: Checks:** ambos PDF existen; `/es/` enlaza `/resume-es.pdf`; PyMuPDF extrae texto con `Computer Vision` / `Visión artificial`, `DocFlow`, `80%`, `500+`, `Madrid`, y sin `four years`/`cuatro años`.
- [ ] **Step 2: Escribir las plantillas HTML** con A4 (`@page { size: A4; margin: 14mm }`), tipografía del sitio, secciones: cabecera (nombre, rol, Madrid, email, LinkedIn, GitHub, web), resumen, experiencia (EIPSA con DocFlow/DXF/ERP, Comunicación Permanente, ANOVO), proyectos seleccionados, stack, educación, idiomas, open source y Kaggle.
- [ ] **Step 3: Imprimir** con Chrome headless `--print-to-pdf --no-pdf-header-footer` y comprobar 2 páginas.
- [ ] **Step 4: Verificar + commit** (`content: rewrite the CV for the CV/ML role in English and Spanish`).

---

## Task 12: Verificación final y despliegue

- [ ] **Step 1:** Build limpio + `python scripts/check_site.py` → todo PASS.
- [ ] **Step 2:** Capturas de `/`, `/es/`, `/projects/`, `/es/projects/`, `/about/`, `/blog/` a 360, 768, 1280, 1440 y 1920; sin overflow; zoom 1.25 intacto.
- [ ] **Step 3:** Revisión independiente (subagente) contra el spec.
- [ ] **Step 4:** PR, merge, deploy, verificación en vivo de las rutas nuevas y de las antiguas.
- [ ] **Step 5:** Actualizar el ledger del proyecto si existe (`docs/` o `.sdd/`).

---

## Self-Review

- **Cobertura del spec:** posicionamiento (Task 3), casos (4), About (5), ES (2), SEO (7), 404 (8), a11y (9), privacidad (10), CV (11), verificación (12). No hay requisito sin task.
- **Tipos y nombres:** `resumeUrl`, `translationKey`, `.langSwitchSite`, `data-privacy`, anclas `#vision/#docflow/#subany`, clases `hireStrip/hireProof/hireActions`, `menuToggle/site-menu` se usan con el mismo nombre en todas las tasks.
- **Proporción:** el plan fija decisiones y hechos; la redacción final de los casos y del CV queda al ejecutor con los datos listados.
- **Riesgo residual:** el script `pulse.subtitleme.workers.dev` no está cubierto por el consentimiento; Task 10 lo audita y exige preguntar antes de cambiarlo.
