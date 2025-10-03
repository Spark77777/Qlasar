import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/static', // output goes to backend static folder
    emptyOutDir: true
  },
  root: '.'
});
