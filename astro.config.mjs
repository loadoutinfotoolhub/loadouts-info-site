import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://loadouts.info',
  integrations: [svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
