// Local berth scoreboard — best clear times / deaths in localStorage. No backend.
import { listMissions, resolveMission } from "./missions.js";

var SCORES_KEY = "xiubo.scores.v1";

var EMPTY = () => ({
  bestTime: null,
  bestRating: "",
  clears: 0,
  deaths: 0,
});

function blankBoard() {
  let i = {};
  for (let e of listMissions()) i[e.id] = EMPTY();
  return i;
}

function sanitizeEntry(i) {
  let e = EMPTY();
  if (!i || typeof i != "object") return e;
  return (
    Number.isFinite(i.bestTime) &&
      i.bestTime > 0 &&
      (e.bestTime = Math.max(1, Math.floor(i.bestTime))),
    typeof i.bestRating == "string" &&
      i.bestRating &&
      (e.bestRating = i.bestRating.slice(0, 12)),
    Number.isFinite(i.clears) && (e.clears = Math.max(0, Math.floor(i.clears))),
    Number.isFinite(i.deaths) && (e.deaths = Math.max(0, Math.floor(i.deaths))),
    e
  );
}

function loadScores() {
  let i = blankBoard();
  try {
    let e = JSON.parse(localStorage.getItem(SCORES_KEY) || "null");
    if (e && typeof e == "object")
      for (let t of Object.keys(i)) e[t] && (i[t] = sanitizeEntry(e[t]));
  } catch {}
  return i;
}

function saveScores(i) {
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(i));
  } catch {}
}

function getEntry(i) {
  let e = resolveMission(i).id,
    t = loadScores();
  return t[e] || (t[e] = EMPTY());
}

function recordDeath(i) {
  let e = resolveMission(i).id,
    t = loadScores(),
    n = sanitizeEntry(t[e]);
  return ((n.deaths += 1), (t[e] = n), saveScores(t), n);
}

function recordClear(i, { time: e, rating: t } = {}) {
  let n = resolveMission(i).id,
    s = loadScores(),
    o = sanitizeEntry(s[n]),
    r = Math.max(1, Math.floor(+e || 0)),
    a = !o.bestTime || r < o.bestTime;
  return (
    (o.clears += 1),
    a && ((o.bestTime = r), (o.bestRating = (t && String(t)) || o.bestRating)),
    (s[n] = o),
    saveScores(s),
    {
      entry: o,
      newBest: a,
      time: r,
    }
  );
}

function formatScoreLine(i) {
  let e = sanitizeEntry(i);
  if (!e.bestTime) return e.deaths > 0 ? `阵亡 ${e.deaths}` : "尚无通关";
  let t =
      String(Math.floor(e.bestTime / 60)).padStart(2, "0") +
      ":" +
      String(e.bestTime % 60).padStart(2, "0"),
    n = e.bestRating ? ` · ${e.bestRating}` : "";
  return `最佳 ${t}${n} · 通关 ${e.clears} · 阵亡 ${e.deaths}`;
}

function formatBestShort(i) {
  let e = sanitizeEntry(i);
  if (!e.bestTime) return "—";
  return (
    String(Math.floor(e.bestTime / 60)).padStart(2, "0") +
    ":" +
    String(e.bestTime % 60).padStart(2, "0")
  );
}

export {
  SCORES_KEY,
  loadScores,
  saveScores,
  getEntry,
  recordDeath,
  recordClear,
  formatScoreLine,
  formatBestShort,
  blankBoard,
};
