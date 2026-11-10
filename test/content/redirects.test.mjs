import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const categories = ["ai-vision", "data-automation", "products", "esports"];

test("each legacy category redirects with a meta refresh to the projects anchor", () => {
  for (const category of categories) {
    const file = path.join(root, "projects", category, "index.html");
    assert.ok(fs.existsSync(file), `${category} redirect must exist`);
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /http-equiv="refresh"/i, `${category} must use a meta refresh`);
    assert.match(html, new RegExp(`url=/projects/#${category}`), `${category} must target /projects/#${category}`);
  }
});

test("the redirect targets use the /projects/#category syntax", () => {
  for (const category of categories) {
    const html = fs.readFileSync(path.join(root, "projects", category, "index.html"), "utf8");
    const target = html.match(/url=([^"]+)/)?.[1];
    assert.equal(target, `/projects/#${category}`);
  }
});
