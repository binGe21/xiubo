var bootElement = document.getElementById("boot");

var bootMessage = document.getElementById("boot-msg");

var bootProgress = document.getElementById("boot-fill");

var yieldToBrowser = () => new Promise((i) => setTimeout(i, 0));

var BOOT_TIPS = [
  "右键开镜可压低散布",
  "蓄力尖啸时侧步可躲开",
  "集装箱能切断鸥的视线",
  "切断闸口会引来增援",
  "生命值会缓慢回升",
  "南端码头是撤离点",
];

async function setBootProgress(i, e) {
  if (bootMessage) {
    let tip = BOOT_TIPS[Math.min(BOOT_TIPS.length - 1, Math.floor(e * BOOT_TIPS.length))];
    bootMessage.textContent = tip ? `${i} · ${tip}` : i;
  }
  (bootProgress && (bootProgress.style.width = Math.round(e * 100) + "%"),
    await yieldToBrowser());
}

export {
  bootElement,
  setBootProgress,
  bootMessage,
  bootProgress,
  yieldToBrowser,
  BOOT_TIPS,
};
