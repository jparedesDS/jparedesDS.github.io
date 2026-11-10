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

test("the EN and ES pages exist", () => {
  const pages = [
    "_pages/about.md",
    "_pages/about-es.md",
    "_pages/blog.md",
    "_pages/blog-es.md",
    "_pages/projects.md",
    "_pages/projects-es.md",
    "_pages/repositories.md",
    "_pages/repositories-es.md",
    "_pages/cv.md",
    "_pages/cv-es.md",
  ];
  for (const page of pages) {
    assert.ok(exists(page), `${page} must exist`);
  }
});

test("the two tutorials and the four legacy redirects exist", () => {
  assert.ok(exists("_posts/2026-11-09-how-subany-video-works-en.md"));
  assert.ok(exists("_posts/2026-11-09-como-funciona-subany-video-es.md"));
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
  for (const file of ["_sass/_style.scss", "_sass/_portfolio.scss", "_sass/_vars.scss", "_layouts/default.html", "_includes/header.html"]) {
    assert.equal(exists(file), false, `${file} must not exist`);
  }
});

test("_config.yml keeps the migration settings", () => {
  assert.equal(config.baseurl, "");
  assert.equal(config.url, "https://jparedesds.github.io");
  assert.deepEqual(config.languages, ["en", "es"]);
  assert.equal(config.default_lang, "en");
  assert.equal(config.parallel_localization, false);
  assert.deepEqual(config.lang_vars, ["lang"]);
  assert.equal(config.imagemagick.enabled, false);
  assert.equal(config.al_folio.compat.bootstrap.enabled, false);
  assert.equal(config.search_enabled, true);
  assert.equal(config.posts_in_search, true);
  assert.equal(config.bib_search, false);
  assert.equal(config.max_width, "1100px");
  assert.equal(config.footer_fixed, false);
  assert.equal(config.enable_darkmode, true);
});

test("the Gemfile includes jekyll-polyglot", () => {
  assert.ok(read("Gemfile").includes("jekyll-polyglot"));
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
  for (const dir of ["_pages", "_posts", "_data", "_projects", "_includes", "_layouts", "_sass"]) {
    walk(dir);
  }
  if (exists("index.html")) sourceFiles.push("index.html");
  sourceFiles.push("_config.yml");

  for (const file of sourceFiles) {
    const source = read(file);
    for (const value of forbidden) {
      assert.equal(source.includes(value), false, `${file} must not contain "${value}"`);
    }
  }
});
