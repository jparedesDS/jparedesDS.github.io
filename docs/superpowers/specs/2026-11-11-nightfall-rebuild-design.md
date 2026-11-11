# Nightfall Rebuild — diseño

**Fecha:** 2026-11-11
**Repo:** `jparedesDS/jparedesDS.github.io`
**Estado:** aprobado por el usuario; pendiente de builder check

## 1. Intención

Reconstruir el portfolio por última vez sobre Hugo + Nightfall, con una home
mínima idéntica al tema, una página About con la información del CV y un blog
propio con tags, archivo y FAQ. Retirar Astro y PaperMod. Después, limpiar el
historial del repo (opción 2) para que el nuevo sitio sea el commit raíz.

## 2. Objetivos

- Sitio Hugo con Nightfall vendorizado (MIT).
- Home idéntica a la demo: terminal, título centrado, redes y footer.
- About con resumen, proyectos seleccionados, experiencia, estudios, stack,
  writing, contacto y CV.
- Blog en `/blog/` dentro del mismo sitio, con los 2 posts migrados, tags,
  archivo y FAQ.
- Conservar URLs antiguas del blog y redirects de las rutas que desaparecen.
- Conservar las páginas legales/activas y los assets que usan otros proyectos.
- Historial limpio: commit huérfano con el árbol nuevo, backup previo y
  `force-with-lease` de `main`.
- Retirar PaperMod (`jparedesDS/blog`) después de migrar; desactivar su Pages.

## 3. No objetivos

- No mantener `/work/` ni los 5 casos.
- No mantener la home Astro, sus componentes ni su archivo.
- No añadir search al blog (Nightfall no lo trae); `/blog/search/` se redirige.
- No añadir todavía menús Projects ni Contact Me; se dejan preparados.
- No tocar el DNS de `cleanyourmail.org`, `cleanyourphone.org` ni subany.video.
- No cambiar el blog a otro tema ni añadir comentarios/analytics/newsletter.

## 4. Anti-objetivos

- Un portfolio recargado con toda la información antigua en la home.
- URLs antiguas del blog rotas.
- Borrar `/cs2pov/` (páginas legales que usan YouTube/TikTok APIs).
- Romper `www.cleanyourmail.org`.
- Un historial “limpio” sin backup previo.

## 5. Enfoques considerados

1. **Nightfall vendorizado + sitio Hugo en la raíz** (elegido): control total,
   sin submódulos, build reproducible, historial limpio.
2. **Nightfall como Hugo Module/submódulo**: menos archivos, pero añade una
   dependencia remota al CI y complica el commit huérfano. Descartado.
3. **Mantener PaperMod en `/blog/` y Nightfall solo para home/About**: descartado
   por el usuario; quiere un solo sitio con el blog de Nightfall.
4. **Rehacer el tema a mano**: descartado; el usuario quiere Nightfall.

## 6. Constantes

- Repo/user site: `https://jparedesds.github.io/` (el repo debe seguir llamándose
  `jparedesDS.github.io`).
- Blog actual: `jparedesDS/blog`, proyecto Pages en `/blog/`; se retira.
- Nightfall: MIT, Hugo >= 0.158, SCSS con Dart Sass.
- Nightfall es **dark-only**: no tiene toggle ni tema claro. La verificación
  visual se hace solo en oscuro; no se inventa un modo claro.
- Hugo local: 0.169 Extended; CI instalará Dart Sass con npm.
- El portfolio no tiene dominio propio.
- `cleanyourmail.org` y `cleanyourphone.org` son sitios independientes con su
  propio CNAME/Pages; no se tocan.
- `www.cleanyourmail.org` es CNAME a `jparedesds.github.io` + 301 al apex; el
  rebuild del portfolio no lo modifica.

## 7. Estructura del sitio

