// Procedural berth layout profiles — spatial + sensory variants without forking the whole map.
// Kept in world/ so level code stays free of game/missions imports.

var LAYOUT_IDS = ["b8", "b4", "b6"];

var LAYOUTS = {
  b8: {
    id: "b8",
    yardTitle: "八号泊位 · 深水",
    quaySign: "趸船站 8",
    boardSign: "撤离舷梯",
    extractApproach: "home",
    extractMark: "趸",
    gateDecal: "berth8",
    gateSignText: "深水八号泊位",
    laneMarks: ["一道", "二道", "三道", "主道"],
    extractZ: 0,
    spawnBias: ["gate", "yard", "shed", "quay"],
    // Classic dense mixed stacks — the “home” yard→shed→quay read.
    midStyle: "mixed",
    extras: "home",
    // Shed building shell + gate booth/boom (not grade/audio).
    shedShell: {
      title: "八号仓库",
      accent: "paint_yellow",
      wallBand: "paint_grey",
      labelColor: "white",
      interior: "mixed",
    },
    // Classic berth — no annex masses (B4/B6 add distinct footprints).
    sceneMass: "home",
    gateShell: {
      boothColor: "white",
      boothShift: 0,
      armOpen: 0.08,
      armYaw: 0,
      boothText: "闸口控制 · 8",
    },
    // Far gantry skyline + near quay crane identity (not grade/audio).
    skyline: {
      craneId: "锈泊 08",
      craneZ: 0,
      craneScale: 1,
      farDz: 66,
      gantries: [
        [-132, 1.15, true, [0.14, 0.17, 0.21]],
        [-186, 1.25, false, [0.14, 0.17, 0.21]],
        [-252, 1.35, true, [0.26, 0.12, 0.06]],
        [-336, 1.4, false, [0.26, 0.12, 0.06]],
        [128, 1.2, false, [0.14, 0.17, 0.21]],
        [182, 1.3, true, [0.24, 0.25, 0.27]],
        [250, 1.4, false, [0.24, 0.25, 0.27]],
        [330, 1.45, true, [0.26, 0.12, 0.06]],
      ],
    },
    sense: {
      saturation: 1,
      rain: 0.78,
      grain: 0.03,
      vignette: 0.4,
      // Cool-steel shadows, sodium-orange highlights (baseline 锈泊).
      gradeSh: [0.84, 0.97, 1.08],
      gradeHi: [1.14, 0.98, 0.78],
    },
    audio: {
      rain: 1,
      wind: 1,
      sea: 1,
      foghorn: 1,
      windPitch: 1,
    },
    // Subtle playfeel bias — keeps berth identity without rewriting core locomotion.
    feel: {
      walk: 1,
      sprint: 1,
      accel: 1,
      landDip: 1,
      extractHold: 1.35,
      extractRadius: 2.5,
    },
  },
  b4: {
    id: "b4",
    yardTitle: "四号泊位 · 冷藏",
    quaySign: "冷岸趸船 4",
    boardSign: "冷岸登船",
    extractApproach: "cold",
    extractMark: "冷",
    gateDecal: "berth4c",
    gateSignText: "冷藏四号泊位",
    laneMarks: ["冷一", "冷二", "岸电", "冷链"],
    extractZ: -2.4,
    spawnBias: ["quay", "yard", "shed", "gate"],
    // Cold-chain reefers choke east/south lanes; jersey wall forces quay approaches.
    midStyle: "reefer",
    extras: "cold",
    // Cold shed shell — white/teal band, compressor accents; tight closed boom.
    shedShell: {
      title: "四号冷库",
      accent: "paint_blue",
      wallBand: "paint_white",
      labelColor: "white",
      interior: "cold",
    },
    // East insulated plant wing + vapor stacks — not a tinted B8 shed footprint.
    sceneMass: "cold_plant",
    gateShell: {
      boothColor: "teal",
      boothShift: -0.45,
      armOpen: 0,
      armYaw: -0.06,
      boothText: "冷链门岗 · 4",
    },
    // Idle upright booms, cooler tints, fewer / farther gantries — cold quay skyline.
    skyline: {
      craneId: "冷岸 04",
      craneZ: -2.4,
      craneScale: 0.92,
      farDz: 88,
      gantries: [
        [-96, 0.92, true, [0.08, 0.15, 0.26]],
        [-210, 1.0, true, [0.09, 0.18, 0.28]],
        [-320, 1.08, false, [0.1, 0.2, 0.3]],
        [118, 0.94, true, [0.08, 0.16, 0.26]],
        [248, 1.05, true, [0.12, 0.22, 0.32]],
      ],
    },
    sense: {
      saturation: 0.72,
      rain: 1.05,
      grain: 0.062,
      vignette: 0.58,
      // Deep cold shadows + teal fog; kill sodium warmth.
      gradeSh: [0.62, 0.88, 1.28],
      gradeHi: [0.86, 1.04, 1.2],
    },
    audio: {
      rain: 1.42,
      wind: 0.55,
      sea: 0.38,
      foghorn: 0.28,
      windPitch: 0.78,
    },
    // Wet quay footing — slightly heavier, deliberate boarding.
    feel: {
      walk: 0.94,
      sprint: 0.91,
      accel: 0.88,
      landDip: 1.18,
      extractHold: 1.55,
      extractRadius: 2.85,
    },
  },
  b6: {
    id: "b6",
    yardTitle: "六号泊位 · 机修",
    quaySign: "机修趸船 6",
    boardSign: "机修登船",
    extractApproach: "maint",
    extractMark: "机",
    gateDecal: "berth6",
    gateSignText: "机修六号泊位",
    laneMarks: ["机一", "机二", "通道", "备份"],
    extractZ: 1.6,
    spawnBias: ["shed", "yard", "gate", "quay"],
    // Open mid + thinned north stacks (gaps, masts, pipes) — not a dense B8 twin.
    midStyle: "open",
    extras: "maint",
    // Maint shed shell — orange band, pipe/flood accents; boom cracked open.
    shedShell: {
      title: "六号机修库",
      accent: "paint_orange",
      wallBand: "paint_grey",
      labelColor: "yellow",
      interior: "maint",
    },
    // South open canopy + scaffold towers — repair apron, not thinned B8 boxes.
    sceneMass: "maint_apron",
    gateShell: {
      boothColor: "grey",
      boothShift: 0.55,
      armOpen: 0.42,
      armYaw: 0.08,
      boothText: "机修门岗 · 6",
    },
    // Close staggered gantries + tall raised boom — sodium grit skyline.
    skyline: {
      craneId: "机修 06",
      craneZ: 1.6,
      craneScale: 1.12,
      farDz: 44,
      gantries: [
        [-72, 1.08, false, [0.28, 0.18, 0.06]],
        [-128, 1.52, true, [0.34, 0.22, 0.08]],
        [-188, 0.88, false, [0.3, 0.14, 0.05]],
        [-268, 1.28, true, [0.26, 0.16, 0.07]],
        [64, 1.1, false, [0.28, 0.2, 0.08]],
        [132, 1.62, true, [0.36, 0.26, 0.1]],
        [210, 1.0, false, [0.24, 0.16, 0.07]],
        [288, 1.34, true, [0.3, 0.14, 0.05]],
        [360, 0.86, false, [0.22, 0.15, 0.06]],
        [420, 1.18, true, [0.28, 0.18, 0.07]],
      ],
    },
    sense: {
      saturation: 1.18,
      rain: 0.48,
      grain: 0.022,
      vignette: 0.28,
      // Hard sodium night, warm grit — open apron reads sharper than B8 dusk.
      gradeSh: [0.96, 0.9, 0.88],
      gradeHi: [1.28, 0.92, 0.58],
    },
    audio: {
      rain: 0.58,
      wind: 1.55,
      sea: 1.28,
      foghorn: 1.85,
      windPitch: 1.22,
    },
    // Open mid-yard pursuit — snappier sprint, faster extract board.
    feel: {
      walk: 1.03,
      sprint: 1.09,
      accel: 1.14,
      landDip: 0.9,
      extractHold: 1.05,
      extractRadius: 2.25,
    },
  },
};

function resolveLayout(i) {
  let e = typeof i == "string" ? i : (i && (i.layoutId || i.id)) || "b8";
  return LAYOUTS[e] || LAYOUTS.b8;
}

export { LAYOUT_IDS, LAYOUTS, resolveLayout };
