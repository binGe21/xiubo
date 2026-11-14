// Procedural berth layout profiles — spatial + sensory variants without forking the whole map.
// Kept in world/ so level code stays free of game/missions imports.

var LAYOUT_IDS = ["b8", "b4", "b6"];

var LAYOUTS = {
  b8: {
    id: "b8",
    yardTitle: "八号泊位 · 深水",
    quaySign: "趸船站 8",
    gateDecal: "berth8",
    gateSignText: "深水八号泊位",
    laneMarks: ["一道", "二道", "三道", "主道"],
    extractZ: 0,
    spawnBias: ["gate", "yard", "shed", "quay"],
    // Classic dense mixed stacks — the “home” yard→shed→quay read.
    midStyle: "mixed",
    extras: "home",
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
  },
  b4: {
    id: "b4",
    yardTitle: "四号泊位 · 冷藏",
    quaySign: "冷岸趸船 4",
    gateDecal: "berth4c",
    gateSignText: "冷藏四号泊位",
    laneMarks: ["冷一", "冷二", "岸电", "冷链"],
    extractZ: -2.4,
    spawnBias: ["quay", "yard", "shed", "gate"],
    // Cold-chain reefers choke east/south lanes; jersey wall forces quay approaches.
    midStyle: "reefer",
    extras: "cold",
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
  },
  b6: {
    id: "b6",
    yardTitle: "六号泊位 · 机修",
    quaySign: "机修趸船 6",
    gateDecal: "berth6",
    gateSignText: "机修六号泊位",
    laneMarks: ["机一", "机二", "通道", "备份"],
    extractZ: 1.6,
    spawnBias: ["shed", "yard", "gate", "quay"],
    // Open mid corridor + maintenance clutter; pipe wall steers shed-first routes.
    midStyle: "open",
    extras: "maint",
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
  },
};

function resolveLayout(i) {
  let e = typeof i == "string" ? i : (i && (i.layoutId || i.id)) || "b8";
  return LAYOUTS[e] || LAYOUTS.b8;
}

export { LAYOUT_IDS, LAYOUTS, resolveLayout };
