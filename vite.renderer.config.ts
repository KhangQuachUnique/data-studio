import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "electron/core"),
      "@electron": path.resolve(__dirname, "electron"),
      "@renderer": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  plugins: [react()],
});
