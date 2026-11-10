# Portfolio Astro — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el portfolio Jekyll por un sitio Astro estático con la home aprobada (variante A), 5 casos nuevos, CleanYourMail legacy, archivo completo y despliegue en GitHub Pages.

**Architecture:** Astro + CSS propio, sin React ni Tailwind. `src/data` contiene proyectos y modelos; `src/content/cases` contiene los 5 casos; `public/` conserva imágenes, CV, sub-sitios y la página legacy de CleanYourMail. El blog ya está en `/blog/` y se enlaza desde Writing.

**Tech Stack:** Astro (última estable), TypeScript, CSS moderno, Fontsource (Inter + JetBrains Mono), Node 22, Playwright + axe, GitHub Actions.

**Spec:** `C:\Users\xht\Desktop\portfolio-mockup\design-astro-portfolio.md`

## Global Constraints

- Solo inglés en el portfolio.
- Sin React, Tailwind, Next.js, analytics, comentarios ni CMS.
- 5 casos nuevos: subany.video, DocFlow, Pro POV CS2, trtw.tv, CleanYourPhone.
- CleanYourMail enlaza a `/cleanyourmail/`; no se duplica el caso.
- Archivo `/work/` con los ~27 proyectos de las categorías + 10 model releases.
- DocFlow se publica sin nombres de clientes, portales ni flujos internos del ERP.
- Polymarket aparece como privado, sin enlace.
- Se conservan `/cleanyourmail/`, `/cs2pov/`, `/murdoku/`, `/propovcs2/`, `resume.pdf`,
  `profile.jpg`, `images/` y los ficheros de verificación.
- `/projects/` y `/projects/<category>/` redirigen a `/work/`.
- El blog ya está desplegado en `/blog/`; Writing enlaza ahí.
- Nada se publica hasta que el build, los tests y una revisión visual estén verdes.

## Review Focus

- **Pérdida de URLs**: `/projects/`, categorías, `/#projects`, `/cleanyourmail/` y sub-sitios.
- **Archivo completo**: que `/work/` no se deje proyectos de las categorías actuales.
- **Privacidad**: DocFlow sin clientes/ERP; Polymarket sin enlace.
- **Legacy CleanYourMail**: que el snapshot cargue CSS/JS y no dependa de `gh-pages`.
- **Móvil**: home, archivo y caso a 360 px sin scroll horizontal.

---

### Task 1: Backup, worktree y documentación

**Files:**
- Create: `docs/superpowers/specs/2026-11-10-astro-portfolio-design.md`
- Create: `docs/superpowers/plans/2026-11-10-astro-portfolio.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nada.
- Produces: rama `feat/astro-portfolio` en `.worktrees/astro-portfolio`, tag `pre-astro-portfolio`, diseño y plan dentro del repo.

- [ ] **Step 1: Crear el tag y el worktree**

```powershell
cd C:\Users\xht\Desktop\jparedesDS.github.io
git tag pre-astro-portfolio
git push origin pre-astro-portfolio
git worktree add .worktrees\astro-portfolio -b feat/astro-portfolio
```

Expected: worktree creado en `.worktrees/astro-portfolio`.

- [ ] **Step 2: Ignorar el worktree y copiar los documentos**

```powershell
cd .worktrees\astro-portfolio
Add-Content .gitignore ".worktrees/"
New-Item -ItemType Directory -Force docs\superpowers\specs, docs\superpowers\plans | Out-Null
Copy-Item "C:\Users\xht\Desktop\portfolio-mockup\design-astro-portfolio.md" "docs\superpowers\specs\2026-11-10-astro-portfolio-design.md"
Copy-Item "C:\Users\xht\Desktop\portfolio-mockup\plans\2026-11-10-astro-portfolio.md" "docs\superpowers\plans\2026-11-10-astro-portfolio.md"
```

- [ ] **Step 3: Commit**

```powershell
git add .gitignore docs
git commit -m "docs: add the Astro portfolio design and plan"
```

---

### Task 2: Scaffold Astro, layout base y tema

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`, `src/components/Footer.astro`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro`
- Test: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 1.
- Produces: `BaseLayout` con `<html data-theme>`, skip link, `<main id="main-content">`, header, footer y theme toggle; build estático.

- [ ] **Step 1: Instalar Astro y dependencias**

Reemplazar el `package.json` antiguo (Jekyll/Playwright) por uno nuevo antes de
instalar. No borrar todavía `index.md`, `projects/`, `css/`, `js/` ni `images/`:
se usan en las tareas de contenido y legacy.

```powershell
npm init -y
npm install astro@latest @fontsource/inter @fontsource/jetbrains-mono
npm install -D @astrojs/check typescript @playwright/test @axe-core/playwright
```

`package.json` scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "npm run build && node --test test/content.test.mjs"
  }
}
```

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jparedesds.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
});
```

- [ ] **Step 2: Escribir el test que falla**

`test/content.test.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const dist = path.join(process.cwd(), "dist");
const read = (file) => fs.readFileSync(path.join(dist, file), "utf8");

