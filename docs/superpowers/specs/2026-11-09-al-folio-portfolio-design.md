# Diseño: portfolio personal y tutoriales con al-folio

Fecha: 2026-11-09
Estado: aprobado (2026-11-09)

## 1. Intención

Migrar `jparedesDS.github.io` a al-folio v1 para crear la web personal de Jose Paredes: un portfolio de los productos que desarrolla y publica en GitHub, acompañado de tutoriales técnicos tipo paper que expliquen cómo funciona cada proyecto por dentro.

La portada seguirá la opción visual A aprobada por el usuario. Las páginas internas aprovecharán la estructura de al-folio. La identidad visual usará las paletas clara y oscura reales de `subany.video`, no una réplica exacta de esa aplicación.

## 2. Objetivos

- Mantener About como primera sección de la portada.
- Mantener `subany.video` como proyecto destacado.
- Conservar y organizar las 37 entradas existentes en las cuatro categorías actuales —17 de AI & Vision, 11 de Data & Automation, 6 de Products & Tools y 3 de Esports & Content— y añadir Subany, para un total de 38 fichas.
- Integrar un blog de tutoriales sobre arquitectura, decisiones técnicas y funcionamiento de los proyectos.
- Publicar un primer tutorial real y verificable sobre `subany.video`.
- Mantener una navegación breve: `about`, `blog`, `projects`, `repositories`, `CV`.
- Añadir buscador global con botón en la barra y atajo Ctrl/Cmd+K.
- Añadir selector claro/oscuro junto al buscador, respetando el sistema y recordando la elección del visitante.
- Añadir un botón independiente EN/ES junto al buscador y al selector de tema. English será el idioma principal; Spanish tendrá rutas bajo `/es/`.
- Publicar los tutoriales en inglés y español, enlazando ambas versiones como traducciones equivalentes.
- Conservar CV, imágenes, perfiles sociales y URLs públicas importantes.
- Facilitar que cada nuevo proyecto o tutorial se añada mediante archivos Markdown por idioma, sin tocar el runtime de al-folio.

## 3. No objetivos y antiobjetivos

- No crear una réplica visual completa de `subany.video`.
- No mantener secciones académicas sin contenido: `publications`, `teaching`, `people`, `books` ni submenús.
- No separar `blog` y `tutorials` en dos páginas: Blog contendrá los tutoriales; la portada los llamará “Latest tutorials”.
- No crear contenido de demostración, artículos genéricos ni tutoriales basados en suposiciones.
- No migrar el post de ejemplo de 2016.
- No sincronizar repositorios privados ni importar automáticamente forks o repositorios sin curar.
- No añadir newsletter, tienda, comentarios ni analítica en esta migración.
- No implementar la traducción como texto dinámico dependiente de JavaScript: las versiones EN/ES deben generarse como páginas estáticas.
- No modificar el código de Subany ni de otros proyectos enlazados.

## 4. Enfoques considerados

### A. Al-folio simplificado + identidad Subany — elegido

Portada personalizada con About, proyecto destacado, proyectos y últimos tutoriales. Páginas internas estándar de al-folio. Personalización local limitada a contenido, configuración y estilos visuales.

Es el equilibrio elegido entre identidad, mantenimiento y uso de las funciones de al-folio.

### B. Al-folio casi original + paleta Subany

Menos personalización y migración más rápida, pero una portada más académica y menos conexión entre proyectos y tutoriales. Se descartó tras comparar los mockups.

### C. Réplica de Subany sobre al-folio

Máxima semejanza visual, pero exige mantener más layouts propios y reduce las ventajas de adoptar al-folio. Se descartó por complejidad innecesaria.

## 5. Navegación y páginas

Orden final:

```text
about · blog · projects · repositories · CV        buscar · EN/ES · claro/oscuro
```

### About (`/`)

- Cabecera con foto, nombre, ubicación, especialidad, resumen y enlaces profesionales.
- Tarjeta destacada de `subany.video` con captura, descripción, demo, código y enlace a su tutorial.
- Selección breve de proyectos y enlace a la página completa.
- “Latest tutorials”, con tres artículos como máximo.
- Sin sección News en la primera versión para mantener la portada simple.
- Implementación preferente mediante `_pages/about.md` y Liquid/HTML de contenido, evitando una copia local de `_layouts/about.liquid` salvo que sea imprescindible.

### Blog (`/blog/`)

- Archivo de tutoriales con paginación, buscador, etiquetas, categorías y archivo por año.
- Cada tutorial podrá usar índice lateral, código, imágenes, diagramas Mermaid y ecuaciones cuando el contenido lo necesite.
- Los artículos enlazarán al proyecto, demo, repositorio y tutoriales relacionados.
- El primer tutorial tendrá dos versiones: `_posts/2026-11-09-how-subany-video-works-en.md` como contenido principal en inglés y `_posts/2026-11-09-como-funciona-subany-video-es.md` como traducción española. Ambas compartirán `page_id` y se basarán en el código real de `C:\Users\xht\Desktop\web-subtitulos` y en la información pública de `https://subany.video`.
- La interfaz, las páginas principales, las fichas de proyecto y los tutoriales estarán en inglés y español. English será el idioma principal y la referencia para SEO; Spanish usará `/es/` y nunca reemplazará el contenido inglés.

