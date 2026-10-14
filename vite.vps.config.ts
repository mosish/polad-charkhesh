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
      '/robots.txt': { target: 'http://127.0.0.1:3001', changeOrigin: false },
      '/llms.txt': { target: 'http://127.0.0.1:3001', changeOrigin: false },
      '/sitemap.xml': { target: 'http://127.0.0.1:3001', changeOrigin: false },
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
      '/uploads': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
  build: {
    target: ['es2020','safari13'],
    outDir: 'dist/client',
    manifest: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Split the official core/renderer modules, retaining their initialization order.
          groups: [
            // GLSL strings have no class initialization dependencies; split them safely.
            { name: 'three-compat-shaders', test: /(?:three-webgl1|three@0\.162\.0).*[/\\]shaders[/\\]ShaderChunk[/\\]/, priority: 40 },
            { name: 'three-compat-renderer', test: /(?:three-webgl1|three@0\.162\.0).*[/\\]src[/\\](?:renderers[/\\](?:WebGLRenderer\.js|webgl[/\\]|shaders[/\\])|extras[/\\]PMREMGenerator\.js)/, priority: 30 },
            { name: 'three-compat-core', test: /three-webgl1|three@0\.162\.0/, priority: 20 },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, maxSize: 600_000 },
          ],
        },
      },
    },
  },
});
