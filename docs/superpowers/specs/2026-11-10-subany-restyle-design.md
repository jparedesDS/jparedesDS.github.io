# Rediseño portfolio + blog con identidad subany

**Fecha:** 2026-11-10
**Repos:** `jparedesDS/jparedesDS.github.io` (Astro), `jparedesDS/blog` (Hugo PaperMod)
**Estado:** pendiente de aprobación

## 1. Intención

Alinear el portfolio y el blog con la identidad visual de subany.site, el último
proyecto de Jose: fondo cálido tostado, tipografía Inter Variable, superficies
planas y acentos puntuales. A la vez, compactar la home y convertir la sección
de experiencia en una cronología única de trabajo, educación e hitos. El blog
adopta la estructura de Lilian Weng: modo lista de PaperMod, bienvenida y menú
Posts / Archive / Search / Tags / FAQ.

## 2. Objetivos

- Aplicar la paleta exacta de subany en claro y oscuro, en portfolio y blog.
- Usar Inter Variable como tipografía de interfaz; mono solo en código.
- Quitar las líneas verticales del marco; conservar los separadores horizontales.
- Hacer circular el retrato del hero.
- Mostrar 8 proyectos seleccionados en una rejilla 4 × 2, mucho más compacta.
- Sustituir las filas de experiencia por una cronología que mezcle trabajo,
  educación e hitos, ordenada de más reciente a más antiguo.
- Reestructurar el blog como Lilian Weng y añadir FAQ.

## 3. No objetivos

- No cambiar el contenido de los casos salvo la lista de seleccionados.
- No tocar la página legacy `/cleanyourmail/` ni los sub-sitios.
- No añadir analytics, comentarios, newsletter ni CMS.
- No reescribir los posts ni cambiar sus URLs.
- No convertir el blog en una copia del branding de Lilian: solo su estructura.

## 4. Anti-objetivos

- Gradientes a pantalla completa o glassmorphism.
- Tarjetas de proyecto privadas o sin destino en Selected work.
- Mezclar trabajo y educación en secciones separadas: la petición es una sola
  cronología.
- Duplicar la paleta con hex nuevos fuera de los tokens de subany.

## 5. Enfoques considerados

1. **Parchear el tema actual** (elegido): cambiar tokens, componentes y datos
   sobre el Astro/PaperMod que ya funciona. Menor riesgo, conserva URLs, tests y
   el legacy.
2. **Forkear el tema de Lilian para el blog**: descartado. Rompería los dos
   posts migrados, los badges de idioma y el deploy actual, para ganar solo la
   estructura, que PaperMod ya soporta en modo lista.
3. **Rehacer el portfolio con otro framework**: descartado. No aporta nada a un
   cambio visual y de contenido; añade deuda y rompe la verificación existente.

## 6. Paleta exacta

Fuente: CSS de `https://subany.site/` (`:root` y `[data-tema=oscuro]`).

### Claro

| Token | Valor | Uso |
|---|---|---|
| fondo | `#c9ae8c` | fondo de página |
| superficie | `#d6bfa0` | tarjetas, paneles, header |
| borde | `#b69a75` | líneas y bordes |
| texto | `#1c1915` | texto principal |
| texto suave | `#3f382f` | texto secundario |
| marcador | `#4a4238` | placeholders y metadatos |
| botón fondo | `#1c1915` | panel de contacto, botones |
| botón texto | `#d6bfa0` | texto sobre panel |
| foco | `#8e0f42` | focus visible |
| degradado | `linear-gradient(90deg, #ff8a00, #ff2d78)` | acento puntual |

### Oscuro

| Token | Valor | Uso |
|---|---|---|
| fondo | `#3a3633` | fondo de página |
| superficie | `#45403c` | tarjetas, paneles, header |
| borde | `#5a544f` | líneas y bordes |
| texto | `#ede3d3` | texto principal |
| texto suave | `#c4b9a8` | texto secundario |
| marcador | `#c0b5a4` | placeholders y metadatos |
| botón fondo | `#1c1915` | panel de contacto, botones |
| botón texto | `#ede3d3` | texto sobre panel |
| foco | `#ff5a94` | focus visible |

`--surface-2` se deriva con `color-mix` de superficie y borde; no se inventan
hex. El degradado se usa solo en el punto de estado, hover de tarjeta y detalles
pequeños, nunca como fondo de sección.

