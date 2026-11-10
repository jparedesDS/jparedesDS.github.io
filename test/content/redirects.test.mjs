import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("category redirects preselect the filter on the home", () => {
  for (const category of ["ai-vision", "data-automation", "products", "esports"]) {
    const html = fs.readFileSync(path.join(root, "projects", category, "index.html"), "utf8");
    assert.match(html, new RegExp(`url=/\\?filter=${category}#portfolio`));
  }
});

test("cv and repositories redirect to their new homes", () => {
  assert.match(fs.readFileSync(path.join(root, "cv/index.html"), "utf8"), /url=\/#resume/);
  assert.match(fs.readFileSync(path.join(root, "es/cv/index.html"), "utf8"), /url=\/es\/#resume/);
  assert.match(fs.readFileSync(path.join(root, "repositories/index.html"), "utf8"), /github\.com\/jparedesDS/);
});

test("the projects index preserves the old category hash", () => {
  const html = fs.readFileSync(path.join(root, "projects/index.html"), "utf8");
  assert.match(html, /location\.hash/);
  assert.match(html, /filter=/);
});

test("a 404 page exists", () => {
  assert.ok(fs.existsSync(path.join(root, "_pages/404.md")));
});
