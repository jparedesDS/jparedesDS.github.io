import { test, expect } from "@playwright/test";

for (const [width, columns] of [[1440, 4], [768, 2], [360, 1]]) {
  test(`the work grid has ${columns} columns at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const count = await page.evaluate(
      () => getComputedStyle(document.querySelector(".work-grid")).gridTemplateColumns.split(" ").length,
    );
    expect(count).toBe(columns);
  });
}

test("the timeline does not overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

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
