import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("the home uses the vCard shell and five tabs", () => {
  const html = read("index.html");
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /class="skip-link"/);
  assert.equal((html.match(/data-nav-link/g) || []).length, 5);
  assert.match(html, /data-theme-toggle/);
  assert.doesNotMatch(html, /ionicons/);
});

test("the English home switches to Spanish and the Spanish home to English", () => {
  assert.match(read("index.html"), /href="\/es\/"/);
  assert.match(read("es/index.html"), /hreflang="en"/);
});

test("the blog tab points at the separate blog", () => {
  assert.match(read("index.html"), /href="\/blog\/"/);
});
