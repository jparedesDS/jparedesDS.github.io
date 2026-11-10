# Portfolio Astro + blog PaperMod — Diseño

Fecha: 2026-11-10
Estado: pendiente de aprobación
Repositorios: `jparedesDS/jparedesDS.github.io` (portfolio) y `jparedesDS/blog` (nuevo)

## 1. Intención

Sustituir el portfolio Jekyll actual por un sitio **estático, rápido y editorial** inspirado
en el sistema visual de Chanh Dai, pero con identidad propia. El blog sale a un repositorio
aparte con Hugo PaperMod, al estilo de Lilian Weng. El portfolio se queda con lo importante:
quién es Jose, 6 proyectos seleccionados, experiencia, writing y contacto.

La web actual (tema Krishan) sigue viva hasta que el nuevo portfolio esté construido y
aprobado. Nada se publica a medias.

## 2. Objetivos

1. Reproducir la sensación de Chanh Dai: nav superior, tipografía grande, líneas finas,
   secciones numeradas, cards con imagen, mucho aire, light/dark.
2. Mantener una identidad propia: avatar pixel-art, papel cálido y ámbar, contenido real.
3. 5 proyectos seleccionados con página nueva + CleanYourMail en su página legacy,
   más un archivo con los ~27 proyectos actuales.
4. Writing enlazando al blog externo; el blog se despliega antes que el portfolio.
5. Solo inglés en el portfolio.
6. GitHub Pages, sin Next.js, sin React, sin registry, sin analytics.
7. Cero regresiones en las URLs y sub-sitios que ya existen.

## 3. No objetivos

- Clonar el repo de Chanh Dai entero.
- Componentes, blocks, registry, testimonios, sponsors, bookmarks, recognition,
  GitHub contributions, PWA, `llms.txt`, command menu.
- Blog dentro del portfolio.
- Español en el portfolio (el blog puede tener posts EN/ES por separado).
- CMS, comentarios, newsletter, analytics.
- Rediseñar `/cleanyourmail/`, `/cs2pov/`, `/murdoku/` ni `/propovcs2/`.

## 4. Anti-objetivos

- Que parezca una copia de la web de otra persona.
- Meter Next.js 16, 70 dependencias y Vercel para un portfolio de una persona.
- Duplicar contenido o mantener dos versiones del mismo proyecto.
- Romper `/resume.pdf`, los sub-sitios o los enlaces antiguos de categorías.

## 5. Restricciones y hechos

- El repo actual es Jekyll + tema Krishan, desplegado desde `gh-pages`.
- El repo de Chanh Dai (`ncdai/chanhdai.com`) es público y **MIT**. Se puede reutilizar
  con atribución, pero es una app Next.js 16 + shadcn + registry + MDX; no se forkeará.
- El portfolio actual tiene 9 proyectos y 4 categorías. Hay 38 proyectos en el historial
  del trabajo vCard; no se migran todos.
- Imágenes disponibles: `profile.jpg` (pixel-art), thumbnails de proyectos, logos SVG.
- El blog actual no existe como sitio; los posts viven en el historial.
- GitHub Pages no tiene redirects de servidor: las redirecciones serán HTML estático.

## 6. Enfoque elegido

**Astro + CSS propio**, sin Tailwind ni React. Se copian del repo MIT solo las **ideas y
patrones visuales** (nav, líneas de sección, cards, tokens, theme toggle), no los componentes
React. El mockup de `portfolio-mockup/` es la referencia visual y la base del CSS.

Ventajas: build estático, cero JS de framework, GitHub Pages, mantenimiento bajo.
Coste: no será pixel-perfect respecto a Chanh Dai; será el mismo sistema con otra piel.

## 7. Arquitectura

```text
/
├── astro.config.mjs
├── package.json
├── src/
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── SectionHeader.astro
│   │   ├── WorkCard.astro
│   │   ├── Experience.astro
│   │   ├── WritingList.astro
│   │   ├── Stack.astro
│   │   ├── ContactPanel.astro
│   │   └── Footer.astro
│   ├── content/projects/*.md
│   ├── data/archive.ts
│   ├── data/site.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── work/index.astro
│   │   └── work/[slug].astro
│   └── styles/global.css
├── public/
│   ├── images/            # thumbnails
│   ├── profile.jpg
│   ├── resume.pdf
│   ├── cleanyourmail/     # snapshot legacy (HTML + CSS + JS)
│   ├── css/               # assets del case legacy
│   ├── js/                # assets del case legacy
│   ├── cs2pov/
│   ├── murdoku/
│   ├── propovcs2/
│   └── projects/          # redirects antiguos
└── .github/workflows/deploy.yml
```

## 8. Rutas

