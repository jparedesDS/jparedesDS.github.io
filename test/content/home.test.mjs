import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("about has four service cards and four app cards", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="service-item"/g) || []).length, 4);
  assert.equal((html.match(/class="app-item"/g) || []).length, 4);
});

test("the apps link to the four products", () => {
  const html = read("index.html");
  for (const href of [
    "/projects/cleanyourphone/",
    "/projects/cleanyourmail/",
    "https://subany.video/",
    "/projects/pro-pov-cs2/",
  ]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
});

test("no testimonials or client logos survive the port", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /testimonials|clients/);
});

test("both home data files define the same four apps", () => {
  for (const lang of ["en", "es"]) {
    const home = yaml.load(fs.readFileSync(path.join(root, `_data/${lang}/home.yml`), "utf8"));
    assert.equal(home.apps.length, 4);
    assert.equal(home.services.length, 4);
  }
});
