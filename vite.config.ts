import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['seedo-logo.png'],
      manifest: {
        name: 'SEEDO Fret',
        short_name: 'SEEDO Fret',
        description: 'Trouvez un camion, suivez votre fret en temps réel — pilote Cotonou / Calavi.',
        theme_color: '#0B2A4A',
        background_color: '#0B2A4A',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/seedo-logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/seedo-logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/seedo-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
})
