import { test, expect } from "@playwright/test";

const widths = [320, 390, 768, 1024, 1440];

const routes = [
  { path: "/", name: "home EN" },
  { path: "/projects/", name: "projects EN" },
  { path: "/blog/", name: "blog EN" },
  { path: "/blog/2026/11/09/how-subany-video-works/", name: "tutorial EN" },
  { path: "/repositories/", name: "repositories EN" },
  { path: "/cv/", name: "CV EN" },
  { path: "/es/", name: "home ES" },
  { path: "/es/projects/", name: "projects ES" },
  { path: "/es/blog/", name: "blog ES" },
  { path: "/es/blog/2026/11/09/como-funciona-subany-video/", name: "tutorial ES" },
  { path: "/es/repositories/", name: "repositories ES" },
  { path: "/es/cv/", name: "CV ES" },
];

const expectNoHorizontalOverflow = async (page, label) => {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `${label}: document scrollWidth ${scrollWidth} vs clientWidth ${clientWidth}`).toBeLessThanOrEqual(clientWidth + 1);
};

for (const width of widths) {
  for (const { path, name } of routes) {
    test(`${name} does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expectNoHorizontalOverflow(page, `${name} at ${width}px`);
    });
  }
}

for (const width of [320, 390]) {
  for (const path of ["/", "/es/"]) {
    test(`mobile menu opens, closes and stays inside the viewport at ${width}px (${path})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);

      const toggle = page.locator(".navbar-toggler-main");
      const menu = page.locator("#navbarNav");

      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(menu).toHaveClass(/show/);

      await expectNoHorizontalOverflow(page, `open menu at ${width}px (${path})`);

      const clipped = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth;
        return [...document.querySelectorAll("#navbarNav a, #navbarNav button")]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return style.visibility !== "hidden" && style.display !== "none" && box.width > 0 && (box.left < -1 || box.right > viewport + 1);
          })
          .map((element) => element.textContent.trim());
      });
      expect(clipped, `menu entries clipped at ${width}px (${path})`).toEqual([]);

      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(menu).not.toHaveClass(/show/);
      await expectNoHorizontalOverflow(page, `closed menu at ${width}px (${path})`);
    });
  }
}
