// DOM menus, persisted settings and controls panels.
import { PLAYER_DIMENSIONS, QUALITY_PRESETS } from "../core/config.js";
import { chooseQuality } from "../core/quality.js";
import { listMissions, resolveMission } from "../game/missions.js";
import {
  formatBestShort,
  formatScoreLine,
  getEntry,
  loadScores,
} from "../game/scores.js";

var SETTINGS_KEY = "xiubo.settings.v1";

var DEFAULT_SETTINGS = {
  quality: "auto",
  sens: 1,
  invertY: !1,
  volume: 0.88,
  fov: PLAYER_DIMENSIONS.fov,
  mission: "b8",
};

var QUALITY_NAMES = ["auto", "low", "medium", "high", "ultra"];

var QUALITY_LABELS = {
  auto: "自动",
  low: "低",
  medium: "中",
  high: "高",
  ultra: "极致",
};

function loadSettings() {
  let i = {
    ...DEFAULT_SETTINGS,
  };
  try {
    let e = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    e &&
      typeof e == "object" &&
      (QUALITY_NAMES.includes(e.quality) && (i.quality = e.quality),
      Number.isFinite(e.sens) && (i.sens = Math.min(3, Math.max(0.2, e.sens))),
      (i.invertY = !!e.invertY),
      Number.isFinite(e.volume) &&
        (i.volume = Math.min(1, Math.max(0, e.volume))),
      Number.isFinite(e.fov) && (i.fov = Math.min(95, Math.max(60, e.fov))),
      e.mission && resolveMission(e.mission).id === e.mission && (i.mission = e.mission));
  } catch {}
  return i;
}

function saveSettings(i) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(i));
  } catch {}
}

var KEYBOARD_CONTROLS_HTML = `
  <dl class="keys">
    <div><dt>移动</dt><dd><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dd></div>
    <div><dt>视角</dt><dd>鼠标</dd></div>
    <div><dt>开火</dt><dd>鼠标左键</dd></div>
    <div><dt>开镜</dt><dd>鼠标右键</dd></div>
    <div><dt>换弹</dt><dd><kbd>R</kbd></dd></div>
    <div><dt>切断闸口</dt><dd>按住 <kbd>E</kbd></dd></div>
    <div><dt>跳跃</dt><dd><kbd>Space</kbd></dd></div>
    <div><dt>冲刺</dt><dd><kbd>Shift</kbd></dd></div>
    <div><dt>蹲下</dt><dd><kbd>C</kbd> 或 <kbd>Ctrl</kbd></dd></div>
    <div><dt>近战</dt><dd><kbd>F</kbd></dd></div>
    <div><dt>暂停</dt><dd><kbd>Esc</kbd> 或 <kbd>P</kbd></dd></div>
  </dl>`;

var TOUCH_CONTROLS_HTML = `
  <dl class="keys">
    <div><dt>移动</dt><dd>左拇指，任意位置</dd></div>
    <div><dt>视角</dt><dd>在右半屏拖动</dd></div>
    <div><dt>开火</dt><dd>按住「开火」，拖动跟踪</dd></div>
    <div><dt>开镜</dt><dd>「开镜」切换</dd></div>
    <div><dt>换弹</dt><dd>「换弹」</dd></div>
    <div><dt>跳跃</dt><dd>「跳跃」</dd></div>
    <div><dt>蹲下 / 近战</dt><dd>「蹲」/「近战」</dd></div>
    <div><dt>切断闸口</dt><dd>在闸口旁按住「互动」</dd></div>
    <div><dt>冲刺</dt><dd>摇杆推满向前</dd></div>
  </dl>`;

