import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "../backend/static"), // Output build to backend/static
    emptyOutDir: true, // Clear folder before build
    rollupOptions: {
      input: path.resolve(__dirname, "index.html")
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
