import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 8743,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8743,
    strictPort: true,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
  },
});
