// Selectable short missions over the 锈泊 berth map.
// layoutId drives procedural yard/quay geometry (see world/level/layouts.js).

import { Vector3 } from "../vendor/three-r180.js";

var HALF_PI = Math.PI / 2;

var MISSION_IDS = ["b8", "b4", "b6"];

var MISSIONS = {
  b8: {
    id: "b8",
    layoutId: "b8",
    tag: "B8",
    name: "深水八号",
    clock: "05:42",
    berthLine: "锈泊港区 · 深水八号泊位 · 05:42",
    role: "港区突入编制",
    premise:
      "闸控失守，港区沦为机器的领地。切断堆场、仓库、码头三处数据闸口，在雨幕与钢箱之间杀到趸船。",
    locSub: "港区突入编制 — 单人突击，无后援",
    debriefK: "深水八号 · 任务结算",
    debriefH: "锈泊已暗",
    debriefLine: "三处闸口已切断，趸船撤离成功。",
    extractLabel: "趸船",
    objectiveOrder: ["relay_a", "relay_b", "relay_c"],
    labels: {
      relay_a: "闸口甲 — 堆场",
      relay_b: "闸口乙 — 仓库",
      relay_c: "闸口丙 — 码头",
    },
    playerStart: {
      pos: new Vector3(-32, 0, 6),
      yaw: -HALF_PI,
    },
    combat: {
      patrol: { gull: 2, hound: 1 },
      waves: [
        { gull: 3, hound: 1 },
        { gull: 3, hound: 2 },
        { gull: 4, hound: 3 },
      ],
      maxAlive: 10,
      spawnStagger: 0.92,
      spawnFar: 17,
      pursuitEvery: 6.5,
      pursuitMinAlive: 4,
      pursuitExtra: 6,
    },
    radio: {
      intro:
        "突击手，这里是指挥部。深水八号泊位已失守，「港主」接管闸控。切断三处上行链路——堆场、仓库、码头。雨会盖住脚步，集装箱是你的掩护。",
      tip: "提示：右键开镜压散布；白壳鸥蓄力时探照灯会亮透，橙壳獒扑击前信标闪红。按住 E 切断闸口。",
      contact: "编制咬上来了。天上白壳是鸥，地上橙壳是獒——先看清再打。",
      pursuit: "编制在追着你的热源。别停在空旷处——钻进箱巷，切开它们的夹击线。",
      cut: [
        "一处闸口已暗。它感觉到了——机械正在压过来。",
        "两处已暗。它把剩下的编制全压上来了。用钢箱切开它们的视线。",
      ],
      all: "三处全灭。趸船停在码头南端舷梯旁，绿灯还在闪。跑，别回头。",
      low: "你伤得很重。躲进钢箱后面，喘口气。生命会缓慢回升。",
      done: "突击手已登船。锈泊链路已盲。雨还在下——但港区重新安静了。干得漂亮。",
    },
  },
  b4: {
    id: "b4",
    layoutId: "b4",
    tag: "B4",
    name: "冷藏四号",
    clock: "03:18",
    berthLine: "锈泊港区 · 冷藏四号泊位 · 03:18",
    role: "冷链切断编制",
    premise:
      "冷藏岸桥被改写——堆场东侧冷柜堵死箱巷，只能贴岸推进。先掐断岸电闸口，再回切堆场与仓库链路，最后沿雨幕撤上趸船。",
    locSub: "冷链切断编制 — 侧翼突入，雨更密",
    debriefK: "冷藏四号 · 任务结算",
    debriefH: "冷链已断",
    debriefLine: "岸电与冷链闸口已盲，趸船撤离成功。",
    extractLabel: "趸船",
    // Quay first — player starts east and fights west through the yard.
    objectiveOrder: ["relay_c", "relay_a", "relay_b"],
    labels: {
      relay_c: "闸口甲 — 岸电",
      relay_a: "闸口乙 — 堆场冷链",
      relay_b: "闸口丙 — 仓库压缩机",
    },
    playerStart: {
      pos: new Vector3(22.4, 0, -11.2),
      yaw: Math.PI * 0.15,
    },
    combat: {
      patrol: { gull: 1, hound: 3 },
      waves: [
        { gull: 2, hound: 2 },
        { gull: 2, hound: 3 },
        { gull: 3, hound: 4 },
      ],
      maxAlive: 11,
      spawnStagger: 0.84,
      spawnFar: 15,
      pursuitEvery: 5.4,
      pursuitMinAlive: 3,
      pursuitExtra: 7,
    },
    radio: {
      intro:
        "指挥部：冷藏四号侧。岸电被「港主」锁死，冷柜在空转。先切码头闸口，再回穿箱巷拿掉堆场和仓库。獒会沿湿岸扑你——别贴栏杆硬刚。",
      tip: "提示：此线獒多鸥少。橙壳扑击前准星会闪红——侧步再开镜。按住 E 切断闸口。",
      contact: "岸侧编制咬上来了。先拆橙壳獒的扑线，再打天上白壳鸥。",
      pursuit: "冷链热源暴露。它们在岸桥夹击——钻回箱巷，切断追击线。",
      cut: [
        "岸电已暗。冷柜停转声传开了——编制正在改道。",
        "两处已盲。仓库压缩机还在喘，切完就撤。",
      ],
      all: "冷链全盲。趸船灯号在闪。沿码头南端跑，别回头。",
      low: "血量危险。躲进集装箱阴影，等生命回升。",
      done: "冷藏四号已静。锈泊夜里只剩雨声。干得漂亮。",
    },
  },
  b6: {
    id: "b6",
    layoutId: "b6",
    tag: "B6",
    name: "机修六号",
    clock: "22:07",
    berthLine: "锈泊港区 · 机修六号泊位 · 22:07",
    role: "机修网突入",
    premise:
      "夜班机修环被接管——中央箱巷被腾空成机修通道，管材堵向码头。从箱巷中央楔入，优先切断仓库与堆场关键节点，再清码头备份闸口，赶在编制合围前登船。",
    locSub: "机修网突入 — 夜班短环，压迫更快",
    debriefK: "机修六号 · 任务结算",
    debriefH: "机修网已盲",
    debriefLine: "关键节点已切断，夜班编制失去合围，趸船撤离成功。",
    extractLabel: "趸船",
    // Shed-first routing from a mid-yard start.
    objectiveOrder: ["relay_b", "relay_a", "relay_c"],
    labels: {
      relay_b: "闸口甲 — 机修仓库",
      relay_a: "闸口乙 — 堆场总线",
      relay_c: "闸口丙 — 码头备份",
    },
    playerStart: {
      pos: new Vector3(-6.2, 0, -2.4),
      yaw: Math.PI * 0.92,
    },
    combat: {
      patrol: { gull: 3, hound: 2 },
      waves: [
        { gull: 3, hound: 2 },
        { gull: 4, hound: 2 },
        { gull: 4, hound: 3 },
      ],
      maxAlive: 12,
      spawnStagger: 0.78,
      spawnFar: 14,
      pursuitEvery: 4.8,
      pursuitMinAlive: 4,
      pursuitExtra: 8,
    },
    radio: {
      intro:
        "夜班频道。机修六号环路被改写——仓库节点最烫。从箱巷中央突入，先切仓库，再清堆场总线和码头备份。鸥在屋顶盘旋，别在开敞处站定。",
      tip: "提示：压迫更快。切完一处就换掩体；鸥灯亮起、獒信标闪红时先躲。按住 E 切断闸口。",
      contact: "夜班编制发现你了。白壳空中、橙壳地面——别恋战，切闸口换巷道。",
      pursuit: "合围正在收口。用钢箱切开视线，别让它们把你赶到岸边。",
      cut: [
        "仓库节点已暗。堆场总线开始尖叫——继续切。",
        "两处已盲。码头备份还在跳，切完就撤上船。",
      ],
      all: "机修网全灭。趸船在等。跑。",
      low: "伤势过重。躲进箱影，喘口气。",
      done: "机修六号已盲。夜雨还在下，但链路安静了。干得漂亮。",
    },
  },
};

function resolveMission(id) {
  let e = String(id || "")
    .trim()
    .toLowerCase();
  return MISSIONS[e] || MISSIONS.b8;
}

function listMissions() {
  return MISSION_IDS.map((e) => MISSIONS[e]);
}

export { MISSIONS, MISSION_IDS, resolveMission, listMissions };
