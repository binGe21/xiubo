# 锈泊 · XIUBO

港区短任务 FPS。雨夜集装箱场，切断三处数据闸口，对抗空中「鸥」与地面「獒」，登趸船撤离。

Three.js r180、程序化材质 / 关卡 / 武器 / 敌人 / Web Audio；全中文菜单、HUD 与港区标识。提供模块化源码与单文件 HTML 双交付。

## 本地开发

需要 Node.js 20.19+ / 22.12+，以及支持 WebGL2 的浏览器。

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:8743`，点 **开始突入**。

```bash
npm run build          # 常规静态站点 → dist/
npm run build:single   # 单文件 HTML → dist-single/index.html
npm run preview
```

单文件版在联网时可拉中文字体；断网仍可玩，仅显示回退。

## 操作

| 动作 | 按键 |
| --- | --- |
| 移动 / 视角 | WASD / 鼠标 |
| 开火 / 开镜 | 左键 / 右键 |
| 换弹 / 近战 | R / F |
| 跳跃 / 冲刺 / 蹲 | 空格 / Shift / C |
| 切断闸口 / 登船 | 靠近后按住 E |
| 暂停 | Esc 或 P |

触屏：左拇指移动、右半屏视角；屏幕按钮含开火、开镜、换弹、近战、蹲、跳跃与互动。

设置保存在 `localStorage` 键 `xiubo.settings.v1`。

## 源码地图

见 `docs/DEVELOPMENT.md`。入口 `src/game.js` → `app/runtime.js`。

## 调试

| URL | 作用 |
| --- | --- |
| `/?q=low` / `/?q=medium` / `/?q=high` / `/?q=ultra` | 画质 |
| `/?seed=4207` | 固定随机种子 |
| `/?autostart=1` | 跳过标题直接开局 |
| `/?noaudio=1` | 静音模块 |
| `/?bench=1` | 基准巡游 |

浏览器控制台：`window.__G`、`window.__stats()`。
