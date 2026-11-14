#!/usr/bin/env node
/**
 * Fixed-seed playtest screenshot harness.
 * Convention: docs/PLAYTEST.md
 *
 * Not part of `npm run check`. Requires Playwright + Chromium:
 *   npm install
 *   npx playwright install chromium
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_SEED = 4207;
const DEFAULT_QUALITY = "high";
const DEFAULT_SHOTS = ["title", "settings", "hud", "paused"];
const VIEWPORTS = {
  wide: { width: 1280, height: 720 },
  narrow: { width: 390, height: 844 },
};
const SETTINGS_KEY = "xiubo.settings.v1";
const READY_TIMEOUT_MS = 90_000;

function printHelp() {
  console.log(`Usage: node scripts/playtest-shots.mjs [options]

Options:
  --seed=<n>          Fixed RNG seed (default ${DEFAULT_SEED})
  --q=<preset>        Quality preset (default ${DEFAULT_QUALITY})
  --label=<name>      Output folder under playtest-out/ (default manual)
  --out=<dir>         Absolute or repo-relative output dir (overrides --label)
  --shots=<list>      Comma list: title,settings,hud,paused (default all)
  --viewports=<list>  Comma list: wide,narrow (default both)
  --port=<n>          Vite port when starting server (default 8743)
  --url=<url>         Base URL (implies --no-server if set via PLAYTEST_URL too)
  --no-server         Do not start Vite; require a reachable --url / PLAYTEST_URL
  --headed            Show browser window
  -h, --help          Show this help

Examples:
  npm run playtest:shots
  npm run playtest:shots -- --label=pass3-atmosphere --shots=title,hud
  PLAYTEST_URL=http://127.0.0.1:8743 npm run playtest:shots -- --no-server
`);
}

function parseArgs(argv) {
  const opts = {
    seed: DEFAULT_SEED,
    q: DEFAULT_QUALITY,
    label: "manual",
    out: null,
    shots: [...DEFAULT_SHOTS],
    viewports: ["wide"],
    port: 8743,
    url: process.env.PLAYTEST_URL || "",
    noServer: false,
    headed: false,
    help: false,
  };
  for (const raw of argv) {
    if (raw === "-h" || raw === "--help") {
      opts.help = true;
      continue;
    }
    if (raw === "--no-server") {
      opts.noServer = true;
      continue;
    }
    if (raw === "--headed") {
      opts.headed = true;
      continue;
    }
    const m = /^--([^=]+)=(.*)$/.exec(raw);
    if (!m) {
      throw new Error(`Unknown argument: ${raw}`);
    }
    const [, key, value] = m;
    switch (key) {
      case "seed":
        opts.seed = Number(value);
        if (!Number.isFinite(opts.seed)) throw new Error("Invalid --seed");
        break;
      case "q":
        opts.q = value;
        break;
      case "label":
        opts.label = value.replace(/[/\\]/g, "-") || "manual";
        break;
      case "out":
        opts.out = value;
        break;
      case "shots":
        opts.shots = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "viewports":
        opts.viewports = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "port":
        opts.port = Number(value);
        if (!Number.isFinite(opts.port)) throw new Error("Invalid --port");
        break;
      case "url":
        opts.url = value;
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }
  }
  if (opts.url) opts.noServer = true;
  return opts;
}

function buildQuery(opts, extra = {}) {
  const params = new URLSearchParams({
    seed: String(opts.seed),
    q: opts.q,
    noaudio: "1",
    ...extra,
  });
  return `/?${params.toString()}`;
}

async function portFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function startVite(port) {
  const free = await portFree(port);
  if (!free) {
    console.log(
      `[playtest] port ${port} busy — reusing http://127.0.0.1:${port}`,
    );
    return { baseUrl: `http://127.0.0.1:${port}`, close: async () => {} };
  }
  const vite = await createViteServer({
    root: ROOT,
    configFile: path.join(ROOT, "vite.config.js"),
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true,
    },
  });
  await vite.listen();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[playtest] vite listening at ${baseUrl}`);
  return {
    baseUrl,
    close: async () => {
      await vite.close();
    },
  };
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    console.error(
      "[playtest] Missing dependency `playwright`.\n" +
        "  npm install\n" +
        "  npx playwright install chromium\n" +
        "See docs/PLAYTEST.md",
    );
    process.exitCode = 1;
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitReady(page) {
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: READY_TIMEOUT_MS,
  });
  const fatal = await page.evaluate(() => window.__fatal);
  if (fatal) throw new Error(`Game fatal during boot: ${fatal}`);
}

async function prepareContext(context) {
  await context.addInitScript((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, SETTINGS_KEY);
  // Remote webfonts are optional; blocking keeps capture offline-stable.
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
}

async function openShotPage(context) {
  // Fresh page per shot — WebGL pages can stall subsequent navigations.
  return context.newPage();
}

async function gotoGame(page, url) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
}

async function shotPath(outDir, seed, viewport, screen) {
  const name = `seed-${seed}-${viewport}-${screen}.png`;
  return path.join(outDir, name);
}

/**
 * CDP capture avoids Playwright's compositor path, which can hang on WebGL canvases.
 */
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

async function waitPlaying(page) {
  await page.waitForFunction(
    () => {
      const stats = typeof window.__stats === "function" && window.__stats();
      return stats && stats.state === "playing";
    },
    null,
    { timeout: 30_000 },
  );
}

async function withShotPage(context, viewport, run) {
  const page = await openShotPage(context);
  try {
    await page.setViewportSize(VIEWPORTS[viewport]);
    return await run(page);
  } finally {
    await page.close().catch(() => {});
  }
}