test("the build produces the home with the shell", () => {
  const html = read("index.html");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /Jose Paredes/);
  assert.match(html, /data-theme/);
});
```

- [ ] **Step 3: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL; no existe `dist/index.html`.

- [ ] **Step 4: Crear el layout y el CSS base**

`src/layouts/BaseLayout.astro`:

```astro
---
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "../styles/global.css";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

const { title = "Jose Paredes — Data Scientist & AI Engineer", description = "Data scientist and AI engineer in Madrid." } = Astro.props;
---
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
    <link rel="icon" href="/profile.jpg" />
    <script is:inline>
      (function () {
        var saved = localStorage.getItem("theme");
        var dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.dataset.theme = dark ? "dark" : "light";
      })();
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <Header />
    <main id="main-content"><slot /></main>
    <Footer />
  </body>
</html>
```

`Header.astro` con brand, nav (`/#work`, `/#experience`, `/blog/`, `/#contact`),
theme toggle (`data-theme-toggle`, `aria-pressed`) y un script que alterna
`data-theme` y guarda en `localStorage`.

`Footer.astro` con copyright y “Built with care. No template.”

`src/styles/global.css`: portar los tokens y componentes de
`C:\Users\xht\Desktop\portfolio-mockup\styles.css` (papel cálido, tinta, ámbar,
Inter/JetBrains, contenedor 1180, tarjetas, dark).

`src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout>
  <h1>Jose Paredes</h1>
</BaseLayout>
```

- [ ] **Step 5: Construir y ver pasar**

```powershell
npm run build
node --test test/content.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: scaffold Astro and the base layout"
```

---

### Task 3: Home — hero y proyectos seleccionados

**Files:**
- Create: `src/data/site.ts`, `src/data/projects.ts`
- Create: `src/components/Hero.astro`, `SectionHeader.astro`, `WorkCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 2.
- Produces: `Project` y `projects`; home con hero (variante A) y 6 cards.

- [ ] **Step 1: Definir los tipos y el test**

`src/data/projects.ts`:

```ts
export type ProjectLink = { label: string; url: string; external?: boolean };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: "ai-vision" | "data-automation" | "products" | "esports";
  year: string;
  image?: string;
  imageAlt?: string;
  links: ProjectLink[];
  href?: string;
  featured?: boolean;
  detail?: boolean;
  private?: boolean;
};
```

Añadir al test:

```js
test("the home shows the six selected projects", () => {
  const html = read("index.html");
  for (const title of ["subany.video", "CleanYourMail", "DocFlow", "Pro POV CS2", "trtw.tv", "CleanYourPhone"]) {
    assert.match(html, new RegExp(title));
  }
  assert.equal((html.match(/class="work-card"/g) || []).length, 6);
});

