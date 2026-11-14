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
    gateShell: {
      boothColor: "teal",
      boothShift: -0.45,
      armOpen: 0,
      armYaw: -0.06,
      boothText: "冷链门岗 · 4",
    },
    // Idle upright booms, cooler tints, fewer gantries — cold quay skyline.
    skyline: {
      craneId: "冷岸 04",
      craneZ: -2.4,
      craneScale: 0.96,
      farDz: 78,
      gantries: [
        [-108, 1.05, true, [0.1, 0.16, 0.24]],
        [-198, 1.12, true, [0.1, 0.18, 0.26]],
        [-278, 1.22, false, [0.12, 0.2, 0.28]],
        [96, 1.08, true, [0.1, 0.16, 0.24]],
        [188, 1.18, true, [0.14, 0.22, 0.3]],
        [292, 1.28, false, [0.1, 0.17, 0.25]],
      ],
    },
    sense: {
      saturation: 0.78,
      rain: 0.97,
      grain: 0.055,
      vignette: 0.54,
      // Colder shadows + teal-bias fog grade; mute the sodium punch.
      gradeSh: [0.7, 0.9, 1.2],
      gradeHi: [0.92, 1.02, 1.14],
    },
    audio: {
      rain: 1.32,
      wind: 0.68,
      sea: 0.48,
      foghorn: 0.4,
      windPitch: 0.84,
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
    gateShell: {
      boothColor: "grey",
      boothShift: 0.55,
      armOpen: 0.42,
      armYaw: 0.08,
      boothText: "机修门岗 · 6",
    },
    // Denser staggered gantries + tall raised boom — maint yard skyline.
    skyline: {
      craneId: "机修 06",
      craneZ: 1.6,
      craneScale: 1.05,
      farDz: 52,
      gantries: [
        [-88, 1.0, false, [0.22, 0.16, 0.08]],
        [-148, 1.38, true, [0.28, 0.2, 0.08]],
        [-218, 0.94, false, [0.26, 0.12, 0.06]],
        [-298, 1.18, true, [0.22, 0.16, 0.08]],
        [86, 1.02, false, [0.24, 0.18, 0.1]],
        [158, 1.48, true, [0.32, 0.24, 0.1]],
        [236, 1.08, false, [0.22, 0.16, 0.08]],
        [308, 1.22, true, [0.26, 0.12, 0.06]],
        [372, 0.9, false, [0.2, 0.15, 0.08]],
      ],
    },
    sense: {
      saturation: 1.1,
      rain: 0.56,
      grain: 0.026,
      vignette: 0.32,
      // Harder night sodium, less teal — open yard reads sharper.
      gradeSh: [0.9, 0.92, 0.98],
      gradeHi: [1.2, 0.94, 0.68],
    },
    audio: {
      rain: 0.72,
      wind: 1.38,
      sea: 1.18,
      foghorn: 1.6,
      windPitch: 1.14,
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
