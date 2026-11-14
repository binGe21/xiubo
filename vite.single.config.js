import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Produce one self-contained HTML (fonts load from Google when online). */
export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [viteSingleFile()],
  resolve: {
    alias: {
      "/src/fonts.css": path.resolve(root, "src/fonts.cdn.css"),
      "./src/fonts.css": path.resolve(root, "src/fonts.cdn.css"),
    },
  },
  build: {
    outDir: "dist-single",
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 5000,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
