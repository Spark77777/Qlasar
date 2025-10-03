import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname), // frontend folder
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../backend/static'), // build output for FastAPI
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // ensure Rollup sees index.html
    },
  },
});
