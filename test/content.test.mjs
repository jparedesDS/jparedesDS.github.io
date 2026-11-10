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

test("the home shows experience, writing and contact", () => {
  const html = read("index.html");
  assert.match(html, /EIPSA/);
  assert.match(html, /Comunicación Permanente/);
  assert.match(html, /How subany\.video works/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /Let’s build/);
  assert.match(html, /jparedescolmenarejo@gmail\.com/);
});

test("the archive contains the current categories and model releases", () => {
  const html = read("work/index.html");
  for (const category of [
    "AI & Computer Vision",
    "Data & Automation",
    "Products & Tools",
    "Esports & Content",
    "Model releases",
  ]) {
    assert.match(html, new RegExp(category));
  }
  assert.match(html, /OCR Weapon Detection/);
  assert.match(html, /LoL Map Tracking Object Detection/);
  assert.match(html, /Polymarket/);
  assert.match(html, /Private project/);
  assert.match(html, /Private source/);
  assert.doesNotMatch(html, /href="[^"]*polymarket/i);
});

test("the archive lists every project and model release once", () => {
  const html = read("work/index.html");
  assert.equal((html.match(/class="archive-item"/g) || []).length, 28);
  assert.equal((html.match(/class="model-item"/g) || []).length, 10);

  const slugs = [...html.matchAll(/data-slug="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(slugs.length, 28);
  assert.equal(new Set(slugs).size, 28, `duplicate archive slug in: ${slugs.join(", ")}`);
});

test("the archive exposes the category anchors", () => {
  const html = read("work/index.html");
  for (const id of ["ai-vision", "data-automation", "products", "esports"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("the archive only links to /work/ or an existing case page", () => {
  const html = read("work/index.html");
  const cases = new Set([
    "/work/subany-video/",
    "/work/docflow-saas/",
    "/work/pro-pov-cs2/",
    "/work/trtw-tv/",
    "/work/cleanyourphone/",
  ]);
  const hrefs = [...html.matchAll(/href="(\/work\/[^"]*)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    assert.ok(href === "/work/" || cases.has(href), `dead case link: ${href}`);
  }
});

test("the archive does not leak the DocFlow client and portal names", () => {
  const html = read("work/index.html");
  for (const name of ["AYESA", "SACYR", "Hyundai", "eGesdoc", "Aconex", "Sendoc", "PRODOC"]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});

const caseSlugs = ["subany-video", "docflow-saas", "pro-pov-cs2", "trtw-tv", "cleanyourphone"];

test("the five new cases build", () => {
  for (const slug of caseSlugs) {
    assert.ok(fs.existsSync(path.join(dist, "work", slug, "index.html")), slug);
  }
});

test("the DocFlow case is public-safe", () => {
  const html = read("work/docflow-saas/index.html");
  assert.match(html, /DocFlow/);
  for (const name of [
    "AYESA",
    "SACYR",
    "Hyundai",
    "eGesdoc",
    "Aconex",
    "Sendoc",
    "PRODOC",
    "GAIA",
    "Wood",
    "Document Space",
    "DocFlow Lite",
    "ERP",
    "DocuSign",
  ]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});

test("every case has a title and a problem, approach and result section", () => {
  for (const slug of caseSlugs) {
    const html = read(`work/${slug}/index.html`);
    assert.match(html, /<h1[^>]*>\s*[^<\s][^<]*<\/h1>/, `${slug} h1`);
    for (const heading of ["Problem", "Approach", "Result"]) {
      assert.match(html, new RegExp(`<h2[^>]*>\\s*${heading}\\s*</h2>`), `${slug} ${heading}`);
    }
  }
});

test("the archive links to all five case studies", () => {
  const html = read("work/index.html");
  for (const slug of caseSlugs) {
    assert.match(html, new RegExp(`href="/work/${slug}/"`), slug);
  }
});
