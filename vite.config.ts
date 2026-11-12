import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Relative base so the same build works from the GitHub Pages project path.
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
  plugins: [
    VitePWA({
      // The game prompts the player before reloading (FR-055), so updates are not applied silently.
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Project Hop',
        short_name: 'Hop',
        description: 'Guide a frog across the road and river to five home bays.',
        theme_color: '#1b5e20',
        background_color: '#1b5e20',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache every built asset so the game runs with no network after one visit (FR-054).
        globPatterns: ['**/*.{js,css,html,png,json,mp3,ogg,wav}'],
      },
    }),
  ],
});
