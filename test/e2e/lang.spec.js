import { test, expect } from "@playwright/test";

test("the ES switch on the English home page goes to /es/", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/es\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the EN switch on the Spanish home page goes to /", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("a translated project switches EN -> ES -> EN", async ({ page }) => {
  await page.goto("/projects/cleanyourmail/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/es\/projects\/cleanyourmail\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/projects\/cleanyourmail\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("an English-only project offers the filtered Spanish portfolio", async ({ page }) => {
  await page.goto("/projects/cs2-players-detector-yolo12s/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const spanishSwitch = page.locator(".lang-switch");
  await expect(spanishSwitch).toHaveAttribute("href", "/es/?filter=ai-vision#portfolio");
  await spanishSwitch.click();
  await expect(page).toHaveURL(/\/es\/\?filter=ai-vision#portfolio$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the fallback page for an English-only project links back to the English project", async ({ page }) => {
  await page.goto("/es/projects/valorant-players-detector/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".fallback-notice")).toBeVisible();

  const englishSwitch = page.locator(".lang-switch");
  await expect(englishSwitch).toHaveAttribute("href", "/projects/valorant-players-detector/");
  await englishSwitch.click();
  await expect(page).toHaveURL(/\/projects\/valorant-players-detector\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the English-only case study falls back to the Spanish portfolio", async ({ page }) => {
  await page.goto("/cleanyourmail/");
  await expect(page.locator(".lang-switch")).toHaveAttribute("href", "/es/#portfolio");
});
