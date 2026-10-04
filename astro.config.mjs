// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production URL used for canonical links, sitemap and RSS.
  site: 'https://www.hairmusedaily.com',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
