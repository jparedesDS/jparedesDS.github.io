import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("the minimal build produces an English and a Spanish home", () => {
  assert.ok(fs.existsSync(path.join(root, "_site/index.html")));
  assert.ok(fs.existsSync(path.join(root, "_site/es/index.html")));
});

test("no al-folio theme or plugins remain in the build config", () => {
  const config = fs.readFileSync(path.join(root, "_config.yml"), "utf8");
  const gemfile = fs.readFileSync(path.join(root, "Gemfile"), "utf8");
  assert.doesNotMatch(config, /al_folio|al-folio/);
  assert.doesNotMatch(gemfile, /al_folio|al-folio/);
});
