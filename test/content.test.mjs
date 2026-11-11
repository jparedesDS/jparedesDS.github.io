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

test("the home shows the three selected projects", () => {
  const html = read("index.html");
  assert.equal((html.match(/class="work-card"/g) || []).length, 3);
  for (const title of ["subany.video", "CleanYourPhone", "CleanYourMail"]) {
    assert.ok(html.includes(title), title);
  }
  const cards = html.match(/<article class="work-card"[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, 3);
  assert.ok(cards.every((card) => /subany\.video|CleanYourPhone|CleanYourMail/.test(card)));
  assert.equal((html.match(/>Web\s*<span/g) || []).length, 3);
  assert.equal((html.match(/>Skill\s*<span/g) || []).length, 2);
  assert.doesNotMatch(html, /subtitle\.me/);
  assert.doesNotMatch(html, /class="chips"/);
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

test("experience and writing sit in two columns", () => {
  const html = read("index.html");
  assert.match(html, /class="home-columns"/);
  assert.match(html, /id="experience"/);
  assert.match(html, /id="writing"/);
  const wrapper = html.match(/<div class="home-columns">([\s\S]*?)<\/div>\s*<section class="section stack-section"/);
  assert.ok(wrapper, "home-columns wraps only experience and writing");
  assert.match(wrapper[1], /id="experience"/);
  assert.match(wrapper[1], /id="writing"/);
});

test("the stack includes the GitHub toolset", () => {
  const html = read("index.html");
  for (const item of [
    "Jupyter",
    "JavaScript",
    "PyTorch",
    "TensorFlow",
    "Keras",
    "scikit-learn",
    "Pandas",
    "NumPy",
    "NLP",
    "FastAPI",
    "Flask",
    "Docker",
    "SQLite",
    "PostgreSQL",
    "GitHub Actions",
    "Tableau",
    "BeautifulSoup",
    "ADB",
    "WebGPU",
    "Whisper",
    "ONNX",
    "FFmpeg",
    "Claude",
    "AI agents",
    "Local-first",
  ]) {
    assert.ok(html.includes(item), item);
  }
});

test("contact adds the personal and Pro POV socials", () => {
  const html = read("index.html");
  for (const url of [
    "x.com/xhitoCS",
    "instagram.com/xhitoCS",
    "youtube.com/@Pro.POV.CS2",
    "tiktok.com/@propov.cs2",
    "instagram.com/propovcs2",
    "twitch.tv/propovcs2",
    "kick.com/propovcs2",
    "x.com/ProPOVCS2",
  ]) {
    assert.ok(html.includes(url), url);
  }
  assert.doesNotMatch(html, /tiktok\.com\/@xhitoCS/);

  const panel = html.match(/<section class="contact-panel"[\s\S]*?<\/section>/);
  assert.ok(panel, "contact panel");
  assert.match(panel[0], />Personal</);
  assert.match(panel[0], />Pro POV CS2</);
  for (const url of [
    "youtube.com/@Pro.POV.CS2",
    "tiktok.com/@propov.cs2",
    "instagram.com/propovcs2",
    "x.com/ProPOVCS2",
    "twitch.tv/propovcs2",
    "kick.com/propovcs2",
  ]) {
    assert.ok(panel[0].includes(url), `pro pov url in contact panel: ${url}`);
  }
});

test("the header brand is jparedesDS", () => {
  const html = read("index.html");
  assert.match(html, /<span>jparedesDS<\/span>/);
});

test("the timeline is only work and education", () => {
  const html = read("index.html");
  assert.match(html, /Work &amp; education/);
  const experience = html.match(/<section class="section" id="experience">([\s\S]*?)<\/section>/);
  assert.ok(experience, "experience section");
  const section = experience[1];
  assert.match(section, /class="timeline"/);
  for (const text of [
    "EIPSA",
    "Comunicación Permanente",
    "The Bridge",
    "Grupo ANOVO",
    "Padre Piquer",
  ]) {
    assert.ok(section.includes(text), text);
  }
  assert.doesNotMatch(section, /Milestone/);
  assert.doesNotMatch(section, /Kaggle/);
  assert.doesNotMatch(section, /Pro POV CS2/);
  assert.doesNotMatch(section, /DocFlow/);
  assert.doesNotMatch(section, /2026/);
});

test("contact includes the Sites block with the three sites", () => {
  const html = read("index.html");
  const panel = html.match(/<section class="contact-panel"[\s\S]*?<\/section>/);
  assert.ok(panel, "contact panel");
  assert.match(panel[0], /<h3 class="contact-label">Sites<\/h3>/);
  for (const url of [
    "https://subany.video/",
    "https://cleanyourmail.org/",
    "https://cleanyourphone.org/",
  ]) {
    assert.ok(panel[0].includes(url), url);
  }
});

const archiveSections = (html) =>
  [...html.matchAll(/<section class="archive-year">([\s\S]*?)<\/section>/g)].map((match) => match[1]);

test("the work archive is chronological and complete", () => {
  const html = read("work/index.html");
  assert.equal((html.match(/class="archive-entry"/g) || []).length, 38);
  assert.equal((html.match(/data-kind="project"/g) || []).length, 28);
  assert.equal((html.match(/data-kind="model"/g) || []).length, 10);
  const years = [...html.matchAll(/class="archive-year-head"[^>]*>(\d{4})/g)].map((match) => match[1]);
  assert.deepEqual(years, ["2026", "2025", "2024"]);
  assert.doesNotMatch(html, /id="ai-vision"/);
  assert.match(html, /HLTV Team &amp; Player Stats Scraper/);
  assert.match(html, /Counter Strike 2 Weapon Detector/);
  assert.match(html, /Private project/);
  assert.doesNotMatch(html, /href="[^"]*polymarket/i);
  for (const name of ["AYESA", "SACYR", "Hyundai", "eGesdoc", "Aconex", "Sendoc", "PRODOC"]) {
    assert.doesNotMatch(html, new RegExp(name, "i"));
  }
});

test("the archive lede counts the 38 items", () => {
  const html = read("work/index.html");
  const lede = html.match(/<p class="archive-lede">([\s\S]*?)<\/p>/);
  assert.ok(lede, "archive lede");
  assert.match(lede[1], /38/);
});

test("the archive counts and orders the items per year", () => {
  const html = read("work/index.html");
  const sections = archiveSections(html);
  assert.equal(sections.length, 3);
  assert.deepEqual(
    sections.map((section) => (section.match(/class="archive-entry"/g) || []).length),
    [3, 7, 28],
  );
  assert.deepEqual(
    sections.map((section) => {
      const head = section.match(/class="archive-year-head">(\d{4}) <span>(\d+)<\/span>/);
      assert.ok(head, "year head");
      return [head[1], Number(head[2])];
    }),
    [
      ["2026", 3],
      ["2025", 7],
      ["2024", 28],
    ],
  );
});

test("the archive sorts each year by title", () => {
  const html = read("work/index.html");
  for (const section of archiveSections(html)) {
    const titles = [...section.matchAll(/<h3>(?:<a [^>]*>)?([^<]+)/g)].map((match) =>
      match[1].replace(/&amp;/g, "&"),
    );
    assert.equal(titles.length, (section.match(/class="archive-entry"/g) || []).length);
    assert.deepEqual(titles, [...titles].sort((a, b) => a.localeCompare(b, "en")));
  }
});

test("the archive entries carry the kind, slug and meta", () => {
  const html = read("work/index.html");
  const entries = [...html.matchAll(/<article class="archive-entry"([\s\S]*?)<\/article>/g)];
  assert.equal(entries.length, 38);
  assert.match(entries[0][1], /data-kind="(project|model)"/);
  assert.match(entries[0][1], /data-slug="[^"]+"/);
  assert.match(html, /<article class="archive-entry" data-kind="project" data-slug="docflow-saas">/);
  assert.match(html, /<article class="archive-entry" data-kind="model" data-slug="cs2-yolo12m-weapon-detection">/);
  assert.match(html, /<p class="archive-entry-meta">Model · YOLO12m<\/p>/);
  assert.match(html, /<p class="archive-entry-meta">Data &amp; Automation<\/p>/);
});

test("the archive has no images, summaries or category sections", () => {
  const html = read("work/index.html");
  const sections = archiveSections(html);
  assert.equal(sections.length, 3);
  for (const section of sections) {
    assert.doesNotMatch(section, /<img/i);
  }
  assert.doesNotMatch(html, /archive-thumb/);
  assert.doesNotMatch(html, /archive-group-head/);
  assert.doesNotMatch(html, /Live subtitles and translation for streams/);
  assert.doesNotMatch(html, /Multi-tenant document control that keeps project files/);
});

test("the archive hides the links of every private project", () => {
  const html = read("work/index.html");
  for (const slug of ["polymarket-autobetting", "docucontrol", "clutchbot-cs2ai", "cs2-vrs-predictions"]) {
    const entry = html.match(
      new RegExp(`<article class="archive-entry"[^>]*data-slug="${slug}"[\\s\\S]*?</article>`),
    );
    assert.ok(entry, slug);
    assert.match(entry[0], /Private project/, slug);
    assert.doesNotMatch(entry[0], /<a /, slug);
  }
});

test("Pro POV keeps its case link and the private marker", () => {
  const html = read("work/index.html");
  const entry = html.match(
    /<article class="archive-entry"[^>]*data-slug="pro-pov-cs2"[\s\S]*?<\/article>/,
  );
  assert.ok(entry, "pro-pov-cs2 entry");
  assert.match(entry[0], /href="\/work\/pro-pov-cs2\/"/);
  assert.match(entry[0], /Private project/);
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

test("legacy category URLs redirect to /work/", () => {
  for (const category of ["ai-vision", "data-automation", "products", "esports"]) {
    const html = read(`projects/${category}/index.html`);
    assert.match(html, /content="0; url=\/work\/"/, category);
    assert.match(
      html,
      /rel="canonical" href="https:\/\/jparedesds\.github\.io\/work\/"/,
      category,
    );
    assert.match(html, /<a [^>]*href="\/work\/"/, category);
    assert.doesNotMatch(html, /#/, category);
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
