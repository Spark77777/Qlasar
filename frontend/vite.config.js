import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "../backend/static", // adjust if backend folder differs
    emptyOutDir: true,
  },
});
