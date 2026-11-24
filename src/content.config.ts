import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  // 必须自定义 id：默认的 slugger 会把 01.dev 变成 01dev，旧链接就断了
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/notes',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    lastmod: z.coerce.date().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { notes };
