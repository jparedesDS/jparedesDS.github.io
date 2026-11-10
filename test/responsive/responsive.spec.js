import { test, expect } from "@playwright/test";

const widths = [360, 768, 1440];

const routes = [
  { path: "/", name: "home EN" },
  { path: "/es/", name: "home ES" },
  { path: "/projects/cleanyourmail/", name: "project EN" },
  { path: "/es/projects/cleanyourmail/", name: "project ES" },
  { path: "/es/projects/valorant-players-detector/", name: "fallback ES" },
  { path: "/cleanyourmail/", name: "case study EN" },
];

const expectNoHorizontalOverflow = async (page, label) => {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `${label}: document scrollWidth ${scrollWidth} vs clientWidth ${clientWidth}`).toBeLessThanOrEqual(clientWidth + 1);
};

for (const width of widths) {
  for (const { path, name } of routes) {
    test(`${name} does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expectNoHorizontalOverflow(page, `${name} at ${width}px`);
    });
  }
}

test("the mobile sidebar opens and closes at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");

  const toggle = page.locator(".info_more-btn");
  const sidebar = page.locator("[data-sidebar]");

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar).toHaveClass(/active/);
  await expectNoHorizontalOverflow(page, "open sidebar at 360px");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar).not.toHaveClass(/active/);
});

test("the desktop sidebar shows the contacts without a toggle", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.locator(".info_more-btn")).toBeHidden();
  await expect(page.locator(".sidebar-info_more")).toBeVisible();
});

test("the mobile sidebar reveals the language and theme controls", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");

  const toggle = page.locator(".info_more-btn");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  const clipped = await expect
    .poll(async () =>
      page.evaluate(() => {
        const sidebar = document.querySelector("[data-sidebar]").getBoundingClientRect();
        return [".lang-switch", "[data-theme-toggle]"].filter((selector) => {
          const box = document.querySelector(selector).getBoundingClientRect();
          return box.bottom > sidebar.bottom + 1 || box.top < sidebar.top - 1;
        });
      })
    )
    .toEqual([]);
});
