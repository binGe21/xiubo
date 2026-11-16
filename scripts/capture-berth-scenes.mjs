#!/usr/bin/env node
/**
 * Capture B4/B6/B8 scene-redesign evidence shots (title + mid silhouette + extract).
 */
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(
      "/cursor/stores/bc-c1cdf02f-ad23-47ae-8ae6-5ded1a6bd2c2/media/b4-b6-scene-redesign",
    );
const DOCS_SHOTS = path.join(ROOT, "docs/shots");
const SEED = 4207;

const SHOTS = [
  // Title / select — skyline + berth card
  { mission: "b8", name: "b8-title", extra: {} },
  { mission: "b4", name: "b4-title", extra: {} },
  { mission: "b6", name: "b6-title", extra: {} },
  // Mid-yard silhouette from gateward approach
  {
    mission: "b8",
    name: "b8-mid-silhouette",
    extra: { autostart: "1", cam: "-28,3.2,6.2,-2,4.5,4", noweapon: "1" },
  },
  {
    mission: "b4",
    name: "b4-mid-silhouette",
    extra: { autostart: "1", cam: "-28,3.2,6.2,-2,4.5,4", noweapon: "1" },
  },
  {
    mission: "b6",
    name: "b6-mid-silhouette",
    extra: { autostart: "1", cam: "-28,3.2,6.2,-2,4.5,4", noweapon: "1" },
  },
  // North / cold corridor vs open apron vs classic
  {
    mission: "b8",
    name: "b8-north-wide",
    extra: { autostart: "1", cam: "-8,2.8,8.5,2,5.5,20", noweapon: "1" },
  },
  {
    mission: "b4",
    name: "b4-north-wide",
    extra: { autostart: "1", cam: "-8,2.8,8.5,2,5.5,20", noweapon: "1" },
  },
  {
    mission: "b6",
    name: "b6-north-wide",
    extra: { autostart: "1", cam: "-8,2.8,8.5,2,5.5,20", noweapon: "1" },
  },
  // Shed / annex / canopy face
  {
    mission: "b8",
    name: "b8-shed-face",
    extra: { autostart: "1", cam: "-4,2.4,2.5,-2,4.2,-18", noweapon: "1" },
  },
  {
    mission: "b4",
    name: "b4-cold-plant",
    extra: { autostart: "1", cam: "8,2.6,-8,18,4.2,-20", noweapon: "1" },
  },
  {
    mission: "b6",
    name: "b6-apron-canopy",
    extra: { autostart: "1", cam: "-14,2.8,-2,2,5.5,-8", noweapon: "1" },
  },
  // Extract approach
  {
    mission: "b8",
    name: "b8-extract",
    extra: { autostart: "1", cam: "18,2.4,8,28,1.2,18", noweapon: "1" },
  },
  {
    mission: "b4",
    name: "b4-extract",
    extra: { autostart: "1", cam: "18,2.4,5.6,28,1.2,16", noweapon: "1" },
  },
  {
    mission: "b6",
    name: "b6-extract",
    extra: { autostart: "1", cam: "18,2.4,9.6,28,1.2,20", noweapon: "1" },
  },
];

