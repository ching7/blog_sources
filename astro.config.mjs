import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cyn-blog.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { shikiConfig: { theme: 'github-light' } },
});
