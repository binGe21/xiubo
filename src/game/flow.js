// Mission progression, relay objectives, waves, extraction and game states.
import { Vector3 } from "../vendor/three-r180.js";
import { clamp, damp, saturate, smoothstep } from "../core/math.js";
import { createMenus } from "../ui/menus.js";
import { rebuildLevel } from "../world/level/level.js";
import { resolveLayout } from "../world/level/layouts.js";
import { resolveMission } from "./missions.js";
import {
  formatScoreLine,
  getEntry,
  recordClear,
  recordDeath,
} from "./scores.js";

var GAME_FLOW = {
  introSeconds: 3.8,
  retryIntroSeconds: 1.2,
  interactRange: 2.4,
  interactFacing: 0.42,
  cutSeconds: 2.15,
  // Baseline combat — overwritten per selected mission.
  patrol: {
    gull: 2,
    hound: 1,
  },
  waves: [
    {
      gull: 3,
      hound: 1,
    },
    {
      gull: 3,
      hound: 2,
    },
    {
      gull: 4,
      hound: 3,
    },
  ],
  maxAlive: 10,
  spawnStagger: 0.92,
  spawnFar: 17,
  pursuitEvery: 6.5,
  pursuitMinAlive: 4,
  pursuitExtra: 6,
  titleSpeed: 1.05,
  titleFov: 48,
};

var jC = [
  "北",
  "东北",
  "东",
  "东南",
  "南",
  "西南",
  "西",
  "西北",
];