| Ruta | Contenido |
|---|---|
| `/` | Home con hero, 6 proyectos, experiencia, writing, stack, contacto |
| `/work/` | Archivo completo: ~27 proyectos actuales + model releases |
| `/work/<slug>/` | Caso de proyecto nuevo (5 seleccionados) |
| `/#work` | Ancla de la sección de proyectos |
| `/#projects` | Alias del ancla anterior para enlaces viejos |
| `/cleanyourmail/` | Página legacy conservada tal cual |
| `/blog/` | Sitio externo (Hugo PaperMod) |
| `/cleanyourmail/`, `/cs2pov/`, `/murdoku/`, `/propovcs2/` | Sin cambios |
| `/resume.pdf`, `/profile.jpg`, `/images/...` | Sin cambios |
| `/projects/`, `/projects/<category>/` | Redirect HTML a `/work/` |
| `/projects/#<category>` | Redirect con hash a `/work/#<category>` (si aplica) |

## 9. Sistema visual

- Fondo papel `#f4f1ea`, tinta `#151412`, línea `#d8d2c5`, acento ámbar `#9a5b06`.
- Dark: fondo `#10100f`, tinta `#f1eee6`, acento `#f0b35a`.
- Tipografía: Inter (400/500/600/700) + JetBrains Mono (400/500), self-hosted con
  Fontsource. Sin Google Fonts en producción.
- Contenedor 1180 px, laterales de 34 px, líneas verticales en el marco.
- Radios 18 px, cards con borde 1 px, sombra casi invisible, hover de 3 px.
- Secciones numeradas `01 / Selected work`, `02 / Experience`, etc.
- Espaciado generoso; cero gradientes llamativos, cero glassmorphism.

## 10. Home

1. **Header** sticky: avatar + nombre, Work / Writing / About / Contact, EN/ES (solo
   indicativo, sin cambio de idioma), toggle de tema.
2. **Hero**: nombre grande, rol, intro de dos líneas, links y tarjeta con avatar pixel-art
   y “Currently…”.
3. **Selected work**: 6 cards con imagen, categoría, año, título, una línea y chips.
   Enlace a `/work/`.
4. **Experience**: 3 filas (EIPSA, Comunicación Permanente, ANOVO) con rol, empresa,
   una línea y fechas.
5. **Writing**: 2 filas con fecha, título, etiqueta y enlace al blog; “All writing →”.
6. **Stack**: chips.
7. **Contact**: panel oscuro con email grande y enlaces.
8. **Footer**: copyright y “Built with care. No template.”

## 11. Proyectos

Seleccionados (6):
1. subany.video — caso nuevo
2. CleanYourMail — enlaza a la página legacy `/cleanyourmail/`
3. DocFlow — caso nuevo, copia pública sin nombres de clientes
4. Pro POV CS2 — caso nuevo
5. trtw.tv — caso nuevo
6. CleanYourPhone — caso nuevo

Casos nuevos: 5. CleanYourMail no se duplica; su card y su entrada del archivo apuntan
a `/cleanyourmail/`.

Archivo: los ~27 proyectos de las cuatro páginas de categoría (ai-vision 7,
data-automation 11, products 6, esports 3) más los 10 model releases de ai-vision.
Se importan a `src/data/archive.ts` con título, descripción, categoría, imagen,
enlaces y `private` cuando aplique. No todos tienen caso propio.

No seleccionados: OCR Weapon Detection, Polymarket, Appointment Management, Claude
Telegram y el resto del archivo. Polymarket se muestra como proyecto privado sin
enlace; los demás enlazan a su repo o página externa.

Cada caso nuevo tiene: breadcrumb, título, categoría/año, resumen, imagen, enlaces,
cuerpo Markdown (problema, enfoque, resultado), "Next project" y vuelta al archivo.

Contenido: se recupera de `96c2255:_projects/<slug>.md` y se adapta; las descripciones
cortas salen de `index.md` y de las páginas de categoría. El caso de DocFlow se limpia
de nombres de clientes, portales y detalles internos del ERP antes de publicar.

## 12. Blog (fase 1, antes que el portfolio)

- Repo nuevo `jparedesDS/blog`, Hugo + PaperMod, `baseurl: /blog`.
- Home en modo profile: avatar, nombre, una línea, redes, lista de posts con fecha y
  tiempo de lectura, tags, search y archive.
- Posts por idioma (`lang: en|es`), sin duplicar cada post.
- Se migran los 2 posts de subany.video desde el historial.
- URLs: `permalink: /:year/:month/:day/:title/`, así que los posts quedan en
  `/blog/2026/11/09/how-subany-video-works/` y
  `/blog/2026/11/09/como-funciona-subany-video/`.
- El portfolio enlaza a `/blog/` y a los dos posts; no incrusta el blog.
- `blog-vcard` no se usa; se elimina o se archiva sin Pages cuando el token lo permita.
- Se despliega antes que el portfolio para que Writing no tenga 404.

## 13. Compatibilidad

