// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./", // ✅ important: makes asset URLs relative
  build: {
    outDir: path.resolve(__dirname, "../backend/public"), // where Express serves from
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
