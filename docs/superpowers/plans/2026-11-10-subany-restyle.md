# Subany Restyle — Portfolio + Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la identidad visual de subany.site al portfolio y al blog, compactar Selected work a 8 tarjetas 4×2, convertir experiencia en una cronología única y reestructurar el blog como Lilian Weng.

**Architecture:** Dos ramas independientes, una por repo. El portfolio sigue en Astro + CSS propio; el blog sigue en Hugo PaperMod. Ambos comparten los mismos tokens de color y la misma tipografía Inter Variable, pero se implementan y despliegan por separado.

**Tech Stack:** Astro 7, TypeScript, CSS moderno, `@fontsource-variable/inter`, Playwright + axe; Hugo 0.169, PaperMod, CSS extendido.

**Spec:** `docs/superpowers/specs/2026-11-10-subany-restyle-design.md`

## Global Constraints

- Paleta claro: fondo `#c9ae8c`, superficie `#d6bfa0`, borde `#b69a75`, texto `#1c1915`, texto suave `#3f382f`, marcador `#4a4238`, botón `#1c1915`/`#d6bfa0`, foco `#8e0f42`.
- Paleta oscuro: fondo `#3a3633`, superficie `#45403c`, borde `#5a544f`, texto `#ede3d3`, texto suave `#c4b9a8`, marcador `#c0b5a4`, botón `#1c1915`/`#ede3d3`, foco `#ff5a94`.
- Degradado `linear-gradient(90deg, #ff8a00, #ff2d78)` solo en detalles.
- Inter Variable en toda la interfaz; JetBrains Mono solo en `code`/`pre`.
- Sin React, Tailwind, Next.js, analytics, comentarios, newsletter ni CMS.
- Sin hex nuevos fuera de los tokens; los derivados usan `color-mix`.
- Selected work: 8 tarjetas, 4 columnas desktop / 2 tablet / 1 móvil. Fuera `trtw.tv`; dentro HLTV Scraper, DXF Data Extraction y Welding Defects Detector.
- Cronología de más reciente a más antiguo, mezclando trabajo, educación e hitos.
- Blog: estructura Lilian Weng (bienvenida + lista), menú Posts / Archive / Search / Tags / FAQ.
- No tocar `/cleanyourmail/`, los sub-sitios ni el contenido de los casos.
- No publicar hasta que build, tests, axe y revisión visual estén verdes.

## Review Focus

- **Grid de 4 columnas:** a 1440 debe haber 4 tarjetas por fila, a 768 dos y a 360 una, sin overflow.
- **Tarjetas externas:** las tres nuevas deben abrir GitHub en otra pestaña, nunca un `/work/<slug>/` que no existe.
- **Contraste oscuro:** texto, metadatos, bordes y focus deben seguir legibles sobre `#3a3633`.
- **Cronología:** un periodo con varias entradas no debe solaparse ni desbordar a 360.
- **Blog:** la home no debe seguir renderizando la tarjeta de perfil ni un menú con About.

---

### Task 0: Worktrees, docs y base

**Files:**
- Create: `.worktrees/subany-restyle` (portfolio)
- Create: `.worktrees/lilian-structure` (blog)
- Create: `docs/superpowers/specs/2026-11-10-subany-restyle-design.md` (both worktrees)
- Create: `docs/superpowers/plans/2026-11-10-subany-restyle.md` (both worktrees)

**Interfaces:**
- Consumes: design aprobado.
- Produces: ramas `feat/subany-restyle` y `feat/lilian-structure`, tags de backup y documentos dentro de cada repo.

- [ ] **Step 1: Crear el worktree del portfolio**

```powershell
cd C:\Users\xht\Desktop\jparedesDS.github.io
git tag pre-subany-restyle
git push origin pre-subany-restyle
git worktree add .worktrees\subany-restyle -b feat/subany-restyle
```

- [ ] **Step 2: Crear el worktree del blog**

