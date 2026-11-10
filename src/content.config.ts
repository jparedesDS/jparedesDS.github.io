import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const cases = defineCollection({
  loader: glob({ base: "./src/content/cases", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z.enum(["ai-vision", "data-automation", "products", "esports"]),
    year: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          external: z.boolean().optional(),
        }),
      )
      .default([]),
    order: z.number().default(99),
  }),
});

export const collections = { cases };
