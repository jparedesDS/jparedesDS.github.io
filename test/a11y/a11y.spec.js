import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  { path: "/", name: "home EN" },
  { path: "/es/", name: "home ES" },
  { path: "/projects/cleanyourmail/", name: "project EN" },
  { path: "/es/projects/cleanyourmail/", name: "project ES" },
  { path: "/es/projects/valorant-players-detector/", name: "fallback ES" },
  { path: "/cleanyourmail/", name: "case study EN" },
];

const themedRoutes = routes.filter(({ path }) => ["/", "/projects/cleanyourmail/"].includes(path));

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

for (const path of ["/", "/es/"]) {
  test(`${path} has no WCAG 2.1 AA violations at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(path);
    await analyze(page, `${path} at 360px`);
  });
}
