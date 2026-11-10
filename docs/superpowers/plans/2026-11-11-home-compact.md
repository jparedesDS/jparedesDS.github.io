# Home Compacta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reducir el hero al 50%, dejar Selected work en 3 tarjetas 16:9 con Web/Skill/Code, compactar Experience+Writing en dos columnas, ampliar el stack y añadir los bloques sociales personal y Pro POV CS2.

**Architecture:** Solo Astro + CSS. Los datos viven en `src/data/site.ts` y `src/data/projects.ts`; `WorkCard.astro` se refactoriza para no anidar anchors y renderizar Web/Skill/Code; `ContactPanel.astro` pasa a tres bloques. El blog no cambia.

**Tech Stack:** Astro 7, TypeScript, CSS moderno, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-11-home-compact-design.md`

## Global Constraints

- Hero ~303px a 1440 (rango aceptado 280–330).
- Selected work: solo subany.video, CleanYourPhone, CleanYourMail.
- Tarjetas 3 columnas desktop, 2 tablet, 1 móvil; imagen 16:9; cuerpo compacto; sin chips.
- Enlaces de tarjeta: Web siempre; Skill en CleanYourMail/CleanYourPhone (repo público); Code en otros solo si el repo es público; subany solo Web.
- Experience + Writing en dos columnas a 1440; apiladas a <=980.
- Stack ampliado con los tokens acordados; Contact con X/Instagram `@xhitoCS` y bloque Pro POV CS2 (YouTube, TikTok, Instagram, X, Twitch, Kick).
- Sin TikTok personal; sin nuevas dependencias; sin tocar el blog ni el legacy.

## Review Focus

- El hero no debe perder legibilidad al reducirlo.
- Las tarjetas no deben anidar `<a>` ni generar `/work/<slug>/` para proyectos sin caso.
- Los enlaces Skill/Code deben apuntar a repos públicos reales.
- Las dos columnas no deben desbordar a 980/360.
- El bloque Pro POV CS2 debe tener las 6 redes y no confundirse con el personal.

---

### Task 1: Hero compacto + 3 tarjetas

**Files:**
- Modify: `src/data/projects.ts`
- Modify: `src/components/WorkCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Modify: `test/content.test.mjs`
- Modify: `test/visual.spec.js`

**Interfaces:**
- Consumes: home actual.
- Produces: `Project.featuredOrder?`, `Project.skill?`; `WorkCard` con `Web`/`Skill`/`Code`.

- [ ] **Step 1: Tests primero**

En `test/content.test.mjs`, sustituir el test de 8 tarjetas por:
```js
test("the home shows the three selected projects", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="work-card"/g) || []).length, 3);
  for (const title of ["subany.video", "CleanYourPhone", "CleanYourMail"]) {
    assert.ok(html.includes(title), title);
  }
  const cards = html.match(/<article class="work-card"[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, 3);
  assert.ok(cards.every((card) => /subany\.video|CleanYourPhone|CleanYourMail/.test(card)));
  assert.equal((html.match(/>Web\s*<span/g) || []).length, 3);
  assert.equal((html.match(/>Skill\s*<span/g) || []).length, 2);
  assert.doesNotMatch(html, /subtitle\.me/);
  assert.doesNotMatch(html, /class="chips"/);
});
```