test("the home has the hero, the portrait and the contact links", () => {
  const html = read("index.html");
  assert.match(html, /class="hero"/);
  assert.match(html, /profile\.jpg/);
  assert.match(html, /github\.com\/jparedesDS/);
  assert.match(html, /mailto:jparedescolmenarejo@gmail\.com/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL.

- [ ] **Step 3: Rellenar `projects.ts` y `site.ts`**

Los 6 featured, con imágenes:
- `subany-video` → `/images/subany-video-thumb.png`
- `cleanyourmail` → `/images/cleanyourmail.png` y `href: "/cleanyourmail/"`
- `docflow-saas` → `/images/docflow.svg`
- `pro-pov-cs2` → `/images/propov-cs2.png`
- `trtw-tv` → `/images/trtw-tv.png`
- `cleanyourphone` → `/images/cleanyourphone-thumb.png`

El resto del archivo se rellena en Task 5. `site.ts` contiene nombre, rol,
ubicación, email, links, intro, disponibilidad, experiencia, writing y stack.

- [ ] **Step 4: Implementar Hero, SectionHeader, WorkCard y home**

`Hero.astro`: eyebrow con estado, `h1` Jose / Paredes, rol, intro, links y tarjeta
con `profile.jpg` y “Currently…”.

`SectionHeader.astro`: props `index`, `title`, `href?`, `linkLabel?`.

`WorkCard.astro`: props `project`; imagen o fallback con inicial y categoría;
título, resumen y chips; enlace a `project.href ?? /work/${project.slug}/`.
CleanYourMail usa `href: "/cleanyourmail/"`.

`index.astro`: hero + `SectionHeader index="01" title="Things I’ve built"` +
grid de 6 `WorkCard` con `projects.filter(p => p.featured)`.

- [ ] **Step 5: Construir y ver pasar**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: add the home hero and selected work"
```

---

### Task 4: Home — experiencia, writing, stack y contacto

**Files:**
- Create: `src/components/Experience.astro`, `WritingList.astro`, `Stack.astro`, `ContactPanel.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/data/site.ts`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 3.
- Produces: las secciones 02-05 de la home.

- [ ] **Step 1: Añadir tests**

```js
test("the home shows experience, writing and contact", () => {
  const html = read("index.html");
  assert.match(html, /EIPSA/);
  assert.match(html, /Comunicación Permanente/);
  assert.match(html, /How subany\.video works/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /Let’s build/);
  assert.match(html, /jparedescolmenarejo@gmail\.com/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL.

- [ ] **Step 3: Implementar las secciones**

`Experience.astro`: 3 filas con rol, empresa, descripción y fechas.

`WritingList.astro`: 2 filas (EN/ES) con fecha, título, etiqueta y enlace a
`https://jparedesds.github.io/blog/2026/11/09/.../`; “All writing” a `/blog/`.

`Stack.astro`: chips desde `site.stack`.

`ContactPanel.astro`: panel oscuro con email grande, GitHub, LinkedIn, Hugging Face,
Kaggle y Madrid.

`index.astro`: añadir las secciones con `SectionHeader` 02-05.

- [ ] **Step 4: Construir y ver pasar**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add .
git commit -m "feat: add experience, writing, stack and contact"
```

---

### Task 5: Archivo `/work/` completo

**Files:**
- Modify: `src/data/projects.ts`
- Create: `src/pages/work/index.astro`
- Create: `src/components/ArchiveGroup.astro`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 3-4.
- Produces: `projects` con los ~27 proyectos y `models` con 10 releases; página `/work/` agrupada.

- [ ] **Step 1: Añadir tests**

```js
test("the archive contains the current categories and model releases", () => {
  const html = read("work/index.html");
  for (const category of ["AI & Computer Vision", "Data & Automation", "Products & Tools", "Esports & Content", "Model releases"]) {
    assert.match(html, new RegExp(category));
  }
  assert.match(html, /OCR Weapon Detection/);
  assert.match(html, /Polymarket/);
  assert.match(html, /Private project/);
  assert.doesNotMatch(html, /href="[^"]*polymarket/i);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL.

- [ ] **Step 3: Importar el archivo**

Leer `projects/ai-vision/index.md`, `projects/data-automation/index.md`,
`projects/products/index.md` y `projects/esports/index.md` del repo actual.
Añadir cada entrada a `projects` con su categoría, año, imagen, enlaces y
`private: true` en Polymarket. Añadir los 10 model releases a `models` con
`name`, `description`, `version`, `year`, `links`.

`src/pages/work/index.astro`: `SectionHeader` + grupos por categoría con
`ArchiveGroup` + sección “Model releases” compacta.

- [ ] **Step 4: Construir y ver pasar**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add .
git commit -m "feat: add the complete work archive"
```

---

### Task 6: Casos de proyecto

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/cases/{subany-video,docflow-saas,pro-pov-cs2,trtw-tv,cleanyourphone}.md`
- Create: `src/pages/work/[slug].astro`
- Create: `src/components/ProjectLinks.astro`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 3-5.
- Produces: 5 rutas `/work/<slug>/` con título, resumen, imagen, enlaces y Markdown.

- [ ] **Step 1: Añadir tests**

```js
test("the five new cases build", () => {
  for (const slug of ["subany-video", "docflow-saas", "pro-pov-cs2", "trtw-tv", "cleanyourphone"]) {
    assert.ok(fs.existsSync(path.join(dist, "work", slug, "index.html")), slug);
  }
});

test("the DocFlow case is public-safe", () => {
  const html = read("work/docflow-saas/index.html");
  assert.match(html, /DocFlow/);
  for (const name of ["AYESA", "SACYR", "Hyundai", "eGesdoc", "Aconex", "Sendoc", "PRODOC"]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
```

Expected: FAIL.

- [ ] **Step 3: Recuperar y limpiar el contenido**

```powershell
$tmp = Join-Path $env:TEMP "projects-old"
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
git clone https://github.com/jparedesDS/jparedesDS.github.io.git $tmp
git -C $tmp fetch origin 96c2255
git -C $tmp show 96c2255:_projects/subany-video.md
```

Repetir para `docflow-saas`, `pro-pov-cs2`, `trtw-tv`, `cleanyourphone`. Usar el
cuerpo como base y recortar a problema, enfoque y resultado. **DocFlow**: quitar
clientes, portales, nombres de integraciones y detalles internos del ERP.

- [ ] **Step 4: Crear la colección y la página**

`src/content/config.ts`:

```ts
import { defineCollection, z } from "astro:content";

const cases = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z.enum(["ai-vision", "data-automation", "products", "esports"]),
    year: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string(), external: z.boolean().optional() })).default([]),
    order: z.number().default(99),
  }),
});

export const collections = { cases };
```

`src/pages/work/[slug].astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const cases = await getCollection("cases");
  return cases.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}
const { entry } = Astro.props;
const { Content } = await entry.render();
---
<BaseLayout title={`${entry.data.title} — Jose Paredes`} description={entry.data.summary}>
  <article class="case">
    <a class="back-link" href="/work/">← Work</a>
    <p class="case-kicker">{entry.data.category} · {entry.data.year}</p>
    <h1>{entry.data.title}</h1>
    <p class="case-summary">{entry.data.summary}</p>
    {entry.data.image && <img src={entry.data.image} alt={entry.data.imageAlt} width="1200" height="630" />}
    <ProjectLinks links={entry.data.links} />
    <div class="prose"><Content /></div>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Construir y ver pasar**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: add the five project cases"
```

---

### Task 7: Legacy CleanYourMail, sub-sitios y assets

**Files:**
- Create: `public/cleanyourmail/`, `public/css/`, `public/js/`
- Create: `public/cs2pov/`, `public/murdoku/`, `public/propovcs2/`
- Create: `public/images/`, `public/profile.jpg`, `public/resume.pdf`
- Create: `public/google75a8559a473af765.html`, `public/tiktok...txt`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 2.
- Produces: la página legacy y los sub-sitios sirviéndose desde Astro.

- [ ] **Step 1: Añadir tests**

```js
test("the legacy case and the sub-sites are preserved", () => {
  assert.ok(fs.existsSync(path.join(dist, "cleanyourmail/index.html")));
  assert.ok(fs.existsSync(path.join(dist, "css/main.css")));
  assert.match(read("cleanyourmail/index.html"), /CleanYourMail/);
  for (const sub of ["cs2pov", "murdoku", "propovcs2"]) {
    assert.ok(fs.existsSync(path.join(dist, sub, "index.html")), sub);
  }
});
```

- [ ] **Step 2: Snapshot del `gh-pages` actual**

```powershell
git fetch origin gh-pages
git worktree add .legacy-gh-pages origin/gh-pages
```

Copiar desde `.legacy-gh-pages`:

```powershell
Copy-Item -Recurse -Force ".legacy-gh-pages\cleanyourmail" "public\cleanyourmail"
Copy-Item -Recurse -Force ".legacy-gh-pages\css" "public\css"
Copy-Item -Recurse -Force ".legacy-gh-pages\js" "public\js"
Copy-Item -Recurse -Force ".legacy-gh-pages\cs2pov" "public\cs2pov"
Copy-Item -Recurse -Force ".legacy-gh-pages\murdoku" "public\murdoku"
Copy-Item -Recurse -Force ".legacy-gh-pages\propovcs2" "public\propovcs2"
Copy-Item -Recurse -Force ".legacy-gh-pages\images" "public\images"
Copy-Item ".legacy-gh-pages\profile.jpg" "public\profile.jpg"
Copy-Item ".legacy-gh-pages\resume.pdf" "public\resume.pdf"
```

Copiar también `google75a8559a473af765.html` y el `.txt` de TikTok. Eliminar el
worktree `.legacy-gh-pages` al terminar.

- [ ] **Step 3: Comprobar el legacy**

```powershell
npm run build
node --test test/content.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add public
git commit -m "chore: preserve the legacy case and sub-sites"
```

---

### Task 8: Redirects y anclas antiguas

**Files:**
- Create: `public/projects/index.html`
- Create: `public/projects/{ai-vision,data-automation,products,esports}/index.html`
- Modify: `src/pages/index.astro`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: Task 5.
- Produces: `/projects/` y categorías redirigen a `/work/`; `/#projects` sigue existiendo.

- [ ] **Step 1: Añadir tests**

```js
test("legacy project URLs redirect to /work/", () => {
  assert.match(read("projects/index.html"), /url=\/work\//);
  for (const category of ["ai-vision", "data-automation", "products", "esports"]) {
    assert.match(read(`projects/${category}/index.html`), /url=\/work\/#/);
  }
});

test("the old #projects anchor still exists", () => {
  assert.match(read("index.html"), /id="projects"/);
});
```

- [ ] **Step 2: Implementar los redirects**

Cada `public/projects/.../index.html` es HTML estático con
`<meta http-equiv="refresh" content="0; url=/work/">` y un enlace visible.
Añadir en la home `<span id="projects"></span>` antes de la sección de trabajo.

- [ ] **Step 3: Construir y ver pasar**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add .
git commit -m "feat: redirect legacy project URLs"
```

- [ ] **Step 5: Limpiar los restos de Jekyll**

Con `public/` ya completo y los redirects creados, borrar el source antiguo:

```powershell
Remove-Item -Recurse -Force index.md, projects, css, js, _data, _includes, _layouts, _sass, _posts, cleanyourmail, cs2pov, murdoku, propovcs2, Gemfile, Gemfile.lock, _config.yml -ErrorAction SilentlyContinue
npm run build
node --test test/content.test.mjs
```

Expected: PASS; el build sigue encontrando todo en `public/`.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "chore: remove the old Jekyll source"
```

---

### Task 9: SEO, accesibilidad y responsive

**Files:**
- Create: `src/pages/sitemap.xml.ts`
- Create: `public/robots.txt`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `test/playwright.config.js`, `test/a11y.spec.js`, `test/responsive.spec.js`
- Modify: `test/content.test.mjs`

**Interfaces:**
- Consumes: todas las páginas.
- Produces: sitemap, JSON-LD, axe limpio y cero overflow.

- [ ] **Step 1: Añadir tests**

`test/content.test.mjs`:

```js
test("the sitemap and robots exist", () => {
  assert.ok(fs.existsSync(path.join(dist, "sitemap.xml")));
  assert.ok(fs.existsSync(path.join(dist, "robots.txt")));
});

test("the home has Person JSON-LD", () => {
  assert.match(read("index.html"), /"@type": "Person"/);
});
```

`test/a11y.spec.js`:

```js
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of ["/", "/work/", "/work/subany-video/", "/cleanyourmail/"]) {
  test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

`test/responsive.spec.js`:

```js
import { test, expect } from "@playwright/test";

for (const width of [360, 768, 1440]) {
  for (const path of ["/", "/work/", "/work/docflow-saas/"]) {
    test(`${path} does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
}
```

`test/playwright.config.js`:

```js
const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: __dirname,
  use: { baseURL: "http://127.0.0.1:4321" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```powershell
npm test
npx playwright test --config test/playwright.config.js
```

Expected: FAIL por sitemap/JSON-LD o por axe/overflow.

- [ ] **Step 3: Implementar sitemap, robots y JSON-LD**

`sitemap.xml.ts`: recorrer `/`, `/work/`, los 5 casos, `/cleanyourmail/` y los
sub-sitios; devolver XML con `site` y `pathname`.

`robots.txt`:

```text
User-agent: *
Allow: /
Sitemap: https://jparedesds.github.io/sitemap.xml
```

`BaseLayout.astro`: añadir JSON-LD `Person` con nombre, rol, URL, sameAs; Open Graph
(`og:title`, `og:description`, `og:image`, `og:url`).

- [ ] **Step 4: Corregir axe y overflow**

Ajustar contraste, labels, foco y CSS hasta que axe y responsive pasen. No
desactivar reglas.

- [ ] **Step 5: Ejecutar y ver pasar**

```powershell
npm test
npx playwright test --config test/playwright.config.js
npm run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "test: add SEO, a11y and responsive checks"
```

---

### Task 10: Desplegar y verificar en producción

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Create: `NOTICE`

**Interfaces:**
- Consumes: Task 1-9 y el blog ya desplegado.
- Produces: portfolio Astro en `https://jparedesds.github.io/`.

- [ ] **Step 1: Workflow**

```yaml
name: Deploy portfolio
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
      - uses: actions/setup-node@v7
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - run: touch dist/.nojekyll
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
          clean: true
```

`NOTICE`: atribución MIT a `ncdai/chanhdai.com` por los patrones visuales.
`README.md`: estructura, comandos (`npm run dev`, `npm run build`, `npm test`) y
nota de que el blog vive en `/blog/`.

- [ ] **Step 2: Verificar el build de producción**

```powershell
npm ci
npm run build
npm test
npx playwright test --config test/playwright.config.js
```

Expected: PASS.

- [ ] **Step 3: Publicar la rama y fusionar**

```powershell
git add .
git commit -m "ci: deploy the Astro portfolio"
git push -u origin feat/astro-portfolio
gh pr create --repo jparedesDS/jparedesDS.github.io --base main --head jparedesDS:feat/astro-portfolio --title "Astro portfolio" --body "Home A, 5 casos, archivo completo, legacy CleanYourMail y redirects."
```

Revisar, fusionar y esperar `Deploy portfolio`.

- [ ] **Step 4: Verificar rutas**

```powershell
$urls = @(
  "https://jparedesds.github.io/",
  "https://jparedesds.github.io/work/",
  "https://jparedesds.github.io/work/subany-video/",
  "https://jparedesds.github.io/work/docflow-saas/",
  "https://jparedesds.github.io/cleanyourmail/",
  "https://jparedesds.github.io/resume.pdf",
  "https://jparedesds.github.io/cs2pov/",
  "https://jparedesds.github.io/murdoku/",
  "https://jparedesds.github.io/propovcs2/",
  "https://jparedesds.github.io/projects/",
  "https://jparedesds.github.io/projects/ai-vision/",
  "https://jparedesds.github.io/blog/"
)
foreach ($url in $urls) {
  $code = curl.exe -s -o NUL -w "%{http_code}" $url
  Write-Output "$code $url"
}
```

Expected: `200` en todas.

- [ ] **Step 5: Revisión visual**

Abrir la home en Chrome a 1440 y 360, claro y oscuro. Comprobar:
- 6 cards, imágenes correctas, sin recortes raros.
- Writing enlaza al blog y a los dos posts.
- `/cleanyourmail/` mantiene su caso y sus assets.
- `/projects/ai-vision/` redirige a `/work/`.
- Sin scroll horizontal.

- [ ] **Step 6: Commit final**

Si hubo ajustes:

```powershell
git add .
git commit -m "fix: verify the Astro portfolio in production"
git push origin main
```
