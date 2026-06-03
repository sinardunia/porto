import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    slug: z.string().optional(),
    excerpt: z.string().nullable().optional(),
    cover_image_url: z.string().nullable().optional(),
    cover_image_alt: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().nullable().optional(),
    is_published: z.boolean().default(true),
  }),
});

export const collections = { blog };