### Projects (`/projects/`)

- Una ficha Markdown por cada una de las 37 entradas actuales en `_projects/`, más otra para Subany: 38 fichas en total. Las diez publicaciones de modelos existentes conservarán entradas independientes para no eliminar contenido público, aunque compartan repositorio con otra ficha.
- Categorías equivalentes a las actuales, con imágenes reutilizadas desde `assets/img/projects/`.
- Cada ficha incluirá resumen, problema que resuelve, características principales, stack y enlaces públicos disponibles: demo/web, código y tutorial relacionado.
- Cada ficha tendrá versión inglesa y española con el mismo identificador de traducción. Las traducciones solo reformularán información verificada; si una ficha secundaria todavía no tiene traducción, se utilizará el fallback inglés sin ocultar la página española.
- `subany.video` aparecerá primero mediante `importance` y tendrá una ficha propia.
- Los proyectos privados se describirán sin prometer acceso público al código. Para entradas privadas o con poca documentación se utilizarán únicamente los datos existentes y fuentes públicas verificables; los campos desconocidos se omitirán o marcarán como “Private repository” / “Not disclosed”, sin inferir stack, arquitectura ni funciones.
- No se crearán páginas automáticas para repositorios vacíos, forks o proyectos sin contenido actual.

### Repositories (`/repositories/`)

- `github_users: [jparedesDS]`.
- Tarjetas para una selección de repositorios relevantes en `_data/repositories.yml`.
- La página representará la presencia pública en GitHub; Projects seguirá siendo la presentación curada de casos de proyecto.
- No se habilitarán trophies externos ni servicios que dependan de una demo desactivada.

### CV (`/cv/`)

- CV visual usando los datos actuales de `resume.pdf`, convertidos a JSONResume/RenderCV según el formato admitido por al-folio.
- Enlace de descarga al PDF original, conservado en una ruta pública.
- La conversión se hará leyendo el PDF; no se inventará experiencia ni formación.

## 6. Identidad visual

Valores extraídos directamente del CSS público de Subany:

| Token | Claro | Oscuro |
|---|---|---|
| Fondo | `#c9ae8c` | `#3a3633` |
| Superficie | `#d6bfa0` | `#45403c` |
| Borde | `#b69a75` | `#5a544f` |
| Texto | `#1c1915` | `#ede3d3` |
| Texto suave | `#3f382f` | `#c4b9a8` |
| Marcador | `#4a4238` | `#c0b5a4` |
| Botón fondo | `#1c1915` | `#1c1915` |
| Botón texto | `#d6bfa0` | `#ede3d3` |
| Foco | `#8e0f42` | `#ff5a94` |

- Acento compartido: degradado `#ff8a00 → #ff2d78`, usado con moderación en marca, proyecto destacado y pequeños detalles.
- Fuente principal: Inter Variable. Atkinson Hyperlegible podrá usarse en el cuerpo de los tutoriales para facilitar la lectura.
- Configuración de fuentes mediante `third_party_libraries.google_fonts.url.fonts` y estilos locales.
- `enable_darkmode: true`; preferencia del sistema por defecto y elección persistente.
- Overrides locales limitados a `_sass/_themes.scss` y, si hacen falta tokens adicionales, `_sass/_variables.scss`. Los estilos específicos de la portada se mantendrán en el override Sass mínimo necesario.
- Registrar los overrides con `bundle exec al-folio upgrade overrides audit` y `.al-folio-overrides.yml`.

## 7. Internacionalización y botón EN/ES

- English será `default_lang`; Spanish será el segundo idioma, generado bajo `/es/`.
- Se utilizará `jekyll-polyglot` para generar páginas estáticas por idioma, con `parallel_localization: false` en Windows y `sass.sourcemap: never` por compatibilidad.
- Las páginas y tutoriales equivalentes compartirán `page_id`; se generarán enlaces `hreflang`, URL canónica inglesa y navegación entre traducciones sin depender de JavaScript.
- El botón EN/ES estará junto al buscador y al botón ☾/☀. Será independiente del tema: EN/ES cambia de idioma y ☾/☀ cambia de paleta.
- El botón enlazará a la traducción equivalente cuando exista o al fallback correspondiente, con una etiqueta accesible como “Switch to Spanish” o “Cambiar a inglés”.
- La interfaz usará `_data/en/strings.yml` y `_data/es/strings.yml` para textos de navegación y componentes traducibles.
- La compatibilidad de Polyglot con al-folio v1 se validará antes de migrar todo el contenido. Si entra en conflicto con el proceso de build, se usarán páginas espejo EN/ES explícitas manteniendo exactamente las mismas rutas públicas y el botón de idioma.
- Cada nuevo tutorial tendrá un archivo inglés y otro español. Las fichas de proyecto seguirán el mismo identificador bilingüe; el fallback inglés evitará páginas rotas cuando falte una traducción secundaria.

