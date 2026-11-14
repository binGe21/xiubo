import {
  Group,
  Object3D,
  Vector3,
  defineModuleExports,
} from "../../vendor/three-r180.js";
import { resolveLayout } from "../level/layouts.js";
import { _t, io, kr, pb, ua } from "./geometry.js";
import { z1 } from "./cranes.js";
import { vb, xb } from "./ships.js";
import { Mb, buildCraneSkyline, wb } from "./sky.js";

var backdropShowcaseModule = {};

defineModuleExports(backdropShowcaseModule, {
  create: () => createBackdrop,
  showcase: () => showcaseBackdrop,
});

var _R = ["crane", "ship", "boat", "sky"];

function defaultSkyline() {
  return resolveLayout("b8").skyline || {};
}

function Eb(i, { only: e = null, showcase: t = !1, skyline: skyOpt = null } = {}) {
  let n = (b) => !e || e === b,
    s = new Group();
  s.name = "backdrop";
  let o = pb(),
    craneLamps = pb(),
    craneLampMesh = null,
    r = new Vector3(31.5, -1.6, 21);
  t && r.set(24, 0.34, 15);
  let a = null,
    l = null,
    gantry = null,
    c = null,
    u = null,
    h = null,
    skyProfile = skyOpt || defaultSkyline();
  if (
    (n("boat") &&
      ((a = xb(i, o)),
      a.root.position.copy(r),
      (a.root.rotation.y = -Math.PI / 2),
      s.add(a.root)),
    a && !t)
  ) {
    let b = new io(),
      m = i.mats.get("rope");
    (b.add(
      m,
      kr(ua(_t(3.2, 0.95, 0.05), _t(4.6, 2.12, 2.3), 0.22, 7), 0.016, 5),
    ),
      b.add(
        m,
        kr(ua(_t(-3.25, 0.82, 0.95), _t(-4.6, 2.12, 2.3), 0.2, 7), 0.016, 5),
      ),
      a.root.add(
        b.build({
          cast: !1,
          recv: !1,
        }),
      ));
  }
  function mountCraneSkyline(profile) {
    let p = profile || defaultSkyline();
    if (l && l.root && l.root.parent) l.root.parent.remove(l.root);
    if (gantry && gantry.root && gantry.root.parent)
      gantry.root.parent.remove(gantry.root);
    if (craneLampMesh && craneLampMesh.parent)
      craneLampMesh.parent.remove(craneLampMesh);
    if (n("crane")) {
      l = z1(i, craneLamps, {
        craneId: p.craneId || "锈泊 08",
      });
      let sc = Number.isFinite(p.craneScale) ? p.craneScale : 1,
        cz = Number.isFinite(p.craneZ) ? p.craneZ : 0;
      (l.root.scale.set(sc, sc, sc),
        (l.root.position.z = cz),
        s.add(l.root));
    } else l = null;
    if (n("sky") || n("crane")) {
      gantry = buildCraneSkyline(i, craneLamps, p);
      s.add(gantry.root);
    } else gantry = null;
    craneLampMesh = craneLamps.build();
    if (craneLampMesh) {
      craneLampMesh.name = "crane-skyline-lamps";
      craneLampMesh.frustumCulled = !1;
      s.add(craneLampMesh);
    }
    return p;
  }
  (mountCraneSkyline(skyProfile),
    n("ship") && ((c = vb(i, o)), s.add(c.root)),
    n("sky") && ((u = Mb(i, o)), s.add(u.root)),
    (n("sky") || n("crane")) && ((h = wb(i, o.uTime, 12)), s.add(h)));
  let f = o.build();
  (f && ((f.name = "backdrop-lamps"), (f.frustumCulled = !1), s.add(f)),
    i.scene.add(s));
  let p = [],
    d = (b, m) => {
      i.physics &&
        i.physics.addBox &&
        p.push(
          i.physics.addBox(b.min, b.max, {
            surface: m,
            tag: "backdrop",
            source: "backdrop",
            noNav: !!b.noNav,
          }),
        );
    };
  function refreshCraneColliders() {
    if (i.physics && i.physics.clearSource) i.physics.clearSource("backdrop");
    p.length = 0;
    if (l)
      for (let b of l.colliders) {
        let cz = l.root.position.z || 0,
          sc = l.root.scale.x || 1;
        d(
          {
            min: [b.min[0] * sc, b.min[1] * sc, b.min[2] * sc + cz],
            max: [b.max[0] * sc, b.max[1] * sc, b.max[2] * sc + cz],
            noNav: b.noNav,
          },
          "metal",
        );
      }
    if (c) for (let b of c.colliders) d(b, "metal");
    a &&
      !t &&
      d(
        {
          min: [30.25, -1.7, 17.4],
          max: [32.8, -0.7, 24.6],
        },
        "rubber",
      );
    i.physics && i.physics.build && i.physics.build();
  }
  refreshCraneColliders();
  let v = 0,
    g = 0;
  s.traverse((b) => {
    if (b.isMesh) {
      g++;
      let m = b.geometry;
      v += (m.index ? m.index.count : m.attributes.position.count) / 3;
    }
  });
  let x = 0;
  function y(b) {
    if (
      ((x += b),
      (o.uTime.value = x),
      (craneLamps.uTime.value = x),
      l)
    ) {
      let m = l.spreader;
      ((m.rotation.x =
        0.012 * Math.sin(x * 0.52) + 0.004 * Math.sin(x * 1.31 + 1)),
        (m.rotation.z = 0.009 * Math.sin(x * 0.41 + 1.1)));
    }
    (c && (c.radar.rotation.y = x * 1.9),
      a &&
        ((a.root.position.y =
          r.y +
          (t
            ? 0
            : 0.05 * Math.sin(x * 1.15) + 0.025 * Math.sin(x * 2.3 + 1.3))),
        (a.hullGrp.rotation.x =
          0.05 * Math.sin(x * 0.9 + 0.4) + 0.016 * Math.sin(x * 2.1)),
        (a.hullGrp.rotation.z = 0.02 * Math.sin(x * 1.3 + 2))));
  }
  let extractionPoint = new Vector3(30, 0, 20),
    activeSkyline = skyProfile;
  return (
    y(0),
    {
      update: y,
      root: s,
      boat: a ? a.root : new Object3D(),
      crane: l ? l.root : null,
      ship: c ? c.root : null,
      skyline: u ? u.root : null,
      craneSkyline: gantry ? gantry.root : null,
      gulls: h,
      lamps: f,
      colliders: p,
      spreader: l ? l.spreader : null,
      boatBase: r,
      extractionPoint,
      get craneId() {
        return (activeSkyline && activeSkyline.craneId) || "锈泊 08";
      },
      // Keep barge visually moored at the berth extract ladder (layout.extractZ).
      setExtractOffset(b) {
        let m = Number.isFinite(b) ? b : 0,
          A = 21 + m;
        ((r.z = A),
          a && a.root && ((a.root.position.z = A), (a.root.position.x = r.x)),
          extractionPoint.set(30, 0, 20 + m));
      },
      /** Swap near crane + far gantry field for the active berth (grade/audio untouched). */
      setSkyline(profile) {
        activeSkyline = mountCraneSkyline(profile || defaultSkyline());
        refreshCraneColliders();
        this.crane = l ? l.root : null;
        this.spreader = l ? l.spreader : null;
        this.craneSkyline = gantry ? gantry.root : null;
        return activeSkyline;
      },
      shipName: "锈潮号",
      stats: {
        tris: Math.round(v),
        drawCalls: g,
      },
    }
  );
}

async function createBackdrop(context) {
  let layout = resolveLayout(
    (context.mission && (context.mission.layoutId || context.mission.id)) ||
      "b8",
  );
  return Eb(context, {
    skyline: layout.skyline || null,
  });
}

function showcaseBackdrop(context) {
  let e =
      context.params && _R.includes(context.params.bshow)
        ? context.params.bshow
        : null,
    t = Eb(context, {
      only: e,
      showcase: !0,
    });
  console.log("[backdrop] " + JSON.stringify(t.stats));
  let n = {
    crane: {
      cam: [0, 1.7, 27],
      target: [33, 13, 0],
    },
    ship: {
      cam: [24, 1.7, -2],
      target: [38, 9, -24],
    },
    boat: {
      cam: [19.5, 1.7, 11.5],
      target: [24, 0.9, 15],
    },
    sky: {
      cam: [-32, 1.7, 6],
      target: [30, 9, 0],
    },
  };
  return {
    ...(n[e] || n.crane),
    update: (s) => t.update(s),
  };
}

export { createBackdrop, backdropShowcaseModule, showcaseBackdrop };
