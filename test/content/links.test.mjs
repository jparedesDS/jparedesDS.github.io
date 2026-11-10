import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "test/content/projects.json"), "utf8"));
const slugs = new Set(manifest.projects.map((project) => project.slug));
const readProject = (file) => matter(fs.readFileSync(path.join(root, "_projects", file), "utf8")).data;
const projectFiles = fs.readdirSync(path.join(root, "_projects")).filter((file) => file.endsWith(".md"));
const projectLinks = projectFiles.flatMap((file) => (readProject(file).links || []).map((link) => ({ file, link })));

const home = ["en", "es"].map((lang) => yaml.load(fs.readFileSync(path.join(root, `_data/${lang}/home.yml`), "utf8")));

const allLinkUrls = [
  ...projectLinks.map(({ link }) => link.url),
  ...home
    .flatMap((data) => [
      (data.apps || []).map((app) => app.url),
      (data.contact || []).map((link) => link.url),
    ])
    .flat(),
];

test("every internal or external link uses an absolute or root-relative URL", () => {
  for (const url of allLinkUrls) {
    assert.ok(
      typeof url === "string" && (url.startsWith("https://") || url.startsWith("/") || url.startsWith("mailto:")),
      `unexpected link URL: ${url}`
    );
  }
});

test("links contain no development or placeholder hosts", () => {
  for (const url of allLinkUrls) {
    for (const value of ["localhost", "127.0.0.1", "example.com", "TODO", "undefined"]) {
      assert.equal(url.includes(value), false, `link ${url} must not contain "${value}"`);
    }
  }
});

test("private projects mark at least one link as private", () => {
  for (const file of projectFiles.filter((file) => !file.endsWith("-es.md"))) {
    const data = readProject(file);
    if (!data.private) continue;
    const links = data.links || [];
    assert.ok(
      links.some((link) => link.private === true),
      `${file} is private but has no link with private: true`
    );
  }
});

test("internal project links point at projects that exist", () => {
  for (const { file, link } of projectLinks) {
    if (!link.url.startsWith("/projects/")) continue;
    const slug = link.url.replace(/^\/projects\//, "").replace(/\/$/, "");
    if (!slug || slug.startsWith("#")) continue;
    assert.ok(slugs.has(slug), `${file} links to unknown project ${link.url}`);
  }
});