En `test/visual.spec.js`:
```js
test("the hero is about half its old height", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const height = await page.evaluate(() => document.querySelector(".hero").getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(280);
  expect(height).toBeLessThanOrEqual(330);
});

for (const [width, columns] of [[1440, 3], [768, 2], [360, 1]]) {
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
Eliminar el test antiguo de 4/2/1 y el de `object-fit` de HLTV/CleanYourPhone (HLTV ya no está en la home); conservar un check de `object-fit: contain` para CleanYourPhone.

- [ ] **Step 2: Ver fallar**

Run: `npm test` y `npx playwright test --config test/playwright.config.js test/visual.spec.js`.
Expected: FAIL por 8 tarjetas, columnas y altura.

- [ ] **Step 3: Datos**

En `projects.ts`:
- Añadir `featuredOrder?: number;` y `skill?: boolean;` a `Project`.
- `subany-video`: `featuredOrder: 1`.
- `cleanyourphone`: `featuredOrder: 2`, `skill: true`.
- `cleanyourmail`: `featuredOrder: 3`, `skill: true`.
- Quitar `featured: true` de `docflow-saas`, `pro-pov-cs2`, `hltv-scraper`, `dxf-data-extraction`, `welding-defects-detection` (y de cualquier otro que no sea los tres).
- En `index.astro`: `const featured = projects.filter(p => p.featured).sort((a,b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));`.

- [ ] **Step 4: WorkCard sin anchors anidados**

Refactorizar el root a `<article class="work-card" data-project={project.slug}>` y dentro:
- `primary = project.href ?? web?.url ?? project.links[0]?.url`.
- `web = links.find(l => /website|web/i.test(l.label) && /^https?:/.test(l.url))`.
- `code = links.find(l => /code|github/i.test(l.label))`.
- Imagen y `h3` enlazan a `primary`.
- Footer `.work-links`:
  - si `web`: `<a href={web.url} target="_blank" rel="noreferrer">Web <span>↗</span></a>`
  - si `code && !project.private`: label `project.skill ? "Skill" : "Code"`, mismo target/rel.
- Sin chips.

- [ ] **Step 5: CSS**

```css
.hero { grid-template-columns: minmax(0,1fr) 220px; gap: 40px; padding: 28px 0 26px; }
.hero h1 { font-size: clamp(44px, 4.6vw, 64px); line-height: 0.82; }
.eyebrow { margin-bottom: 10px; }
.hero-role { margin-top: 12px; font-size: 17px; }
.hero-intro { margin-top: 10px; font-size: 14.5px; line-height: 1.5; max-width: 620px; }
.hero-links { margin-top: 14px; }
.hero-card { padding: 8px; }
.work-grid { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
.work-media { aspect-ratio: 16 / 9; }
.work-body { padding: 10px 12px 12px; }
.work-body h3 { font-size: 18px; margin: 6px 0 4px; }
.work-body p { font-size: 12.5px; line-height: 1.45; }
.work-links { display:flex; gap:14px; margin-top:10px; font-size:11px; }
```
A <=980: grid 2 columnas. A <=760: 1 columna; hero padding 30/28, `h1` clamp 44–60. Mantener `.portrait` circular y `object-fit: contain` para CleanYourPhone.

- [ ] **Step 6: Ver pasar**

Run: `npm test`, Playwright, `npm run check`.
Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src test
git commit -m "feat: compact the hero and selected work"
```

---

### Task 2: Experience/Writing en dos columnas + stack + contacto

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/data/site.ts`
- Modify: `src/components/ContactPanel.astro`
- Modify: `src/styles/global.css`
- Modify: `test/content.test.mjs`
- Modify: `test/visual.spec.js`

**Interfaces:**
- Consumes: Task 1.
- Produces: `.home-columns`, stack ampliado, `personalSocials`/`propovSocials`.

- [ ] **Step 1: Tests**

En `test/content.test.mjs`:
```js
test("experience and writing sit in two columns", () => {
  const html = read("index.html");
  assert.match(html, /class="home-columns"/);
  assert.match(html, /id="experience"/);
  assert.match(html, /id="writing"/);
});

test("the stack includes the GitHub toolset", () => {
  const html = read("index.html");
  for (const item of ["Jupyter", "JavaScript", "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "FastAPI", "Docker", "PostgreSQL", "GitHub Actions", "Tableau", "WebGPU", "Whisper", "ONNX", "FFmpeg", "Claude", "AI agents"]) {
    assert.ok(html.includes(item), item);
  }
});

test("contact adds the personal and Pro POV socials", () => {
  const html = read("index.html");
  for (const url of ["x.com/xhitoCS", "instagram.com/xhitoCS", "youtube.com/@Pro.POV.CS2", "tiktok.com/@propov.cs2", "twitch.tv/propovcs2", "kick.com/propovcs2", "x.com/ProPOVCS2"]) {
    assert.ok(html.includes(url), url);
  }
  assert.doesNotMatch(html, /tiktok\.com\/@xhitoCS/);
});
```

En `test/visual.spec.js`:
```js
test("experience and writing are side by side at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const boxes = await page.evaluate(() => {
    const e = document.querySelector("#experience").getBoundingClientRect();
    const w = document.querySelector("#writing").getBoundingClientRect();
    return { eTop: e.top, wTop: w.top, eLeft: e.left, wLeft: w.left };
  });
  expect(Math.abs(boxes.eTop - boxes.wTop)).toBeLessThan(2);
  expect(boxes.wLeft).toBeGreaterThan(boxes.eLeft);
});

