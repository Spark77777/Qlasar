import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './frontend', // tells Vite where index.html is
  build: {
    outDir: 'dist',   // output directory (will be frontend/dist)
    emptyOutDir: true // clean before building
  }
})
