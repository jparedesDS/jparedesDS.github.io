const { test, expect } = require("@playwright/test");

test("a hash opens the matching tab", async ({ page }) => {
  await page.goto("/#resume");
  await expect(page.locator('[data-page="resume"]')).toHaveClass(/active/);
  await expect(page.getByRole("tab", { name: "Resume" })).toHaveAttribute("aria-selected", "true");
});

test("arrow keys move between tabs and update the hash", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "About" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#resume$/);
  await expect(page.getByRole("tab", { name: "Resume" })).toHaveAttribute("aria-selected", "true");
});

test("back returns to the previous tab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Portfolio" }).click();
  await page.getByRole("tab", { name: "Contact" }).click();
  await page.goBack();
  await expect(page).toHaveURL(/#portfolio$/);
  await expect(page.locator('[data-page="portfolio"]')).toHaveClass(/active/);
});

test("the contact section has no form and copies the email", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#contact");
  await expect(page.locator('[data-page="contact"] form')).toHaveCount(0);
  await page.getByRole("button", { name: /copy email/i }).click();
  await expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("@");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all sections and all projects stay visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-page="about"]')).toBeVisible();
    await expect(page.locator('[data-page="contact"]')).toBeVisible();
    await expect(page.locator(".project-item")).toHaveCount(38);
  });
});
