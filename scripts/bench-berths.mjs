#!/usr/bin/env node
/**
 * Capture /?bench=1 frame-time notes for B8/B4/B6 at high + medium.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(
      "/cursor/stores/bc-c1cdf02f-ad23-47ae-8ae6-5ded1a6bd2c2/media/launch-identity-perf",
    );

const CASES = [
  { mission: "b8", q: "high" },
  { mission: "b4", q: "high" },
  { mission: "b6", q: "high" },
  { mission: "b8", q: "medium" },
  { mission: "b4", q: "medium" },
  { mission: "b6", q: "medium" },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const vite = await createViteServer({
    root: ROOT,
    configFile: path.join(ROOT, "vite.config.js"),
    server: { host: "127.0.0.1", port: 8752, strictPort: true },
  });
  await vite.listen();
  const base = "http://127.0.0.1:8752";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  await context.addInitScript(() => {
    try {
      localStorage.removeItem("xiubo.settings.v1");
    } catch {}
    window.__ft = [];
    window.__ftLast = 0;
    window.__ftOn = false;
  });

  const rows = [];
  for (const c of CASES) {
    const page = await context.newPage();
    try {
      const params = new URLSearchParams({
        bench: "1",
        mission: c.mission,
        q: c.q,
        seed: "4207",
        noaudio: "1",
      });
      await page.goto(`${base}/?${params}`, {
        waitUntil: "domcontentloaded",
        timeout: 120_000,
      });
      await page.waitForFunction(() => window.__ready === true, null, {
        timeout: 90_000,
      });
      await page.evaluate(() => {
        window.__ft = [];
        window.__ftLast = performance.now();
        window.__ftOn = true;
        const loop = (now) => {
          if (!window.__ftOn) return;
          window.__ft.push(now - window.__ftLast);
          window.__ftLast = now;
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      });
      await sleep(10000);
      const sampled = await page.evaluate(() => {
        window.__ftOn = false;
        const all = window.__ft.slice();
        const ms = all.slice(60); // drop ~1s warmup
        ms.sort((a, b) => a - b);
        const avg = ms.reduce((s, v) => s + v, 0) / Math.max(1, ms.length);
        const med = ms[ms.length >> 1] || 0;
        const p99 = ms[Math.min(ms.length - 1, Math.floor(ms.length * 0.99))] || med;
        const stats =
          typeof window.__stats === "function" ? window.__stats() : {};
        const benchEl = document.getElementById("bench");
        return {
          avgMs: ms.length ? +avg.toFixed(2) : null,
          medianMs: ms.length ? +med.toFixed(2) : null,
          p99Ms: ms.length ? +p99.toFixed(2) : null,
          fps: ms.length ? +(1000 / avg).toFixed(1) : null,
          statsFps: stats.fps || null,
          state: stats.state || null,
          benchText: benchEl ? String(benchEl.textContent || "").slice(0, 500) : "",
          n: ms.length,
          total: all.length,
        };
      });
      const row = {
        mission: c.mission,
        quality: c.q,
        ...sampled,
      };
      rows.push(row);
      console.log(
        `${c.mission}@${c.q}: avg=${row.avgMs} med=${row.medianMs} p99=${row.p99Ms} fps=${row.fps} n=${row.n}/${row.total}`,
      );
      await page.screenshot({
        path: path.join(OUT, `bench-${c.mission}-${c.q}.png`),
        type: "png",
      });
    } finally {
      await page.close().catch(() => {});
    }
  }

  const md = [
    "# Bench notes (Chromium headless, 1280×720)",
    "",
    "Sampled via page `requestAnimationFrame` for ~10s after `__ready` (~1s warmup trimmed).",
    "",
    `| Mission | Quality | Avg ms | Median ms | p99 ms | ≈FPS |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...rows.map(
      (r) =>
        `| ${r.mission} | ${r.quality} | ${r.avgMs ?? "—"} | ${r.medianMs ?? "—"} | ${r.p99Ms ?? "—"} | ${r.fps ?? "—"} |`,
    ),
    "",
    "Environment: cloud agent VM, Playwright Chromium, `/?bench=1&seed=4207`.",
    "Honest for this host — laptop GPUs differ; dynres still scales under load.",
    "Perf this pass: geometry dispose on rebuild/skyline swap; high default no motion blur; leaner volSteps/rain on medium/low.",
    "",
  ].join("\n");
  await writeFile(path.join(OUT, "bench-notes.md"), md);
  await writeFile(
    path.join(OUT, "bench-notes.json"),
    JSON.stringify(rows, null, 2),
  );
  console.log("wrote", path.join(OUT, "bench-notes.md"));

  await browser.close();
  await vite.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
