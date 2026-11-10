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

test("English and Spanish home data share keys and selected projects", () => {
  const en = readYaml("_data/en/home.yml");
  const es = readYaml("_data/es/home.yml");
  assert.deepEqual(keyPaths(en), keyPaths(es));
  assert.deepEqual(en.selected_projects, es.selected_projects);
  assert.equal(en.selected_projects.length, 9);
});

test("English and Spanish repository lists contain the same repos in the same order", () => {
  const en = readYaml("_data/en/repositories.yml");
  const es = readYaml("_data/es/repositories.yml");
  assert.deepEqual(
    en.repos.map((repo) => repo.name),
    es.repos.map((repo) => repo.name)
  );
  assert.deepEqual(
    en.repos.map((repo) => repo.url),
    es.repos.map((repo) => repo.url)
  );
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

test("the two tutorials share a page_id and use distinct permalinks", () => {
  const posts = fs
    .readdirSync(path.join(root, "_posts"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ file, data: readFrontMatter(path.join("_posts", file)) }));

  const en = posts.filter(({ data }) => data.lang === "en");
  const es = posts.filter(({ data }) => data.lang === "es");
  assert.equal(en.length, 1);
  assert.equal(es.length, 1);
  assert.equal(en[0].data.page_id, es[0].data.page_id);
  assert.notEqual(en[0].data.permalink, es[0].data.permalink);
  assert.equal(en[0].data.permalink_lang.en, en[0].data.permalink);
  assert.equal(en[0].data.permalink_lang.es, es[0].data.permalink);
});
