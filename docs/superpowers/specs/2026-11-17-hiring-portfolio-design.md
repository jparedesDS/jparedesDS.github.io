# Diseño: portfolio orientado a contratación (Madrid, visión artificial industrial)

Fecha: 2026-11-17
Estado: propuesta para aprobación

## 1. Intención

El sitio existe y funciona, pero no está optimizado para que un reclutador técnico de Madrid
decida escribir. Hoy muestra un rol genérico ("Data Scientist / AI Engineer"), una lista de
proyectos como enlaces y un solo artículo. No hay prueba con números, no hay CV a un clic y
no hay versión en español.

Objetivo: que un reclutador o hiring manager que llega desde LinkedIn entienda en menos de
diez segundos **qué perfil es, dónde está y qué ha construido**, y pueda descargar el CV o
escribir sin buscar.

## 2. Posicionamiento elegido

**Computer Vision & ML Engineer para industria**, con producto AI local-first como diferencial.

Es lo más próximo al perfil real: desde enero de 2024 en EIPSA construyendo visión artificial
para control de calidad (YOLO11 en penetrantes y soldadura), automatización de datos
industriales (DXF, ERP) y un SaaS interno en producción; antes, cinco años en datos y
electrónica. El producto propio (subany.video, CleanYourPhone) demuestra que además sabe
llevar un modelo hasta una app usable.

Regla: ninguna cifra de antigüedad se publica si no coincide con el CV. Hoy son **casi tres
años en EIPSA** (desde 01/2024) y **cinco años en datos e IA** (desde 2021).

Titular propuesto, EN: *Computer Vision & ML Engineer — industrial quality control and
local-first AI products. Madrid.*

Titular propuesto, ES: *Ingeniero de Computer Vision y ML — control de calidad industrial y
productos de IA local-first. Madrid.*

Anti-goal: no se posiciona como "data scientist genérico" ni como "full-stack"; eso diluye la
vacante a la que quiere optar.

## 3. Audiencia y criterio de éxito

Audiencia primaria: reclutador técnico o hiring manager de empresas de Madrid (industria,
defensa, energía, retail, robótica) buscando perfiles de visión artificial / ML aplicado.

Criterio de éxito, medible a ojo:

1. En 5 segundos se lee rol, ciudad y disponibilidad.
2. En 30 segundos se ve al menos una prueba con número (p. ej. "0–40 ms de desfase",
   "500+ documentos/mes", "80% menos trabajo manual").
3. El CV se descarga o el email se abre en un clic desde la home.
4. Todo lo anterior existe también en `/es/`.

## 4. Objetivos / no objetivos

Objetivos:

- Reorientar la home al perfil industrial-CV y añadir CTA de CV/contacto.
- Convertir Projects en tres casos con problema, qué se hizo y resultado.
- Alinear About con los datos reales del CV (33+ repos, 268 seguidores, 10+ modelos en HF,
  bronce en Kaggle, DocFlow en producción).
- Versión española real de las cuatro páginas de contratación.
- Tarjeta social (`og:image`) y datos estructurados `Person` para búsquedas por nombre.

No objetivos:

- Traducir el blog. Los artículos técnicos se quedan en inglés (y su toggle actual intacto).
- Rediseñar la identidad visual ni el shell Nightfall.
- Añadir animaciones, modo claro o frameworks de UI.
- Sistema de blog multi-autor, comentarios, newsletter.

Anti-goals:

- Inventar métricas. Lo que no esté confirmado se redacta sin cifra.
- Convertir la web en un CV en HTML: sigue siendo portfolio, el CV es el PDF.
- Duplicar contenido entre ES y EN con texto automático: las dos versiones se escriben.

## 5. Restricciones

- Hugo 0.169 extended, salida `dist/`, despliegue en GitHub Pages vía Actions; nada de backend.
- El blog actual (PaperMod/Weng dentro de Nightfall), su buscador, el toggle bilingüe del
  artículo, el zoom 125% y los redirects deben seguir funcionando sin cambios.
- El repositorio es público; no se publican datos de clientes ni capturas internas sin
  autorización (DocFlow es interno: se ilustra con diagrama, no con captura de la app).
- GA4 con consentimiento ya instalado; cualquier página nueva debe respetarlo.

## 6. Alternativas consideradas

**A. Prueba primero** (elegida): tres casos con resultados en Projects, CTA y CV en home,
tarjeta social, SEO de nombre. Convierte la visita en evidencia.

**B. Reclutador rápido**: solo una franja con rol, años, stack y CV. Medio día, pero sin prueba
compite con candidatos que sí la tienen y duplica el LinkedIn.

**C. Autoridad a fuego lento**: publicar cada 2–3 semanas. Correcto a medio plazo; no arregla
la conversión de esta semana.

Decisión: **A + la franja de B** (la franja forma parte de A) y dejar C como hábito posterior.

