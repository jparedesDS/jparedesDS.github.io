import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  { path: "/", name: "home EN" },
  { path: "/projects/", name: "projects EN" },
  { path: "/blog/", name: "blog EN" },
  { path: "/blog/2026/11/09/how-subany-video-works/", name: "tutorial EN" },
  { path: "/repositories/", name: "repositories EN" },
  { path: "/cv/", name: "CV EN" },
  { path: "/es/", name: "home ES" },
  { path: "/es/projects/", name: "projects ES" },
  { path: "/es/blog/", name: "blog ES" },
  { path: "/es/blog/2026/11/09/como-funciona-subany-video/", name: "tutorial ES" },
  { path: "/es/repositories/", name: "repositories ES" },
  { path: "/es/cv/", name: "CV ES" },
];

const themedRoutes = routes.filter(({ path }) => ["/", "/projects/", "/blog/2026/11/09/how-subany-video-works/", "/cv/"].includes(path));

const analyze = async (page, label) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations, `${label}: ${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
};

for (const { path, name } of routes) {
  test(`${name} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    await analyze(page, `${name} (${path})`);
  });
}

for (const theme of ["light", "dark"]) {
  for (const { path, name } of themedRoutes) {
    test(`${name} has no WCAG 2.1 AA violations in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await analyze(page, `${name} (${path}, ${theme})`);
    });
  }
}
