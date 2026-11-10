import { test, expect } from "@playwright/test";

for (const width of [360, 768, 1440]) {
  for (const path of ["/", "/work/", "/work/docflow-saas/"]) {
    test(`${path} does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
}

test("the mobile header keeps Writing and Contact visible", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/");
  await expect(page.locator('.nav a[href="/blog/"]')).toBeVisible();
  await expect(page.locator('.nav a[href="/#contact"]')).toBeVisible();
  await expect(page.locator('.nav a[href="/#work"]')).toBeHidden();
  await expect(page.locator('.nav a[href="/#experience"]')).toBeHidden();
});
