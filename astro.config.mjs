import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://loadouts.info',
  integrations: [svelte(), sitemap()],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
