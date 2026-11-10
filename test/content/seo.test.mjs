import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("the English home declares canonical, hreflang and Person JSON-LD", () => {
  const html = read("index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/jparedesds\.github\.io\/">/);
  assert.match(html, /hreflang="es" href="https:\/\/jparedesds\.github\.io\/es\/"/);
  assert.match(html, /"@type": "Person"/);
});

test("a translated project points at its Spanish twin", () => {
  const html = read("projects/cleanyourmail/index.html");
  assert.match(html, /hreflang="es" href="https:\/\/jparedesds\.github\.io\/es\/projects\/cleanyourmail\/"/);
  assert.match(html, /hreflang="en" href="https:\/\/jparedesds\.github\.io\/projects\/cleanyourmail\/"/);
  assert.match(html, /"@type": "CreativeWork"/);
});

test("an English-only project does not advertise a Spanish alternate", () => {
  const html = read("projects/valorant-players-detector/index.html");
  assert.doesNotMatch(html, /<link rel="alternate" hreflang="es"/);
  assert.match(
    html,
    /<link rel="alternate" hreflang="en" href="https:\/\/jparedesds\.github\.io\/projects\/valorant-players-detector\/"/
  );
});

test("the English-only case study does not advertise a Spanish alternate", () => {
  const html = read("cleanyourmail/index.html");
  assert.doesNotMatch(html, /<link rel="alternate" hreflang="es"/);
});

test("a fallback page is noindex and has no Spanish alternate", () => {
  const html = read("es/projects/valorant-players-detector/index.html");
  assert.match(html, /content="noindex"/);
  assert.doesNotMatch(html, /hreflang="es"/);
});

test("the sitemap lists both language variants", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /\/projects\/cleanyourmail\//);
  assert.match(sitemap, /\/es\/projects\/cleanyourmail\//);
});
