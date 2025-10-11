// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ Use absolute paths for deployed environment
  build: {
    outDir: path.resolve(__dirname, "../backend/public"), // backend will serve from public
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