function createMenus(context, e) {
  let t = document.getElementById("ui"),
    n = loadSettings(),
    s = document.createElement("div");
  ((s.className = "menu"),
    (s.dataset.screen = "none"),
    (s.innerHTML = `
    <div class="m-veil"></div>
    <div class="m-bars"><i></i><i></i></div>

    <section class="m-screen m-title" data-s="title" aria-label="锈泊">
      <div class="m-title-main">
        <div class="m-eyebrow"><span class="m-tag" data-f="mission-tag">B8</span><span data-f="mission-role">港区突入编制</span><span class="m-dim" data-f="mission-berth">锈泊港区 \xB7 深水八号泊位 \xB7 05:42</span></div>
        <h1 class="m-word">锈泊</h1>
        <p class="m-premise" data-f="mission-premise">闸控失守，港区沦为机器的领地。切断堆场、仓库、码头三处数据闸口，在雨幕与钢箱之间杀到趸船。</p>
        <div class="m-missions" role="radiogroup" aria-label="选择泊位任务">
          ${listMissions()
            .map(
              (U) =>
                `<button type="button" class="m-mission" role="radio" data-mission="${U.id}" data-berth="${U.id}" aria-checked="false"><b>${U.tag}</b><span>${U.name}</span><i>${U.clock}</i><small>${U.menuDiff || ""}</small><em data-best="${U.id}">—</em></button>`,
            )
            .join("")}
        </div>
        <p class="m-scoreboard" data-f="scoreboard" aria-label="本机泊位成绩">本机成绩加载中</p>
        <div class="m-actions">
          <button class="btn primary" data-act="deploy">开始突入</button>
          <button class="btn" data-act="settings">设置</button>
          <button class="btn m-only-narrow" data-act="controls">操作</button>
        </div>
        <p class="m-note">三泊位短任务 · 本机成绩存于浏览器 · 键盘鼠标或触屏均可 · Esc / P 暂停</p>
      </div>
      <aside class="m-legend" aria-label="操作速览">
        <div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动</span><span><kbd>鼠标</kbd> 视角</span><span><kbd>左键</kbd> 开火</span><span><kbd>右键</kbd> 开镜</span><span><kbd>R</kbd> 换弹</span></div>
        <div><span><kbd>E</kbd> 切断闸口</span><span><kbd>F</kbd> 近战</span><span><kbd>空格</kbd> 跳跃</span><span><kbd>Shift</kbd> 冲刺</span><span><kbd>C</kbd> 蹲下</span><span><kbd>Esc</kbd> 暂停</span></div>
        <div class="lg-touch"><em>触屏</em><span>左拇指移动</span><span>右拇指视角</span><span>屏幕按钮：开火 \xB7 开镜 \xB7 换弹 \xB7 近战 \xB7 蹲 \xB7 跳跃</span></div>
      </aside>
    </section>

    <section class="m-screen m-card" data-s="paused" aria-label="暂停">
      <div class="m-k">行动中止</div>
      <h2 class="m-h">任务暂停</h2>
      <p class="m-line" data-f="lookmode"></p>
      <div class="m-actions col">
        <button class="btn primary" data-act="resume">继续</button>
        <button class="btn" data-act="settings">设置</button>
        <button class="btn" data-act="controls">操作</button>
        <button class="btn" data-act="restart">重新突入</button>
      </div>
    </section>

    <section class="m-screen m-card m-dead" data-s="dead" aria-label="信号中断">
      <div class="m-k">突击手倒地</div>
      <h2 class="m-h">信号中断</h2>
      <p class="m-line">港区未静。重整装具，再次突入切断闸口。</p>
      <dl class="m-stats"><div><dt>存活时间</dt><dd data-f="dead-time">00:00</dd></div><div><dt>已切闸口</dt><dd data-f="dead-relays">0/3</dd></div><div><dt>本泊位阵亡</dt><dd data-f="dead-deaths">0</dd></div></dl>
      <p class="m-score-note" data-f="dead-best">本机尚无通关记录</p>
      <div class="m-actions col"><button class="btn primary" data-act="retry">再次突入</button></div>
    </section>

    <section class="m-screen m-card m-debrief" data-s="complete" aria-label="任务结算">
      <div class="m-k" data-f="debrief-k">深水八号 \xB7 任务结算</div>
      <h2 class="m-h" data-f="debrief-h">锈泊已暗</h2>
      <p class="m-line" data-f="debrief-line">三处闸口已切断，趸船撤离成功。</p>
      <div class="m-rating"><span>评级</span><b data-f="rating">干净</b></div>
      <dl class="m-stats">
        <div><dt>用时</dt><dd data-f="time">00:00</dd></div>
        <div><dt>命中率</dt><dd data-f="acc">0%</dd></div>
        <div><dt>击毁机械</dt><dd data-f="kills">0</dd></div>
        <div><dt>重试次数</dt><dd data-f="retries">0</dd></div>
      </dl>
      <p class="m-score-note" data-f="score-note">本机成绩</p>
      <div class="m-actions col"><button class="btn primary" data-act="redeploy">再度突入</button></div>
    </section>

    <div class="panel" role="dialog" aria-modal="true" aria-label="设置与操作" tabindex="-1" hidden>
      <header class="panel-h">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" data-tab="settings" aria-selected="true">设置</button>
          <button class="tab" role="tab" data-tab="controls" aria-selected="false">操作</button>
        </div>
        <button class="btn small" data-act="close-panel">关闭</button>
      </header>
      <div class="panel-b" data-pane="settings">
        <div class="row"><label id="l-q">画质</label>
          <div class="seg" role="group" aria-labelledby="l-q">${QUALITY_NAMES.map((U) => `<button type="button" data-q="${U}" aria-pressed="false">${QUALITY_LABELS[U]}</button>`).join("")}</div></div>
        <div class="row"><label for="s-sens">视角灵敏度</label><div class="slider"><input id="s-sens" type="range" min="0.2" max="3" step="0.05"><output data-o="sens"></output></div></div>
        <div class="row"><label id="l-inv">反转 Y 轴</label><button type="button" class="toggle" data-act="invert" aria-labelledby="l-inv" aria-pressed="false"><i></i><span>关</span></button></div>
        <div class="row"><label for="s-vol">主音量</label><div class="slider"><input id="s-vol" type="range" min="0" max="100" step="1"><output data-o="vol"></output></div></div>
        <div class="row"><label for="s-fov">视野 FOV</label><div class="slider"><input id="s-fov" type="range" min="60" max="95" step="1"><output data-o="fov"></output></div></div>
        <div class="row" data-row="fs"><label id="l-fs">显示</label><button type="button" class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">进入全屏</span></button></div>
        <p class="panel-note" data-f="qnote"></p>
      </div>
      <div class="panel-b" data-pane="controls" hidden>
        <h3>键盘 \xB7 鼠标</h3>${KEYBOARD_CONTROLS_HTML}
        <p class="panel-note">若浏览器无法锁定鼠标，可按住鼠标拖动视角（左键同时开火，右键同时开镜）。方向键或 <kbd>I</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> 转向，<kbd>Enter</kbd> 开火。</p>
        <h3>触屏</h3>${TOUCH_CONTROLS_HTML}
        <h3>手柄</h3>
        <p class="panel-note">摇杆移动与视角 \xB7 RT 开火 \xB7 LT 开镜 \xB7 A 跳 \xB7 B 蹲 \xB7 X 换弹 \xB7 Y 切断闸口 \xB7 L3 冲刺 \xB7 Start 暂停。支持双马达震动反馈（开火 / 受伤 / 闸口 / 雷声）。</p>
      </div>
    </div>

    <div class="loc-card" aria-hidden="true"><i></i><b data-f="loc-berth">锈泊港区 \xB7 深水八号泊位 \xB7 05:42</b><span data-f="loc-sub">港区突入编制 \u2014 单人突击，无后援</span></div>
  `),
    t.appendChild(s));
  let o = (U) => s.querySelector(U),
    r = (U) => [...s.querySelectorAll(U)],
    a = o(".panel"),
    l = o(".loc-card"),
    c = (U) => s.querySelector(`[data-f="${U}"]`),
    u = o("#s-sens"),
    h = o("#s-vol"),
    f = o("#s-fov"),
    p = "none",
    d = null;
  function refreshScoreboard(U) {
    let T = resolveMission(U || n.mission).id,
      D = loadScores(),
      C = listMissions()
        .map((G) => {
          let j = D[G.id] || getEntry(G.id),
            N = formatBestShort(j);
          return `${G.tag} ${N === "—" ? "尚无" : N}`;
        })
        .join(" · "),
      G = D[T] || getEntry(T);
    for (let j of r("[data-best]"))
      j.textContent = formatBestShort(D[j.dataset.best] || getEntry(j.dataset.best));
    let N = c("scoreboard");
    N &&
      (N.textContent =
        `本机 · ${C}` +
        (G.bestTime || G.deaths
          ? ` — 当前 ${resolveMission(T).tag}：${formatScoreLine(G)}`
          : ` — 当前 ${resolveMission(T).tag}：尚无通关`));
  }
  function setMissionBriefing(U) {
    let T = resolveMission(U && (U.id || U));
    ((n.mission = T.id),
      (c("mission-tag").textContent = T.tag),
      (c("mission-role").textContent = T.role),
      (c("mission-berth").textContent = T.berthLine),
      (c("mission-premise").textContent = T.premise),
      (c("loc-berth").textContent = T.berthLine),
      (c("loc-sub").textContent = T.locSub),
      (c("debrief-k").textContent = T.debriefK),
      (c("debrief-h").textContent = T.debriefH),
      (c("debrief-line").textContent = T.debriefLine));
    for (let D of r(".m-mission"))
      D.setAttribute("aria-checked", String(D.dataset.mission === T.id));
    (refreshScoreboard(T.id), saveSettings(n));
  }
  function v(U) {
    if (
      ((!U || U === "sens") && (context.input.sensitivity = n.sens),
      (!U || U === "invertY") && (context.input.invertY = n.invertY),
      !U || U === "volume")
    )
      try {
        context.audio &&
          context.audio.setVolume &&
          context.audio.setVolume(n.volume);
      } catch (T) {
        console.error(T);
      }
    if (
      ((!U || U === "fov") &&
        context.player &&
        context.player.setFov &&
        context.player.setFov(n.fov),
      U === "quality" ||
        (!U &&
          n.quality !== "auto" &&
          !context.params.shot &&
          !context.params.q &&
          n.quality !== (context.quality && context.quality.name)))
    ) {
      let T =
        n.quality === "auto" ? chooseQuality() : QUALITY_PRESETS[n.quality];
      if (T)
        try {
          context.render && context.render.setQuality
            ? context.render.setQuality({
                ...T,
              })
            : (context.quality = {
                ...T,
              });
        } catch (D) {
          console.error("[game] setQuality failed", D);
        }
    }
  }
  function g() {
    let U =
      n.quality === "auto"
        ? (context.quality && context.quality.name) || "high"
        : n.quality;
    for (let D of r(".seg button"))
      D.setAttribute("aria-pressed", String(D.dataset.q === n.quality));
    ((u.value = n.sens),
      (h.value = Math.round(n.volume * 100)),
      (f.value = n.fov),
      (o('[data-o="sens"]').textContent = n.sens.toFixed(2) + "\xD7"),
      (o('[data-o="vol"]').textContent = Math.round(n.volume * 100) + "%"),
      (o('[data-o="fov"]').textContent = Math.round(n.fov) + "\xB0"));
    let T = o('[data-act="invert"]');
    (T.setAttribute("aria-pressed", String(n.invertY)),
      (T.querySelector("span").textContent = n.invertY ? "开" : "关"),
      (c("qnote").textContent =
        n.quality === "auto"
          ? `已按本机性能选择画质（${QUALITY_LABELS[U] || U || "默认"}）。若掉帧请下调。`
          : "画质立即生效；阴影与反射可能需要片刻重建。"));
  }
  (u.addEventListener("input", () => {
    ((n.sens = +u.value), v("sens"), g(), saveSettings(n));
  }),
    h.addEventListener("input", () => {
      ((n.volume = +h.value / 100), v("volume"), g(), saveSettings(n));
    }),
    f.addEventListener("input", () => {
      ((n.fov = +f.value), v("fov"), g(), saveSettings(n));
    }));
  let x = o('[data-row="fs"]'),
    y = o("#fs-t"),
    b = () =>
      document.fullscreenElement || document.webkitFullscreenElement || null,
    m = document.getElementById("app") || document.documentElement;
  (m &&
    (m.requestFullscreen || m.webkitRequestFullscreen) &&
    document.fullscreenEnabled !== !1 &&
    document.webkitFullscreenEnabled !== !1) ||
    (x.hidden = !0);
  function _() {
    y.textContent = "当前环境不支持全屏";
  }
  function M() {
    try {
      if (b()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(
          document,
        );
        return;
      }
      let U = (m.requestFullscreen || m.webkitRequestFullscreen).call(m);
      U && U.catch && U.catch(_);
    } catch {
      _();
    }
  }
  let E = () => {
    y.textContent = b() ? "退出全屏" : "进入全屏";
  };
  (document.addEventListener("fullscreenchange", E),
    document.addEventListener("webkitfullscreenchange", E));
  function w(U) {
    ((d = document.activeElement),
      (a.hidden = !1),
      s.classList.add("panel-open"),
      z(U || "settings"));
    try {
      a.focus({
        preventScroll: !0,
      });
    } catch {}
  }
  function S() {
    return a.hidden
      ? !1
      : ((a.hidden = !0),
        s.classList.remove("panel-open"),
        d && d.focus && s.contains(d) ? d.focus() : H(),
        !0);
  }
  function z(U) {
    for (let T of r(".tab"))
      T.setAttribute("aria-selected", String(T.dataset.tab === U));
    for (let T of r(".panel-b")) T.hidden = T.dataset.pane !== U;
  }
  function H() {
    let U = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
    if (U)
      try {
        U.focus({
          preventScroll: !0,
        });
      } catch {}
  }
  (s.addEventListener("click", (U) => {
    let T = U.target.closest("button");
    if (!T || !s.contains(T)) return;
    if ((context.events.emit("ui:click", {}), T.dataset.q)) {
      ((n.quality = T.dataset.q), v("quality"), g(), saveSettings(n));
      return;
    }
    if (T.dataset.mission) {
      e.selectMission
        ? e.selectMission(T.dataset.mission)
        : setMissionBriefing(T.dataset.mission);
      return;
    }
    if (T.dataset.tab) {
      z(T.dataset.tab);
      return;
    }
    let D = T.dataset.act;
    D === "settings"
      ? w("settings")
      : D === "controls"
        ? w("controls")
        : D === "close-panel"
          ? S()
          : D === "invert"
            ? ((n.invertY = !n.invertY), v("invertY"), g(), saveSettings(n))
            : D === "fullscreen"
              ? M()
              : D && e[D] && e[D](U);
  }),
    s.addEventListener("mouseover", (U) => {
      let T = U.target.closest("button");
      T &&
        U.relatedTarget &&
        !T.contains(U.relatedTarget) &&
        context.events.emit("ui:hover", {});
    }),
    s.addEventListener("keydown", (U) => {
      if (
        (U.code === "Escape" &&
          !a.hidden &&
          (S(), U.stopPropagation(), U.preventDefault()),
        U.code === "Tab" && !a.hidden)
      ) {
        let T = [...a.querySelectorAll("button, input")].filter(
          (G) => G.offsetParent !== null,
        );
        if (!T.length) return;
        let D = T[0],
          C = T[T.length - 1];
        U.shiftKey && document.activeElement === D
          ? (C.focus(), U.preventDefault())
          : !U.shiftKey &&
            document.activeElement === C &&
            (D.focus(), U.preventDefault());
      }
    }));
  let O = (U) => (
      (U = Math.max(0, Math.floor(U))),
      String(Math.floor(U / 60)).padStart(2, "0") +
        ":" +
        String(U % 60).padStart(2, "0")
    ),
    q = {
      root: s,
      settings: n,
      fmtTime: O,
      get screen() {
        return p;
      },
      get panelOpen() {
        return !a.hidden;
      },
      closePanel: S,
      setMissionBriefing: setMissionBriefing,
      show(U) {
        U !== p &&
          ((p = U),
          (s.dataset.screen = U),
          S(),
          s.classList.toggle("open", U !== "none"),
          U !== "none"
            ? (g(),
              U === "title" && refreshScoreboard(n.mission),
              setTimeout(H, 30))
            : document.activeElement &&
              s.contains(document.activeElement) &&
              document.activeElement.blur());
      },
      locationCard(U) {
        l.classList.toggle("on", !!U);
      },
      setLookMode(U) {
        c("lookmode").textContent = U || "";
      },
      refreshScoreboard,
      setDead({ time: U, relays: T, total: D, deaths: C, bestLine: G }) {
        ((c("dead-time").textContent = O(U)),
          (c("dead-relays").textContent = `${T}/${D}`),
          (c("dead-deaths").textContent = String(C ?? 0)),
          (c("dead-best").textContent =
            G || "本机尚无通关记录"));
      },
      setDebrief({
        time: U,
        accuracy: T,
        kills: D,
        retries: C,
        rating: G,
        scoreNote: j,
      }) {
        ((c("time").textContent = O(U)),
          (c("acc").textContent =
            T == null ? "\u2014" : Math.round(T * 100) + "%"),
          (c("kills").textContent = String(D)),
          (c("retries").textContent = String(C)),
          (c("rating").textContent = G),
          (c("score-note").textContent = j || "本机成绩已更新"),
          refreshScoreboard(n.mission));
      },
      applySettings: v,
    };
  return (
    setMissionBriefing(
      (context.params && context.params.mission) || n.mission || "b8",
    ),
    g(),
    q
  );
}

export {
  createMenus,
  loadSettings,
  saveSettings,
  SETTINGS_KEY,
  DEFAULT_SETTINGS,
  QUALITY_NAMES,
  KEYBOARD_CONTROLS_HTML,
  TOUCH_CONTROLS_HTML,
};
