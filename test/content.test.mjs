import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const dist = path.join(process.cwd(), "dist");
const read = (file) => fs.readFileSync(path.join(dist, file), "utf8");

test("the build produces the home with the shell", () => {
  const html = read("index.html");
  assert.match(html, /<html lang="en"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /Jose Paredes/);
  assert.match(html, /data-theme/);
});

test("the home shows the eight selected projects", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="work-card"/g) || []).length, 8);
  for (const title of [
    "subany.video",
    "CleanYourMail",
    "DocFlow",
    "Pro POV CS2",
    "CleanYourPhone",
    "HLTV Team &amp; Player Stats Scraper",
    "Technical Drawing Data Extraction",
    "Welding Defects Detector",
  ]) {
    assert.ok(html.includes(title), title);
  }
  assert.doesNotMatch(html, /href="\/work\/trtw-tv\/"/);
  assert.match(html, /https:\/\/github\.com\/jparedesDS\/hltv-scraper/);
  assert.match(html, /https:\/\/github\.com\/jparedesDS\/extract-data-dxf/);
  assert.match(html, /https:\/\/github\.com\/jparedesDS\/welding-defects-detection/);
});

test("the home has the hero, the portrait and the contact links", () => {
  const html = read("index.html");
  assert.match(html, /class="hero"/);
  assert.match(html, /profile\.jpg/);
  assert.match(html, /github\.com\/jparedesDS/);
  assert.match(html, /mailto:jparedescolmenarejo@gmail\.com/);
});

test("the home shows experience, writing and contact", () => {
  const html = read("index.html");
  assert.match(html, /EIPSA/);
  assert.match(html, /Comunicación Permanente/);
  assert.match(html, /How subany\.video works/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /Let’s build/);
  assert.match(html, /jparedescolmenarejo@gmail\.com/);
});

test("the timeline combines work, education and milestones", () => {
  const html = read("index.html");
  for (const text of [
    "Work, education &amp; milestones",
    "EIPSA",
    "Comunicación Permanente",
    "Grupo ANOVO",
    "The Bridge",
    "Padre Piquer",
    "Kaggle",
    "DocFlow",
    "Pro POV CS2",
    "subany.video",
    "CleanYourMail",
    "CleanYourPhone",
  ]) {
    assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /class="timeline"/);
});

test("the archive contains the current categories and model releases", () => {
  const html = read("work/index.html");
  for (const category of [
    "AI & Computer Vision",
    "Data & Automation",
    "Products & Tools",
    "Esports & Content",
    "Model releases",
  ]) {
    assert.match(html, new RegExp(category));
  }
  assert.match(html, /OCR Weapon Detection/);
  assert.match(html, /LoL Map Tracking Object Detection/);
  assert.match(html, /Polymarket/);
  assert.match(html, /Private project/);
  assert.match(html, /Private source/);
  assert.doesNotMatch(html, /href="[^"]*polymarket/i);
});