async function captureTitle(context, baseUrl, opts, viewport, outDir) {
  return withShotPage(context, viewport, async (page) => {
    await gotoGame(page, `${baseUrl}${buildQuery(opts)}`);
    await waitReady(page);
    await page.waitForFunction(
      () => document.querySelector(".menu")?.dataset?.screen === "title",
      null,
      { timeout: 15_000 },
    );
    await sleep(800);
    const file = await shotPath(outDir, opts.seed, viewport, "title");
    await captureViewport(page, file);
    return file;
  });
}

async function captureSettings(context, baseUrl, opts, viewport, outDir) {
  return withShotPage(context, viewport, async (page) => {
    await gotoGame(page, `${baseUrl}${buildQuery(opts)}`);
    await waitReady(page);
    await page.waitForSelector('.m-title button[data-act="settings"]', {
      state: "visible",
      timeout: 15_000,
    });
    await page.click('.m-title button[data-act="settings"]');
    await page.waitForFunction(
      () => document.querySelector(".menu")?.classList.contains("panel-open"),
      null,
      { timeout: 10_000 },
    );
    await sleep(400);
    const file = await shotPath(outDir, opts.seed, viewport, "settings");
    await captureViewport(page, file);
    return file;
  });
}

async function captureHud(context, baseUrl, opts, viewport, outDir) {
  return withShotPage(context, viewport, async (page) => {
    await gotoGame(page, `${baseUrl}${buildQuery(opts, { autostart: "1" })}`);
    await waitReady(page);
    await waitPlaying(page);
    await sleep(1000);
    const file = await shotPath(outDir, opts.seed, viewport, "hud");
    await captureViewport(page, file);
    return file;
  });
}

async function capturePaused(context, baseUrl, opts, viewport, outDir) {
  return withShotPage(context, viewport, async (page) => {
    await gotoGame(page, `${baseUrl}${buildQuery(opts, { autostart: "1" })}`);
    await waitReady(page);
    await waitPlaying(page);
    await sleep(600);
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () => document.querySelector(".menu")?.dataset?.screen === "paused",
      null,
      { timeout: 10_000 },
    );
    await sleep(400);
    const file = await shotPath(outDir, opts.seed, viewport, "paused");
    await captureViewport(page, file);
    return file;
  });
}

const CAPTURE = {
  title: captureTitle,
  settings: captureSettings,
  hud: captureHud,
  paused: capturePaused,
};

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(String(err.message || err));
    printHelp();
    process.exitCode = 1;
    return;
  }
  if (opts.help) {
    printHelp();
    return;
  }

  for (const shot of opts.shots) {
    if (!CAPTURE[shot]) {
      console.error(
        `[playtest] Unknown shot "${shot}". Allowed: ${Object.keys(CAPTURE).join(", ")}`,
      );
      process.exitCode = 1;
      return;
    }
  }
  for (const vp of opts.viewports) {
    if (!VIEWPORTS[vp]) {
      console.error(
        `[playtest] Unknown viewport "${vp}". Allowed: ${Object.keys(VIEWPORTS).join(", ")}`,
      );
      process.exitCode = 1;
      return;
    }
  }

  const playwright = await loadPlaywright();
  if (!playwright) return;

  const outDir = path.resolve(
    ROOT,
    opts.out || path.join("playtest-out", opts.label),
  );
  await mkdir(outDir, { recursive: true });

  let server = { baseUrl: opts.url, close: async () => {} };
  if (!opts.noServer) {
    server = await startVite(opts.port);
  } else if (!opts.url) {
    console.error(
      "[playtest] --no-server requires --url=... or PLAYTEST_URL=...",
    );
    process.exitCode = 1;
    return;
  }

  const baseUrl = (opts.url || server.baseUrl).replace(/\/$/, "");
  const written = [];
  let browser;
  try {
    browser = await playwright.chromium.launch({
      headless: !opts.headed,
      args: [
        "--enable-unsafe-swiftshader",
        "--ignore-gpu-blocklist",
        "--use-gl=angle",
        "--use-angle=swiftshader",
      ],
    });
    const context = await browser.newContext({
      deviceScaleFactor: 1,
    });
    await prepareContext(context);

    for (const viewport of opts.viewports) {
      for (const shot of opts.shots) {
        console.log(`[playtest] ${viewport} / ${shot} ...`);
        const file = await CAPTURE[shot](
          context,
          baseUrl,
          opts,
          viewport,
          outDir,
        );
        written.push(path.relative(ROOT, file));
        console.log(`[playtest] wrote ${path.relative(ROOT, file)}`);
      }
    }

    const manifest = {
      seed: opts.seed,
      q: opts.q,
      label: opts.label,
      baseUrl,
      viewports: opts.viewports,
      shots: opts.shots,
      files: written,
      createdAt: new Date().toISOString(),
    };
    const manifestPath = path.join(outDir, "manifest.json");
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`[playtest] manifest ${path.relative(ROOT, manifestPath)}`);
    console.log(`[playtest] done — ${written.length} screenshot(s)`);
  } catch (err) {
    console.error("[playtest] failed:", err && err.stack ? err.stack : err);
    if (
      String(err && err.message).includes("Executable doesn't exist") ||
      String(err).includes("playwright install")
    ) {
      console.error(
        "[playtest] Install browser binaries: npx playwright install chromium",
      );
    }
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    await server.close().catch(() => {});
  }
}

main();
