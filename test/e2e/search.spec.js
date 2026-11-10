import { test, expect } from "@playwright/test";

const openSearch = async (page) => {
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");
  await expect(page.locator("ninja-keys .modal.visible")).toBeVisible();
};

const searchActions = async (page) =>
  page.evaluate(() => {
    const ninja = document.querySelector("ninja-keys");
    return [...ninja.shadowRoot.querySelectorAll("ninja-action")].map((action) => (action.shadowRoot?.textContent || "").replace(/\s+/g, " ").trim());
  });

test("Control+k opens the search and finds the subany.video project and tutorial", async ({ page }) => {
  await page.goto("/");
  await openSearch(page);
  await page.keyboard.type("subany");
  await expect
    .poll(() => searchActions(page))
    .toEqual(expect.arrayContaining([expect.stringContaining("subany.video"), expect.stringContaining("How subany.video works")]));
});

test("the Spanish search placeholder is localized and results link under /es/", async ({ page }) => {
  await page.goto("/es/");
  await expect.poll(() => page.locator("ninja-keys").evaluate((element) => element.dataset.placeholder)).toBe("Escribe para buscar");

  await openSearch(page);
  await page.keyboard.type("clean");
  await expect.poll(() => searchActions(page)).toEqual(expect.arrayContaining([expect.stringContaining("CleanYourMail")]));

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/es\/projects\/cleanyourmail\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("an English-only model is marked with the · EN suffix in Spanish search", async ({ page }) => {
  await page.goto("/es/");
  await openSearch(page);
  await page.keyboard.type("YOLO12s");

  const titles = await page.evaluate(() => {
    const ninja = document.querySelector("ninja-keys");
    return ninja.data.map((item) => item.title);
  });
  const model = titles.find((title) => title.includes("YOLO12s"));
  expect(model, "the English-only YOLO12s model should be indexed").toBeTruthy();
  expect(model.endsWith(" · EN")).toBe(true);
});
