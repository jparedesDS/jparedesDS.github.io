import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const readYaml = (file) => yaml.load(fs.readFileSync(path.join(root, file), "utf8"));
const readFrontMatter = (file) => matter(fs.readFileSync(path.join(root, file), "utf8")).data;

const keyPaths = (value, prefix = "") => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.keys(value).flatMap((key) => keyPaths(value[key], prefix ? `${prefix}.${key}` : key));
};

test("English and Spanish string tables expose exactly the same keys", () => {
  assert.deepEqual(keyPaths(readYaml("_data/en/strings.yml")), keyPaths(readYaml("_data/es/strings.yml")));
});

test("English and Spanish home data share keys, apps and service counts", () => {
  const en = readYaml("_data/en/home.yml");
  const es = readYaml("_data/es/home.yml");
  assert.deepEqual(keyPaths(en), keyPaths(es));
  assert.deepEqual(en.apps.map((app) => app.url), es.apps.map((app) => app.url));
  assert.equal(en.apps.length, 4);
  assert.equal(es.apps.length, 4);
  assert.equal(en.services.length, 4);
  assert.equal(es.services.length, 4);
});

test("English and Spanish CV data share the canonical section keys", () => {
  const en = readYaml("_data/en/cv.yml").cv;
  const es = readYaml("_data/es/cv.yml").cv;
  assert.deepEqual(Object.keys(en), Object.keys(es));
  assert.deepEqual(Object.keys(en.sections), Object.keys(es.sections));
});

test("every page with a page_id has an EN/ES pair that shares its permalink", () => {
  const pages = fs
    .readdirSync(path.join(root, "_pages"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ file, data: readFrontMatter(path.join("_pages", file)) }))
    .filter(({ data }) => data.page_id);

  const byId = new Map();
  for (const page of pages) {
    byId.set(page.data.page_id, [...(byId.get(page.data.page_id) || []), page]);
  }

  for (const [pageId, pair] of byId) {
    const en = pair.filter(({ data }) => data.lang === "en");
    const es = pair.filter(({ data }) => data.lang === "es");
    assert.equal(en.length, 1, `${pageId} must have one English page`);
    assert.equal(es.length, 1, `${pageId} must have one Spanish page`);
    assert.equal(en[0].data.permalink, es[0].data.permalink, `${pageId} must share a permalink`);
  }
});

test("the ten English-only projects keep an explicit Spanish fallback", () => {
  const slugs = [
    "cs2-players-detector-yolo12s",
    "cs2-players-detector-yolov9-v10-v11",
    "cs2-weapon-detector-yolo12m",
    "deadlock-players-detector",
    "fortnite-players-detector",
    "liquid-penetrant-test-yolo11l",
    "lol-map-tracking-yolo11",
    "overwatch-2-players-detector",
    "valorant-players-detector",
    "welding-defects-detector-yolo11x",
  ];

  for (const slug of slugs) {
    const data = readFrontMatter(path.join("_projects", `${slug}.md`));
    assert.equal(data.lang_switch_fallback, "/?filter=ai-vision#portfolio", `${slug} fallback`);
    assert.equal(fs.existsSync(path.join(root, "_projects", `${slug}-es.md`)), false, `${slug} must stay English-only`);
  }
});

test("the blog lives outside this repository", () => {
  assert.equal(fs.existsSync(path.join(root, "_posts")), false);
  const preview = readYaml("_data/blog_preview.yml").posts;
  assert.deepEqual([...new Set(preview.map((post) => post.lang))].sort(), ["en", "es"]);
});