```powershell
cd C:\Users\xht\Desktop\blog
git tag pre-lilian-structure
git push origin pre-lilian-structure
git worktree add .worktrees\lilian-structure -b feat/lilian-structure
```

- [ ] **Step 3: Copiar diseño y plan a ambos worktrees**

Portfolio:
```powershell
cd C:\Users\xht\Desktop\jparedesDS.github.io\.worktrees\subany-restyle
New-Item -ItemType Directory -Force docs\superpowers\specs, docs\superpowers\plans | Out-Null
Copy-Item C:\Users\xht\Desktop\jparedesDS.github.io\docs\superpowers\specs\2026-11-10-subany-restyle-design.md docs\superpowers\specs\
Copy-Item C:\Users\xht\Desktop\jparedesDS.github.io\docs\superpowers\plans\2026-11-10-subany-restyle.md docs\superpowers\plans\
```

Blog:
```powershell
cd C:\Users\xht\Desktop\blog\.worktrees\lilian-structure
New-Item -ItemType Directory -Force docs\superpowers\specs, docs\superpowers\plans | Out-Null
Copy-Item C:\Users\xht\Desktop\jparedesDS.github.io\docs\superpowers\specs\2026-11-10-subany-restyle-design.md docs\superpowers\specs\
Copy-Item C:\Users\xht\Desktop\jparedesDS.github.io\docs\superpowers\plans\2026-11-10-subany-restyle.md docs\superpowers\plans\
```

- [ ] **Step 4: Ignorar worktrees y commitear docs**

En cada repo, añadir `.worktrees/` a `.gitignore` si no está, y:
```powershell
git add .gitignore docs
git commit -m "docs: add the subany restyle design and plan"
```

- [ ] **Step 5: Verificar**

Run: `git worktree list` en ambos repos.
Expected: cada worktree aparece en su rama; `git status --short` limpio tras el commit.

---

### Task 1: Portfolio — tokens, tipografía, líneas y retrato

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/layouts/BaseLayout.astro:1-12`
- Modify: `src/styles/global.css:1-36`, header/section/portrait blocks
- Test: `test/visual.spec.js` (create)

**Interfaces:**
- Consumes: Task 0.
- Produces: tokens `--bg`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-soft`, `--panel`, `--panel-ink`, `--panel-muted`, `--focus`, `--gradient`; `--label` para microcopy; `.page` sin bordes laterales; `.portrait` circular.

- [ ] **Step 1: Escribir el test de shell y paleta**

`test/visual.spec.js`:
```js
import { test, expect } from "@playwright/test";

test("the page has no vertical frame and a round portrait", async ({ page }) => {
  await page.goto("/");
  const s = await page.evaluate(() => {
    const pageEl = document.querySelector(".page");
    const portrait = document.querySelector(".portrait");
    return {
      left: getComputedStyle(pageEl).borderLeftWidth,
      right: getComputedStyle(pageEl).borderRightWidth,
      radius: getComputedStyle(portrait).borderRadius,
    };
  });
  expect(s.left).toBe("0px");
  expect(s.right).toBe("0px");
  expect(s.radius).toBe("50%");
});

test("the light palette and Inter Variable match subany", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto("/");
  const s = await page.evaluate(() => ({
    bg: getComputedStyle(document.body).backgroundColor,
    font: getComputedStyle(document.body).fontFamily,
  }));
  expect(s.bg).toBe("rgb(201, 174, 140)");
  expect(s.font).toContain("Inter Variable");
});

test("the dark palette matches subany", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(58, 54, 51)");
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npx playwright test --config test/playwright.config.js test/visual.spec.js`
Expected: FAIL en bordes, radio, fondo y fuente.

- [ ] **Step 3: Instalar Inter Variable**

```powershell
npm install @fontsource-variable/inter
npm uninstall @fontsource/inter
```

En `BaseLayout.astro`, sustituir los imports de `@fontsource/inter/400..700.css` por:
```astro
import "@fontsource-variable/inter";
```
Mantener `@fontsource/jetbrains-mono/400.css`.

