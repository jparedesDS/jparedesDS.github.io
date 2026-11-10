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
