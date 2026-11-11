import { test, expect } from "@playwright/test";

test("the hero is about half its old height", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const height = await page.evaluate(() => document.querySelector(".hero").getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(280);
  expect(height).toBeLessThanOrEqual(330);
});

for (const [width, columns] of [[1440, 3], [768, 2], [360, 1]]) {
  test(`the work grid has ${columns} columns at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const count = await page.evaluate(
      () => getComputedStyle(document.querySelector(".work-grid")).gridTemplateColumns.split(" ").length,
    );
    expect(count).toBe(columns);
  });
}

test("experience and writing are side by side at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const boxes = await page.evaluate(() => {
    const e = document.querySelector("#experience").getBoundingClientRect();
    const w = document.querySelector("#writing").getBoundingClientRect();
    return { eTop: e.top, wTop: w.top, eLeft: e.left, wLeft: w.left };
  });
  expect(Math.abs(boxes.eTop - boxes.wTop)).toBeLessThan(2);
  expect(boxes.wLeft).toBeGreaterThan(boxes.eLeft);
});

test("experience and writing stack at 980", async ({ page }) => {
  await page.setViewportSize({ width: 980, height: 1000 });
  await page.goto("/");
  const boxes = await page.evaluate(() => {
    const e = document.querySelector("#experience").getBoundingClientRect();
    const w = document.querySelector("#writing").getBoundingClientRect();
    return { eBottom: e.bottom, wTop: w.top };
  });
  expect(boxes.wTop).toBeGreaterThanOrEqual(boxes.eBottom - 2);
});

test("experience and writing stack at 360 without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  const boxes = await page.evaluate(() => {
    const e = document.querySelector("#experience").getBoundingClientRect();
    const w = document.querySelector("#writing").getBoundingClientRect();
    return {
      eBottom: e.bottom,
      wTop: w.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(boxes.wTop).toBeGreaterThanOrEqual(boxes.eBottom - 2);
  expect(boxes.overflow).toBeLessThanOrEqual(1);
});

for (const [width, columns] of [[1440, 4], [980, 1], [360, 1]]) {
  test(`the contact panel has ${columns} columns at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const count = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".contact-panel"))
          .gridTemplateColumns.split(" ").length,
    );
    expect(count).toBe(columns);
  });
}

test("contact has four columns at 1440 and one at 980", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  let count = await page.evaluate(() => getComputedStyle(document.querySelector(".contact-panel")).gridTemplateColumns.split(" ").length);
  expect(count).toBe(4);
  await page.setViewportSize({ width: 980, height: 1000 });
  await page.reload();
  count = await page.evaluate(() => getComputedStyle(document.querySelector(".contact-panel")).gridTemplateColumns.split(" ").length);
  expect(count).toBe(1);
});

test("the contact panel names the personal, Pro POV and Sites blocks", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".contact-panel")).toContainText("Personal");
  await expect(page.locator(".contact-panel")).toContainText("Pro POV CS2");
  await expect(page.locator(".contact-panel")).toContainText("Sites");
  await expect(page.locator('.contact-panel a[href="https://cleanyourmail.org/"]')).toBeVisible();
  await expect(page.locator('.contact-panel a[href="https://cleanyourphone.org/"]')).toBeVisible();
});

test("the timeline does not overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("the CleanYourPhone logo is contained, not cropped", async ({ page }) => {
  await page.goto("/");
  const fit = await page.evaluate(
    () =>
      getComputedStyle(
        document.querySelector('.work-media[data-project="cleanyourphone"] img'),
      ).objectFit,
  );
  expect(fit).toBe("contain");
});

test("focusing a card link shows a ring on the card", async ({ page }) => {
  await page.goto("/");
  await page.locator(".work-card .work-media-link").first().focus();
  const outline = await page.evaluate(() => {
    const card = document.querySelector(".work-card");
    const styles = getComputedStyle(card);
    return {
      style: styles.outlineStyle,
      width: styles.outlineWidth,
      offset: styles.outlineOffset,
    };
  });
  expect(outline.style).toBe("solid");
  expect(outline.width).toBe("2px");
  expect(outline.offset).toBe("3px");
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
