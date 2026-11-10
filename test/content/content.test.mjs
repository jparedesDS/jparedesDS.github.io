import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const config = yaml.load(read("_config.yml"));

test("the index pages and the 404 exist", () => {
  for (const page of ["_pages/index.md", "_pages/index-es.md", "_pages/404.md"]) {
    assert.ok(exists(page), `${page} must exist`);
  }
});

test("the four legacy category redirects exist", () => {
  for (const category of ["ai-vision", "data-automation", "products", "esports"]) {
    assert.ok(exists(`projects/${category}/index.html`), `projects/${category}/index.html must exist`);
  }
});

test("the standalone product pages ship their index.html", () => {
  for (const page of ["cleanyourmail", "propovcs2", "cs2pov", "murdoku"]) {
    assert.ok(exists(`${page}/index.html`), `${page}/index.html must exist`);
  }
  assert.ok(read("cleanyourmail/index.html").includes("/images/"));
});

test("the legacy al-folio files are gone", () => {
  for (const file of ["_sass", "_posts", ".al-folio-overrides.yml", "purgecss.config.js"]) {
    assert.equal(exists(file), false, `${file} must not exist`);
  }
});

test("_config.yml keeps the multilingual Jekyll settings", () => {
  assert.equal(config.baseurl, "");
  assert.equal(config.url, "https://jparedesds.github.io");
  assert.deepEqual(config.languages, ["en", "es"]);
  assert.equal(config.default_lang, "en");
  assert.equal(config.parallel_localization, false);
  assert.deepEqual(config.lang_vars, ["lang"]);
  assert.deepEqual(config.plugins, ["jekyll-polyglot"]);
  assert.equal(config.theme, undefined);
  assert.equal(config.al_folio, undefined);
});

test("the Gemfile uses Jekyll and polyglot only", () => {
  const gemfile = read("Gemfile");
  assert.ok(gemfile.includes("jekyll-polyglot"));
  assert.equal(gemfile.includes("al_folio"), false);
});

test("the main landmark is the skip-link target", () => {
  const html = read("_site/index.html");
  assert.match(html, /<main id="main-content"/);
});

test("the lockfile includes linux for CI", () => {
  assert.match(read("Gemfile.lock"), /x86_64-linux/);
});

test("the vCard MIT notice is present", () => {
  const notice = read("NOTICE");
  assert.ok(notice.includes("codewithsadee"));
  assert.ok(notice.includes("MIT"));
});

test("no demo or placeholder content remains in the site sources", () => {
  const forbidden = ["Albert Einstein", "Your Name", "example.com", "Lorem ipsum", "prof_pic.jpg", "selected_papers", "announcements:"];
  const sourceFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const relative = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(relative);
      } else if (/\.(md|html|liquid|yml|yaml|scss|js|json)$/.test(entry.name)) {
        sourceFiles.push(relative);
      }
    }
  };
  for (const dir of ["_pages", "_data", "_projects", "_includes", "_layouts", "_plugins", "assets/js"]) {
    walk(dir);
  }
  sourceFiles.push("_config.yml");

  for (const file of sourceFiles) {
    const source = read(file);
    for (const value of forbidden) {
      assert.equal(source.includes(value), false, `${file} must not contain "${value}"`);
    }
  }
});
