#!/usr/bin/env node
/**
 * Copy the single-file ship build into release/xiubo.html.
 * Run after `npm run build:single` (or use `npm run release`).
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "dist-single", "index.html");
const destDir = path.join(root, "release");
const dest = path.join(destDir, "xiubo.html");

if (!existsSync(src)) {
  console.error(
    "[sync-release] missing dist-single/index.html — run `npm run build:single` first",
  );
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
const kb = Math.round(statSync(dest).size / 1024);
console.log(`[sync-release] wrote ${path.relative(root, dest)} (${kb} KiB)`);