test("experience and writing stack at 980", async ({ page }) => {
  await page.setViewportSize({ width: 980, height: 1000 });
  await page.goto("/");
  const boxes = await page.evaluate(() => {
    const e = document.querySelector("#experience").getBoundingClientRect();
    const w = document.querySelector("#writing").getBoundingClientRect();
    return { eBottom: e.bottom, wTop: w.top };
  });
  expect(boxes.wTop).toBeGreaterThanOrEqual(boxes.eBottom - 2);
});
```

- [ ] **Step 2: Ver fallar**

Run: `npm test` y Playwright.
Expected: FAIL.

- [ ] **Step 3: Envolver Experience y Writing**

En `index.astro`, envolver ambas secciones:
```astro
<div class="home-columns">
  <section class="section" id="experience">…</section>
  <section class="section" id="writing">…</section>
</div>
```
CSS:
```css
.home-columns { display:grid; grid-template-columns: 1.25fr .75fr; gap: 48px; border-top: 1px solid var(--line); }
.home-columns > .section { border-top: 0; padding: 40px 0 48px; }
@media (max-width: 980px) { .home-columns { grid-template-columns: 1fr; gap: 0; } .home-columns > .section + .section { border-top: 1px solid var(--line); } }
```
Compactar `.timeline-period` padding a 12px, `.timeline-entry` margin, `h3` 14px, `p` 12.5px; `.writing-row` padding 12px, title 15px.

- [ ] **Step 4: Stack**

En `site.ts`, reemplazar `stack` por la lista acordada (33 tokens): Python, Jupyter, JavaScript, TypeScript, HTML/CSS, PyTorch, TensorFlow, Keras, YOLO, OpenCV, scikit-learn, Pandas, NumPy, NLP, Hugging Face, FastAPI, Flask, React, Docker, SQL, SQLite, PostgreSQL, GitHub Actions, Tableau, BeautifulSoup, ADB, WebGPU, Whisper, ONNX, FFmpeg, Claude, AI agents, Local-first.

- [ ] **Step 5: Contacto**

En `site.ts`, añadir:
```ts
personalSocials: [
  { label: "X", url: "https://x.com/xhitoCS", external: true },
  { label: "Instagram", url: "https://www.instagram.com/xhitoCS/", external: true },
],
propovSocials: [
  { label: "YouTube", url: "https://www.youtube.com/@Pro.POV.CS2", external: true },
  { label: "TikTok", url: "https://www.tiktok.com/@propov.cs2", external: true },
  { label: "Instagram", url: "https://www.instagram.com/propovcs2", external: true },
  { label: "X", url: "https://x.com/ProPOVCS2", external: true },
  { label: "Twitch", url: "https://www.twitch.tv/propovcs2", external: true },
  { label: "Kick", url: "https://kick.com/propovcs2", external: true },
],
```
En `ContactPanel.astro`, renderizar tres columnas: CTA/email; bloque personal (GitHub, LinkedIn, HF, Kaggle, X, Instagram); bloque Pro POV (6 enlaces). Añadir etiquetas “Personal” y “Pro POV CS2”. CSS: `grid-template-columns: 1.15fr .85fr .85fr`; a <=980 una columna.

- [ ] **Step 6: Ver pasar**

Run: `npm test`, Playwright, `npm run check`.
Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src test
git commit -m "feat: compact home columns and expand stack and socials"
```

---

### Task 3: Verificación y PR

**Files:** ninguno si todo pasa.

- [ ] **Step 1: Suite completa**

`npm test`, Playwright, `npm run check`, auditoría de enlaces.
- [ ] **Step 2: Revisión visual** 1440/360 claro/oscuro; hero ~303, 3 tarjetas, dos columnas, stack y bloques sociales.
- [ ] **Step 3: PR** `git push -u origin feat/home-compact` y `gh pr create --repo jparedesDS/jparedesDS.github.io --base main --head feat/home-compact --title "Compact home" --body "..."`. No fusionar hasta revisión final.
