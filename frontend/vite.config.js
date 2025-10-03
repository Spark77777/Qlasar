import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.', // this makes Vite use the folder containing vite.config.js as root
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../backend/static'), // output goes to backend/static
    emptyOutDir: true, // clears the folder before build
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // explicitly tell Rollup where index.html is
    },
  },
});
