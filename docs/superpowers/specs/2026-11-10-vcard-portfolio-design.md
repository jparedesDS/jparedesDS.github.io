# Portfolio vCard + blog separado — Diseño

Fecha: 2026-11-10
Estado: pendiente de aprobación
Repositorios: `jparedesDS/jparedesDS.github.io` (portfolio) y `jparedesDS/blog` (nuevo)

## 1. Intención y por qué

Sustituir el portfolio actual (al-folio) por un sitio con la identidad visual y la
estructura de [vCard](https://github.com/codewithsadee/vcard-personal-portfolio):
sidebar con foto y contactos, y pestañas About, Resume, Portfolio, Blog y Contact.
Cada proyecto conserva su propia página con el mismo armazón de vCard. El blog deja
de vivir dentro del portfolio y pasa a ser un sitio aparte, minimalista y de lectura
cómoda, inspirado en la estructura de [pineda89.com](https://pineda89.com): una lista
de entradas y páginas de post sin navegación pesada.

El objetivo no es solo cambiar el aspecto: hoy el contenido está enterrado en una
tema académica con buscador, archivo y páginas auxiliares. La nueva web debe enseñar
en 10 segundos quién es Jose, qué construye y cómo contactarle, y dejar los detalles
en las páginas de proyecto.

## 2. Objetivos

1. Portar el diseño de vCard (layout, tipografía, colores, modo claro/oscuro,
   sidebar, pestañas y rejilla de proyectos) al portfolio.
2. Mantener **todos** los proyectos publicados como páginas propias, con el mismo
   armazón de vCard: 38 fichas EN + 28 fichas ES traducidas + 10 rutas ES con
   fallback inglés = 76 URLs. No se traduce nada nuevo en esta fase.
3. Mantener el bilingüismo existente (38 fichas EN, 28 ES traducidas y 10 rutas ES
   con fallback inglés), con selector de idioma y `hreflang`, sin traducciones
   nuevas en esta fase.
4. Sacar el blog a un repositorio aparte con una estructura mínima y accesible.
5. Mostrar en la pestaña Blog de vCard las últimas entradas, enlazando al blog.
6. Sustituir la franja de "Clients" por una franja de **Apps** con cuatro productos:
   CleanYourPhone, CleanYourMail, subany.video y Pro POV CS2.
7. No romper ninguna URL pública actual de proyectos ni de posts.

## 3. No objetivos

- Buscador, archivo por año/tag, comentarios (giscus), newsletter, página de
  repositorios con estadísticas, testimonios, logos de clientes.
- Formulario de contacto con backend. No habrá envío desde la web.
- Rediseñar los sub-sitios existentes (`/cleanyourmail/`, `/cs2pov/`, `/murdoku/`,
  `/propovcs2/`); se quedan como están.
- Dominio propio o subdominio nuevo. El blog vive en `jparedesds.github.io/blog/`.
- CMS o edición desde el navegador. El contenido sigue en Markdown/YAML.
- Framework JS (React, Astro, Eleventy). Nada de bundler.

## 4. Anti-objetivos

- Duplicar a mano el contenido de cada proyecto para EN y ES.
- Romper enlaces existentes de proyectos o posts.
- Añadir dependencias externas en tiempo de ejecución (CDN de iconos, fuentes
  bloqueantes, trackers).
- Convertir el portfolio en una SPA con routing propio.
- Dejar el repositorio con dos temas conviviendo (al-folio + vCard).

## 5. Restricciones y hechos del proyecto

- El repo del portfolio es un fork de al-folio y usa el gem `al_folio_core`, Tailwind,
  PurgeCSS y una decena de plugins. Hay que desmontarlo, no convive.
- Despliegue actual: GitHub Actions (`deploy.yml`) construye con Ruby 3.3 y publica
  `_site` en la rama `gh-pages`.
- Contenido actual: 38 proyectos EN y 28 ES, 2 posts (1 EN, 1 ES), datos de CV en
  `_data/{en,es}/cv.yml`, home en `_data/{en,es}/home.yml`, textos en `strings.yml`.
  Diez proyectos solo existen en inglés y usan `lang_switch_fallback: /projects/`:
  `cs2-players-detector-yolo12s`, `cs2-players-detector-yolov9-v10-v11`,
  `cs2-weapon-detector-yolo12m`, `deadlock-players-detector`,
  `fortnite-players-detector`, `liquid-penetrant-test-yolo11l`,
  `lol-map-tracking-yolo11`, `overwatch-2-players-detector`,
  `valorant-players-detector`, `welding-defects-detector-yolo11x`.
  Polyglot genera para ellos `/es/projects/<slug>/` con el contenido inglés,
  `rendered_lang: en` y un aviso visible. Esas 10 rutas se conservan, pero llevan
  `noindex` y `hreflang` solo EN.
- 14 proyectos no tienen imagen (`img` vacío). Necesitan un fallback visual.
- Los enlaces de proyecto usan 14 tipos: `case_study`, `code`, `github`, `model`,
  `web`, `website`, `release`, `local_app`, `tableau`, `kaggle`, `youtube`, `tiktok`,
  `instagram`, `x`. Todos necesitan etiqueta e icono.
- Hay proyectos temáticamente solapados (dos páginas de LoL map tracking, dos de
  welding, dos de CS2 players). Se conservan todas para no romper URLs; la rejilla
  las muestra tal cual.
- vCard es MIT; el repo actual es GPL-3.0. El resultado sigue siendo GPL-3.0 y se
  añade un aviso de atribución a vCard.
- El blog actual tiene solo 2 posts, así que la migración es pequeña.
- GitHub Pages sirve el repo de usuario en `/` y un repo de proyecto en `/blog/`.
  Los posts ya usan URLs `/blog/YYYY/MM/DD/slug/`, que se pueden preservar.

## 6. Enfoques considerados

1. **Jekyll limpio con piel vCard** — elegido. Se conserva Jekyll + polyglot, se
   elimina al-folio y se escriben layouts/includes nuevos con el HTML y CSS de vCard.
   Los 38 proyectos siguen siendo Markdown, cada uno con su versión EN y, cuando
   existe, ES.
2. **Estático puro generado por un script Node** — viable, pero obliga a mantener un
   generador propio (Markdown, i18n, layouts, feed) y a reescribir la cadena de
   pruebas. Más control, más superficie de error.
3. **Estático a mano** — descartado. 76 URLs de proyecto a mano se desincronizan.

Se elige la 1 porque el coste real es de integración (sustituir layouts), no de
inventar un generador, y porque polyglot ya resuelve EN/ES con una fuente por página.

## 7. Arquitectura

### 7.1 Repositorio del portfolio

```
/
├── _config.yml                  # Jekyll mínimo + polyglot
├── Gemfile                      # jekyll, polyglot, sitemap, feed (para preview)
├── _layouts/
│   ├── shell.liquid             # <html>, head, sidebar, navbar, footer
│   ├── home.liquid              # las 5 pestañas
│   └── project.liquid           # una página de proyecto
├── _includes/
│   ├── sidebar.liquid
│   ├── navbar.liquid
│   ├── language-switch.liquid
│   ├── apps-strip.liquid
│   ├── project-card.liquid
│   ├── project-filter.liquid
│   ├── skill-chips.liquid
│   ├── contact-links.liquid
│   └── icons.liquid             # sprite SVG inline
├── _data/
│   ├── en/{home,cv,strings,repositories}.yml
│   ├── es/{home,cv,strings,repositories}.yml
│   └── blog_preview.yml         # fallback de últimas entradas
├── _projects/*.md               # 38 EN + 28 ES (se conservan)
├── _pages/
│   ├── index.md                 # permalink /
│   ├── index-es.md              # permalink /, lang es
│   └── redirects/               # cv, repositories, projects
├── assets/
│   ├── css/style.css            # base vCard + extensiones
│   ├── js/script.js             # tabs, filtro, tema, sidebar, copiar email
│   ├── img/                     # avatares, iconos, fallbacks
│   └── pdf/resume.pdf
├── images/                      # thumbnails de proyectos (se conservan)
├── blog-preview-sync.mjs        # sincroniza _data/blog_preview.yml
├── cleanyourmail/ cs2pov/ murdoku/ propovcs2/   # sub-sitios intactos
└── test/                        # pruebas adaptadas
```

Se eliminan: `theme: al_folio_core`, plugins al-folio, Tailwind, `_sass` de al-folio,
`_includes` y `_layouts` antiguos, `_posts` (se mudan), `_pages` de blog/CV/repos,
`purgecss.config.js`, `.al-folio-overrides.yml`, `al-folio-upgrade-report.md`,
`package-lock` de dependencias muertas y los assets JS/CSS de al-folio.

### 7.2 Rutas

| Ruta | Contenido |
|---|---|
| `/`, `/es/` | vCard: About, Resume, Portfolio, Blog, Contact |
| `/#about`, `/#resume`, `/#portfolio`, `/#blog`, `/#contact` | pestañas enlazables |
| `/projects/<slug>/` | página de proyecto EN (38) |
| `/es/projects/<slug>/` | 28 páginas ES traducidas + 10 fallbacks EN |
| `/projects/`, `/es/projects/` | redirección a `/#portfolio` |
| `/projects/<category>/` | redirección a `/?filter=<category>#portfolio` |
| `/cv/`, `/es/cv/` | redirección a `/#resume` |
| `/repositories/`, `/es/repositories/` | redirección a GitHub |
| `/blog/...` | servido por el repo `blog` |
| `/cleanyourmail/`, `/cs2pov/`, `/murdoku/`, `/propovcs2/` | sin cambios |

Las redirecciones son páginas HTML estáticas con `meta refresh`, `link rel=canonical`
y un enlace visible, no reglas de servidor (GitHub Pages no las ofrece).

- Las cuatro redirecciones de categoría existentes se conservan y se reapuntan.
  La home lee `?filter=<category>`, preselecciona ese filtro y muestra la pestaña
  Portfolio.
- `/projects/` conserva además el hash antiguo con un script inline: si llega
  `/projects/#ai-vision`, redirige a `/?filter=ai-vision#portfolio`; sin JS, el
  `meta refresh` lleva a `/#portfolio`.

### 7.3 i18n

Se mantiene el patrón actual: una página EN y otra ES con el mismo `permalink` y
`lang` distinto. Polyglot publica la ES bajo `/es/`. Los layouts eligen datos con
`site.active_lang`. Reglas:

- Toda página tiene `lang`, `page_id`, `title` y `description`.
- `hreflang` en el `<head>`: `en`, `es`, `x-default` (EN). Solo se emite `es` cuando
  existe la página hermana traducida; en los diez proyectos EN-only se emiten `en`
  y `x-default`, y la página lleva `noindex`.
- El selector de idioma apunta a la misma página en el otro idioma; en la home,
  a `/` y `/es/`. En los proyectos sin versión ES usa `lang_switch_fallback`, que
  pasa a ser `/es/?filter=<category>#portfolio` (mantiene el contexto de categoría).
- El contenido de proyecto ES se conserva; no se traduce nada nuevo en esta fase.

### 7.4 Shell y pestañas

- `shell.liquid` contiene sidebar + navbar + `<main>` y recibe el artículo.
- En la home, las cinco secciones son `<article role="tabpanel">` y la navbar son
  `<button role="tab">` con `aria-controls`, `aria-selected` y roving tabindex.
- Flechas izquierda/derecha, Home y End cambian de pestaña.
- La pestaña activa se refleja en el hash (`/#portfolio`), soporta carga directa y
  atrás/adelante con `history.pushState` + `popstate`.
- El filtro de Portfolio se puede preseleccionar con `?filter=<category>`; al
  cambiar de filtro se actualiza la query con `replaceState` (sin llenar el
  historial de filtros).
- En páginas de proyecto la navbar son enlaces reales a `/#about`, etc. El botón
  Blog es un enlace a `/blog/`.
- Sin JS: la home muestra las cinco secciones apiladas (progressive enhancement).
- Sidebar: botón "Show Contacts" con `aria-expanded`; en escritorio los contactos
  están siempre visibles.
- Tema claro/oscuro: variables CSS, `prefers-color-scheme` por defecto, preferencia
  guardada en `localStorage`, botón con `aria-pressed`. Sin flash: script inline
  mínimo en `<head>`.

### 7.5 About

- Intro desde `home.yml` (eyebrow, nombre, rol, resumen).
- Cuatro tarjetas de servicio (Computer Vision, AI Engineering, Automation,
  Products) con icono SVG y una línea cada una.
- **Franja de Apps** en lugar de Clients: cuatro tarjetas con thumbnail, nombre,
  una línea y enlace. CleanYourPhone → página de proyecto; CleanYourMail → página
  de proyecto; subany.video → `https://subany.video/`; Pro POV CS2 → página de
  proyecto. En móvil, scroll horizontal con snap; en escritorio, cuatro columnas.
- Sin testimonios ni logos de clientes.

### 7.6 Resume

- Education y Experience como timeline de vCard, desde `cv.yml` (empresa, puesto,
  fechas, ubicación, highlights).
- Skills como chips agrupados por área, no como barras de porcentaje: las barras de
  vCard implican niveles que no existen y serían datos inventados.
- Botón "Download CV" → `/assets/pdf/resume.pdf`.

### 7.7 Portfolio

- Rejilla de los 38 proyectos, orden por `importance` y luego título.
- Filtros: All, AI & Vision, Data & Automation, Products, Esports
  (`ai-vision`, `data-automation`, `products`, `esports`). El filtro inicial sale
  de `?filter=<category>` si es válido.
- Cada tarjeta: thumbnail (o fallback), título, categoría, descripción corta.
  Toda la tarjeta es un enlace a la página del proyecto.
- Filtro con `aria-pressed`; sin JS se ven todos.
- Fallback de imagen: bloque con las iniciales y un degradado derivado del título,
  sin imágenes adicionales.
- La rejilla no precarga las 38 imágenes: `loading="lazy"` y dimensiones fijas.

### 7.8 Página de proyecto

- Mismo shell y navbar que la home.
- Cabecera: enlace "← Projects", título, categoría, descripción, imagen grande.
- Acciones: enlaces de `links` (Code, Case study, Website, Release, Local app,
  Private repository) con iconos y etiquetas legibles.
- Cuerpo Markdown renderizado con la tipografía de vCard: encabezados, listas,
  tablas, código y blockquotes.
- Pie: "Next project" dentro de la misma categoría y botón para volver a la rejilla.
- Metadatos: `og:type=article`, imagen del proyecto, `hreflang`.

### 7.9 Blog (pestaña del portfolio)

- Tres entradas más recientes del idioma activo, con fecha, título y extracto.
- Enlace "All posts" a `/blog/`.
- Los datos salen de `_data/blog_preview.yml`.
- Sincronización: `blog-preview-sync.mjs` descarga `https://jparedesds.github.io/blog/posts.json`
  antes del build y reescribe `_data/blog_preview.yml` con las 6 últimas entradas
  (3 por idioma). Si la descarga falla, se usa el fichero commiteado y el build sigue.
- El script se ejecuta en `deploy.yml` y también a mano (`npm run sync:blog`).

### 7.10 Contact

- Sin formulario. Tarjeta con email (copiar al portapapeles), LinkedIn, GitHub,
  Hugging Face, Kaggle y ubicación (Madrid).
- Botón principal "Email me" (`mailto:`) y enlace al CV.
- Aviso de disponibilidad opcional desde `home.yml`.
- El mapa embebido de vCard se elimina: no aporta y añade un iframe de Google.

## 8. Blog separado (`jparedesDS/blog`)

### 8.1 Estructura

```
/
├── _config.yml          # baseurl: /blog, permalink /:year/:month/:day/:title/
├── _layouts/
│   ├── default.html     # cabecera mínima + contenido + pie
│   ├── home.html        # lista de entradas
│   └── post.html        # entrada
├── _posts/*.md          # los 2 posts actuales + futuros
├── about.md / es/sobre-mi.md
├── posts.json           # generado: title, url, date, excerpt, lang
├── assets/css/blog.css
└── .github/workflows/deploy.yml
```

Jekyll sin tema, sin plugins salvo `jekyll-feed` y `jekyll-sitemap`.

### 8.2 Diseño

- Una columna, ancho de lectura ~65ch, sin sidebar ni pestañas.
- Cabecera: nombre, enlaces `[posts] [about]` y selector EN/ES.
- Índice: lista numerada, fecha y título, como pineda89. Sin tarjetas ni imágenes
  obligatorias. Cada entrada lleva una marca `EN`/`ES`.
- Post: título, fecha, cuerpo, enlace "← All posts". Código con resaltado legible,
  tablas con scroll horizontal, imágenes con `max-width: 100%`.
- Tipografía del sistema (sin fuentes externas), modo claro/oscuro según el sistema.
- Accesibilidad: skip link, un solo `h1`, contraste AA, foco visible, `lang` por
  entrada, fechas con `<time datetime>`, enlaces subrayados en el cuerpo.

### 8.3 Rutas y compatibilidad

| Ruta | Contenido |
|---|---|
| `/blog/` | índice EN + todas las entradas |
| `/blog/es/` | índice ES |
| `/blog/2026/11/09/how-subany-video-works/` | post EN (URL actual) |
| `/blog/2026/11/09/como-funciona-subany-video/` | post ES (URL actual) |
| `/blog/about/`, `/blog/es/sobre-mi/` | quién soy |
| `/blog/posts.json` | feed para el portfolio |

Los dos posts se copian tal cual, adaptando el front matter (`permalink_lang` y
`toc`/`mermaid` de al-folio se sustituyen por lo que uses en el blog). Las imágenes
referenciadas se copian a `assets/img/`.

### 8.4 Qué se pierde

Comentarios, TOC automático, Mermaid, búsqueda y relacionados. Si un post necesita
un diagrama, se pega una imagen o un bloque de código. Es aceptable para el tipo de
contenido actual.

## 9. Contenido y migración

1. Copiar `_posts/*.md` al repo del blog y borrarlos del portfolio.
2. Copiar las imágenes que referencian los posts.
3. Reutilizar `_data/{en,es}/cv.yml`, `home.yml` y `strings.yml`, podando claves que
   ya no se usan (blog, search, repositories, newsletter, giscus).
4. Rellenar `home.yml` con: intro, cuatro servicios, cuatro apps y disponibilidad.
5. Revisar los 38 proyectos: `img`/`img_alt`, enlaces y categoría. Los 14 sin imagen
   usan el fallback; se pueden añadir thumbnails después. Mapear los 14 tipos de
   enlace a etiqueta e icono (`case_study`, `code`, `github`, `model`, `web`,
   `website`, `release`, `local_app`, `tableau`, `kaggle`, `youtube`, `tiktok`,
   `instagram`, `x`).
6. Conservar `profile.jpg`, `resume.pdf`, `google75a8559a473af765.html` y el fichero
   de TikTok en la raíz.
7. Mantener `LICENSE` (GPL-3.0) y añadir `NOTICE` con la atribución MIT de vCard.

## 10. Accesibilidad

- Skip link al contenido.
- Landmarks (`header`, `nav`, `main`, `footer`) y un `h1` por página.
- Pestañas con el patrón ARIA completo y navegación por teclado.
- Foco visible en todos los interactivos; nunca `outline: none` sin sustituto.
- Contraste mínimo AA en claro y oscuro (vCard base se ajusta si hace falta).
- `alt` desde `img_alt`; decorativos con `alt=""`.
- Botones de icono con `aria-label`; enlaces externos con aviso accesible.
- `prefers-reduced-motion` desactiva transiciones y scroll suave.
- El contenido funciona sin JS (secciones apiladas, todos los proyectos visibles).
- `lang` correcto en cada página y en los cambios de idioma.

## 11. SEO y rendimiento

- `<title>` y `description` por página; canonical; `hreflang`; Open Graph.
- JSON-LD: `Person` + `WebSite` en la home; `CreativeWork` en proyectos.
- `sitemap.xml` con las rutas EN y ES.
- Sin JS de terceros; iconos SVG inline; una sola hoja CSS y un solo JS.
- Fuentes: Poppins 300/400/500/600 con `display=swap` y `preconnect`; fallback del
  sistema.
- Imágenes con `width`/`height` y `loading="lazy"` salvo la del sidebar.
- Objetivo Lighthouse móvil: Performance ≥ 90, Accessibility 100, Best Practices
  ≥ 95, SEO 100.

## 12. Pruebas

Se adaptan las actuales, no se tiran:

- **Contenido**: inventario de 38 fichas EN, 28 ES y 76 rutas de proyecto, home
  EN/ES, títulos y descripciones no vacíos, categorías válidas.
- **i18n**: cada página ES traducida tiene su equivalente EN; las 10 rutas ES con
  fallback están en una allowlist explícita, llevan `lang="en"` y `noindex`;
  `hreflang` es recíproco solo cuando existen ambos lados.
- **Enlaces**: todos los internos resuelven tras el build; las redirecciones
  apuntan a destinos existentes; los enlaces externos de proyectos son válidos.
- **Accesibilidad**: axe en home, proyecto y blog; cero violaciones críticas.
- **Responsive**: 360, 768 y 1440 px; sidebar colapsable; rejilla 1/2/3 columnas.
- **E2E**: deep link a pestaña, filtro de categoría, tema persistente, selector de
  idioma, "Show contacts", copiar email.
- **Visual**: snapshots de home (claro/oscuro, móvil/escritorio) y de una página de
  proyecto.
- **Blog**: build, enlaces, `posts.json`, axe y lectura en 360 px.

Se eliminan las pruebas de buscador y de las páginas retiradas.

## 13. Despliegue y orden de trabajo

1. **Blog primero**: el agente crea el repo público `jparedesDS/blog` con `gh`
   (sesión ya autenticada), activa Pages sobre `gh-pages`, mueve los posts,
   despliega y verifica que `/blog/...` responde con las URLs antiguas. Es un
   checkpoint: si la creación del repo o Pages falla, se para aquí.
2. **Portfolio en rama**: quitar al-folio, añadir shell vCard, home y página de
   proyecto.
3. **Contenido**: datos de home/CV, apps, revisión de los 38 proyectos.
4. **Redirecciones y pruebas**: `npm test`, axe, snapshots.
5. **Publicar** y comprobar: home EN/ES, una página de proyecto EN/ES, un post, las
   redirecciones y los sub-sitios.
6. Si algo falla, revertir el deploy del portfolio; el blog sigue vivo.

Riesgo de transición: mientras el portfolio antiguo siga publicando `/blog/`, el
repo del blog también reclama `/blog/`. Por eso el blog se despliega y verifica
antes de retirar el blog del portfolio, y se comprueba que GitHub Pages sirve el
repo de proyecto en esa ruta.

## 14. Riesgos

| Riesgo | Mitigación |
|---|---|
| Desmontar al-folio rompe includes o plugins | Sustituir layouts/config en un commit, construir en local antes de publicar |
| Polyglot no genera bien las rutas nuevas | Prueba de inventario EN/ES y build en CI |
| Conflicto de `/blog/` entre repos | Desplegar el blog primero y verificar la ruta |
| Asimetría EN/ES en 10 proyectos | Allowlist en tests, `noindex`, `hreflang` solo en parejas, fallback por categoría |
| Crear un repo público nuevo es irreversible-ish | Crearlo vacío, verificar nombre/visibilidad y que Pages sirve antes de mover contenido |
| 14 proyectos sin imagen se ven pobres | Fallback con iniciales y degradado; thumbnails después |
| El preview del blog queda obsoleto si falla la red | `_data/blog_preview.yml` commiteado como fallback |
| Pérdida de URLs antiguas | Redirecciones estáticas + prueba de enlaces |
| El CSS de vCard no cubre Markdown de proyectos | Estilos `.prose` para tablas, código, listas e imágenes |

## 15. Decisiones tomadas por el builder

- Se conservan los 38 proyectos, incluidos los solapados, para no romper enlaces.
- Se conservan las 76 URLs existentes (38 EN + 38 ES; 28 traducidas y 10 fallback);
  las 10 sin traducción no se traducen en esta fase, llevan `noindex` y su selector
  cae en la rejilla ES de su categoría.
- Las cuatro redirecciones de categoría se mantienen y preseleccionan el filtro con
  `?filter=<category>`.
- El repo del blog lo crea el agente con `gh` (ya autenticado) y activa Pages antes
  de mover contenido; es un checkpoint del plan.
- No hay formulario de contacto ni mapa.
- Skills como chips, no barras de porcentaje.
- Iconos SVG inline en vez del CDN de Ionicons.
- Fuente Poppins vía Google Fonts; el blog usa tipografía del sistema.
- El blog es monolingüe por entrada, con índices EN y ES; no se traduce cada post.
- El blog usa Jekyll sin tema, no un generador nuevo.
- El portfolio sigue en GPL-3.0 con aviso MIT de vCard.
- Los sub-sitios existentes no se tocan.

## 16. Pendiente de decidir por Jose

Nada bloqueante. Si aparece algo durante la implementación, se propone y se decide.
