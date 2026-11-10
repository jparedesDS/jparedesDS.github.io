import { writeFileSync } from "node:fs";

export function selectLatest(posts, lang, limit = 3) {
  return posts
    .filter((post) => post.lang === lang)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function renderYaml(posts) {
  const lines = posts.map((post) =>
    [
      `- title: '${String(post.title).replaceAll("'", "''")}'`,
      `  url: '${post.url}'`,
      `  date: '${post.date}'`,
      `  excerpt: '${String(post.excerpt).replaceAll("'", "''")}'`,
      `  lang: '${post.lang}'`,
    ].join("\n")
  );
  return `posts:\n${lines.join("\n")}\n`;
}

export async function sync({ url, outFile, fetchImpl = fetch }) {
  try {
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    writeFileSync(outFile, renderYaml([...selectLatest(posts, "en"), ...selectLatest(posts, "es")]));
    return { ok: true, count: posts.length };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

if (process.argv[1]?.endsWith("blog-preview-sync.mjs")) {
  const result = await sync({
    url: process.env.BLOG_POSTS_URL || "https://jparedesds.github.io/blog/posts.json",
    outFile: "_data/blog_preview.yml",
  });
  console.log(result.ok ? `Blog preview: ${result.count} posts` : `Blog preview: fallback (${result.error})`);
}
