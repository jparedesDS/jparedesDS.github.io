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

test("the tutorial switches EN -> ES -> EN", async ({ page }) => {
  await page.goto("/blog/2026/11/09/how-subany-video-works/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/es\/blog\/2026\/11\/09\/como-funciona-subany-video\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("h1")).toContainText("Cómo funciona subany.video");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/blog\/2026\/11\/09\/how-subany-video-works\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toContainText("How subany.video works");
});

test("a translated project keeps its equivalent route", async ({ page }) => {
  await page.goto("/projects/subany-video/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.locator(".lang-switch").click();
  await expect(page).toHaveURL(/\/es\/projects\/subany-video\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("an English-only model offers the Spanish projects index and falls back", async ({ page }) => {
  await page.goto("/projects/cs2-players-detector-yolo12s/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const spanishSwitch = page.locator(".lang-switch");
  await expect(spanishSwitch).toHaveAttribute("href", "/es/projects/");
  await spanishSwitch.click();
  await expect(page).toHaveURL(/\/es\/projects\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the fallback page for an English-only model links back to the English project", async ({ page }) => {
  await page.goto("/es/projects/cs2-players-detector-yolo12s/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".fallback-notice")).toBeVisible();

  const englishSwitch = page.locator(".lang-switch");
  await expect(englishSwitch).toHaveAttribute("href", "/projects/cs2-players-detector-yolo12s/");
  await englishSwitch.click();
  await expect(page).toHaveURL(/\/projects\/cs2-players-detector-yolo12s\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
