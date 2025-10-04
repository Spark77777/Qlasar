// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.',  // <-- root is current folder (frontend/)
  plugins: [react()],
  build: {
    outDir: 'dist',  // Vite will output frontend/dist
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
