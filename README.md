# Jose Paredes — portfolio

Portfolio personal con el diseño de vCard y contenido bilingüe EN/ES. El blog vive
en un repositorio aparte, [`jparedesDS/blog`](https://github.com/jparedesDS/blog),
servido en <https://jparedesds.github.io/blog/>.

## Estructura

- `_layouts/shell.liquid`: cabecera, sidebar y navbar comunes.
- `_layouts/home.liquid`: las cinco pestañas (About, Resume, Portfolio, Blog, Contact).
- `_layouts/project.liquid`: ficha de proyecto.
- `_includes/`: sidebar, navbar, iconos SVG, tarjetas, filtros y preview del blog.
- `_projects/`: 38 proyectos en inglés y 28 traducciones al español.
- `_data/{en,es}/`: textos, home y CV.
- `_data/blog_preview.yml`: últimas entradas, sincronizadas desde el blog.
- `assets/css/vcard.css`: base de vCard (MIT).
- `assets/css/style.css`: tema claro/oscuro y extensiones.
- `assets/js/script.js`: pestañas, filtro, tema, sidebar y copiar email.
- `blog-preview-sync.mjs`: descarga `posts.json` del blog antes del build.
- `_plugins/sitemap.rb`: genera el sitemap con las 66 URLs de proyecto.

## Comandos

```powershell
bundle install
bundle exec jekyll build
npm ci
npm test
```

Para actualizar las últimas entradas del blog:

```powershell
npm run sync:blog
```

## Rutas

- `/` y `/es/`: portfolio.
- `/projects/<slug>/` y `/es/projects/<slug>/`: fichas de proyecto.
- `/cv/`, `/repositories/`, `/projects/`: redirecciones a la home.
- `/blog/`: sitio externo.
- `/cleanyourmail/`, `/cs2pov/`, `/murdoku/`, `/propovcs2/`: sub-sitios existentes.

## Licencia

GPL-3.0 para el repositorio. El diseño de vCard se usa bajo MIT; ver `NOTICE`.
