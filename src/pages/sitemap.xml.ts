import type { APIRoute } from "astro";

const routes = [
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
];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://jparedesds.github.io");
  const urls = routes
    .map((route) => `  <url>\n    <loc>${new URL(route, base).href}</loc>\n  </url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