```text
hugo.toml
content/
  _index.md
  about.md
  blog/
    _index.md
    2026-11-09-how-subany-video-works.md
    2026-11-09-como-funciona-subany-video.md
  archive.md
  faq.md
  tags/_index.md
layouts/
  archive.html
  _partials/custom-head.html   # si hace falta
themes/nightfall/             # tema vendorizado + LICENSE
static/
  cs2pov/                     # legal YouTube/TikTok, intacto
  propovcs2/                  # landing activa, intacta
  murdoku/                    # app activa, intacta
  cleanyourmail/index.html    # redirect a https://cleanyourmail.org/
  work/index.html             # redirect a /about/#projects
  work/subany-video/index.html
  work/docflow-saas/index.html
  work/pro-pov-cs2/index.html
  work/trtw-tv/index.html
  work/cleanyourphone/index.html
  projects/...                # redirects legacy a /about/
  images/, profile.jpg, resume.pdf
  google...html, tiktok...txt
.github/workflows/deploy.yml
```

## 8. Home y About

**Home** (Nightfall `home.html`, sin cambios de estructura):
- Header terminal: `jparedesDS@portfolio ~ $`.
- Menú: `~/about`, `~/blog`, `~/tags`, `~/archive`, `~/faq`.
- H1: `Jose Paredes`.
- Redes: GitHub, LinkedIn, X, Instagram, Email.
- Footer: “© 2026 Jose Paredes · Built with Hugo and Nightfall”.

**About** (Markdown, plantilla single de Nightfall):
- Intro y rol actual.
- Selected projects: subany.video, CleanYourMail, CleanYourPhone, DocFlow,
  Pro POV CS2 y el archivo/GitHub. Enlaces externos y casos que sigan vivos.
- Experiencia: EIPSA, Comunicación Permanente, Grupo ANOVO.
- Educación: The Bridge, Padre Piquer.
- Stack: los 33 tokens actuales.
- Writing: enlace a `/blog/`.
- Contacto: email, GitHub, LinkedIn, X, Instagram, Hugging Face, Kaggle.
- `id="projects"` en la sección de proyectos para futuros enlaces.

## 9. Blog

- Sección `content/blog`; `permalinks`:
  - `blog = "/blog/:year/:month/:day/:slug/"`.
  - Conserva `/blog/2026/11/09/how-subany-video-works/` y
    `/blog/2026/11/09/como-funciona-subany-video/`.
- Los cuerpos se migran tal cual; frontmatter adaptado a Hugo/Nightfall.
- Tags: `subany`, `hls`, `whisper`, `onnx`, `webgpu`, `translation` /
  `traduccion`, visibles en cada post. `content/tags/_index.md` con
  `url: /blog/tags/` y `[permalinks] tags = "/blog/tags/:slug/"` para conservar
  el índice y las páginas de tag antiguas.
- Archivo: `content/archive.md` con `url: /blog/archives/` y
  `layout: archive`; plantilla propia agrupada por año, con título, fecha,
  lectura y enlace.
- FAQ: `content/faq.md` con `url: /blog/faq/`, 5 preguntas.
- `/blog/search/` se redirige a `/blog/`; no hay search nuevo. `/blog/index.json`
  (índice de búsqueda de PaperMod) se retira con el search.
- `/blog/index.xml` se conserva: la sección `blog` genera su RSS.
- Se conserva el badge EN/ES si es barato: `lang: en|es` + pequeño span en el
  metadata del post; si no, el título ya identifica el idioma. El builder puede
  decidir la implementación mínima.
- Los enlaces internos `/work/subany-video/` de los posts se cambian a
  `https://subany.video/`.

### URLs antiguas del blog

| Ruta | Destino |
|---|---|
| `/blog/` | `/blog/` (nuevo índice) |
| `/blog/2026/11/09/...` | se conserva |
| `/blog/posts/` | `/blog/` |
| `/blog/about/` | `/about/` |
| `/blog/categories/` | `/blog/` |
| `/blog/tags/` y `/blog/tags/<term>/` | se conservan con permalinks |
| `/blog/archives/` | se conserva |
| `/blog/faq/` | se conserva |
| `/blog/search/` | `/blog/` |
| `/blog/index.xml` | se conserva |
| `/blog/index.json` | se retira (search) |