`--accent` no existe en subany. Se mapea al color de foco (`#8e0f42` claro,
`#ff5a94` oscuro) para enlaces, hovers y focus. `--accent-soft` se deriva con
`color-mix` de superficie y acento; no se añade un hex nuevo. Los enlaces de
texto mantienen subrayado y heredan el color de tinta; el acento aparece en
hover/focus, no como color base de párrafo.

## 7. Tipografía

- Inter Variable (`@fontsource-variable/inter`) para toda la interfaz.
- Los kickers, metadatos y fechas dejan de usar JetBrains Mono y pasan a Inter
  Variable en mayúsculas con tracking. Así la home coincide con subany.
- JetBrains Mono queda solo para `code`/`pre` dentro de los casos.
- En el blog se copia el woff2 de Inter Variable a `static/fonts/` y se declara
  `@font-face` en `assets/css/extended/custom.css`; PaperMod lo usa en `body`.

## 8. Portfolio: cambios

### 8.1 Shell y retrato

- `.page`: quitar `border-inline`; mantener `.section { border-top }`, header y
  footer como separadores horizontales.
- `.portrait` y su override móvil: `border-radius: 50%`; la caja exterior del
  hero sigue siendo una tarjeta redondeada.
- Header, footer, tarjetas, chips, panel de contacto y casos usan los tokens
  nuevos. El logo y el toggle se adaptan al fondo tostado.

### 8.2 Selected work

- Quitar `featured` a `trtw-tv` (sigue en `/work/` y con su caso).
- Añadir `featured` a los tres proyectos con más estrellas de GitHub:
  - `hltv-scraper` — 27 estrellas.
  - `dxf-data-extraction` — 22 estrellas.
  - `welding-defects-detection` — 19 estrellas.
- Los 8 seleccionados: subany.video, CleanYourMail, DocFlow, Pro POV CS2,
  CleanYourPhone, HLTV Scraper, DXF Data Extraction, Welding Defects Detector.
- Los tres nuevos no tienen caso propio. Enlazan directamente a su repo de
  GitHub:
  - `https://github.com/jparedesDS/hltv-scraper`
  - `https://github.com/jparedesDS/extract-data-dxf`
  - `https://github.com/jparedesDS/welding-defects-detection`
  `WorkCard` detecta `http` y añade `target="_blank" rel="noreferrer"`.
- `.work-grid`: 4 columnas en desktop, 2 en tablet, 1 en móvil.
- Tarjeta compacta: imagen 16/10, padding 12–14 px, título 17 px, resumen 12.5 px,
  chips 9.5 px y como máximo 2 chips.
- La sección mantiene `id="work"` y el alias `id="projects"`.

### 8.3 Cronología

Sustituir `Experience.astro` por `Timeline.astro`. Tipo de datos:

```ts
type TimelineKind = "work" | "education" | "milestone";
type TimelineEntry = {
  kind: TimelineKind;
  title: string;
  org?: string;
  description: string;
  href?: string;
};
type TimelinePeriod = { period: string; entries: TimelineEntry[] };
```

Contenido (de más reciente a más antiguo):

- **2026** — hitos: subany.video; CleanYourMail y CleanYourPhone.
- **2024 — Now** — EIPSA, Data Analyst & AI Engineer; hitos: DocFlow en
  producción, modelos YOLO de inspección, Pro POV CS2.
- **2021 — 2023** — Comunicación Permanente, Data Management Technician;
  educación: Data Science Bootcamp, The Bridge (2021–2022); hito: medalla de
  bronce en Kaggle (Futurama).
- **2015 — 2020** — Grupo ANOVO, Electronics Lab Technician.
- **2010 — 2012** — Advanced Vocational Degree in Telecommunications, Centro
  de Formación Padre Piquer.

Cada fila muestra el periodo a la izquierda y una lista de entradas a la derecha,
con una etiqueta `Work` / `Education` / `Milestone`. En móvil el periodo pasa
encima de las entradas. El título de sección cambia a “Work, education &
milestones”.

Descripciones y enlaces (una línea, sacadas del CV; sin métricas nuevas):

- 2026 subany.video → “Live subtitles and translation, processed in the browser.”,
  enlace `/work/subany-video/`.
- 2026 CleanYourMail → “Reversible inbox cleanup for coding agents.”, enlace
  `/cleanyourmail/`.
- 2026 CleanYourPhone → “Reversible Android debloat without root.”, enlace
  `/work/cleanyourphone/`.
