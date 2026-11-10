const { test, expect } = require("@playwright/test");

test("a filter query preselects the category and shows its projects", async ({ page }) => {
  await page.goto("/?filter=products#portfolio");
  await expect(page.locator('[data-filter="products"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".project-item:visible")).toHaveCount(7);
});
