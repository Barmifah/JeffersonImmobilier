import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: { host: '0.0.0.0', hmr: { host: 'localhost', clientPort: 5173 } },
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'icons/*.png'],
    manifest: {
      name: 'Jefferson Immobilier',
      short_name: 'Jefferson Immo',
      description: 'Plateforme immobilière Jefferson Immobilier',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#071B3A',
      background_color: '#071B3A',
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallbackDenylist: [/^\/api\//, /^\/admin/],
      runtimeCaching: [{
        urlPattern: ({ url }) => url.pathname.startsWith('/api/properties'),
        handler: 'NetworkFirst',
        options: { cacheName: 'public-properties', expiration: { maxEntries: 30, maxAgeSeconds: 300 } },
      }],
    },
  })],
})
