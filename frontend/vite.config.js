// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./", // ✅ Ensures relative paths for assets
  build: {
    outDir: path.resolve(__dirname, "dist"), // ✅ Stay inside frontend folder
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
