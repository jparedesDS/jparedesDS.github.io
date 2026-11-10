import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (file) => fs.readFileSync(path.join(root, "_site", file), "utf8");

test("resume renders the real CV, not placeholder content", () => {
  const html = read("index.html");
  assert.match(html, /EIPSA/);
  assert.match(html, /The Bridge/);
  assert.match(html, /YOLO/);
  assert.match(html, /href="\/assets\/pdf\/resume.pdf"/);
});

test("skills are chips, not invented percentage bars", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="skill-group"/g) || []).length, 11);
  assert.doesNotMatch(html, /skill-progress-fill/);
});
