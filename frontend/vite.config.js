import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/static/", // all asset URLs start with /static/
  build: {
    outDir: "../backend/static", // output directly to backend static folder
    emptyOutDir: true,            // clean the folder before build
  },
});
