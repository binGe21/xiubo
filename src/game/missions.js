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
    // Short Chinese card line — why this berth feels different.
    menuDiff: "经典箱巷 · 堆场→仓库→码头",
    premise:
      "闸控失守，港区沦为机器的领地。切断堆场、仓库、码头三处数据闸口，在雨幕与钢箱之间杀到趸船。",
    locSub: "港区突入编制 — 单人突击，无后援",
    landingK: "登船成功 · 深水八号",
    landingH: "锈泊已暗",
    landingLine: "三闸已切，趸船舷梯收起。雨还在下。",
    landingHold: 2.9,
    debriefK: "深水八号 · 任务结算",
    debriefH: "锈泊已暗",
    debriefLine: "三处闸口已切断，趸船撤离成功。港区重新安静。",
    redeploy: "再度突入深水",
    extractLabel: "趸船",
    objectiveOrder: ["relay_a", "relay_b", "relay_c"],
    labels: {
      relay_a: "闸口甲 — 堆场",
      relay_b: "闸口乙 — 仓库",
      relay_c: "闸口丙 — 码头",
    },
    weaponName: "PAC-9 深水",
    hud: {
      channel: "指挥部",
      chip: "B8 · 深水",
      accent: "home",
      startObj: "切断堆场、仓库、码头三处闸口",
      extractObj: "前往趸船撤离",
      extractPrompt: "登上趸船撤离",
      extractUnlock: "趸船已亮 — 南端舷梯撤离",
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
        "突击手，这里是指挥部。深水八号泊位已失守，「港主」接管闸控。切断三处上行链路——堆场、仓库、码头。雨会盖住脚步，集装箱是你的掩护。从主突入道楔入。",
      tip: "提示：右键开镜压散布；白壳鸥蓄力时探照灯会亮透，橙壳獒扑击前信标闪红。按住 E 切断闸口。",
      contact: "编制咬上来了。天上白壳是鸥，地上橙壳是獒——先看清再打。",
      pursuit: "编制在追着你的热源。别停在空旷处——钻进箱巷，切开它们的夹击线。",
      cut: [
        "一处闸口已暗。它感觉到了——机械正在压过来。",
        "两处已暗。它把剩下的编制全压上来了。用钢箱切开它们的视线。",
      ],
      all: "三处全灭。趸船停在码头南端舷梯旁，绿灯还在闪。跑，别回头。",
      extractNear: "趸船舷梯就在面前。按住登船，别停在开敞处。",
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
    menuDiff: "冷柜堵巷 · 岸电先切 · 獒重",
    premise:
      "冷藏岸桥被改写——堆场东侧冷柜堵死箱巷，只能贴岸推进。先掐断岸电闸口，再回切堆场与仓库链路，最后沿雨幕撤上冷岸趸船。",
    locSub: "冷链切断编制 — 侧翼突入，雨更密",
    landingK: "冷岸登船 · 冷藏四号",
    landingH: "冷链已断",
    landingLine: "岸电熄灭，压缩机停转。湿甲板只剩雨声。",
    landingHold: 3.4,
    debriefK: "冷藏四号 · 任务结算",
    debriefH: "冷链已断",
    debriefLine: "岸电与冷链闸口已盲。冷柜停转，冷岸趸船撤离成功。",
    redeploy: "再度切断冷链",
    extractLabel: "冷岸趸船",
    // Quay first — player starts east and fights west through the yard.
    objectiveOrder: ["relay_c", "relay_a", "relay_b"],
    labels: {
      relay_c: "闸口甲 — 岸电",
      relay_a: "闸口乙 — 堆场冷链",
      relay_b: "闸口丙 — 仓库压缩机",
    },
    weaponName: "PAC-9 冷链",
    hud: {
      channel: "冷链台",
      chip: "B4 · 冷藏",
      accent: "cold",
      startObj: "先切岸电，再断冷链与压缩机闸口",
      extractObj: "沿湿岸撤上冷岸趸船",
      extractPrompt: "登上冷岸趸船",
      extractUnlock: "冷岸趸船已亮 — 贴湿岸撤离",
    },
    playerStart: {
      pos: new Vector3(22.4, 0, -11.2),
      yaw: Math.PI * 0.15,
    },
    combat: {
      // Hound-heavy pressure — ground pouncers own the wet quay.
      patrol: { gull: 1, hound: 4 },
      waves: [
        { gull: 1, hound: 3 },
        { gull: 2, hound: 4 },
        { gull: 2, hound: 5 },
      ],
      maxAlive: 11,
      spawnStagger: 0.78,
      spawnFar: 14,
      pursuitEvery: 5.0,
      pursuitMinAlive: 3,
      pursuitExtra: 8,
    },
    radio: {
      intro:
        "冷链台呼叫。岸电被「港主」锁死，冷柜在空转。先切码头岸电闸口，再回穿箱巷拿掉堆场冷链和仓库压缩机。獒会沿湿岸扑你——别贴栏杆硬刚，冷柜巷是你的掩护。",
      tip: "提示：此线獒多鸥少。橙壳扑击前准星会闪红——侧步再开镜。雨更密，脚步更难被听清。按住 E 切断闸口。",
      contact: "岸侧编制咬上来了。先拆橙壳獒的扑线，再打天上白壳鸥。",
      pursuit: "冷链热源暴露。它们在岸桥夹击——钻回冷柜巷，切断追击线。",
      cut: [
        "岸电已暗。冷柜停转声传开了——编制正在改道扑岸。",
        "两处已盲。仓库压缩机还在喘，切完就撤上冷岸趸船。",
      ],
      all: "冷链全盲。冷岸趸船灯号在闪。沿码头南端湿岸跑，别回头。",
      extractNear: "冷岸趸船就在脚下。湿甲板上站稳，按住登船。",
      low: "血量危险。躲进冷柜阴影，等生命回升——别站在开敞岸边。",
      done: "冷藏四号已静。锈泊夜里只剩雨声和停转的压缩机。干得漂亮。",
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
    menuDiff: "开敞北场 · 仓库先切 · 追击快",
    premise:
      "夜班机修环被接管——中央箱巷被腾空成机修通道，管材堵向码头。从开敞作业区楔入，优先切断仓库与堆场关键节点，再清码头备份闸口，赶在编制合围前登机修趸船。",
    locSub: "机修网突入 — 夜班短环，压迫更快",
    landingK: "冲上趸船 · 机修六号",
    landingH: "机修网已盲",
    landingLine: "夜班合围散了。舷梯一收，链路安静。",
    landingHold: 2.2,
    debriefK: "机修六号 · 任务结算",
    debriefH: "机修网已盲",
    debriefLine: "关键节点已切断，夜班编制失去合围，机修趸船撤离成功。",
    redeploy: "再度冲入机修",
    extractLabel: "机修趸船",
    // Shed-first routing from a mid-yard start.
    objectiveOrder: ["relay_b", "relay_a", "relay_c"],
    labels: {
      relay_b: "闸口甲 — 机修仓库",
      relay_a: "闸口乙 — 堆场总线",
      relay_c: "闸口丙 — 码头备份",
    },
    weaponName: "PAC-9 机修",
    hud: {
      channel: "夜班频道",
      chip: "B6 · 机修",
      accent: "maint",
      startObj: "先切机修仓库，再清堆场总线与码头备份",
      extractObj: "冲开机修道登机修趸船",
      extractPrompt: "冲上机修趸船",
      extractUnlock: "机修趸船已亮 — 冲通道撤离",
    },
    playerStart: {
      pos: new Vector3(-6.2, 0, -2.4),
      yaw: Math.PI * 0.92,
    },
    combat: {
      // Faster pursuit, more aerial pressure across open sightlines.
      patrol: { gull: 4, hound: 2 },
      waves: [
        { gull: 4, hound: 2 },
        { gull: 5, hound: 2 },
        { gull: 5, hound: 3 },
      ],
      maxAlive: 13,
      spawnStagger: 0.68,
      spawnFar: 13,
      pursuitEvery: 4.2,
      pursuitMinAlive: 3,
      pursuitExtra: 9,
    },
    radio: {
      intro:
        "夜班频道。机修六号环路被改写——仓库节点最烫。从开敞机修通道突入，先切仓库，再清堆场总线和码头备份。鸥在屋顶盘旋，别在开敞处站定；管材堆是你的掩体。",
      tip: "提示：压迫更快。切完一处就换掩体；鸥灯亮起、獒信标闪红时先躲。开敞视线长——别直线冲刺。按住 E 切断闸口。",
      contact: "夜班编制发现你了。白壳空中、橙壳地面——别恋战，切闸口换巷道。",
      pursuit: "合围正在收口。用管材与钢箱切开视线，别让它们把你赶到岸边。",
      cut: [
        "仓库节点已暗。堆场总线开始尖叫——继续切，别在开敞中央停。",
        "两处已盲。码头备份还在跳，切完就冲机修道登船。",
      ],
      all: "机修网全灭。机修趸船在等。跑。",
      extractNear: "机修趸船舷梯开着。别恋战——按住登船。",
      low: "伤势过重。躲进管材影里，喘口气。",
      done: "机修六号已盲。夜风还在刮，但链路安静了。干得漂亮。",
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
