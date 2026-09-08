import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
export default defineConfig({
  publicDir: 'public-site',
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      // Preserve the browser's host so API same-origin checks work through Vite.
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
      '/uploads': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
  build: { outDir: 'dist/client' },
});
