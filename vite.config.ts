import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3001,
    strictPort: true,
    host: true
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]]
    }),
    basicSsl(),
    tsconfigPaths(),
    svgrPlugin(),
    nodePolyfills(),
    checker({
      typescript: true
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']

        // runtimeCaching: [
        //   {
        //     urlPattern: /\.(?:png|jpg|jpeg|svg|gif|mp4)$/,
        //     handler: 'CacheFirst',
        //     options: {
        //       cacheName: 'images-cache',
        //       expiration: {
        //         maxEntries: 50, // Количество изображений, которые будут храниться в кэше
        //         maxAgeSeconds: 30 * 24 * 60 * 60 // Время хранения (например, 30 дней)
        //       },
        //       cacheableResponse: {
        //         statuses: [0, 200]
        //       }
        //     }
        //   }
        // ]
      },
      manifest: {
        name: 'Power Wallet',
        short_name: 'PWA',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        lang: 'en',
        scope: '/',
        icons: [
          {
            src: '/logo-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        theme_color: '#000000',
        description: 'Power Wallet',
        orientation: 'any',
        handle_links: 'auto'
      }
    })
  ],
  build: {
    outDir: 'build',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        }
      }
    }
  },
  preview: {
    port: 3002,
    https: true,
    host: 'localhost',
    strictPort: true
  }
});
