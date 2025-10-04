import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.', // project root has index.html
  plugins: [react()],
  build: {
    outDir: 'dist', // production build output
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
