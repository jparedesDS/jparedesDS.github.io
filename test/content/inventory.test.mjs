import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "test/content/projects.json"), "utf8"));
const projectsDir = path.join(root, "_projects");

const readProject = (file) => {
  const { data } = matter(fs.readFileSync(path.join(projectsDir, file), "utf8"));
  return data;
};

const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".md"));
const enFiles = files.filter((file) => !file.endsWith("-es.md"));
const esFiles = files.filter((file) => file.endsWith("-es.md"));
const enBySlug = new Map(
  enFiles.map((file) => {
    const data = readProject(file);
    return [data.project_key, { file, data }];
  })
);

test("the manifest lists the 38 English projects with the expected per-category counts", () => {
  assert.equal(manifest.projects.length, 38);
  assert.deepEqual(manifest.categories, [
    { key: "ai-vision", count: 17 },
    { key: "data-automation", count: 11 },
    { key: "products", count: 7 },
    { key: "esports", count: 3 },
  ]);

  const counts = {};
  for (const project of manifest.projects) {
    counts[project.category] = (counts[project.category] || 0) + 1;
  }
  assert.deepEqual(counts, {
    "ai-vision": 17,
    "data-automation": 11,
    products: 7,
    esports: 3,
  });
});

test("there are 38 English and 28 Spanish project files", () => {
  assert.equal(enFiles.length, 38);
  assert.equal(esFiles.length, 28);
  for (const file of enFiles) {
    assert.equal(readProject(file).lang, "en", `${file} must declare lang: en`);
  }
  for (const file of esFiles) {
    assert.equal(readProject(file).lang, "es", `${file} must declare lang: es`);
  }
});

test("every English project has canonical front matter", () => {
  for (const project of manifest.projects) {
    const entry = enBySlug.get(project.slug);
    assert.ok(entry, `missing English project for ${project.slug}`);
    const { data } = entry;

    assert.equal(data.page_id, `project-${project.slug}`, `${project.slug} page_id`);
    assert.equal(data.permalink, `/projects/${project.slug}/`, `${project.slug} permalink`);
    assert.equal(data.category, project.category, `${project.slug} category`);
    assert.equal(data.title, project.title_en, `${project.slug} title`);
    assert.ok(typeof data.title === "string" && data.title.trim().length > 0, `${project.slug} title must not be empty`);
    assert.ok(typeof data.description === "string" && data.description.trim().length > 0, `${project.slug} description must not be empty`);
    assert.equal(typeof data.importance, "number", `${project.slug} importance must be numeric`);
    assert.equal(Boolean(data.private), project.private, `${project.slug} private flag`);
  }
});

test("subany-video is the featured project with importance 0", () => {
  const { data } = enBySlug.get("subany-video");
  assert.equal(data.importance, 0);
});

test("every Spanish project mirrors the English front matter", () => {
  for (const file of esFiles) {
    const es = readProject(file);
    const slug = es.project_key;
    const entry = enBySlug.get(slug);
    assert.ok(entry, `${file} has no English counterpart`);
    const en = entry.data;

    assert.equal(es.page_id, en.page_id, `${slug} page_id`);
    assert.equal(es.permalink, en.permalink, `${slug} permalink`);
    assert.equal(es.category, en.category, `${slug} category`);
    assert.equal(es.importance, en.importance, `${slug} importance`);
    assert.deepEqual(es.links || null, en.links || null, `${slug} links`);
  }
});

test("the 10 model releases stay English-only", () => {
  const modelSlugs = [
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

  assert.equal(manifest.projects.filter((project) => !project.es).length, 10);
  for (const slug of modelSlugs) {
    const project = manifest.projects.find((entry) => entry.slug === slug);
    assert.ok(project, `${slug} must be in the manifest`);
    assert.equal(project.es, false, `${slug} must stay English-only`);
    assert.equal(fs.existsSync(path.join(projectsDir, `${slug}-es.md`)), false, `${slug} must not have a Spanish file`);
  }
});

test("every declared project image exists in images/", () => {
  for (const project of manifest.projects) {
    if (!project.img) continue;
    const imagePath = path.join(root, project.img.replace(/^\//, ""));
    assert.ok(fs.existsSync(imagePath), `${project.slug} image ${project.img} must exist`);
  }
});

test("project sources contain no placeholder or development values", () => {
  const forbidden = ["TODO", "undefined", "example.com", "localhost"];
  for (const file of files) {
    const source = fs.readFileSync(path.join(projectsDir, file), "utf8");
    for (const value of forbidden) {
      assert.equal(source.includes(value), false, `${file} must not contain "${value}"`);
    }
  }
});
