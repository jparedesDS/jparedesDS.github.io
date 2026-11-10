const path = require("node:path");
const { defineConfig, devices } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "..");

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "**/*.spec.js",
  timeout: 30_000,
  outputDir: path.join(repoRoot, "test-results"),
  reporter: [["list"], ["html", { outputFolder: path.join(repoRoot, "playwright-report"), open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bundle exec jekyll serve --host 127.0.0.1 --port 4000",
    cwd: repoRoot,
    url: "http://127.0.0.1:4000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
