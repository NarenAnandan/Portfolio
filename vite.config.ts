import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public-static',
  build: { outDir: 'dist', sourcemap: false, target: 'es2020' },
});