- [ ] **Step 4: Reescribir los tokens**

En `global.css`, `:root` y `html[data-theme="dark"]` deben quedar con los valores del diseño. Añadir:
```css
--focus: #8e0f42;
--gradient: linear-gradient(90deg, #ff8a00, #ff2d78);
--label: "Inter Variable", "Segoe UI", system-ui, sans-serif;
--mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
--sans: "Inter Variable", "Segoe UI", system-ui, sans-serif;
```
`--surface-2: color-mix(in srgb, var(--surface) 78%, var(--border));`
`--accent: var(--focus);`
`--accent-soft: color-mix(in srgb, var(--surface) 80%, var(--focus) 20%);`

En oscuro: `--focus: #ff5a94`.

- [ ] **Step 5: Cambiar microcopy a Inter y quitar el marco**

Reemplazar `font-family: var(--mono)` por `font-family: var(--label)` en todos los usos de interfaz (eyebrow, kickers, metadatos, fechas, links, chips, archive, case). Añadir al final:
```css
.prose code,
.prose pre,
.case code,
.case pre {
  font-family: var(--mono);
}
```
En `.page`, borrar `border-inline: 1px solid var(--line);`.
En `.portrait` y en el override móvil, `border-radius: 50%`.

Sustituir los hex antiguos hardcodeados por tokens:
- `.status-dot`: `background: var(--gradient)` y sombra basada en `--focus`.
- `.work-media img[src$=".svg"]`: `background: var(--surface-2)`.
- `.work-media[data-project="cleanyourmail"]` y `[data-project="pro-pov-cs2"]`:
  `background: var(--surface-2)` o `color-mix` de superficie y borde.
- Cualquier `#0f172a`, `#0f1512`, `#0a0a0a`, `#3f8f5a` que quede en
  `global.css` se sustituye por tokens; no se añaden hex nuevos.

- [ ] **Step 6: Ejecutar y ver pasar**