test("the archive lists every project and model release once", () => {
  const html = read("work/index.html");
  assert.equal((html.match(/class="archive-item"/g) || []).length, 28);
  assert.equal((html.match(/class="model-item"/g) || []).length, 10);

  const slugs = [...html.matchAll(/data-slug="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(slugs.length, 28);
  assert.equal(new Set(slugs).size, 28, `duplicate archive slug in: ${slugs.join(", ")}`);
});

test("the archive exposes the category anchors", () => {
  const html = read("work/index.html");
  for (const id of ["ai-vision", "data-automation", "products", "esports"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("the archive only links to /work/ or an existing case page", () => {
  const html = read("work/index.html");
  const cases = new Set([
    "/work/subany-video/",
    "/work/docflow-saas/",
    "/work/pro-pov-cs2/",
    "/work/trtw-tv/",
    "/work/cleanyourphone/",
  ]);
  const hrefs = [...html.matchAll(/href="(\/work\/[^"]*)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    assert.ok(href === "/work/" || cases.has(href), `dead case link: ${href}`);
  }
});

test("the archive does not leak the DocFlow client and portal names", () => {
  const html = read("work/index.html");
  for (const name of ["AYESA", "SACYR", "Hyundai", "eGesdoc", "Aconex", "Sendoc", "PRODOC"]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});

const caseSlugs = ["subany-video", "docflow-saas", "pro-pov-cs2", "trtw-tv", "cleanyourphone"];

test("the five new cases build", () => {
  for (const slug of caseSlugs) {
    assert.ok(fs.existsSync(path.join(dist, "work", slug, "index.html")), slug);
  }
});

test("the DocFlow case is public-safe", () => {
  const html = read("work/docflow-saas/index.html");
  assert.match(html, /DocFlow/);
  for (const name of [
    "AYESA",
    "SACYR",
    "Hyundai",
    "eGesdoc",
    "Aconex",
    "Sendoc",
    "PRODOC",
    "GAIA",
    "Wood",
    "Document Space",
    "DocFlow Lite",
    "ERP",
    "DocuSign",
    "portal",
  ]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});

test("the subany.video case does not advertise the private repository", () => {
  const html = read("work/subany-video/index.html");
  assert.doesNotMatch(html, /subtitle\.me/i);
  assert.doesNotMatch(html, /open source/i);
});

test("every case has a title and a problem, approach and result section", () => {
  for (const slug of caseSlugs) {
    const html = read(`work/${slug}/index.html`);
    assert.match(html, /<h1[^>]*>\s*[^<\s][^<]*<\/h1>/, `${slug} h1`);
    for (const heading of ["Problem", "Approach", "Result"]) {
      assert.match(html, new RegExp(`<h2[^>]*>\\s*${heading}\\s*</h2>`), `${slug} ${heading}`);
    }
  }
});

test("the archive links to all five case studies", () => {
  const html = read("work/index.html");
  for (const slug of caseSlugs) {
    assert.match(html, new RegExp(`href="/work/${slug}/"`), slug);
  }
});

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

test("legacy project URLs redirect to /work/", () => {
  const html = read("projects/index.html");
  assert.match(html, /<meta http-equiv="refresh" content="0; url=\/work\/"/);
  assert.match(html, /rel="canonical" href="https:\/\/jparedesds\.github\.io\/work\/"/);
  assert.match(html, /<a [^>]*href="\/work\/"/);
});

test("legacy category URLs redirect to their /work/ anchor", () => {
  for (const category of ["ai-vision", "data-automation", "products", "esports"]) {
    const html = read(`projects/${category}/index.html`);
    assert.match(html, new RegExp(`content="0; url=/work/#${category}"`), category);
    assert.match(
      html,
      new RegExp(`rel="canonical" href="https://jparedesds\\.github\\.io/work/#${category}"`),
      category,
    );
    assert.match(html, new RegExp(`<a [^>]*href="/work/#${category}"`), category);
  }
});

test("the redirects are tiny static pages without scripts or analytics", () => {
  for (const file of [
    "projects/index.html",
    "projects/ai-vision/index.html",
    "projects/data-automation/index.html",
    "projects/products/index.html",
    "projects/esports/index.html",
  ]) {
    const html = read(file);
    assert.doesNotMatch(html, /<script/i, file);
    assert.doesNotMatch(html, /gtag|googletagmanager|analytics|plausible/i, file);
    assert.match(html, /<html lang="en"/, file);
  }
});

test("the old #projects anchor still exists", () => {
  assert.match(read("index.html"), /id="projects"/);
});

test("the old #about anchor still exists", () => {
  assert.match(read("index.html"), /id="about"/);
});

test("the legacy case and the sub-sites are preserved", () => {
  assert.ok(fs.existsSync(path.join(dist, "cleanyourmail/index.html")));
  assert.ok(fs.existsSync(path.join(dist, "css/main.css")));
  assert.match(read("cleanyourmail/index.html"), /CleanYourMail/);
  for (const sub of ["cs2pov", "murdoku", "propovcs2"]) {
    assert.ok(fs.existsSync(path.join(dist, sub, "index.html")), sub);
  }
});

test("the legacy page ships its stylesheet, scripts and images", () => {
  const html = read("cleanyourmail/index.html");
  const assets = [
    ...html.matchAll(/<link[^>]+href="(\/[^"]*\.css)"/g),
    ...html.matchAll(/<script[^>]+src="(\/[^"]*\.js)"/g),
    ...html.matchAll(/<img[^>]+src="(\/[^"]+)"/g),
  ].map((match) => match[1]);
  assert.ok(assets.includes("/css/main.css"), "stylesheet reference");
  assert.ok(assets.includes("/js/GridWorld.js"), "GridWorld reference");
  for (const asset of assets) {
    assert.ok(fs.existsSync(path.join(dist, asset)), `missing asset: ${asset}`);
  }
  for (const file of [
    "css/main.css",
    "js/GridWorld.js",
    "images/cleanyourmail.png",
    "profile.jpg",
    "resume.pdf",
  ]) {
    assert.ok(fs.existsSync(path.join(dist, file)), file);
  }
});

test("the legacy page CV link resolves from the site root", () => {
  assert.match(read("cleanyourmail/index.html"), /href="\/resume\.pdf"/);
});

test("the search-console and TikTok verification files are served", () => {
  for (const file of [
    "google75a8559a473af765.html",
    "tiktoktlkXmcJe9C9XczFLZBDaijGBy6abp0WB.txt",
  ]) {
    assert.ok(fs.existsSync(path.join(dist, file)), file);
  }
  assert.match(read("google75a8559a473af765.html"), /google-site-verification/);
});

test("every sub-site carries at least one asset next to its index", () => {
  for (const sub of ["cs2pov", "murdoku", "propovcs2"]) {
    const files = walk(path.join(dist, sub)).filter(
      (file) => path.basename(file) !== "index.html",
    );
    assert.ok(files.length > 0, `${sub} only contains index.html`);
  }
});

// /blog/ is a separate Hugo site deployed to the same origin, not an Astro
// route, so it is not part of this build output and is not asserted here.
test("the sitemap and robots exist", () => {
  assert.ok(fs.existsSync(path.join(dist, "sitemap.xml")));
  assert.ok(fs.existsSync(path.join(dist, "robots.txt")));
});

test("the sitemap lists the public routes and no redirects", () => {
  const xml = read("sitemap.xml");
  for (const route of [
    "/",
    "/work/",
    "/work/subany-video/",
    "/work/docflow-saas/",
    "/work/pro-pov-cs2/",
    "/work/trtw-tv/",
    "/work/cleanyourphone/",
    "/cleanyourmail/",
    "/cs2pov/",
    "/murdoku/",
    "/propovcs2/",
  ]) {
    assert.match(xml, new RegExp(`<loc>https://jparedesds\\.github\\.io${route}</loc>`), route);
  }
  assert.doesNotMatch(xml, /\/projects\//);
  assert.doesNotMatch(xml, /\/blog\//);
});

test("robots.txt points crawlers at the sitemap", () => {
  assert.equal(
    read("robots.txt"),
    "User-agent: *\nAllow: /\nSitemap: https://jparedesds.github.io/sitemap.xml\n",
  );
});

test("the home has Person JSON-LD", () => {
  assert.match(read("index.html"), /"@type": "Person"/);
});

test("the Person JSON-LD parses and carries the identity links", () => {
  const html = read("index.html");
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, "JSON-LD script");
  const data = JSON.parse(match[1]);
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Person");
  assert.equal(data.name, "Jose Paredes");
  assert.match(data.jobTitle, /Data Scientist/);
  assert.equal(data.url, "https://jparedesds.github.io/");
  for (const url of [
    "https://github.com/jparedesDS",
    "https://www.linkedin.com/in/jparedesDS/",
    "https://huggingface.co/jparedesDS",
    "https://www.kaggle.com/joseparedesc",
  ]) {
    assert.ok(data.sameAs.includes(url), url);
  }
});

test("every page carries Open Graph metadata", () => {
  for (const [file, title, url] of [
    ["index.html", "Jose Paredes — Data Scientist &amp; AI Engineer", "https://jparedesds.github.io/"],
    ["work/index.html", "Work archive — Jose Paredes", "https://jparedesds.github.io/work/"],
    [
      "work/docflow-saas/index.html",
      null,
      "https://jparedesds.github.io/work/docflow-saas/",
    ],
  ]) {
    const html = read(file);
    assert.match(html, /<meta property="og:title" content="[^"]+"/, file);
    assert.match(html, /<meta property="og:description" content="[^"]+"/, file);
    assert.match(
      html,
      /<meta property="og:image" content="https:\/\/jparedesds\.github\.io\/profile\.jpg"/,
      file,
    );
    assert.match(html, new RegExp(`<meta property="og:url" content="${url}"`), file);
    if (title) {
      assert.match(html, new RegExp(`<meta property="og:title" content="${title}"`), file);
    }
  }
});

test("the cleanup keeps the legacy pages and the public assets", () => {
  for (const file of [
    "cleanyourmail/index.html",
    "cs2pov/index.html",
    "murdoku/index.html",
    "propovcs2/index.html",
    "resume.pdf",
    "profile.jpg",
  ]) {
    assert.ok(fs.existsSync(path.join(dist, file)), file);
  }
});