- EIPSA → descripción actual de `site.ts`; sin enlace.
- DocFlow → “Document control for engineering project orders, in production.”,
  enlace `/work/docflow-saas/`.
- YOLO inspection models → “Defect detection for metallurgy quality control.”,
  enlace `https://huggingface.co/jparedesDS/welding-defects-detection`.
- Pro POV CS2 → “Autonomous esports content pipeline.”, enlace
  `/work/pro-pov-cs2/`.
- Comunicación Permanente → descripción actual; sin enlace.
- The Bridge bootcamp → “Supervised and unsupervised learning, deep learning,
  NLP, computer vision and Flask deployment.”; sin enlace.
- Kaggle → “Bronze medal, multilabel image classification (Futurama frames).”,
  enlace a la competición de Kaggle.
- ANOVO → descripción actual; sin enlace.
- Padre Piquer → “Advanced Vocational Degree in Telecommunications.”; sin enlace.

### 8.4 Resto de la home

Writing, Stack y Contact se mantienen; solo cambian tokens, tipografía y
separadores. El enlace a `/blog/` y a los dos posts no cambia.

## 9. Blog: estructura Lilian Weng

- `hugo.toml`:
  - `profileMode.enabled = false`.
  - `mainSections = ["posts"]`.
  - `homeInfoParams` con título “👋 Welcome” y una bienvenida breve.
  - Menú en orden: Posts, Archive, Search, Tags, FAQ.
  - Mantener `ShowReadingTime`, `ShowPostNavLinks`, `ShowToc`.
- Eliminar `layouts/index.html`; el `list.html` de PaperMod renderiza la
  bienvenida y la lista de posts con fecha, tiempo de lectura y autor.
- `layouts/_partials/post_meta.html`: formato “Date: … | Estimated Reading
  Time: … | Author: …”, conservando `<time datetime>` y el badge EN/ES.
- Crear `content/faq.md` con 4–5 preguntas: quién soy, de qué escribo, puedo
  usar el código, cómo contacto, por qué hay posts en español.
- Archive, Search y Tags ya existen; se mantienen.
- About deja de estar en el menú y sigue fuera del índice de búsqueda.
- Paleta: mapear los tokens de subany a las variables de PaperMod
  (`--theme`, `--entry`, `--primary`, `--secondary`, `--tertiary`, `--content`,
  `--border`, `--code-bg`, `--hljs-bg`) en claro y oscuro.
- Fuente: Inter Variable en `body`; mono solo en código.

## 10. Verificación

Portfolio:
- Tests Node: 8 `work-card`, títulos nuevos, ausencia de trtw en la home,
  cronología con EIPSA, The Bridge, ANOVO, Padre Piquer, Kaggle y hitos.
- Playwright:
  - 4 columnas a 1440, 2 a 768, 1 a 360 en `.work-grid`.
  - `.page` sin bordes laterales.
  - `.portrait` con `border-radius: 50%`.
  - Sin overflow a 360/768/1440.
  - Axe limpio en home, archivo, caso y legacy.
- Revisión visual clara/oscura en 1440 y 360.

Blog:
- Tests: home con bienvenida y lista; menú en orden; FAQ 200; sin tarjeta de
  perfil; metadatos con Date/Reading Time/Author; colores de subany en CSS claro
  y oscuro; los dos posts y sus URLs siguen vivos.
- Revisión visual clara/oscura.

## 11. Entrega

- Portfolio en `feat/subany-restyle`, PR y deploy a `gh-pages`.
- Blog en `feat/lilian-structure`, PR y deploy a su `gh-pages`.
- El tag `pre-astro-portfolio` se conserva.
- No se publica nada hasta que build, tests, axe y revisión visual estén verdes.

## 12. Decisiones tomadas por el builder

- Orden de la cronología: descendente, como la sección actual.
- FAQ: contenido breve, en inglés, sin datos privados.
- Se mantiene el badge EN/ES porque los dos posts están en idiomas distintos;
  Lilian no lo tiene, pero es una desviación funcional necesaria.
- `trtw.tv` sigue en `/work/` y en su caso; solo sale de Selected work.
- Las tres tarjetas nuevas enlazan a GitHub, no a casos nuevos.
- El acento es el color de foco de subany; no se inventa un hex.
- Las descripciones de la cronología son una línea basada en el CV; los enlaces
  internos apuntan a los casos existentes y los externos a GitHub/Hugging Face/
  Kaggle.
