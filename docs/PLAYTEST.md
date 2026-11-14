# 锈泊 · 玩法证据 / 截图约定

供质量 Pass 与 PR 审阅复用的**轻量** playtest 约定。  
不依赖 Saltline 等价 vs 锈泊身份决策；不替代 `npm run check`。

配套：`README.md` 调试参数、`docs/DEVELOPMENT.md` 诊断接口。

---

## 1. 固定种子与画质

默认对照种子：**`4207`**（与 README / 历史验收一致）。

| 用途 | 建议 URL 片段 |
| --- | --- |
| 标题 / 菜单 | `/?seed=4207&q=high&noaudio=1` |
| 局内 HUD | `/?seed=4207&q=high&noaudio=1&autostart=1` |
| 固定镜头回归（考古） | `/?shot=1&q=test&seed=4207&dt=0&noaudio=1&cam=...`（见 DEVELOPMENT） |

PR 描述应写明：

- `seed`（默认 4207）
- `q`（建议 `high`；勿混用未注明的本地 `localStorage` 画质）
- 视口（见下）
- 浏览器 / 机器备注（GPU 不可跨机逐像素比）

首次启动会读 `localStorage` 键 `xiubo.settings.v1`。自动化截图脚本会清空该源，避免设置污染。

---

## 2. 视口

| 标签 | 尺寸 | 用途 |
| --- | --- | --- |
| `wide` | 1280×720 | 桌面标题、设置、局内 HUD、暂停 |
| `narrow` | 390×844 | 窄屏 / 触控布局抽检 |

同一 Pass 内 wide/narrow 都拍时，文件名必须带视口标签，避免混比。

---

## 3. 关键画面（最低集）

手感 / UX / 氛围 PR 至少附其中相关项；不必每次全拍。

| 画面 ID | 如何到达 | 审阅看什么 |
| --- | --- | --- |
| `title` | 标题屏（未 autostart） | 品牌「锈泊」、主 CTA、操作区 |
| `settings` | 标题 →「设置」 | 文案、控件可读性 |
| `hud` | `autostart=1` 且 `__ready` | 准星、目标、弹药等 HUD 噪声 |
| `paused` | 局内后 Esc / P | 暂停卡文案与层级 |

死亡 / 胜利卡可选手拍；自动化默认不强制（需推进玩法状态，易脆）。

---

## 4. 文件命名与目录

本地输出（**默认不入库**）：

```text
playtest-out/<label>/seed-<seed>-<viewport>-<screen>.png
```

示例：

```text
playtest-out/pass3-atmosphere/seed-4207-wide-title.png
playtest-out/pass3-atmosphere/seed-4207-wide-hud.png
playtest-out/pass3-atmosphere/seed-4207-narrow-title.png
```

| 段 | 规则 |
| --- | --- |
| `<label>` | Pass 名或短主题，如 `pass2-ux`、`2026-11-14-hud` |
| `<seed>` | 数字，默认 `4207` |
| `<viewport>` | `wide` 或 `narrow` |
| `<screen>` | `title` / `settings` / `hud` / `paused` 等 |

附件可拷到 Agent Store / PR 评论；仓库只保留约定与脚本，不强制提交 PNG。

---

## 5. 自动化：截图脚本

```bash
# 一次性：安装 Playwright（devDependency）与 Chromium
npm install
npx playwright install chromium

# 捕获默认最低集（wide 视口：title/settings/hud/paused）→ playtest-out/manual/
npm run playtest:shots

# 常用参数
npm run playtest:shots -- --label=pass3-atmosphere
npm run playtest:shots -- --seed=4207 --viewports=wide,narrow --shots=title,hud
PLAYTEST_URL=http://127.0.0.1:8743 npm run playtest:shots -- --no-server
```

每个画面会冷启动一局 WebGL，完整 wide 四连大约数分钟；加上 `narrow` 约翻倍。按需裁剪 `--shots` / `--viewports`。


脚本职责：

1. 可选启动本机 Vite（端口 **8743**；已被占用则复用）
2. 清空 `xiubo.settings.v1`；拦截远程 Google Fonts（本地 `fonts.css` 回退，避免截图挂起）
3. 每个画面使用新标签页；等待 `window.__ready`
4. 经 CDP 截取视口 PNG（规避 WebGL canvas 上 Playwright 合成截图超时）
5. 按约定命名写入 `playtest-out/<label>/`，并写 `manifest.json`

**不是** CI 门禁；失败不阻塞 `npm run check`。

---

## 6. 手工 checklist（脚本之外）

- [ ] 标题 → 开始突入 → 第一人称可控
- [ ] Esc 暂停 / 继续；设置开关可回退
- [ ] 触屏或窄视口：主要按钮可点（约 48px 量级）
- [ ] 切断闸口 / 撤离主闭环未被本次 diff 破坏（若改了 flow / input）
- [ ] 控制台无新增 `__fatal`；必要时贴 `__stats()` 摘要
- [ ] PR 写清「改了什么 / 未改什么」；身份相关大改须等产品决策

---

## 7. 与门禁的关系

| 命令 | 角色 |
| --- | --- |
| `npm run check` | **日常门禁**（必须绿） |
| `npm run build` | 动到构建链路时跑 |
| `npm run playtest:shots` | **审阅证据**，可选 |
| `npm run verify:refactor` | 迁移考古，非日常门禁 |

本约定不猜测产品身份；Gamefeel / 氛围 / 战斗主 Pass 仍以质量路线图 §3.4 为准。
