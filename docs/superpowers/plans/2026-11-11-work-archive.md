# Work Archive + Contact Sites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `/work/` en un archive cronológico tipo blog, reducir la cronología a trabajo+estudios, añadir el bloque Sites y cambiar el brand a `jparedesDS`.

**Architecture:** Astro + CSS. `work/index.astro` construye una lista unificada de proyectos y modelos, la ordena por año y la agrupa; se elimina `ArchiveGroup`. Timeline y ContactPanel se ajustan en datos/componentes. Sin dependencias nuevas.

**Tech Stack:** Astro 7, TypeScript, CSS, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-11-work-archive-design.md`

## Global Constraints

- `/work/` con formato de archive de blog: año, contador y filas compactas.
- 38 entradas: 28 proyectos + 10 modelos; años 2026, 2025, 2024 en orden descendente.
- Sin grupos por categoría ni imágenes/summaries en `/work/`.
- Privados sin enlace; DocFlow sin nombres de clientes/portales/ERP.
- Timeline solo trabajo + estudios, título “Work & education”; sin hitos.
- Contacto con bloque Sites: `https://subany.video/`, `https://cleanyourmail.org/`, `https://cleanyourphone.org/`.
- Header con `jparedesDS`.
- No tocar el blog, casos, legacy ni la home (salvo timeline/contacto/header).

## Review Focus

- Que el archive no pierda ninguna entrada ni enlace de caso.
- Que la agrupación por año sea correcta y descendente.
- Que los privados (Polymarket, DocuControl, CS2AI, VRS, Pro POV) no filtren enlaces.
- Que el contacto de 4 columnas no desborde a 980/360.
- Que el timeline corto no rompa la alineación de dos columnas con Writing.

---

### Task 1: Header, timeline corto y bloque Sites

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/data/site.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/components/Timeline.astro`
- Modify: `src/components/ContactPanel.astro`
- Modify: `src/styles/global.css`
- Modify: `test/content.test.mjs`
- Modify: `test/visual.spec.js`

**Interfaces:**
- Consumes: home compacta.
- Produces: brand `jparedesDS`, `site.sites`, timeline solo work/education.

- [ ] **Step 1: Tests**

En `test/content.test.mjs`:
```js
test("the header brand is jparedesDS", () => {
  const html = read("index.html");
  assert.match(html, /<span>jparedesDS<\/span>/);
});

test("the timeline is only work and education", () => {
  const html = read("index.html");
  assert.match(html, /Work &amp; education/);
  assert.doesNotMatch(html, /Milestone/);
  assert.doesNotMatch(html, /Kaggle/);
  assert.doesNotMatch(html, /Pro POV CS2/);
  for (const text of ["EIPSA", "Comunicación Permanente", "The Bridge", "Grupo ANOVO", "Padre Piquer"]) {
    assert.ok(html.includes(text), text);
  }
});

test("contact includes the three sites", () => {
  const html = read("index.html");
  for (const url of ["https://subany.video/", "https://cleanyourmail.org/", "https://cleanyourphone.org/"]) {
    assert.ok(html.includes(url), url);
  }
});
```
En `test/visual.spec.js`:
```js
test("contact has four columns at 1440 and one at 980", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  let count = await page.evaluate(() => getComputedStyle(document.querySelector(".contact-panel")).gridTemplateColumns.split(" ").length);
  expect(count).toBe(4);
  await page.setViewportSize({ width: 980, height: 1000 });
  await page.reload();
  count = await page.evaluate(() => getComputedStyle(document.querySelector(".contact-panel")).gridTemplateColumns.split(" ").length);
  expect(count).toBe(1);
});
```

- [ ] **Step 2: Ver fallar**

Run: `npm test` y Playwright.
Expected: FAIL.

- [ ] **Step 3: Brand y timeline**

- `Header.astro`: `<span>jparedesDS</span>`.
- `site.ts`: `TimelineKind = "work" | "education"`; quitar `milestone`; datos:
  - 2024 — Now: EIPSA.
  - 2021 — 2023: Comunicación Permanente + The Bridge.
  - 2015 — 2020: ANOVO.
  - 2010 — 2012: Padre Piquer.
- `Timeline.astro`: labels solo Work/Education.
- `index.astro`: título `Work & education`.

- [ ] **Step 4: Sites**

En `site.ts`, añadir `sites: SiteLink[]`:
```ts
[
  { label: "Subany", url: "https://subany.video/", external: true },
  { label: "CleanYourMail", url: "https://cleanyourmail.org/", external: true },
  { label: "CleanYourPhone", url: "https://cleanyourphone.org/", external: true },
]
```
En `ContactPanel.astro`, cuarto bloque con `<h3 class="contact-label">Sites</h3>`.
CSS: `.contact-panel { grid-template-columns: 1.15fr .82fr .82fr .82fr; }`; a <=980 `1fr`.

- [ ] **Step 5: Ver pasar y commit**

`npm test`, Playwright, `npm run check`.
```powershell
git add src test
git commit -m "feat: trim the timeline and add contact sites"
```

---

### Task 2: `/work/` cronológico

**Files:**
- Modify: `src/pages/work/index.astro`
- Delete: `src/components/ArchiveGroup.astro`
- Modify: `src/styles/global.css`
- Modify: `public/projects/{ai-vision,data-automation,products,esports}/index.html`
- Modify: `test/content.test.mjs`
- Modify: `test/visual.spec.js`

**Interfaces:**
- Consumes: `projects`, `models`, `Project`, `ModelRelease`.
- Produces: `archive-entry` × 38, `data-kind` project/model, year headings.

- [ ] **Step 1: Tests**

En `test/content.test.mjs`:
```js
test("the work archive is chronological and complete", () => {
  const html = read("work/index.html");
  assert.equal((html.match(/class="archive-entry"/g) || []).length, 38);
  assert.equal((html.match(/data-kind="project"/g) || []).length, 28);
  assert.equal((html.match(/data-kind="model"/g) || []).length, 10);
  const years = [...html.matchAll(/class="archive-year-head"[^>]*>(\d{4})/g)].map((m) => m[1]);
  assert.deepEqual(years, ["2026", "2025", "2024"]);
  assert.doesNotMatch(html, /id="ai-vision"/);
  assert.match(html, /HLTV Team &amp; Player Stats Scraper/);
  assert.match(html, /Counter Strike 2 Weapon Detector/);
  assert.match(html, /Private project/);
  assert.doesNotMatch(html, /href="[^"]*polymarket/i);
  for (const name of ["AYESA", "SACYR", "Hyundai", "eGesdoc", "Aconex", "Sendoc", "PRODOC"]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});
