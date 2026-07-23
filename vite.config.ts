import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const resolveSrc = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: resolveSrc('App.tsx'),
      common: resolveSrc('common'),
      components: resolveSrc('components'),
      layouts: resolveSrc('layouts'),
      lib: resolveSrc('lib'),
      pages: resolveSrc('pages'),
      store: resolveSrc('store'),
      utils: resolveSrc('utils')
    }
  }
});
