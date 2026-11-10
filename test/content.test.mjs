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
