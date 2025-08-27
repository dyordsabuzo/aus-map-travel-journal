import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import path module

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Original alias
      "@": path.resolve(__dirname, "./src"),
      // Add explicit aliases for components, utils, and types
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@blogs": path.resolve(__dirname, "./src/blogs"),
    },
  },
});