## 7. Diseño

### 7.1 Arquitectura de información

```
/                 Home: perfil + franja de contratación + prueba + CTA
/projects/        Tres casos + productos activos + archivo
/about/           Trayectoria, stack, educación, datos de CV
/contact/         Email, redes, proyectos
/es/              Espejo de las cuatro anteriores
/es/projects/ ... (mismos slugs que EN)
/blog/            Sin cambios, solo inglés
```

Slugs idénticos en ambos idiomas (decisión: paridad y menos enlaces rotos; Google no necesita
slugs traducidos). El blog queda fuera de `/es/`: desde el menú español enlaza a `/blog/`.

### 7.2 Multilingüe en Hugo

- `defaultContentLanguage = "en"`, `defaultContentLanguageInSubdir = false`.
- Contenido movido a `content/en/` y `content/es/` con `contentDir` por idioma. Los posts del
  blog se mueven a `content/en/blog/` conservando permalink (`/blog/:year/:month/:day/:slug/`).
- Traducciones enlazadas por `translationKey` (about, projects, contact, home).
- Selector `EN / ES` en la cabecera (y dentro del menú móvil). Enlaza a la traducción si existe;
  si no, a la home del otro idioma.
- En las páginas del blog el selector del sitio **no se muestra**: ese espacio ya tiene su propio
  mecanismo (el toggle dentro del artículo y el idioma recordado en listados y buscador). Evita
  dos controles de idioma compitiendo en la misma pantalla y no toca los layouts del blog.
- `hreflang` en `<head>` para las cuatro páginas, generado desde `.AllTranslations`.
- El artículo bilingüe actual no se toca; su `?lang=es` sigue funcionando.

Riesgo principal: mover contenido cambia rutas si algún `url:`/`slug:` se descuida. Mitigación:
build + comprobación de las 20 rutas actuales antes y después (lista en el plan).

### 7.3 Home

Se conserva la tarjeta de perfil (avatar pixel-art, nombre, redes, chips de proyectos) y se
añade debajo del bio una franja de contratación:

```
Computer Vision & ML Engineer · Madrid
Abierto a puestos de visión artificial / ML en industria. Español nativo, inglés B2.
[ Descargar CV ]   [ Escríbeme ]
```

Y, antes de los chips, una línea de prueba:

> Visión artificial industrial desde 2024 · 10+ modelos publicados en Hugging Face · DocFlow en
> producción

El H1 sigue siendo el nombre; la franja es un bloque con `h2` visualmente pequeño para no
romper la jerarquía.

### 7.4 Projects

Tres casos en bloques con ancla (`#vision`, `#docflow`, `#subany`), cada uno con:

- una imagen (captura o diagrama),
- **Problema** (1–2 líneas),
- **Qué hice** (2–3 líneas, decisiones técnicas),
- **Resultado** (una cifra o un hecho verificable),
- chips de stack,
- enlaces (demo, repo, modelo, artículo).

Casos y datos disponibles:

1. **Visión artificial para control de calidad (EIPSA)** — YOLO11 para penetrantes y defectos de
   soldadura. Resultado: modelos desplegados y publicados en Hugging Face; en uso en producción.
   Falta confirmar: tamaño de dataset y métrica (mAP@50 o similar) para sustituir "en uso" por
   una cifra.
2. **DocFlow** — SaaS interno en producción: 21 routers de API, 24 capas de servicio, 24
   pantallas, Docker + CI, DocuSign, JWT. Imagen: diagrama de arquitectura, no captura. Los
   **500+ documentos/mes** pertenecen a la automatización correo→ERP, no a DocFlow: se citan en
   About como hito propio y en el caso solo si el flujo forma parte de DocFlow (a confirmar).
3. **subany.video** — subtítulos en directo en el navegador. Resultado medido: retardo fijo
   15,3 s con objetivo de 15 s, desfase mediano 0–40 ms, Whisper + Silero VAD + ONNX/WebGPU,
   0 servidores. Enlace al artículo.

Debajo, "Productos activos" (chips actuales) y "Archivo" (repos y modelos).

Los números de impacto de EIPSA (DXF −80%, 500+ documentos/mes en la automatización
correo→ERP) también se incorporan a la sección de experiencia de About, que hoy no los tiene.

### 7.5 About

Se mantiene la estructura (perfil, proyectos, experiencia, educación, stack, contacto) y se
corrige para que case con el CV:

- añadir DocFlow y los números (80%, 500+, 21/24/24),
- añadir "33+ repositorios públicos, 268+ seguidores, 10+ modelos en Hugging Face",
- añadir el bronce de Kaggle (clasificación multilabel, ResNet152),
- declarar idiomas (español nativo, inglés B2),
- enlace al CV arriba, no enterrado.

### 7.6 Contacto

