import {
  Group,
  Mesh,
  PointLight,
  SphereGeometry,
  defineModuleExports,
} from "../../vendor/three-r180.js";
import {
  batchStaticMeshes,
  createMesh,
  cylinderGeometry,
} from "../../core/geometry.js";
import { ab, no, ob, rb } from "./buildings.js";
import { resolveLayout } from "./layouts.js";
import { Lr, cb, fR, hR, lv, mt, ts } from "./placement.js";

function extractBeaconColor(i) {
  return i === "b4" ? 0x66d6e8 : i === "b6" ? 0xff8a3c : 0x7dff5a;
}

function setMatGlow(mat, hex, intensity) {
  if (!mat) return;
  if (mat.emissive && mat.emissive.isColor) {
    mat.emissive.setHex(hex);
    if ("emissiveIntensity" in mat) mat.emissiveIntensity = intensity;
    return;
  }
  if (mat.uniforms && mat.uniforms.color && mat.uniforms.color.value) {
    mat.uniforms.color.value.setHex(hex);
    if (mat.uniforms.intensity) mat.uniforms.intensity.value = intensity;
    return;
  }
  if (mat.color && mat.color.isColor) mat.color.setHex(hex);
}

/** Dedicated extract beacon — pole + lens + vertical glow (readable in B4 haze). */
function buildExtractBeacon(context, layoutId, extraction) {
  let hex = extractBeaconColor(layoutId),
    cold = layoutId === "b4",
    root = new Group(),
    lensR = cold ? 0.34 : 0.24,
    beamH = cold ? 1.55 : 1.15;
  root.name = "extract-beacon-mesh";
  root.userData.noMerge = !0;
  let pole = createMesh(
      cylinderGeometry(0.055, 0.075, 3.15, 10),
      context.mats.get("steel_galv"),
    ),
    base = createMesh(
      cylinderGeometry(0.3, 0.38, 0.1, 12),
      context.mats.get("steel_dark"),
    ),
    collar = createMesh(
      cylinderGeometry(0.12, 0.14, 0.08, 10),
      context.mats.get("paint_yellow"),
    ),
    lensMat = context.mats.emissive(hex, 0.03).clone(),
    beamMat = context.mats.emissive(hex, 0.02).clone(),
    lens = new Mesh(new SphereGeometry(lensR, 16, 12), lensMat),
    beam = new Mesh(cylinderGeometry(0.05, 0.05, beamH, 10), beamMat),
    tip = new Mesh(
      cylinderGeometry(0.02, 0.09, cold ? 0.55 : 0.38, 8),
      beamMat.clone ? beamMat.clone() : beamMat,
    );
  ((pole.position.y = 1.55),
    (base.position.y = 0.05),
    (collar.position.y = 3.12),
    (lens.position.y = 3.42),
    (beam.position.y = 3.42 + beamH * 0.35),
    (tip.position.y = 3.42 + beamH * 0.85),
    (lens.userData.noMerge = !0),
    (beam.userData.noMerge = !0),
    (tip.userData.noMerge = !0),
    root.add(base, pole, collar, beam, tip, lens),
    root.position.set(extraction.x - 1.15, 0, extraction.z));
  let lite = new PointLight(hex, 0, cold ? 26 : 18, 2);
  ((lite.position.set(0, 3.5, 0)),
    (lite.name = "extract-beacon-light"),
    root.add(lite));
  return {
    root,
    lite,
    lensMat,
    beamMat,
    tipMat: tip.material,
    hex,
    cold,
  };
}

var levelShowcaseModule = {};

defineModuleExports(levelShowcaseModule, {
  create: () => createLevel,
  showcase: () => showcaseLevel,
});