```
Actualizar los tests de redirects para esperar `/work/` sin hash:
```js
assert.match(read(`projects/${category}/index.html`), /url=\/work\//);
```

- [ ] **Step 2: Ver fallar**

Run: `npm test`.
Expected: FAIL.

- [ ] **Step 3: Construir la lista unificada**

En `work/index.astro`, crear:
```ts
type ArchiveItem = {
  slug: string;
  title: string;
  year: string;
  kind: "project" | "model";
  meta: string;
  href?: string;
  links: ProjectLink[];
  private?: boolean;
};
```
- Proyectos: `kind:"project"`, `meta` = label de categoría, `href`, `links`, `private`.
- Modelos: `kind:"model"`, `meta` = `Model · ${version}`, `links`, sin href.
- Ordenar por `Number(year)` desc y luego title.
- Agrupar por año.

Render:
```astro
<section class="archive-year">
  <h2 class="archive-year-head">{year} <span>{items.length}</span></h2>
  {items.map((item) => (
    <article class="archive-entry" data-kind={item.kind} data-slug={item.slug}>
      <div class="archive-entry-main">
        <h3>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</h3>
        <p class="archive-entry-meta">{item.meta}</p>
      </div>
      <div class="archive-entry-links">
        {item.private && <span class="archive-private">Private project</span>}
        {!item.private && item.links.map(...)}
      </div>
    </article>
  ))}
</section>
```
- Mantener el hero “Archive” y el back home; actualizar el lede a 38 items.
- Borrar `ArchiveGroup.astro`.

- [ ] **Step 4: Redirects**

En los cuatro `public/projects/<categoría>/index.html`, cambiar meta refresh, canonical y enlace visible a `/work/` (sin hash).

- [ ] **Step 5: CSS**

Estilos compactos al estilo blog archive:
```css
.archive-year { border-top: 1px solid var(--line); padding: 28px 0; }
.archive-year-head { display:flex; gap:10px; align-items:baseline; font-size:24px; margin-bottom:14px; }
.archive-year-head span { font-size:12px; color:var(--muted); font-weight:400; }
.archive-entry { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:24px; align-items:start; padding:12px 0; border-top:1px solid color-mix(in srgb, var(--line) 55%, transparent); }
.archive-entry h3 { font-size:16px; font-weight:500; }
.archive-entry-meta { margin:3px 0 0; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; }
.archive-entry-links { display:flex; flex-wrap:wrap; gap:12px; font-size:11px; }
@media (max-width:760px) { .archive-entry { grid-template-columns:1fr; gap:6px; } }
```

- [ ] **Step 6: Ver pasar y commit**

`npm test`, Playwright, `npm run check`.
```powershell
git add src public test
git commit -m "feat: rebuild the work archive chronologically"
```

---

### Task 3: Verificación y PR

- [ ] **Step 1:** `npm test`, Playwright, `npm run check`, auditoría de enlaces.
- [ ] **Step 2:** capturas 1440/360 de `/work/`, home y contacto; comprobar 38 entradas, años y 4 columnas.
- [ ] **Step 3:** push `feat/work-archive`, PR, sin merge.
