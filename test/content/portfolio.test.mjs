import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("the grid renders 38 projects and five filters", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="project-item active"/g) || []).length, 38);
  for (const filter of ["all", "ai-vision", "data-automation", "products", "esports"]) {
    assert.match(html, new RegExp(`data-filter="${filter}"`));
  }
});

test("the 14 projects without an image use the fallback tile", () => {
  const html = read("index.html");
  assert.equal((html.match(/project-img--fallback/g) || []).length, 14);
});

test("every card links to its project page", () => {
  const html = read("index.html");
  assert.match(html, /href="\/projects\/cleanyourmail\/"/);
  assert.match(html, /href="\/projects\/docflow-saas\/"/);
});

test("the Spanish grid links to the Spanish project routes", () => {
  const html = read("es/index.html");
  assert.match(html, /href="\/es\/projects\/cleanyourmail\/"/);
  assert.doesNotMatch(html, /href="\/projects\/cleanyourmail\/"/);
});

test("Spanish project links keep the same-host external URLs unlocalized", () => {
  const html = read("es/projects/cleanyourmail/index.html");
  assert.match(html, /href="\/cleanyourmail-web\/"/);
  assert.doesNotMatch(html, /\/es\/cleanyourmail-web/);
});
