import { test, expect } from "@playwright/test";

const themeState = async (page) => ({
  theme: await page.locator("html").getAttribute("data-theme"),
  setting: await page.locator("html").getAttribute("data-theme-setting"),
  stored: await page.evaluate(() => localStorage.getItem("theme")),
});

test.describe("system preference: light", () => {
  test.use({ colorScheme: "light" });

  test("the first visit starts light and the toggle switches to dark and persists", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => themeState(page)).toEqual({ theme: "light", setting: "light", stored: null });

    await page.locator("#light-toggle").click();
    await expect.poll(() => themeState(page)).toEqual({ theme: "dark", setting: "dark", stored: "dark" });

    await page.reload();
    await expect.poll(() => themeState(page)).toEqual({ theme: "dark", setting: "dark", stored: "dark" });

    await page.locator("#light-toggle").click();
    await expect.poll(() => themeState(page)).toEqual({ theme: "light", setting: "light", stored: "light" });
  });
});

test.describe("system preference: dark", () => {
  test.use({ colorScheme: "dark" });

  test("the first visit starts dark and the toggle switches to light and persists", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => themeState(page)).toEqual({ theme: "dark", setting: "dark", stored: null });

    await page.locator("#light-toggle").click();
    await expect.poll(() => themeState(page)).toEqual({ theme: "light", setting: "light", stored: "light" });

    await page.reload();
    await expect.poll(() => themeState(page)).toEqual({ theme: "light", setting: "light", stored: "light" });
  });
});

test("the toggle only cycles between light and dark, never a third system state", async ({ page }) => {
  await page.goto("/");
  const seen = new Set();

  for (let click = 0; click < 4; click += 1) {
    await page.locator("#light-toggle").click();
    const state = await themeState(page);
    expect(["light", "dark"]).toContain(state.theme);
    expect(["light", "dark"]).toContain(state.setting);
    expect(["light", "dark"]).toContain(state.stored);
    seen.add(state.setting);
  }

  expect([...seen].sort()).toEqual(["dark", "light"]);
});