async function captureViewport(page, file) {
  const client = await page.context().newCDPSession(page);
  try {
    const { data } = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(file, Buffer.from(data, "base64"));
  } finally {
    await client.detach().catch(() => {});
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const vite = await createViteServer({
    root: ROOT,
    configFile: path.join(ROOT, "vite.config.js"),
    server: { host: "127.0.0.1", port: 8751, strictPort: true },
  });
  await vite.listen();
  const base = "http://127.0.0.1:8751";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  await context.addInitScript(() => {
    try {
      localStorage.removeItem("xiubo.settings.v1");
    } catch {}
  });
  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (
      /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(url) ||
      (/\.(woff2?|ttf|otf)(\?|$)/i.test(url) && !url.includes("127.0.0.1"))
    ) {
      return route.abort();
    }
    return route.continue();
  });

  const written = [];
  for (const shot of SHOTS) {
    const page = await context.newPage();
    try {
      const params = new URLSearchParams({
        seed: String(SEED),
        q: "high",
        noaudio: "1",
        mission: shot.mission,
        ...shot.extra,
      });
      await page.goto(`${base}/?${params}`, {
        waitUntil: "domcontentloaded",
        timeout: 120_000,
      });
      await page.waitForFunction(() => window.__ready === true, null, {
        timeout: 90_000,
      });
      const fatal = await page.evaluate(() => window.__fatal);
      if (fatal) throw new Error(`${shot.name}: ${fatal}`);
      if (shot.extra.autostart) {
        await page.waitForFunction(
          () => {
            const s = typeof window.__stats === "function" && window.__stats();
            return s && s.state === "playing";
          },
          null,
          { timeout: 30_000 },
        );
        await sleep(900);
      } else {
        await page.waitForFunction(
          () => document.querySelector(".menu")?.dataset?.screen === "title",
          null,
          { timeout: 15_000 },
        );
        await sleep(900);
      }
      const file = path.join(OUT, `${shot.name}.png`);
      await captureViewport(page, file);
      written.push(file);
      console.log("wrote", file);
    } finally {
      await page.close().catch(() => {});
    }
  }

  // Refresh README docs/shots JPEGs from key PNGs via sharp-less canvas: keep PNG copies
  // and also write jpg via playwright screenshot re-encode isn't available — copy PNGs
  // then use a tiny node conversion with chromium print if needed.
  // For docs/shots we capture dedicated jpgs:
  const docsMap = [
    ["b8-mid-silhouette", "b8-skyline.jpg"],
    ["b4-mid-silhouette", "b4-skyline.jpg"],
    ["b6-mid-silhouette", "b6-skyline.jpg"],
    ["b8-extract", "b8-gate.jpg"],
    ["b4-cold-plant", "b4-gate.jpg"],
    ["b6-apron-canopy", "b6-gate.jpg"],
    ["b8-extract", "extract-plaza.jpg"],
    ["b8-title", "hero-title.jpg"],
  ];
  for (const [src, dest] of docsMap) {
    const page = await context.newPage();
    try {
      // Re-encode png→jpeg via CDP
      const png = path.join(OUT, `${src}.png`);
      const buf = await (await import("node:fs/promises")).readFile(png);
      // Use page to render image and screenshot as jpeg is heavy; instead write jpeg via CDP on live scene.
      // Fallback: keep existing docs shots and overwrite with fresh capture of same angles as jpeg.
    } finally {
      await page.close().catch(() => {});
    }
  }

  // Dedicated jpeg captures for docs/shots
  const jpegShots = [
    {
      file: "b8-skyline.jpg",
      mission: "b8",
      cam: "-28,3.2,6.2,-2,4.5,4",
    },
    {
      file: "b4-skyline.jpg",
      mission: "b4",
      cam: "-28,3.2,6.2,-2,4.5,4",
    },
    {
      file: "b6-skyline.jpg",
      mission: "b6",
      cam: "-28,3.2,6.2,-2,4.5,4",
    },
    {
      file: "b8-gate.jpg",
      mission: "b8",
      cam: "-34,2.2,5.5,-20,2.8,6",
    },
    {
      file: "b4-gate.jpg",
      mission: "b4",
      cam: "-34,2.2,5.5,-20,2.8,6",
    },
    {
      file: "b6-gate.jpg",
      mission: "b6",
      cam: "-34,2.2,5.5,-20,2.8,6",
    },
    {
      file: "extract-plaza.jpg",
      mission: "b8",
      cam: "18,2.4,8,28,1.2,18",
    },
    {
      file: "hero-title.jpg",
      mission: "b8",
      cam: null,
    },
  ];
  await mkdir(DOCS_SHOTS, { recursive: true });
  for (const shot of jpegShots) {
    const page = await context.newPage();
    try {
      const params = new URLSearchParams({
        seed: String(SEED),
        q: "high",
        noaudio: "1",
        mission: shot.mission,
      });
      if (shot.cam) {
        params.set("autostart", "1");
        params.set("cam", shot.cam);
        params.set("noweapon", "1");
      }
      await page.goto(`${base}/?${params}`, {
        waitUntil: "domcontentloaded",
        timeout: 120_000,
      });
      await page.waitForFunction(() => window.__ready === true, null, {
        timeout: 90_000,
      });
      if (shot.cam) {
        await page.waitForFunction(
          () => {
            const s = typeof window.__stats === "function" && window.__stats();
            return s && s.state === "playing";
          },
          null,
          { timeout: 30_000 },
        );
        await sleep(900);
      } else {
        await page.waitForFunction(
          () => document.querySelector(".menu")?.dataset?.screen === "title",
          null,
          { timeout: 15_000 },
        );
        await sleep(900);
      }
      const client = await page.context().newCDPSession(page);
      try {
        const { data } = await client.send("Page.captureScreenshot", {
          format: "jpeg",
          quality: 82,
          fromSurface: true,
          captureBeyondViewport: false,
        });
        const dest = path.join(DOCS_SHOTS, shot.file);
        await writeFile(dest, Buffer.from(data, "base64"));
        console.log("docs", dest);
      } finally {
        await client.detach().catch(() => {});
      }
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close();
  await vite.close();
  console.log(`done ${written.length} pngs → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
