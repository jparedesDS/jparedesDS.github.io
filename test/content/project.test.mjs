import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("all 38 English and 38 Spanish project routes build", () => {
  const skip = new Set(["ai-vision", "data-automation", "products", "esports"]);
  const en = fs.readdirSync(path.join(root, "_site/projects"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !skip.has(entry.name));
  const es = fs.readdirSync(path.join(root, "_site/es/projects"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  assert.equal(en.length, 38);
  assert.equal(es.length, 38);
});

test("a translated project renders title, links and markdown", () => {
  const html = read("projects/cleanyourmail/index.html");
  assert.match(html, /CleanYourMail/);
  assert.match(html, /Case study/);
  assert.match(html, /Overview/);
  assert.match(html, /href="https:\/\/github.com\/jparedesDS\/cleanyourmail"/);
});

test("the ten fallback routes are English, noindex and flagged", () => {
  const html = read("es/projects/valorant-players-detector/index.html");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /name="robots" content="noindex"/);
  assert.match(html, /fallback-notice/);
});

test("a project page links to the next project in its category", () => {
  const html = read("projects/cleanyourmail/index.html");
  assert.match(html, /class="next-project"/);
  assert.match(html, /href="\/projects\/[^"]+\/"/);
});

test("all fourteen link types have a label in both languages", () => {
  const types = ["case_study", "code", "github", "model", "web", "website", "release", "local_app", "tableau", "kaggle", "youtube", "tiktok", "instagram", "x"];
  for (const lang of ["en", "es"]) {
    const strings = yaml.load(fs.readFileSync(path.join(root, `_data/${lang}/strings.yml`), "utf8"));
    for (const type of types) assert.ok(strings.project_links[type], `${lang}: ${type}`);
  }
});
