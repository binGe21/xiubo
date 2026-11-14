// Procedural berth layout profiles — spatial variants without forking the whole map.
// Kept in world/ so level code stays free of game/missions imports.

var LAYOUT_IDS = ["b8", "b4", "b6"];

var LAYOUTS = {
  b8: {
    id: "b8",
    yardTitle: "八号泊位 · 深水",
    quaySign: "趸船站 8",
    gateDecal: "berth4",
    extractZ: 0,
    spawnBias: ["gate", "yard", "shed", "quay"],
    // Mid-yard: default dense mixed stacks (see placement.hR).
    midStyle: "mixed",
    extras: "none",
  },
  b4: {
    id: "b4",
    yardTitle: "四号泊位 · 冷藏",
    quaySign: "趸船站 4",
    gateDecal: "berth4",
    extractZ: -2.4,
    spawnBias: ["quay", "yard", "shed", "gate"],
    // Cold-chain reefers choke east/south lanes; jersey wall forces quay approaches.
    midStyle: "reefer",
    extras: "cold",
  },
  b6: {
    id: "b6",
    yardTitle: "六号泊位 · 机修",
    quaySign: "趸船站 6",
    gateDecal: "berth4",
    extractZ: 1.6,
    spawnBias: ["shed", "yard", "gate", "quay"],
    // Open mid corridor + maintenance clutter; pipe wall steers shed-first routes.
    midStyle: "open",
    extras: "maint",
  },
};

function resolveLayout(i) {
  let e = typeof i == "string" ? i : (i && (i.layoutId || i.id)) || "b8";
  return LAYOUTS[e] || LAYOUTS.b8;
}

export { LAYOUT_IDS, LAYOUTS, resolveLayout };
