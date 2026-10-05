import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['Updos & Buns', 'Waves & Curls', 'Braids', 'Bangs & Bobs', 'Occasion Hairstyles']),
    image: z.string(),
    imageAlt: z.string(),
    tags: z.array(z.string()).default([]),
    pinDescription: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