async function createLevel(context) {
  let layout = resolveLayout(
      (context.mission && (context.mission.layoutId || context.mission.id)) ||
        (context.params && context.params.mission) ||
        "b8",
    ),
    e = new Group();
  ((e.name = "level"), context.scene.add(e));
  let t = ob(context);
  (hR(t, layout), fR(t, layout));
  let n = ab(t, layout),
    s = cb(t, layout),
    o = t.place(
      "relay_node",
      1.5,
      7.5,
      0.35,
      {
        seed: 1,
      },
      0,
    ),
    r = t.place(
      "relay_node",
      n.relayPos.x,
      n.relayPos.z,
      ts * 0.9,
      {
        seed: 2,
      },
      no.FLOOR,
    ),
    a = t.place(
      "relay_node",
      s.relayPos.x,
      s.relayPos.z,
      -0.2,
      {
        seed: 3,
      },
      0,
    );
  (Lr(
    t,
    [
      [-2, -27.5, 1.2],
      [-2, -27.55, 0.08],
      [-1.4, -25.6],
      [-2.4, -23],
      [-1.9, -20.3],
    ],
    0.03,
    t.MI("rubber"),
    no.FLOOR + 0.028,
  ),
    lv(t, 20.4, -7.3, 0.2),
    Lr(
      t,
      [
        [20.5, -7],
        [21.4, -4.9],
        [22.4, -2.6],
        [22.9, -0.7],
      ],
      0.03,
    ),
    t.staticRoot.updateMatrixWorld(!0));
  let l = [];
  t.staticRoot.traverse((z) => {
    z.userData &&
      z.userData.noMerge &&
      !(z.parent && dR(z.parent, t.staticRoot)) &&
      l.push(z);
  });
  for (let z of l) t.dynRoot.attach(z);
  let c = new Set();
  t.staticRoot.traverse((z) => {
    z.isMesh && !Array.isArray(z.material) && c.add(z.material);
  });
  let u = new Map();
  for (let z of c)
    if (!(
      !z.isMeshStandardMaterial ||
      z.vertexColors ||
      z.transparent ||
      !z.name ||
      !(context.mats.names || []).includes(z.name)
    ))
      try {
        let H =
          z.userData && z.userData.interior
            ? {
                interior: !0,
              }
            : {};
        if (context.mats.get(z.name, H) !== z) continue;
        let O = context.mats.get(z.name, {
          ...H,
          vertexColors: !0,
        });
        O !== z && c.has(O) && u.set(z, O);
      } catch {}
  t.staticRoot.traverse((z) => {
    if (!z.isMesh || Array.isArray(z.material)) return;
    let H = u.get(z.material);
    H && (z.material = H);
    let O = !z.material.transparent && !z.material.isMeshBasicMaterial;
    ((z.castShadow = O), (z.receiveShadow = !z.material.isMeshBasicMaterial));
  });
  let h = {
    count: 0,
    update() {},
  };
  try {
    h = rb(t.staticRoot);
  } catch (z) {
    console.error("[level] label atlas failed", z);
  }
  let f = batchStaticMeshes(t.staticRoot);
  ((f.name = "level-merged"), e.add(f), e.add(t.dynRoot));
  for (let z of [o, r, a]) {
    for (let H = z.children.length - 1; H >= 0; H--) z.remove(z.children[H]);
    t.dynRoot.add(z);
  }
  // Extract approach beacon — mesh + light; dark until all relays cut.
  let extractBeacon = buildExtractBeacon(context, layout.id, s.extraction),
    extractLite = extractBeacon.lite,
    extractPulse = 0,
    extractOpen = !1,
    p = 0;
  t.dynRoot.add(extractBeacon.root);
  f.traverse((z) => {
    if (z.isMesh) {
      let H = z.geometry;
      p += (H.index ? H.index.count : H.attributes.position.count) / 3;
    }
  });
  let d = {
      pos: mt(-32, 0, 6),
      yaw: -ts,
    },
    // Physical relay nodes (shared map). Mission overlays reorder / relabel these.
    relayNodes = {
      relay_a: {
        id: "relay_a",
        label: "闸口甲 \u2014 堆场",
        zone: "yard",
        pos: mt(1.5, 0, 7.5),
        object: o,
      },
      relay_b: {
        id: "relay_b",
        label: "闸口乙 \u2014 仓库",
        zone: "shed",
        pos: mt(n.relayPos.x, no.FLOOR, n.relayPos.z),
        object: r,
      },
      relay_c: {
        id: "relay_c",
        label: "闸口丙 \u2014 码头",
        zone: "quay",
        pos: mt(s.relayPos.x, 0, s.relayPos.z),
        object: a,
      },
    },
    v = [],
    g = (z, H, O) => ({
      pos: mt(z, 0, H),
      zone: O,
      type: "ground",
    }),
    x = (z, H, O, q) => ({
      pos: mt(z, H, O),
      zone: q,
      type: "air",
    }),
    y = [
      g(-19, -1.4, "yard"),
      g(3.5, -1.6, "yard"),
      g(14.2, 16.4, "yard"),
      g(-3.2, 16.6, "yard"),
      g(-16, 26, "yard"),
      g(6, 26, "yard"),
      g(4.2, -5.12, "yard"),
      g(-7.8, 21.4, "yard"),
      g(-11.3, 12.5, "yard"),
      g(17.5, 22.2, "yard"),
      x(10, 11, 23.5, "yard"),
      x(2, 11, 21.5, "yard"),
      x(13, 9, 11, "yard"),
      x(-4, 12.5, -4.5, "yard"),
      x(9, 10, 1.5, "yard"),
      x(-10, 12, 24.5, "yard"),
      g(-12.4, -24.8, "shed"),
      g(9.6, -25.3, "shed"),
      g(-13.4, -19.6, "shed"),
      g(4.6, -13.8, "shed"),
      g(-21, -27.2, "shed"),
      g(-18.6, -22, "shed"),
      g(13.6, -24, "shed"),
      g(-26.6, -15, "shed"),
      x(-8, 5.4, -20.5, "shed"),
      x(5, 5.2, -18, "shed"),
      x(-20, 10.5, -20, "shed"),
      x(14.5, 10, -22, "shed"),
      x(-2, 12.5, -8.5, "shed"),
      g(27.7, -24.2, "quay"),
      g(18.3, -25.4, "quay"),
      g(27.2, -12.6, "quay"),
      g(20.2, 14, "quay"),
      g(23.4, 23.2, "quay"),
      g(18, 24.4, "quay"),
      g(27.4, 11.6, "quay"),
      x(36, 9, 4, "quay"),
      x(38, 11, -6, "quay"),
      x(35, 8.5, 16, "quay"),
      x(24, 12.5, 10.5, "quay"),
      x(33.5, 10, 24.5, "quay"),
      x(22, 13, -14, "quay"),
    ],
    b = [
      {
        name: "gate",
        min: [-40, -30],
        max: [-24, 30],
      },
      {
        name: "yard",
        min: [-24, -10],
        max: [16, 30],
      },
      {
        name: "shed",
        min: [-24, -30],
        max: [16, -10],
      },
      {
        name: "quay",
        min: [16, -30],
        max: [40, 30],
      },
    ],
    m = [
      {
        min: mt(no.X0, 0, no.Z0),
        max: mt(no.X1, no.RIDGE, no.Z1),
      },
    ],
    A = [
      {
        pos: [-34, 1.6, 6.2],
        look: [-12, 2.6, 6.6],
      },
      {
        pos: [-20, 1.3, 5.6],
        look: [0, 2.2, 7],
      },
      {
        pos: [-6.2, 2.1, 7.9],
        look: [2, 1.6, 7.6],
      },
      {
        pos: [-6.6, 2.5, 0.4],
        look: [-4, 2.6, -12],
      },
      {
        pos: [-4.4, 1.9, -8.6],
        look: [-2.4, 2.8, -19.5],
      },
      {
        pos: [-3.2, 2.2, -15],
        look: [-2, 2.2, -20.5],
      },
      {
        pos: [4.2, 2.6, -19.6],
        look: [12, 3.2, -19.5],
      },
      {
        pos: [15, 2, -19.5],
        look: [24, 3.5, -6],
      },
      {
        pos: [20.2, 1.7, -9],
        look: [23, 1.6, 0],
      },
      {
        pos: [25.9, 1.8, 1.5],
        look: [27.5, 1.2, 12],
      },
      {
        pos: [27.3, 1.8, 12],
        look: [29.6, 0.4, 20],
      },
      {
        pos: [28.4, 1.9, 17.2],
        look: [31.5, -0.8, 21],
      },
    ],
    _ = [
      mt(-33.9, 0, 3.8),
      mt(-27.3, 0, 2.3),
      mt(-19.2, 0, 4.7),
      mt(-17.4, 0, 4.9),
      mt(-12.5, 0, 7.2),
      mt(-9.3, 0, 6.4),
      mt(-6.3, 0, 7.3),
      mt(-2.9, 0, 6.1),
      mt(-2.9, 0, 4.5),
      mt(5.6, 0, 5.8),
      mt(5.6, 0, 4.2),
      mt(-2.2, 0, 10.4),
      mt(5, 0, 8.9),
      mt(-4.8, 0, 10.6),
      mt(7.5, 0, 7.7),
      mt(9.2, 0, 4.4),
      mt(-1, 0, 13.6),
      mt(-13.5, 0, -1.5),
      mt(-9.6, 0, -0.7),
      mt(7.8, 0, -1.5),
      mt(-4.2, 0, -2.2),
      mt(-0.9, 0, -6.7),
      mt(-6.7, 0, -7),
      mt(1.2, 0, -8.9),
      mt(-8.1, 0, 15.4),
      mt(0.6, 0, 16.9),
      mt(4.2, 0, 15.7),
      mt(-16, 0, 15.6),
      mt(12, 0, 17.2),
      mt(2.9, 0, -17),
      mt(4.2, 0, -15.3),
      mt(6.9, 0, -20.6),
      mt(-7.6, 0, -17.4),
      mt(-8.3, 0, -14.3),
      mt(9.6, 0, -21.9),
      mt(-13.2, 0, -14.4),
      mt(-11.6, 0, -18.6),
      mt(0, 0, -25.8),
      mt(-12.4, 0, -25.8),
      mt(21.4, 0, -4.7),
      mt(25.3, 0, 3.9),
      mt(25.7, 0, -4.4),
      mt(20.2, 0, -15.4),
      mt(26.4, 0, -15.4),
      mt(20.6, 0, 14.4),
      mt(26.8, 0, 14.4),
      mt(20.6, 0, 21.2),
      mt(27.4, 0, 22.4),
      mt(19.6, 0, -21.4),
      mt(27, 0, -16.2),
      mt(25.6, 0, 6),
      mt(13.5, 2.59, 12.4),
      mt(4.4, 2.59, 12.4),
      mt(12.9, 0, 8.8),
      mt(11.6, 0, 4.9),
    ],
    M = context.physics.nav,
    E = (z) => {
      if (!(!M || !M.isWalkable || z.y > 0.2 || M.isWalkable(z.x, z.z)))
        for (let H of [0.5, 1, 1.5, 2])
          for (let O = 0; O < 8; O++) {
            let q = z.x + Math.cos(O * 0.7854) * H,
              U = z.z + Math.sin(O * 0.7854) * H;
            if (M.isWalkable(q, U)) {
              ((z.x = q), (z.z = U));
              return;
            }
          }
    };
  (_.forEach(E),
    y.forEach((z) => {
      z.type === "ground" && E(z.pos);
    }));
  let w = !1,
    allSpawns = y.slice(),
    S = {
      root: e,
      playerStart: d,
      objectives: v,
      missionId: layout.id,
      layoutId: layout.id,
      layout: layout,
      relayNodes: relayNodes,
      extraction: {
        pos: s.extraction.clone(),
        radius: 2.5,
        label: "趸船",
        mark: layout.extractMark || "撤",
      },
      enemySpawns: y,
      allSpawns: allSpawns,
      zones: b,
      interiorBoxes: m,
      cinematicPath: A,
      coverPoints: _,
      skylights: n.skylights,
      shedLights: n.lights,
      vantage: {
        stairsFoot: mt(-2.2, 0, 12.4),
        roof: mt(13.5, 2.59, 12.4),
      },
      stats: {
        labelsAtlased: h.count,
        containers: t.placed.filter((z) => z.name.startsWith("container"))
          .length,
        props: t.placed.length,
        tris: Math.round(p),
        meshes: f.children.length + pR(t.dynRoot),
        layout: layout.id,
      },
      placed: t.placed,
      // Mission object from game/missions.js — keeps world/ free of game imports.
      applyMission(H) {
        if (!H || !H.id) return null;
        S.missionId = H.id;
        let O = H.playerStart,
          ly = resolveLayout(H.layoutId || H.id);
        O &&
          O.pos &&
          (S.playerStart.pos.copy(O.pos), (S.playerStart.yaw = O.yaw || 0));
        let q = (H.objectiveOrder || Object.keys(relayNodes))
          .map((U) => relayNodes[U])
          .filter(Boolean)
          .map((U) => {
            let T = H.labels && H.labels[U.id];
            return T ? ((U.label = T), U) : U;
          });
        ((S.objectives.length = 0),
          S.objectives.push(...q),
          (S.extraction.label = H.extractLabel || "趸船"),
          (S.extraction.radius =
            (ly.feel && ly.feel.extractRadius) || S.extraction.radius || 2.5),
          (S.extraction.hold =
            (ly.feel && ly.feel.extractHold) || S.extraction.hold || 1.35),
          (S.extraction.mark = ly.extractMark || "撤"),
          // Soft spawn bias for this berth (geometry layoutId may differ until rebuild).
          (S.enemySpawns = allSpawns
            .slice()
            .sort(
              (U, T) =>
                (ly.spawnBias.indexOf(U.zone) + 99) -
                (ly.spawnBias.indexOf(T.zone) + 99),
            )));
        // Nodes not on this briefing read as already dark — avoids false interactables.
        for (let U of Object.values(relayNodes)) {
          let T = U.object && U.object.userData;
          if (!(T && typeof T.setState == "function")) continue;
          try {
            T.setState(q.includes(U) ? "live" : "cut");
          } catch (D) {
            console.error("[level] relay setState threw", D);
          }
        }
        return H;
      },
      setExtractOpen(H) {
        extractOpen = !!H;
        let O = extractBeaconColor(S.layoutId || layout.id);
        extractBeacon.hex = O;
        extractLite.color.setHex(O);
        if (!extractOpen) {
          extractLite.intensity = 0;
          extractPulse = 0;
          setMatGlow(extractBeacon.lensMat, O, 0.03);
          setMatGlow(extractBeacon.beamMat, O, 0.015);
          setMatGlow(extractBeacon.tipMat, O, 0.02);
        }
      },
      groundSurfaceAt(z, H) {
        return t.isMetal(z, H) ? "metal" : "concrete";
      },
      update(z) {
        (n.update(z), h.update(z));
        if (extractOpen) {
          extractPulse += z;
          let O = extractBeacon.hex,
            q = extractBeacon.cold ? 1.35 : 1,
            U =
              0.55 +
              0.45 * Math.sin(extractPulse * 4.2) +
              0.18 * Math.sin(extractPulse * 11.5);
          extractLite.intensity =
            (extractBeacon.cold ? 34 : 24) * q * (0.55 + 0.45 * U);
          setMatGlow(extractBeacon.lensMat, O, (extractBeacon.cold ? 18 : 12) * U);
          setMatGlow(extractBeacon.beamMat, O, (extractBeacon.cold ? 10 : 6) * U);
          setMatGlow(extractBeacon.tipMat, O, (extractBeacon.cold ? 16 : 9) * U);
        }
        for (let H = 0; H < t.updaters.length; H++)
          try {
            t.updaters[H](z);
          } catch (O) {
            w || ((w = !0), console.error("[level] prop update threw", O));
          }
      },
    };
  // Default briefing until flow applies the selected mission.
  return (S.applyMission({
    id: layout.id,
    playerStart: d,
    objectiveOrder: ["relay_a", "relay_b", "relay_c"],
    labels: {
      relay_a: "闸口甲 \u2014 堆场",
      relay_b: "闸口乙 \u2014 仓库",
      relay_c: "闸口丙 \u2014 码头",
    },
    extractLabel: "趸船",
  }),
  S);
}

/** Tear down level colliders/meshes and rebuild for a berth layout. */
async function rebuildLevel(context, missionId) {
  let e = context.level;
  if (e && e.root) {
    try {
      context.scene.remove(e.root);
    } catch {}
  }
  (context.physics.clearSource && context.physics.clearSource("level"),
    (context.mission = {
      id: missionId,
      layoutId: missionId,
    }));
  let t = await createLevel(context);
  return (
    (context.level = t),
    context.physics.build(),
    t
  );
}

function dR(i, e) {
  for (; i && i !== e;) {
    if (i.userData && i.userData.noMerge) return !0;
    i = i.parent;
  }
  return !1;
}

function pR(i) {
  let e = 0;
  return (
    i.traverse((t) => {
      t.isMesh && e++;
    }),
    e
  );
}

async function showcaseLevel(context) {
  let e = await createLevel(context);
  return {
    cam: [-32, 1.7, 6],
    target: [0, 2.4, 6.4],
    update: (t) => e.update(t),
  };
}

export { createLevel, rebuildLevel, levelShowcaseModule, showcaseLevel };
