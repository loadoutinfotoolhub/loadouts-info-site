import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { sourceEnricher } from './src/integrations/source-enricher';

export default defineConfig({
  site: 'https://loadouts.info',
  integrations: [svelte(), sitemap(), sourceEnricher()],
  vite: {
    plugins: [tailwindcss()],
  },
});
