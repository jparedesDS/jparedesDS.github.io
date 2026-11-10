import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jparedesds.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
});