- Se conservan `resume.pdf`, `profile.jpg`, `images/` y los 4 sub-sitios.
- Antes de reemplazar `gh-pages`, se guarda una copia del HTML renderizado de
  `/cleanyourmail/` y de sus assets (`/css/main.css`, `/js/*`) en `public/`.
  Es la única página legacy que se conserva tal cual; sus scripts p5 son una excepción
  al "sin JS de terceros" del portfolio.
- `/projects/` y `/projects/<category>/` se convierten en redirects estáticos a `/work/`.
- El ancla vieja `/#projects` se mantiene como alias de `/#work`.
- El blog nuevo vive en `/blog/`; el repo `blog-vcard` se eliminará cuando el token
  tenga `delete_repo` o se dejará archivado sin Pages.
- Etiqueta `pre-astro-portfolio` en `main` antes de empezar, para volver atrás.

## 14. Accesibilidad

- Skip link a `#main-content`.
- Un `h1` por página; jerarquía correcta.
- Foco visible; contraste AA; `prefers-reduced-motion`.
- Nav y theme toggle operables por teclado.
- Imágenes con `alt`; decorativas con `alt=""`.
- El contenido funciona sin JS; el tema por defecto sigue `prefers-color-scheme` con JS y
  cae a claro sin JS.

## 15. SEO y rendimiento

- `title`/`description` por página, canonical, Open Graph, sitemap, robots.
- JSON-LD `Person` en home y `CreativeWork` en casos.
- Sin JS de terceros; una hoja CSS y un script mínimo.
- Imágenes con `width`/`height`, `loading="lazy"` salvo el avatar.
- Objetivo Lighthouse móvil: Performance ≥ 95, Accessibility 100, SEO 100.

## 16. Pruebas

- `astro check` y `astro build`.
- Comprobación de enlaces internos y de los 4 sub-sitios.
- Playwright: home, `/work/`, un caso, 360/768/1440, theme toggle y navegación.
- axe en home, archivo y caso; cero violaciones críticas.
- Snapshot visual de home (claro/oscuro, móvil/escritorio) y de un caso.

## 17. Despliegue

- Etiqueta `pre-astro-portfolio` en `main` y copia del `gh-pages` actual antes de empezar.
- **Blog primero**: repo `blog`, Hugo PaperMod, deploy a `gh-pages` del repo del blog,
  verificar `/blog/` y los dos posts. Después, portfolio.
- Rama `feat/astro-portfolio` en un worktree; `main` no se toca hasta aprobar.
- GitHub Actions: `npm ci`, `astro build`, deploy de `dist` a `gh-pages`.
- Pages sigue sirviendo `gh-pages`. El blog es un repo aparte con su propio workflow.
- Verificación post-deploy: `/`, `/work/`, un caso, `/resume.pdf`, `/cleanyourmail/`,
  los 4 sub-sitios, `/projects/ai-vision/` y `/blog/`.

## 18. Riesgos

| Riesgo | Mitigación |
|---|---|
| El look queda a medio camino entre Chanh Dai y el mockup | Usar el mockup como referencia y revisar tokens antes de construir |
| Perder enlaces antiguos | Redirects estáticos y prueba de enlaces |
| El blog `/blog/` choca con el repo viejo | Crear `blog` limpio, desplegarlo primero y archivar/borrar `blog-vcard` |
| El contenido de los 5 casos es escaso | Recuperar los Markdown del historial y recortar |
| Se pierde la página legacy de CleanYourMail al borrar `gh-pages` | Snapshot del HTML renderizado y assets antes del deploy |
| El archivo de ~27 proyectos se queda a medias | Importar las cuatro páginas de categoría y los model releases en `archive.ts` |
| DocFlow publica nombres de clientes o detalles del ERP | Copia pública sin nombres ni flujos internos |
| GitHub Pages y Astro | Build estático puro, sin SSR ni rutas dinámicas de servidor |
| Copia de Chanh Dai | Solo patrones visuales; atribución MIT en `NOTICE` |

## 19. Decisiones cerradas

- Astro + CSS propio; sin Tailwind, React ni Next.js.
- Solo inglés en el portfolio.
- 5 casos nuevos + CleanYourMail legacy; archivo con los ~27 proyectos actuales y
  los 10 model releases.
- Mockup A (retrato + texto) como home.
- Blog aparte con Hugo PaperMod, desplegado antes que el portfolio.
- GitHub Pages, no Vercel.
- Se conserva el avatar pixel-art y la paleta papel/ámbar del mockup.
- Se copian patrones de Chanh Dai, no su código de aplicación; MIT acreditado.
- `/cleanyourmail/` se conserva como página legacy; su card no duplica el caso.
- DocFlow se publica sin nombres de clientes ni detalles internos del ERP.
- Polymarket se muestra como proyecto privado sin enlace.

## 20. Pendiente

Nada bloqueante. La implementación empieza por el blog y sigue con el portfolio en una
rama aparte. `blog-vcard` se borra cuando el token tenga `delete_repo`; mientras tanto
se deja sin Pages.
