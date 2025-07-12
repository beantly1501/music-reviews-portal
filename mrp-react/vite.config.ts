import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared/utils": "/src/shared/utils",
      "@shared/components": "/src/shared/components",
    },
  },
});