Run:
```
npm test
npx playwright test --config test/playwright.config.js
```
Expected: PASS; 31 Node tests + los nuevos visuales.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json src test
git commit -m "feat: apply the subany palette and type"
```

---

### Task 2: Portfolio — 8 tarjetas 4×2

**Files:**
- Modify: `src/data/projects.ts` (trtw, hltv, dxf, welding)
- Modify: `src/components/WorkCard.astro`
- Modify: `src/styles/global.css` (`.work-grid`, `.work-card`, `.work-media`, `.work-body`, chips)
- Modify: `test/content.test.mjs`
- Modify: `test/visual.spec.js`

**Interfaces:**
- Consumes: Task 1.
- Produces: 8 `featured`; `href` externo en las tres nuevas; grid 4/2/1.

- [ ] **Step 1: Añadir los tests de contenido**

En `test/content.test.mjs`:
```js
test("the home shows the eight selected projects", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="work-card"/g) || []).length, 8);
  for (const title of [
    "subany.video",
    "CleanYourMail",
    "DocFlow",
    "Pro POV CS2",
    "CleanYourPhone",
    "HLTV Team &amp; Player Stats Scraper",
    "Technical Drawing Data Extraction",
    "Welding Defects Detector",
  ]) {
    assert.ok(html.includes(title), title);
  }
  assert.doesNotMatch(html, /href="\/work\/trtw-tv\/"/);
  assert.match(html, /https:\/\/github\.com\/jparedesDS\/hltv-scraper/);
  assert.match(html, /https:\/\/github\.com\/jparedesDS\/extract-data-dxf/);
  assert.match(html, /https:\/\/github\.com\/jparedesDS\/welding-defects-detection/);
});
```

En `test/visual.spec.js`:
```js
for (const [width, columns] of [[1440, 4], [768, 2], [360, 1]]) {
  test(`the work grid has ${columns} columns at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const count = await page.evaluate(
      () => getComputedStyle(document.querySelector(".work-grid")).gridTemplateColumns.split(" ").length,
    );
    expect(count).toBe(columns);
  });
}
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npm test` y `npx playwright test --config test/playwright.config.js test/visual.spec.js`.
Expected: FAIL por 6 tarjetas, trtw presente y columnas.

- [ ] **Step 3: Ajustar los datos**

En `projects.ts`:
- `trtw-tv`: quitar `featured: true`; conservar `href`, `detail`, links y tags.
- `hltv-scraper`: añadir `href: "https://github.com/jparedesDS/hltv-scraper"`, `featured: true`, `tags: ["Python", "Scraping", "Pandas"]`.
- `dxf-data-extraction`: añadir `href: "https://github.com/jparedesDS/extract-data-dxf"`, `featured: true`, `tags: ["Python", "Deep Learning", "CAD"]`.
- `welding-defects-detection`: añadir `href: "https://github.com/jparedesDS/welding-defects-detection"`, `featured: true`, `tags: ["YOLO11", "Python", "Computer Vision"]`.

- [ ] **Step 4: WorkCard externo y compacto**

En `WorkCard.astro`:
```astro
const external = href.startsWith("http");
...
<a class="work-card" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
```
Mostrar como máximo dos chips: `{tags.slice(0, 2).map(...)}`.

En `global.css`:
```css
.work-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.work-media { aspect-ratio: 16 / 10; }
.work-body { padding: 12px 13px 14px; }
.work-body h3 { font-size: 17px; margin: 8px 0 5px; }
.work-body p { font-size: 12.5px; line-height: 1.45; }
.work-body .chips { margin-top: 10px; gap: 4px; }
.work-body .chips span { font-size: 9.5px; padding: 3px 6px; }
```
En `@media (max-width: 980px)`: `repeat(2, ...)`.
En `@media (max-width: 760px)`: `grid-template-columns: 1fr`.

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npm test` y Playwright.
Expected: PASS; 8 tarjetas y 4/2/1 columnas.

- [ ] **Step 6: Commit**

```powershell
git add src test
git commit -m "feat: compact selected work to eight cards"
```

---

### Task 3: Portfolio — cronología única

**Files:**
- Modify: `src/data/site.ts`
- Create: `src/components/Timeline.astro`
- Delete: `src/components/Experience.astro`
- Modify: `src/pages/index.astro:6,32-35`
- Modify: `src/styles/global.css` (bloque Experience → Timeline)
- Modify: `test/content.test.mjs`
- Modify: `test/visual.spec.js`

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: `TimelineKind`, `TimelineEntry`, `TimelinePeriod`, `site.timeline`; componente `Timeline` sin props.

- [ ] **Step 1: Añadir el test de cronología**

En `test/content.test.mjs`:
```js
test("the timeline combines work, education and milestones", () => {
  const html = read("index.html");
  for (const text of [
    "Work, education &amp; milestones",
    "EIPSA",
    "Comunicación Permanente",
    "Grupo ANOVO",
    "The Bridge",
    "Padre Piquer",
    "Kaggle",
    "DocFlow",
    "Pro POV CS2",
    "subany.video",
    "CleanYourMail",
    "CleanYourPhone",
  ]) {
    assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /class="timeline"/);
});
```

En `test/visual.spec.js`:
```js
test("the timeline does not overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `npm test` y Playwright.
Expected: FAIL por la sección antigua.

- [ ] **Step 3: Añadir los tipos y los datos**

En `site.ts`, sustituir `ExperienceItem`/`experience` por:
```ts
export type TimelineKind = "work" | "education" | "milestone";
export type TimelineEntry = {
  kind: TimelineKind;
  title: string;
  org?: string;
  description: string;
  href?: string;
};
export type TimelinePeriod = { period: string; entries: TimelineEntry[] };
```
Añadir `timeline: TimelinePeriod[]` a `Site` y los datos exactos del diseño:
- 2026: subany.video (`/work/subany-video/`), CleanYourMail (`/cleanyourmail/`), CleanYourPhone (`/work/cleanyourphone/`).
- 2024 — Now: EIPSA; DocFlow (`/work/docflow-saas/`); YOLO inspection models (`https://huggingface.co/jparedesDS/welding-defects-detection`); Pro POV CS2 (`/work/pro-pov-cs2/`).
- 2021 — 2023: Comunicación Permanente; The Bridge bootcamp; Kaggle Bronze Medal (`https://www.kaggle.com/competitions/comp-mediavida-2-futurama/leaderboard`).
- 2015 — 2020: Grupo ANOVO.
- 2010 — 2012: Advanced Vocational Degree in Telecommunications, Centro de Formación Padre Piquer.

- [ ] **Step 4: Crear `Timeline.astro` y usarlo**

`Timeline.astro`:
```astro
---
import { site } from "../data/site";
const labels = { work: "Work", education: "Education", milestone: "Milestone" } as const;
---
<div class="timeline">
  {site.timeline.map((period) => (
    <div class="timeline-period">
      <span class="timeline-years">{period.period}</span>
      <div class="timeline-entries">
        {period.entries.map((entry) => (
          <div class="timeline-entry">
            <span class="timeline-kind">{labels[entry.kind]}</span>
            <h3>
              {entry.href ? <a href={entry.href}>{entry.title}</a> : entry.title}
              {entry.org && <span class="timeline-org">{entry.org}</span>}
            </h3>
            <p>{entry.description}</p>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```
En `index.astro`: importar `Timeline`, borrar `Experience`, cambiar el título a `Work, education & milestones` y renderizar `<Timeline />`. Borrar `Experience.astro`.

- [ ] **Step 4: CSS de la cronología**

Sustituir `.experience`/`.exp-*` por `.timeline`, `.timeline-period`, `.timeline-years`, `.timeline-entries`, `.timeline-entry`, `.timeline-kind`, `.timeline-org`. Desktop: periodo 150px + entradas; cada periodo con `border-top` y padding. Móvil: una columna, periodo arriba. Enlaces con subrayado y hover en `--accent`.

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npm test` y Playwright.
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src test
git commit -m "feat: combine work, education and milestones into a timeline"
```

---

### Task 4: Blog — estructura Lilian Weng

**Files:**
- Modify: `hugo.toml`
- Delete: `layouts/index.html`
- Create: `content/faq.md`
- Modify: `layouts/_partials/post_meta.html`
- Modify: `test/blog.test.mjs`

**Interfaces:**
- Consumes: Task 0.
- Produces: home en modo lista, menú Posts/Archive/Search/Tags/FAQ, FAQ page, metadatos Date/Reading Time/Author.

- [ ] **Step 1: Añadir los tests**

En `test/blog.test.mjs`:
```js
test("the home uses the Lilian Weng list structure", () => {
  const html = read("index.html");
  assert.match(html, /class="first-entry home-info"/);
  assert.match(html, /Welcome/);
  assert.doesNotMatch(html, /class="profile"/);
  assert.doesNotMatch(html, /profile\.jpg/);
});

test("the menu is Posts, Archive, Search, Tags, FAQ", () => {
  const html = read("index.html");
  const menu = html.match(/<ul id="menu">([\s\S]*?)<\/ul>/)[1];
  const labels = [...menu.matchAll(/<span[^>]*>([^<]+)<\/span>/g)].map((m) => m[1].trim());
  assert.deepEqual(labels, ["Posts", "Archive", "Search", "Tags", "FAQ"]);
});

test("the FAQ page exists", () => {
  assert.ok(fs.existsSync(path.join(site, "faq/index.html")));
});

test("post metadata uses Date, Reading Time and Author", () => {
  const html = read("2026/11/09/how-subany-video-works/index.html");
  assert.match(html, /Date:/);
  assert.match(html, /Estimated Reading Time:/);
  assert.match(html, /Author:/);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run:
```powershell
$env:PATH = "C:\Users\xht\AppData\Local\Microsoft\WinGet\Packages\Hugo.Hugo.Extended_Microsoft.Winget.Source_8wekyb3d8bbwe;$env:PATH"
npm test
```
Expected: FAIL en home/menu/FAQ/metadatos.

- [ ] **Step 3: Configurar PaperMod**

En `hugo.toml`:
- `paginate = 20` → `[pagination] pagerSize = 10`.
- Añadir `mainSections = ["posts"]`.
- `profileMode.enabled = false`.
- Añadir:
```toml
[params.homeInfoParams]
  Title = "👋 Welcome"
  Content = "I write about data, computer vision, automation and local-first AI products."
```
- Menú: Posts weight 1, Archive 2, Search 3, Tags 4, FAQ 5. Quitar About del menú.

- [ ] **Step 4: Eliminar el layout custom y añadir FAQ**

Borrar `layouts/index.html` para que PaperMod use `list.html`.
Crear `content/faq.md` con `title`, `url: /faq/`, `summary: faq` y 5 preguntas: quién soy, de qué escribo, puedo usar el código, cómo contacto, por qué hay posts en español.

- [ ] **Step 5: Formato de metadatos**

En `layouts/_partials/post_meta.html`, construir el footer como:
`Date: <time datetime="...">…</time> | Estimated Reading Time: N min | Author: Jose Paredes`
usando `&nbsp;|&nbsp;` como separador. Mantener el badge `.post-lang` al final.

- [ ] **Step 6: Ejecutar y ver pasar**

Run: `npm test`.
Expected: PASS; 8 tests existentes + los nuevos.

- [ ] **Step 7: Commit**

```powershell
git add hugo.toml content layouts test
git commit -m "feat: adopt the Lilian Weng blog structure"
```

---

### Task 5: Blog — paleta subany e Inter Variable

**Files:**
- Create: `static/fonts/inter-var.woff2`
- Modify: `assets/css/extended/custom.css`
- Modify: `test/blog.test.mjs`

**Interfaces:**
- Consumes: Task 4.
- Produces: variables PaperMod mapeadas a subany; `@font-face` Inter Variable.

- [ ] **Step 1: Copiar la fuente**

Desde el portfolio (Task 1 ya instaló `@fontsource-variable/inter`):
```powershell
New-Item -ItemType Directory -Force C:\Users\xht\Desktop\blog\.worktrees\lilian-structure\static\fonts | Out-Null
Copy-Item C:\Users\xht\Desktop\jparedesDS.github.io\.worktrees\subany-restyle\node_modules\@fontsource-variable\inter\files\inter-latin-wght-normal.woff2 C:\Users\xht\Desktop\blog\.worktrees\lilian-structure\static\fonts\inter-var.woff2
```

- [ ] **Step 2: Añadir el test de paleta**

En `test/blog.test.mjs`:
```js
test("the blog uses the subany palette and Inter Variable", () => {
  const cssFile = fs.readdirSync(path.join(site, "assets/css")).find((f) => f.startsWith("stylesheet."));
  const css = fs.readFileSync(path.join(site, "assets/css", cssFile), "utf8");
  for (const value of ["#c9ae8c", "#d6bfa0", "#1c1915", "#b69a75", "#3a3633", "#45403c", "#ede3d3", "#5a544f"]) {
    assert.ok(css.includes(value), value);
  }
  assert.match(css, /Inter Variable/);
});
```

- [ ] **Step 3: Ejecutar y ver fallar**

Run: `npm test`.
Expected: FAIL por colores/fuente.

- [ ] **Step 4: Escribir el CSS**

En `custom.css`, añadir `@font-face`:
```css
@font-face {
  font-family: "Inter Variable";
  src: url("/blog/fonts/inter-var.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
body { font-family: "Inter Variable", "Segoe UI", system-ui, sans-serif; }
code, pre { font-family: "JetBrains Mono", ui-monospace, monospace; }
```
Mapear:
```css
:root {
  --theme: #c9ae8c;
  --entry: #d6bfa0;
  --primary: #1c1915;
  --secondary: #3f382f;
  --tertiary: #4a4238;
  --content: #1c1915;
  --border: #b69a75;
  --code-bg: #bfa47f;
  --hljs-bg: #d6bfa0;
}
.dark {
  --theme: #3a3633;
  --entry: #45403c;
  --primary: #ede3d3;
  --secondary: #c4b9a8;
  --tertiary: #c0b5a4;
  --content: #ede3d3;
  --border: #5a544f;
  --code-bg: #2f2b29;
  --hljs-bg: #2f2b29;
}
```
Añadir hover/focus con `#8e0f42` claro y `#ff5a94` oscuro. Mantener `.post-lang` con los nuevos tokens.

- [ ] **Step 5: Ejecutar y ver pasar**

Run: `npm test`.
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add assets static test
git commit -m "feat: apply the subany palette to the blog"
```

---

### Task 6: Portfolio — verificación y PR

**Files:** ninguno si todo pasa; posibles ajustes de CSS/test.

**Interfaces:**
- Consumes: Tasks 1-3.
- Produces: rama `feat/subany-restyle` verde y PR abierto (sin merge).

- [ ] **Step 1: Suite completa**

```powershell
npm test
npx playwright test --config test/playwright.config.js
npm run check
```
Expected: PASS.

- [ ] **Step 2: Auditoría de enlaces e imágenes**

Reutilizar el script de auditoría de `dist/`: 0 assets locales missing; solo `/feed.xml` legacy y `/blog/` externos.

- [ ] **Step 3: Revisión visual**

Capturar 1440 claro, 360 claro, 1440 oscuro y `/work/`. Comprobar 8 tarjetas en 4×2, retrato circular, sin líneas verticales, cronología legible y paleta.

- [ ] **Step 4: Publicar rama y PR**

```powershell
git push -u origin feat/subany-restyle
gh pr create --repo jparedesDS/jparedesDS.github.io --base main --head feat/subany-restyle --title "Subany restyle" --body "Palette/type, 8 compact cards, combined timeline."
```
No fusionar hasta la revisión final.

---

### Task 7: Blog — verificación y PR

**Files:** ninguno si todo pasa.

**Interfaces:**
- Consumes: Tasks 4-5.
- Produces: rama `feat/lilian-structure` verde y PR abierto (sin merge).

- [ ] **Step 1: Suite completa**

```powershell
$env:PATH = "C:\Users\xht\AppData\Local\Microsoft\WinGet\Packages\Hugo.Hugo.Extended_Microsoft.Winget.Source_8wekyb3d8bbwe;$env:PATH"
npm test
```
Expected: PASS.

- [ ] **Step 2: Revisión visual**

Capturar home clara/oscura, un post y FAQ a 1440 y 360. Comprobar menú, bienvenida, lista, metadatos y paleta.

- [ ] **Step 3: Publicar rama y PR**

```powershell
git push -u origin feat/lilian-structure
gh pr create --repo jparedesDS/blog --base main --head feat/lilian-structure --title "Lilian Weng structure and subany palette" --body "List-mode home, FAQ, menu, palette and Inter Variable."
```
No fusionar hasta la revisión final.

---

## Self-Review

- **Spec coverage:** paleta, tipografía, líneas, retrato, 8 tarjetas, cronología, blog Lilian, FAQ, verificación y deploy: todas tienen tarea.
- **Step scan:** cada paso deja una acción verificable; los valores exactos están en Global Constraints y en las tareas.
- **Type consistency:** `TimelineEntry`/`TimelinePeriod` se declaran en Task 3 y se consumen en `Timeline.astro`; `Project.href` ya existe y se reutiliza para enlaces externos.
- **Review Focus:** grid 4/2/1, tarjetas externas, contraste oscuro, cronología a 360 y home del blog tienen tests en Tasks 1-5.
- **Proportion:** el plan fija decisiones y valores; no transcribe los cuerpos de los componentes.
