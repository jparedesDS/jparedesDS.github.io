import { test, expect } from "@playwright/test";

test("the page has no vertical frame and a round portrait", async ({ page }) => {
  await page.goto("/");
  const s = await page.evaluate(() => {
    const pageEl = document.querySelector(".page");
    const portrait = document.querySelector(".portrait");
    return {
      left: getComputedStyle(pageEl).borderLeftWidth,
      right: getComputedStyle(pageEl).borderRightWidth,
      radius: getComputedStyle(portrait).borderRadius,
    };
  });
  expect(s.left).toBe("0px");
  expect(s.right).toBe("0px");
  expect(s.radius).toBe("50%");
});

test("the light palette and Inter Variable match subany", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto("/");
  const s = await page.evaluate(() => ({
    bg: getComputedStyle(document.body).backgroundColor,
    font: getComputedStyle(document.body).fontFamily,
  }));
  expect(s.bg).toBe("rgb(201, 174, 140)");
  expect(s.font).toContain("Inter Variable");
});

test("the dark palette matches subany", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(58, 54, 51)");
});
