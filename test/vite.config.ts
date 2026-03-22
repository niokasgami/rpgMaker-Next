import { defineConfig } from "vite";
import { resolve } from 'path';
import glsl from 'vite-plugin-glsl';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  root: resolve(__dirname),
  plugins: [
    glsl(),
  ],
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../src/core'),
      '@data': resolve(__dirname, '../src/data'),
      '@managers': resolve(__dirname, '../src/managers'),
      '@objects': resolve(__dirname, '../src/objects'),
      '@scenes': resolve(__dirname, '../src/scenes'),
      'rmmz': resolve(__dirname, '../src'),
    }
  },
});