## 8. Buscador

- `search_enabled: true`, `posts_in_search: true`, `bib_search: false`.
- Botón en la barra junto a EN/ES y al selector de tema, con apertura mediante Ctrl/Cmd+K.
- Búsqueda sobre proyectos, páginas y tutoriales, sin contenido bibliográfico académico. Los resultados enlazarán a la versión lingüística correspondiente y mostrarán el idioma cuando sea necesario distinguirlos.
- Mantener navegación por teclado, foco visible y lectura de resultados por lector de pantalla.

## 9. Contenido y rutas que se conservarán

- `resume.pdf` y su enlace de descarga.
- `profile.jpg`, imágenes de proyectos y favicon/verificación de Google aplicables.
- `/cleanyourmail/`, `/propovcs2/`, `/cs2pov/` y `/murdoku/`, copiando sus páginas y recursos independientes sin reescribir sus aplicaciones.
- Las antiguas rutas `/projects/ai-vision/`, `/projects/data-automation/`, `/projects/products/` y `/projects/esports/` no devolverán 404: se convertirán en redirecciones o páginas de acceso a la categoría equivalente dentro de `/projects/`.
- Los enlaces internos se actualizarán para apuntar a las nuevas fichas y tutoriales.
- Se eliminarán layouts, Sass y posts de ejemplo del tema anterior solo después de que sus contenidos dependientes estén migrados.

## 10. Integración con al-folio

- Partir de `alshedivat/al-folio` v1 actual, no de una versión antigua.
- Mantener `al_folio.api_version`, contrato de Tailwind y plugins requeridos en `Gemfile` y `_config.yml`.
- Activar únicamente las funciones necesarias: core, iconos, búsqueda, CV, imágenes, matemáticas/gráficos cuando se usen y archives/paginación.
- No copiar el runtime completo del tema al repositorio.
- Personalizar primero `_config.yml`, `_data`, `_pages`, `_projects`, `_posts` y assets.
- No añadir Bootstrap compatibility ni componentes académicos que no se utilicen.

## 11. Despliegue

El al-folio actual usa gems que requieren compilación mediante GitHub Actions.

- Fuente del sitio en `main`.
- Sitio generado publicado en `gh-pages` por el workflow oficial de al-folio.
- Conservar GitHub Pages apuntando a `gh-pages`.
- Cambiar la rama predeterminada del repositorio a `main` cuando la migración esté validada y el usuario autorice la publicación.
- Confirmar permisos de escritura del workflow antes del primer despliegue; no modificar ajustes de GitHub sin autorización.
- No publicar directamente el contenido fuente de `main` en `gh-pages`.

## 12. Verificación

Antes de entregar o publicar:

1. `npm run lint:prettier`.
2. `bundle exec al-folio upgrade audit --no-fail`.
3. `bundle exec al-folio upgrade overrides audit` para las personalizaciones locales.
4. `bundle exec jekyll build` con `url: https://jparedesds.github.io` y `baseurl` vacío.
5. Comprobar las 38 fichas, el primer tutorial, CV, buscador y las rutas especiales.
6. Comprobar que no quedan enlaces a contenido de ejemplo ni páginas académicas vacías.
7. Revisar desktop y móvil en 320, 390, 768, 1024 y 1440 px, en claro y oscuro.
8. Probar buscador con ratón y Ctrl/Cmd+K, cambio de tema y persistencia al recargar.
9. Ejecutar axe WCAG AA en portada, Projects, Blog, un tutorial, Repositories y CV; corregir incidencias automáticas.
10. Validar el workflow en GitHub Actions antes de cambiar la rama predeterminada.

Si el entorno local no tiene Ruby/Bundler, se preparará un entorno aislado o se pedirá autorización antes de cualquier instalación global. No se declarará que el build funciona sin ejecutar estas comprobaciones.

## 13. Decisiones que puede tomar el implementador

- Nombres de slugs y orden exacto dentro de cada categoría, siempre que Subany quede primero globalmente.
- Estructura concreta de datos JSONResume/RenderCV derivada del PDF.
- Método de redirección de las cuatro categorías antiguas, conservando accesibilidad y SEO.
- Desglose del primer tutorial en secciones, siempre basado en código y documentación reales.
- Ajustes de contraste o espaciado necesarios para superar las pruebas, sin cambiar los colores base aprobados.
- Uso de un worktree/rama de migración y del entorno local aislado, coordinado con las autorizaciones de Git necesarias.
