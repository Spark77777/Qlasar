import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "./frontend",
  build: {
    outDir: path.resolve(__dirname, "../backend/static"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "frontend/index.html"),
    },
  },
});
