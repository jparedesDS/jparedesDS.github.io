import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { selectLatest, renderYaml, sync } from "../../blog-preview-sync.mjs";

const root = path.resolve(process.cwd());

const fixture = [
  { lang: "en", date: "2026-11-09T10:00:00+01:00", title: "A", url: "/blog/a/", excerpt: "a" },
  { lang: "es", date: "2026-11-10T10:00:00+01:00", title: "B", url: "/blog/b/", excerpt: "b" },
  { lang: "en", date: "2026-11-08T10:00:00+01:00", title: "C", url: "/blog/c/", excerpt: "c" },
  { lang: "en", date: "2026-11-07T10:00:00+01:00", title: "D", url: "/blog/d/", excerpt: "d" },
  { lang: "en", date: "2026-11-06T10:00:00+01:00", title: "E", url: "/blog/e/", excerpt: "e" },
];

test("selectLatest filters by language and returns the newest three", () => {
  assert.deepEqual(selectLatest(fixture, "en", 3).map((post) => post.title), ["A", "C", "D"]);
});

test("renderYaml produces a posts list with escaped titles", () => {
  const yamlText = renderYaml([{ ...fixture[0], title: 'A "quoted" title' }]);
  assert.match(yamlText, /^- title: 'A "quoted" title'$/m);
});

test("sync leaves the fallback file untouched when the blog is unreachable", async () => {
  const out = path.join(process.cwd(), "test", "tmp-blog-preview.yml");
  fs.writeFileSync(out, "posts: []\n");
  const result = await sync({
    url: "https://example.invalid/posts.json",
    outFile: out,
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });
  assert.equal(result.ok, false);
  assert.equal(fs.readFileSync(out, "utf8"), "posts: []\n");
  fs.rmSync(out);
});

test("the blog tab renders the synced posts", () => {
  const html = fs.readFileSync(path.join(root, "_site/index.html"), "utf8");
  assert.match(html, /blog-posts-list/);
  assert.match(html, /How subany\.video works/);
});