Se mantiene. Añadir al principio el mismo CTA de disponibilidad y un `mailto:` con asunto
prefijado (`?subject=Oportunidad%20CV%20/%20ML`), que evita que el correo caiga en genéricos.

### 7.7 SEO y compartir

- `og:image` 1200×630 para todo el sitio (tarjeta terminal con nombre, rol y chips), con
  `og:image:alt`; `twitter:card = summary_large_image`. Se genera una sola imagen y se reutiliza;
  el artículo conserva la suya si se añade después.
- JSON-LD `Person`: nombre, rol, `address` (Madrid), `sameAs` (GitHub, LinkedIn, X, Hugging Face,
  Kaggle, web), `knowsAbout` (computer vision, YOLO, PyTorch, FastAPI…), `alumniOf`.
- Títulos: home `Jose Paredes — Computer Vision & ML Engineer (Madrid)`; ES equivalente.
- `hreflang` en las cuatro páginas; canonical propio por idioma.
- 404 propio: **uno solo** en la raíz (`/404.html`), bilingüe, con enlaces a Inicio, Projects,
  Blog y Contacto en ambos idiomas. GitHub Pages no sirve `/es/404.html`, así que no se crea.

### 7.8 Accesibilidad (incluida porque el menú crece con el selector)

El menú móvil actual depende de un checkbox con `display:none`, inaccesible con teclado.
Se sustituye por un `<button aria-expanded aria-controls>` con cierre por Esc y foco visible.
El selector de idioma debe ser alcanzable y anunciar el idioma activo (`aria-current`).

### 7.9 Privacidad (incluida, coste bajo)

`/privacy/` y `/es/privacy/`: cookies de GA4, base legal, cómo revocar el consentimiento y
contacto. Se activa el enlace del banner (`data-privacy`) y se enlaza en el pie.

## 8. Copia inicial (para reaccionar, no definitiva)

Home ES:

> **Jose Paredes** — Ingeniero de Computer Vision y ML
> Madrid · Abierto a oportunidades
> Desde 2024 construyo visión artificial para control de calidad industrial, además de productos
> de IA que se ejecutan en local. Español nativo, inglés B2.
> [Descargar CV] [Escríbeme]

Caso DocFlow (ES):

> **DocFlow — SaaS de gestión documentaria en producción.** La ingeniería de EIPSA movía
> cientos de documentos al mes a mano entre correo y ERP. Diseñé y dirigí la construcción del
> sistema: FastAPI con 21 routers y 24 servicios, React con 24 pantallas, DocuSign, JWT y
> despliegue Docker con CI. Hoy está en uso diario. *Stack: FastAPI, React, Docker, PostgreSQL,
> Claude API.*

(La cifra exacta de 500+ documentos/mes queda para la línea de automatización correo→ERP hasta
confirmar que ese flujo es parte de DocFlow.)

## 9. Lo que necesito de ti (una sola ronda)

Para cada punto propongo una opción por defecto: si me dices "adelante", hago esa.

1. **CV**: el PDF actual es de abril, en inglés y titulado "Data Scientist | AI Engineer | ML
   Engineer". Propongo actualizarlo al nuevo posicionamiento (Computer Vision & ML Engineer
   primero, casos con números, DocFlow) y generar una versión en español. Alternativa:
   enlazar el actual y que el botón ES diga "Download CV (EN)". *Decide: reescribir o enlazar.*
2. **Métrica de visión artificial**: ¿mAP@50, precisión/recall o imágenes/día del modelo de
   soldadura o penetrantes? Por defecto: sin cifra, "desplegado y en uso en producción".
3. **Disponibilidad**: por defecto "Abierto a oportunidades · Madrid (presencial, híbrido o
   remoto)". ¿Fecha concreta?
4. **Foto**: por defecto pixel-art en home y foto real en About (si me pasas una).
5. **DocFlow**: por defecto nombrar EIPSA y describir el sistema. ¿Prefieres anonimizar el
   cliente? Y ¿los 500+ documentos/mes pasan por DocFlow o son del flujo correo→ERP aparte?

## 10. Hecho cuando

- Home, Projects, About y Contacto existen en EN y ES, con el CTA y los tres casos.
- Un reclutador puede ir de LinkedIn a CV descargado en dos clics.
- `/` y `/es/` comparten estructura y no hay enlaces rotos entre idiomas.
- `og:image`, `Person` y `hreflang` validados; sitemap incluye ambos idiomas.
- El blog, el buscador, el toggle del artículo, los redirects y el zoom siguen intactos.
- Build de Hugo sin errores y las rutas antiguas responden 200.

## 11. Fuera de alcance (para otra iteración)

- Traducir artículos del blog y unificar el toggle con el idioma del sitio.
- Página de servicios/freelance.
- Testimonios o referencias.
- Migración a dominio propio.
