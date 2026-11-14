import { Vector3 } from "../vendor/three-r180.js";

function createCombat(context) {
  let e = {
    shots: 0,
    hits: 0,
    kills: 0,
  };
  return (
    context.events.on("enemy:killed", () => {
      e.kills++;
    }),
    {
      stats: e,
      reset() {
        e.shots = e.hits = e.kills = 0;
      },
      playerShot(
        n,
        s,
        { damage: o = 28, range: r = 300, impulse: a = 1 } = {},
      ) {
        e.shots++;
        let l = context.physics.raycast(n, s, r),
          c = context.enemies.raycast(n, s, l ? l.dist : r);
        if (c) {
          e.hits++;
          let u = c.part === "weak" ? 2.2 : 1,
            h = c.enemy.damage(o * u, c.point, s, c.part) === !0,
            f = {
              point: c.point,
              normal: c.normal || s.clone().negate(),
              dist: c.dist,
              surface: "enemy",
              enemy: c.enemy,
              part: c.part,
              dir: s,
              from: "player",
              killed: h,
            };
          return (
            context.events.emit("impact", f),
            context.events.emit("player:hitEnemy", {
              enemy: c.enemy,
              part: c.part,
              killed: h,
              weak: c.part === "weak",
            }),
            f
          );
        }
        if (l) {
          let u = {
            point: l.point,
            normal: l.normal,
            dist: l.dist,
            surface: l.surface,
            enemy: null,
            dir: s,
            from: "player",
          };
          return (context.events.emit("impact", u), u);
        }
        return null;
      },
      enemyShot(n, s, { damage: o = 6, range: r = 200 } = {}) {
        let a = context.physics.raycast(n, s, r),
          l = a ? a.dist : r,
          c = context.player;
        if (c && c.alive) {
          let u = nm.copy(c.pos);
          u.y += 1;
          let h = u.sub(n).dot(s);
          if (h > 0 && h < l) {
            zf.copy(n).addScaledVector(s, h);
            let f = Math.abs(zf.y - (c.pos.y + 0.95));
            if (Math.hypot(zf.x - c.pos.x, zf.z - c.pos.z) < 0.38 && f < 0.95)
              return (c.damage(o, n), !0);
          }
        }
        return (
          a &&
            context.events.emit("impact", {
              point: a.point,
              normal: a.normal,
              dist: a.dist,
              surface: a.surface,
              enemy: null,
              dir: s,
              from: "enemy",
            }),
          !1
        );
      },
      explode(n, s = 5, o = 80, r = "player") {
        for (let l of context.enemies.list) {
          if (!l.alive) continue;
          let c = l.pos.distanceTo(n);
          c < s &&
            context.physics.lineOfSight(
              n,
              nm.copy(l.pos).setY(l.pos.y + 0.5),
            ) &&
            l.damage(
              o * (1 - c / s),
              l.pos,
              zf.copy(l.pos).sub(n).normalize(),
              "body",
            );
        }
        let a = context.player;
        if (a && a.alive) {
          let l = nm
            .copy(a.pos)
            .setY(a.pos.y + 1)
            .distanceTo(n);
          l < s &&
            context.physics.lineOfSight(n, nm.copy(a.pos).setY(a.pos.y + 1)) &&
            a.damage(o * 0.5 * (1 - l / s), n);
        }
      },
      playerMelee(n, s, { damage: o = 48, range: r = 2.45 } = {}) {
        let a = null,
          l = r,
          c = null;
        for (let u of context.enemies.list) {
          if (!u.alive) continue;
          let h = u.type === "hound" ? 0.55 : u.type === "gull" ? 0.15 : 0.4;
          nm.copy(u.pos).y += h;
          let f = nm.x - n.x,
            p = nm.y - n.y,
            d = nm.z - n.z,
            v = Math.hypot(f, p, d);
          if (v > l || v < 0.05) continue;
          let g = (f * s.x + p * s.y + d * s.z) / v;
          if (g < 0.22) continue;
          ((l = v), (a = u), (c = nm.clone()));
        }
        if (!a) return null;
        zf.copy(c).sub(n).normalize();
        let u = a.damage(o, c, zf, "body") === !0,
          h = {
            point: c,
            normal: zf.clone().negate(),
            dist: l,
            surface: "enemy",
            enemy: a,
            part: "body",
            dir: zf.clone(),
            from: "player",
            melee: !0,
            killed: u,
          };
        return (
          context.events.emit("impact", h),
          context.events.emit("player:hitEnemy", {
            enemy: a,
            part: "body",
            killed: u,
            weak: !1,
            melee: !0,
          }),
          h
        );
      },
    }
  );
}

var nm = new Vector3();

var zf = new Vector3();

export { createCombat };