function createGameFlow(context) {
  let e = (context.render && context.render.post) || {},
    t = typeof e.saturation == "number" ? e.saturation : 1,
    n = context.player,
    s = context.level,
    o = context.hud,
    r = context.input,
    a = (P, V, ...Y) => {
      try {
        if (P && typeof P[V] == "function") return P[V](...Y);
      } catch (L) {
        console.error(`[game] ${V} threw`, L);
      }
    },
    _l = resolveMission("b8").radio,
    Mi = null,
    layoutBusy = null;
  function applyBerthSense(P) {
    let V = resolveLayout((P && (P.layoutId || P.id)) || "b8"),
      Y = V.sense || {},
      L = V.audio || {},
      feel = V.feel || {},
      Z = (P && P.hud) || {};
    (t = Number.isFinite(Y.saturation) ? Y.saturation : 1),
      e &&
        ((e.saturation = t),
        (e.berthSh = Y.gradeSh || [0.84, 0.97, 1.08]),
        (e.berthHi = Y.gradeHi || [1.14, 0.98, 0.78]),
        Number.isFinite(Y.grain) && (e.grain = Y.grain),
        Number.isFinite(Y.vignette) && (e.vignette = Y.vignette)),
      a(context.ground, "setRain", Number.isFinite(Y.rain) ? Y.rain : 0.78),
      a(context.audio, "setBerthAmbient", L),
      a(n, "applyFeel", feel),
      a(context.weapon, "setName", (P && P.weaponName) || "PAC-9 深水"),
      a(context.backdrop, "setExtractOffset", V.extractZ || 0),
      s &&
        s.extraction &&
        ((s.extraction.radius = Number.isFinite(feel.extractRadius)
          ? feel.extractRadius
          : 2.5),
        (s.extraction.hold = Number.isFinite(feel.extractHold)
          ? feel.extractHold
          : 1.35),
        (s.extraction.mark = V.extractMark || "撤")),
      a(s, "setExtractOpen", !1),
      a(o, "setBerthChrome", {
        channel: Z.channel || "指挥部",
        chip: Z.chip || ((P && P.tag) || "B8") + " · " + ((P && P.name) || ""),
        accent: Z.accent || V.id || "home",
      }),
      l.setVictoryChrome && l.setVictoryChrome(P);
  }
  let startAfterLayout = (P = {}) => {
      let V = () => {
        (a(context.audio, "resume"), r.requestLock(), U(P));
      };
      layoutBusy ? layoutBusy.then(V).catch((Y) => {
        (console.error("[game] layout rebuild failed", Y), V());
      }) : V();
    },
    l = createMenus(context, {
      deploy() {
        startAfterLayout({});
      },
      resume() {
        j(!0);
      },
      restart() {
        (c.retries++,
          startAfterLayout({
            quick: !0,
            keepRetries: !0,
          }));
      },
      retry() {
        (c.retries++,
          startAfterLayout({
            quick: !0,
            keepRetries: !0,
          }));
      },
      redeploy() {
        startAfterLayout({
          quick: !0,
        });
      },
      selectMission(P) {
        we(P);
      },
    });
  l.applySettings();
  let c = {
      time: 0,
      retries: 0,
      relays: [],
      cut: 0,
      allCut: !1,
      queue: [],
      waveHot: 0,
      alertT: 0,
      pursuitT: 0,
      pursuitLeft: 0,
      contactSaid: !1,
      tipSaid: !1,
      pursuitSaid: !1,
      lowSaid: !1,
      extractHint: 0,
      extractT: 0,
      extractNearSaid: !1,
      intensity: 0.15,
      used: new Map(),
    },
    u = 0,
    h = GAME_FLOW.introSeconds,
    f = !1,
    p = !1,
    d = 0,
    v = 0,
    g = !1,
    x = "",
    y = 0.8,
    b = new Vector3(),
    m = new Vector3(),
    A = () => (s && s.objectives) || [],
    _ = {
      state: "title",
      flow: GAME_FLOW,
      run: c,
      menus: l,
      get mission() {
        return Mi;
      },
      setMission(P) {
        we(P);
      },
      start(P = {}) {
        U({
          skipIntro: !!P.skipIntro,
          quick: !!P.quick,
        });
      },
      pause() {
        G();
      },
      resume() {
        j(!1);
      },
      update: B,
      debugCut() {
        let P = c.relays.find((V) => !V.cut);
        P && me(P);
      },
    };
  function we(P) {
    let V = resolveMission(P && (P.id || P));
    Mi = V;
    context.mission = V;
    _l = V.radio || _l;
    let Y = V.combat || {},
      L = V.layoutId || V.id,
      Z = (s && (s.layoutId || s.missionId)) || "b8";
    (Object.assign(GAME_FLOW, {
      patrol: Y.patrol || GAME_FLOW.patrol,
      waves: Y.waves || GAME_FLOW.waves,
      maxAlive: Y.maxAlive ?? GAME_FLOW.maxAlive,
      spawnStagger: Y.spawnStagger ?? GAME_FLOW.spawnStagger,
      spawnFar: Y.spawnFar ?? GAME_FLOW.spawnFar,
      pursuitEvery: Y.pursuitEvery ?? GAME_FLOW.pursuitEvery,
      pursuitMinAlive: Y.pursuitMinAlive ?? GAME_FLOW.pursuitMinAlive,
      pursuitExtra: Y.pursuitExtra ?? GAME_FLOW.pursuitExtra,
    }),
      applyBerthSense(V),
      s && s.applyMission && s.applyMission(V),
      l.setMissionBriefing && l.setMissionBriefing(V),
      // Rebuild procedural berth geometry when the selected layout differs.
      L !== Z &&
        _.state === "title" &&
        ((layoutBusy = rebuildLevel(context, L)
          .then((J) => {
            s = context.level = J;
            _.run && (_.run = c);
            s.applyMission && s.applyMission(V);
            applyBerthSense(V);
            typeof w == "function" && w();
            layoutBusy = null;
            return J;
          })
          .catch((J) => {
            layoutBusy = null;
            throw J;
          })),
        o.message && o.message("正在重组泊位结构…", 2.2)),
      // Cinematic state is ready after init; title switches call w() safely.
      typeof w == "function" && L === Z && w());
  }
  function M(P) {
    let V = _.state;
    P !== V &&
      ((_.state = P),
      (u = 0),
      context.events.emit("game:state", {
        state: P,
        prev: V,
      }));
  }
  let E = {
    pos: [],
    look: [],
    len: 1,
    t: 0,
  };
  function w() {
    let P = (s && s.cinematicPath) || [];
    if (
      ((E.pos = P.map((Y) => new Vector3(...Y.pos))),
      (E.look = P.map((Y) => new Vector3(...Y.look))),
      E.pos.length < 2)
    ) {
      let Y = (s && s.playerStart && s.playerStart.pos) || new Vector3();
      ((E.pos = [new Vector3(Y.x, 2.2, Y.z), new Vector3(Y.x + 8, 2, Y.z)]),
        (E.look = [
          new Vector3(Y.x + 30, 2.5, Y.z - 2),
          new Vector3(Y.x + 40, 3, Y.z - 2),
        ]));
    }
    let V = 0;
    for (let Y = 1; Y < E.pos.length; Y++)
      V += E.pos[Y].distanceTo(E.pos[Y - 1]);
    E.len = Math.max(V, 4);
  }
  function S(P, V, Y) {
    let L = P.length - 1,
      Z = clamp(V, 0, 1) * L,
      J = Math.min(L - 1, Math.floor(Z)),
      oe = Z - J,
      fe = P[Math.max(0, J - 1)],
      le = P[J],
      R = P[J + 1],
      I = P[Math.min(L, J + 2)],
      se = oe * oe,
      ae = se * oe,
      k = (ce, ve, _e, Te) =>
        0.5 *
        (2 * ve +
          (-ce + _e) * oe +
          (2 * ce - 5 * ve + 4 * _e - Te) * se +
          (-ce + 3 * ve - 3 * _e + Te) * ae);
    return Y.set(
      k(fe.x, le.x, R.x, I.x),
      k(fe.y, le.y, R.y, I.y),
      k(fe.z, le.z, R.z, I.z),
    );
  }
  function z(P) {
    let V = Math.max(26, E.len / GAME_FLOW.titleSpeed);
    ((E.t += P), E.t >= V && (E.t = 0));
    let Y = E.t / V,
      L = Y * Y * (3 - 2 * Y) * 0.25 + Y * 0.75,
      Z = context.camera,
      J = context.time.t;
    (S(E.pos, L, b),
      S(E.look, L, m),
      (b.x += Math.sin(J * 0.31) * 0.05),
      (b.y += Math.sin(J * 0.43 + 1.7) * 0.035),
      (b.z += Math.sin(J * 0.27 + 0.6) * 0.05),
      (m.y += Math.sin(J * 0.19) * 0.12),
      (m.x += Math.sin(J * 0.13 + 2) * 0.2),
      Z.position.copy(b),
      Z.lookAt(m),
      (Z.rotation.z += Math.sin(J * 0.21) * 0.006),
      !context.params.fov &&
        Math.abs(Z.fov - GAME_FLOW.titleFov) > 0.01 &&
        ((Z.fov = GAME_FLOW.titleFov), Z.updateProjectionMatrix()),
      (e.fade = Math.max(
        1 - smoothstep(0, 1.8, E.t),
        smoothstep(V - 1.6, V, E.t),
      )));
  }
  function H() {
    (a(context.enemies, "clear"),
      a(context.fx, "clear"),
      a(context.combat, "reset"),
      a(context.weapon, "reset"),
      (c.time = 0),
      (c.cut = 0),
      (c.allCut = !1),
      (c.queue.length = 0),
      (c.waveHot = 0),
      (c.alertT = 0),
      (c.pursuitT = 0),
      (c.pursuitLeft = 0),
      (c.contactSaid = !1),
      (c.tipSaid = !1),
      (c.pursuitSaid = !1),
      (c.lowSaid = !1),
      (c.extractHint = 0),
      (c.extractT = 0),
      (c.extractNearSaid = !1),
      (c._debrief = null),
      (c._landingHold = 0),
      c.used.clear(),
      (c.relays = A().map((P, V) => {
        let Y = (/([a-z0-9])$/i.exec(String(P.id || "")) || [
          0,
          String.fromCharCode(65 + V),
        ])[1].toUpperCase();
        return (
          O(P, "live"),
          {
            o: P,
            id: P.id || "relay_" + V,
            short: Y,
            t: 0,
            cut: !1,
            cutting: !1,
          }
        );
      })),
      n.reset(s.playerStart),
      o.reset && o.reset(),
      (e.saturation = t),
      (e.flash = 0),
      q(),
      o.setRelays && o.setRelays(0, c.relays.length),
      ie());
  }
  function O(P, V) {
    try {
      let Y = P && P.object && P.object.userData;
      Y && typeof Y.setState == "function" && Y.setState(V);
    } catch (Y) {
      console.error("[game] relay setState threw", Y);
    }
  }
  function q() {
    if (!o.setMarkers) return;
    let P = c.relays
      .filter((V) => !V.cut)
      .map((V) => ({
        id: V.id,
        short: V.short,
        label: V.o.label || "闸口 " + V.short,
        pos: V.o.pos,
        kind: "relay",
      }));
    (c.allCut &&
      s.extraction &&
      P.push({
        id: "extract",
        short: (s.extraction && s.extraction.mark) || "撤",
        label: (s.extraction && s.extraction.label) || "趸船",
        pos: s.extraction.pos,
        kind: "extract",
      }),
      o.setMarkers(P));
  }
  function U({ skipIntro: P = !1, quick: V = !1, keepRetries: Y = !1 } = {}) {
    if (
      (Y || (c.retries = 0),
      l.show("none"),
      l.locationCard(!1),
      a(context.audio, "setPaused", !1),
      H(),
      a(context.weapon, "setVisible", !0),
      (g = !1),
      P)
    ) {
      ((e.fade = 0), T());
      return;
    }
    ((h = V ? GAME_FLOW.retryIntroSeconds : GAME_FLOW.introSeconds),
      (f = V),
      (p = V),
      (n.enabled = !1),
      // Patrol already spawned; keep player safe until intro hands off to playing.
      (n.invulnerable = !0),
      r.setGameplay && r.setGameplay(!1),
      o.show(!1),
      (e.fade = 1),
      a(context.audio, "setIntensity", 0.15),
      M("intro"));
  }
  function T() {
    ((n.invulnerable = !1),
      (n.enabled = !0),
      o.show(!0),
      r.setGameplay && r.setGameplay(!0),
      o.setObjective(D()),
      M("playing"),
      C(!0));
  }
  function D() {
    let hud = (Mi && Mi.hud) || {},
      extractObj = hud.extractObj || "前往趸船撤离";
    if (c.allCut) return extractObj;
    let P = c.relays.length - c.cut,
      V = c.relays.length;
    return c.cut === 0
      ? hud.startObj ||
          (V === 3
            ? "切断三处数据闸口"
            : `切断 ${V} 处数据闸口`)
      : P === 1
        ? "切断最后一处闸口"
        : `切断剩余 ${P} 处闸口`;
  }
  function C(P) {
    let V = r.describeMode ? r.describeMode() : "";
    (l.setLookMode(V),
      !(!P && V === x) &&
        ((x = V),
        _.state === "playing" &&
        (r.mode === "drag" ||
          (r.mode === "lock" &&
            !r.locked &&
            !context.params.shot &&
            !context.params.autostart))
          ? o.message(V, r.mode === "drag" ? 7 : 4)
          : _.state === "playing" && r.locked && o.message("", 0)));
  }
  (r.onModeChange && r.onModeChange(() => C(!1)),
    context.events.on("input:lock", (P) => {
      if (P.locked) {
        ((g = !0), C(!1));
        return;
      }
      (_.state === "playing" && g && G(), (g = !1));
    }),
    document.addEventListener("visibilitychange", () => {
      document.hidden && _.state === "playing" && G();
    }),
    addEventListener("keydown", (P) => {
      _.state !== "title" ||
        l.panelOpen ||
        (P.code !== "Enter" && P.code !== "NumpadEnter") ||
        (P.target && P.target.tagName === "BUTTON") ||
        (a(context.audio, "resume"), r.requestLock(), U({}));
    }));
  function G() {
    _.state === "playing" &&
      (r.setGameplay && r.setGameplay(!1),
      r.exitLock(),
      a(context.audio, "setPaused", !0),
      l.setLookMode(
        r.mode === "drag"
          ? r.describeMode()
          : r.touch
            ? "触屏操控已启用 \u2014 点「继续」返回港区。"
            : "继续后将重新锁定鼠标。Esc / P 可再次暂停。",
      ),
      o.show(!1),
      l.show("paused"),
      (d = 0.35),
      M("paused"));
  }
  function j(P) {
    _.state === "paused" &&
      (l.show("none"),
      a(context.audio, "setPaused", !1),
      o.show(!0),
      r.setGameplay && r.setGameplay(!0),
      (g = !1),
      r.requestLock(),
      M("playing"),
      setTimeout(() => C(!0), 700));
  }
  function N(P) {
    let V = P === "gull" ? "air" : "ground",
      Y = (s && s.enemySpawns) || [],
      L = Y.filter((Z) => Z.type === V);
    return L.length ? L : Y;
  }
  function Q(
    P,
    {
      minDist: V = GAME_FLOW.spawnFar,
      from: Y = n.pos,
      preferHidden: L = !0,
    } = {},
  ) {
    let Z = N(P),
      J = null,
      oe = -1e9;
    let bias = (s && s.layout && s.layout.spawnBias) || [];
    for (let le of Z) {
      let R = Math.hypot(le.pos.x - Y.x, le.pos.z - Y.z),
        I = context.rng() * 1.5,
        aeZ = bias.indexOf(le.zone);
      if (
        ((I += R >= V ? 2 + Math.min(1, (R - V) / 30) * 0.5 : -(V - R) / 4),
        aeZ >= 0 && (I += (bias.length - aeZ) * 0.4),
        L)
      ) {
        (b.copy(le.pos), (b.y += P === "gull" ? 0 : 1));
        let ae = !0;
        try {
          ae = context.physics.lineOfSight(b, n.eye);
        } catch {}
        ae || (I += 2.5);
      }
      let se = c.used.get(le);
      (se !== void 0 && c.time - se < 6 && (I -= 3),
        I > oe && ((oe = I), (J = le)));
    }
    let fe = new Vector3();
    if (J) {
      (c.used.set(J, c.time), fe.copy(J.pos));
      let le = (context.rng() - 0.5) * 2.4,
        R = (context.rng() - 0.5) * 2.4,
        I = P === "gull";
      try {
        I || (I = context.physics.nav.isWalkable(fe.x + le, fe.z + R));
      } catch {
        I = !1;
      }
      I && ((fe.x += le), (fe.z += R));
    } else {
      let le = context.rng() * Math.PI * 2;
      fe.set(
        clamp(Y.x + Math.cos(le) * 26, -34, 26),
        0,
        clamp(Y.z + Math.sin(le) * 26, -26, 24),
      );
    }
    return (P === "gull" && fe.y < 2.5 && (fe.y = 6 + context.rng() * 3), fe);
  }
  function K(P, V, Y) {
    let L = null;
    try {
      L = context.enemies.spawn(P, V, Y);
    } catch (Z) {
      console.error("[game] enemies.spawn threw", Z);
    }
    return L;
  }
  function ie() {
    let P = (s.playerStart && s.playerStart.pos) || n.pos;
    for (let V of ["gull", "hound"])
      for (let Y = 0; Y < GAME_FLOW.patrol[V]; Y++)
        K(
          V,
          Q(V, {
            minDist: 32,
            from: P,
            preferHidden: !0,
          }),
          {
            state: "patrol",
          },
        );
  }
  function F(P) {
    let V = GAME_FLOW.waves[Math.min(P, GAME_FLOW.waves.length - 1)],
      Y = [];
    for (let oe = 0; oe < V.gull; oe++) Y.push("gull");
    for (let oe = 0; oe < V.hound; oe++)
      Y.splice(Math.min(Y.length, 1 + oe * 2), 0, "hound");
    let L = 0,
      Z = 0;
    (Y.forEach((oe, fe) => {
      let le = Q(oe);
      ((L += le.x - n.pos.x),
        (Z += le.z - n.pos.z),
        c.queue.push({
          type: oe,
          pos: le,
          at: c.time + 1.6 + fe * GAME_FLOW.spawnStagger,
        }));
    }),
      (c.waveHot = 30));
    let J = ((Math.atan2(L, -Z) * 180) / Math.PI + 360) % 360,
      parts = [];
    (V.gull > 0 && parts.push("鸥×" + V.gull),
      V.hound > 0 && parts.push("獒×" + V.hound),
      o.warn &&
        o.warn(
          "接敌 — " +
            jC[Math.round(J / 45) % 8] +
            (parts.length ? " · " + parts.join(" ") : ""),
          3.8,
        ));
  }
  function X(P) {
    let V = ne();
    for (let Y = 0; Y < c.queue.length; Y++) {
      let L = c.queue[Y];
      if (c.time < L.at) continue;
      if (V >= GAME_FLOW.maxAlive) {
        L.at = c.time + 1;
        continue;
      }
      if (
        !K(L.type, L.pos, {
          state: "alert",
          target: n.pos,
        }) &&
        !context.enemies.stub &&
        (L.tries = (L.tries || 0) + 1) < 6
      ) {
        L.at = c.time + 1.5;
        continue;
      }
      (c.queue.splice(Y, 1), a(context.enemies, "alert", n.pos, 60));
      break;
    }
    if (c.allCut) {
      if (
        ((c.pursuitT -= P),
        c.pursuitT <= 0 &&
          c.pursuitLeft > 0 &&
          !c.queue.length &&
          V < GAME_FLOW.pursuitMinAlive)
      ) {
        ((c.pursuitT = GAME_FLOW.pursuitEvery), c.pursuitLeft--);
        let Y = context.rng() < 0.6 ? "gull" : "hound";
        c.queue.push({
          type: Y,
          pos: Q(Y),
          at: c.time + 0.5,
        });
      }
      c.pursuitT <= 0 &&
        ((c.pursuitT = 4), a(context.enemies, "alert", n.pos, 90));
    }
  }
  function ne() {
    try {
      return context.enemies.aliveCount
        ? context.enemies.aliveCount()
        : context.enemies.list.filter((P) => P.alive).length;
    } catch {
      return 0;
    }
  }
  function re(P) {
    let V = (context.enemies && context.enemies.list) || [];
    for (let Y = 0; Y < V.length; Y++) {
      let L = V[Y];
      if (
        L &&
        L.alive &&
        L.pos &&
        Math.hypot(L.pos.x - n.pos.x, L.pos.z - n.pos.z) < P
      )
        return !0;
    }
    return !1;
  }
  (context.events.on("enemy:alert", () => {
    if (((c.alertT = 10), _.state !== "playing")) return;
    if (!c.contactSaid) {
      ((c.contactSaid = !0), o.radio && o.radio(_l.contact, 3.2));
      return;
    }
    !c.pursuitSaid &&
      c.cut >= 1 &&
      ((c.pursuitSaid = !0), o.radio && o.radio(_l.pursuit, 3));
  }),
    context.events.on("player:hit", () => {
      c.alertT = Math.max(c.alertT, 8);
    }),
    context.events.on("player:rescued", () => {
      _.state === "playing" && o.message("被从水里捞了上来", 2.5);
    }));
  function $() {
    let P = null,
      V = GAME_FLOW.interactRange;
    for (let Y of c.relays) {
      if (Y.cut) continue;
      let L = Y.o.pos.x - n.pos.x,
        Z = Y.o.pos.z - n.pos.z,
        J = Math.hypot(L, Z);
      J > V ||
        Math.abs((Y.o.pos.y || 0) - n.pos.y) > 2.5 ||
        (J > 0.9 &&
          (L * n.forward.x + Z * n.forward.z) /
            (J * Math.max(0.2, Math.hypot(n.forward.x, n.forward.z))) <
            GAME_FLOW.interactFacing) ||
        ((P = Y), (V = J));
    }
    return P;
  }
  function ue(P) {
    let V = n.alive ? $() : null;
    for (let L of c.relays)
      L.cut ||
        (L === V && r.down("interact")
          ? (L.cutting || ((L.cutting = !0), O(L.o, "cutting")),
            (L.t += P / GAME_FLOW.cutSeconds),
            context.events.emit("objective:progress", {
              id: L.id,
              t: Math.min(1, L.t),
            }),
            L.t >= 1 && me(L))
          : L.t > 0 &&
            ((L.t = Math.max(0, L.t - P * 1.6)),
            L.cutting &&
              ((L.cutting = !1),
              O(L.o, "live"),
              context.events.emit("objective:progress", {
                id: L.id,
                t: 0,
              }))));
    let Y = s.extraction,
      hud = (Mi && Mi.hud) || {},
      hold = (Y && Y.hold) || 1.35,
      L =
        Y && Y.pos
          ? Math.hypot(Y.pos.x - n.pos.x, Y.pos.z - n.pos.z) <
              (Y.radius || 2.5) && Math.abs(Y.pos.y - n.pos.y) < 3.5
          : !1,
      Z = !!(r.down && r.down("interact"));
    if (V && !V.cut)
      o.setPrompt && o.setPrompt("切断闸口 " + V.short, saturate(V.t));
    else if (L && c.allCut && n.alive) {
      (!c.extractNearSaid &&
        ((c.extractNearSaid = !0),
        o.radio && _l.extractNear && o.radio(_l.extractNear, 2.6)),
        Z
          ? ((c.extractT = Math.min(1, c.extractT + P / hold)),
            c.extractT >= 1 && ee())
          : (c.extractT = Math.max(0, c.extractT - P * 1.55)),
        o.setPrompt &&
          o.setPrompt(
            hud.extractPrompt ||
              "登上" + ((Y && Y.label) || "趸船") + "撤离",
            saturate(c.extractT),
          ));
    } else
      ((c.extractT = 0),
        o.setPrompt && o.setPrompt(null),
        L &&
          !c.allCut &&
          c.extractHint <= 0 &&
          ((c.extractHint = 8),
          o.message(
            ((Y && Y.label) || "趸船") + "仍在线 — 闸口未切完不会等你",
            3.2,
          )));
    c.extractHint = Math.max(0, c.extractHint - P);
  }
  function me(P) {
    ((P.cut = !0), (P.cutting = !1), (P.t = 1), c.cut++, O(P.o, "cut"));
    let V = c.relays.length;
    (context.events.emit("objective:done", {
      id: P.id,
      index: c.cut,
      total: V,
    }),
      o.setRelays && o.setRelays(c.cut, V),
      o.setPrompt && o.setPrompt(null),
      n.addShake(0.18),
      F(c.cut - 1),
      c.cut >= V
        ? ((c.allCut = !0),
          (c.pursuitLeft = GAME_FLOW.pursuitExtra),
          (c.pursuitT = 12),
          (c.extractNearSaid = !1),
          a(s, "setExtractOpen", !0),
          context.events.emit("objective:all", {}),
          o.radio && o.radio(_l.all, 4.5),
          o.warn &&
            o.warn(
              (Mi && Mi.hud && Mi.hud.extractUnlock) ||
                ((s.extraction && s.extraction.label) || "趸船") + "已亮",
              3.6,
            ),
          o.message &&
            o.message(
              ((Mi && Mi.hud && Mi.hud.extractUnlock) ||
                ((s.extraction && s.extraction.label) || "趸船") +
                  "已亮 — 前往撤离"),
              3.4,
            ),
          e && (e.flash = Math.max(e.flash || 0, 0.55)))
        : o.radio &&
          o.radio(_l.cut[Math.min(c.cut - 1, _l.cut.length - 1)], 3.6),
      o.setObjective(D()),
      q());
  }
  context.events.on("player:dead", () => {
    // Intro can still sim enemies; if invuln is bypassed, avoid softlock without a death UI.
    (_.state !== "playing" && _.state !== "paused" && _.state !== "intro") ||
      (r.setGameplay && r.setGameplay(!1),
      r.exitLock(),
      o.setPrompt && o.setPrompt(null),
      o.show(!1),
      o.clearRadio && o.clearRadio(),
      l.locationCard && l.locationCard(!1),
      (() => {
        let P = (Mi && Mi.id) || "b8",
          V = recordDeath(P),
          Y = getEntry(P);
        l.setDead({
          time: c.time,
          relays: c.cut,
          total: c.relays.length,
          deaths: V.deaths,
          bestLine: Y.bestTime
            ? `本机最佳 ${formatScoreLine(Y)}`
            : "本机尚无通关记录",
        });
      })(),
      M("dead"));
  });
  function ee() {
    ((n.invulnerable = !0),
      (n.enabled = !1),
      r.setGameplay && r.setGameplay(!1),
      r.exitLock(),
      o.setPrompt && o.setPrompt(null),
      o.show(!1),
      context.events.emit("extraction:reached", {}),
      o.clearRadio && o.clearRadio(),
      a(s, "setExtractOpen", !1),
      // Landing beat — berth-specific loc-card before debrief.
      l.setLandingBeat &&
        l.setLandingBeat({
          k: (Mi && Mi.landingK) || "登船成功",
          h: (Mi && Mi.landingH) || ((Mi && Mi.debriefH) || "锈泊已暗"),
          line:
            (Mi && Mi.landingLine) ||
            (Mi && Mi.debriefLine) ||
            "趸船撤离成功",
        }),
      l.locationCard && l.locationCard(!0),
      o.radio && o.radio(_l.done, 2.6),
      e && (e.flash = Math.max(e.flash || 0, 0.72)));
    let P = (context.combat && context.combat.stats) || {
        shots: 0,
        hits: 0,
        kills: 0,
      },
      V = P.shots > 0 ? clamp(P.hits / P.shots, 0, 1) : null,
      Y =
        (c.time < 270 ? 2 : c.time < 400 ? 1 : 0) +
        (V >= 0.5 ? 2 : V >= 0.3 ? 1 : 0) +
        (c.retries === 0 ? 1 : 0),
      L = ["狼狈", "喧闹", "稳健", "干净", "凌厉", "外科手术"][Y],
      Z = (Mi && Mi.id) || "b8",
      J = recordClear(Z, {
        time: c.time,
        rating: L,
      }),
      oe = J.newBest
        ? `新纪录！本机最佳 ${l.fmtTime(J.entry.bestTime)} · 通关 ${J.entry.clears} · 阵亡 ${J.entry.deaths}`
        : `本局未破纪录 · ${formatScoreLine(J.entry)}`;
    // Stash debrief until landing hold finishes — each berth lingers differently.
    ((c._debrief = {
      time: c.time,
      accuracy: V,
      kills: P.kills || 0,
      retries: c.retries,
      rating: L,
      scoreNote: oe,
    }),
      (c._landingHold =
        (Mi && Number.isFinite(Mi.landingHold) && Mi.landingHold) || 2.8),
      M("complete"));
  }
  function B(P) {
    switch (((u += P), _.state)) {
      case "title":
        return (z(P), !1);
      case "intro":
        return (
          (e.fade = 1 - smoothstep(0.25, Math.min(h, 2.6), u)),
          !f && u > 0.5 && ((f = !0), l.locationCard(!0)),
          !p && u > 1.15 && ((p = !0), o.radio && o.radio(_l.intro, 4.6)),
          u > h - 0.6 &&
            !o.root?.classList.contains("on") &&
            (o.show(!0), o.setObjective(D())),
          u >= h && (l.locationCard(!1), (e.fade = 0), T()),
          !0
        );
      case "playing": {
        if (
          ((c.time += P),
          (e.fade = damp(e.fade || 0, 0, 6, P)),
          d > 0 && (d -= P),
          r.pressed("pause"))
        )
          return (G(), !1);
        if ((ue(P), _.state !== "playing")) return !0;
        (X(P),
          (c.alertT = Math.max(0, c.alertT - P)),
          (c.waveHot = Math.max(0, c.waveHot - P)));
        let V = ne();
        c.waveHot > 0 &&
          V === 0 &&
          !c.queue.length &&
          c.waveHot < 24 &&
          ((c.waveHot = 0),
            !c.allCut &&
              o.message &&
              o.message("这波编制散了 — 抓紧切闸口", 2.4));
        let Y =
          c.allCut || c.queue.length || (c.waveHot > 0 && V > 0)
            ? 1
            : c.alertT > 0 || (V > 0 && re(26))
              ? 0.6
              : 0.15;
        return (
          Y !== c.intensity &&
            ((c.intensity = Y), a(context.audio, "setIntensity", Y)),
          r.mode === "lock" &&
          !r.locked &&
          !r.touch &&
          !context.params.shot &&
          !context.params.autostart
            ? ((y -= P), y <= 0 && ((y = 2), o.message(r.describeMode(), 2.6)))
            : (y = 0.8),
          !c.tipSaid &&
            c.time > 6.5 &&
            !c.contactSaid &&
            ((c.tipSaid = !0), o.radio && o.radio(_l.tip, 3.8)),
          !c.lowSaid &&
            n.alive &&
            n.health < 30 &&
            ((c.lowSaid = !0), o.radio && o.radio(_l.low, 3)),
          !0
        );
      }
      case "paused":
        return (
          d > 0 ? (d -= P) : r.pressed("pause") && (l.closePanel() || j(!1)),
          !1
        );
      case "dead":
        return (
          (e.saturation = damp(e.saturation ?? 1, 0.12, 2.2, P)),
          (e.fade = damp(e.fade || 0, 0.55, 1.4, P)),
          u > 1.5 &&
            l.screen !== "dead" &&
            (l.show("dead"), a(context.audio, "setIntensity", 0.15)),
          !0
        );
      case "complete": {
        let V =
          (c._landingHold && Number.isFinite(c._landingHold) && c._landingHold) ||
          2.8;
        return (
          (e.fade = damp(e.fade || 0, 0.72, 0.9, P)),
          (e.saturation = damp(e.saturation ?? 1, t * 0.7, 1, P)),
          u > V &&
            l.screen !== "complete" &&
            (l.locationCard && l.locationCard(!1),
            c._debrief &&
              (l.setDebrief(c._debrief), (c._debrief = null)),
            l.show("complete"),
            a(context.audio, "setIntensity", 0.15)),
          !0
        );
      }
    }
    return !1;
  }
  return (
    we(
      (context.mission && context.mission.id) ||
        (context.params && context.params.mission) ||
        (l.settings && l.settings.mission) ||
        "b8",
    ),
    (n.enabled = !1),
    o.show(!1),
    a(context.weapon, "setVisible", !1),
    r.setGameplay && r.setGameplay(!1),
    a(context.audio, "setIntensity", 0.15),
    context.params.shot || context.params.autostart || l.show("title"),
    _
  );
}

export { createGameFlow, GAME_FLOW };
