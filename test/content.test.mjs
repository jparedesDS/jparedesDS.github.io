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
