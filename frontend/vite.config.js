import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0
    port: process.env.PORT || 5173
  },
  build: {
    outDir: '../backend/static', // Build files go to backend/static for Python to serve
    emptyOutDir: true
  }
});
