import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "../backend/static"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/chat": "http://localhost:8000",
      "/proactive": "http://localhost:8000",
    },
  },
});
