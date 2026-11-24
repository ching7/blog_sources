import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://southocean.home64.de',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { shikiConfig: { theme: 'github-light' } },
});