## 10. Rutas que desaparecen y redirects

| Ruta antigua | Destino |
|---|---|
| `/work/` | `/about/#projects` |
| `/work/subany-video/` | `https://subany.video/` |
| `/work/docflow-saas/` | `https://github.com/jparedesDS/docflow` |
| `/work/pro-pov-cs2/` | `/propovcs2/` |
| `/work/trtw-tv/` | `https://github.com/jparedesDS/trtw-tv` |
| `/work/cleanyourphone/` | `https://cleanyourphone.org/` |
| `/cleanyourmail/` | `https://cleanyourmail.org/` |
| `/projects/` y `/projects/<cat>/` | `/about/#projects` |
| `/blog/search/` | `/blog/` |
| `/#work`, `/#projects` | sin equivalente; caen al inicio |

Los redirects son HTML estático con `meta refresh`, canonical y enlace visible.

## 11. Qué se conserva

- `/cs2pov/` completo: privacy/terms requeridos por YouTube/TikTok/Instagram.
- `/propovcs2/`: landing activa de Pro POV CS2.
- `/murdoku/`: app estática activa.
- `resume.pdf`, `profile.jpg`, `images/`, verificaciones Google/TikTok.
- `LICENSE`/`NOTICE` del portfolio y atribución MIT de Nightfall.

## 12. Limpieza de historial (opción 2)

1. Backup: `git bundle` completo + tag local `pre-nightfall-rewrite`; copia del
   repo actual en un directorio de backup.
2. Construir y verificar el sitio Nightfall en `rebuild/nightfall`.
3. Crear una rama huérfana `main-clean` con el árbol nuevo y un commit raíz
   “Initial commit: Nightfall portfolio”.
4. `git push --force-with-lease origin main-clean:main`.
5. Borrar ramas/tags antiguos del remoto, conservando el bundle local.
6. Mantener `gh-pages` y el workflow de deploy; el push a `main` reconstruye.
7. Retirar el blog PaperMod con este orden:
   1. Migrar y verificar el nuevo `/blog/` en local (`hugo server`).
   2. Force-push del portfolio y deploy a `gh-pages`; el project site del repo
      `blog` sigue sirviendo `/blog/` y tapa al nuevo.
   3. Verificar en vivo `/`, `/about`, `/blog/archives/` no (aún tapado), etc.
   4. Desactivar Pages del repo `blog`; ahora `/blog/` lo sirve el portfolio.
   5. Verificar posts, tags, archivo y FAQ. Si algo falla, reactivar Pages del
      blog (rollback) y corregir.
   6. Archivar el repo `blog` (no borrar) tras verificar.
8. Aviso: el repo seguirá marcado como fork en GitHub; la opción 2 limpia la
   historia, no el badge. Para el badge haría falta la opción 3.

## 13. Verificación

- `hugo --gc --minify` limpio; SCSS compila con Dart Sass.
- Home visualmente idéntica a Nightfall; menú y redes.
- About con toda la información y `#projects`.
- Blog: 2 posts, tags, `/blog/archives/`, `/blog/faq/`; URLs antiguas 200.
- Redirects: `/work/*`, `/cleanyourmail/`, `/projects/*`, `/blog/search/`.
- `/cs2pov/`, `/propovcs2/`, `/murdoku/`, assets y verificaciones 200.
- `cleanyourmail.org` 200 y `www` 301→apex.
- Playwright: 1440/360 en oscuro (Nightfall no tiene claro), sin overflow;
  enlaces internos 200.
- Deploy live y verificación posterior.
- Blog repo Pages desactivado; `/blog/` servido por el portfolio.

## 14. Decisiones del builder

- Nightfall vendorizado, no submódulo.
- Menú inicial con about/blog/tags/archive/faq; proyectos/contacto después.
- Sin search; se redirige `/blog/search/`.
- Redirects estáticos en `static/` para no depender de Pages redirects.
- Backup local antes del force-push; no borrar el repo.
