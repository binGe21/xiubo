# playtest-out/

本地固定种子截图输出目录。约定见 [`docs/PLAYTEST.md`](../docs/PLAYTEST.md)。

```bash
npm run playtest:shots -- --label=my-pass
```

生成例如：

```text
playtest-out/my-pass/seed-4207-wide-title.png
playtest-out/my-pass/manifest.json
```

PNG / manifest 默认被 `.gitignore` 忽略，勿把大批量截图提交进仓库；把需要的文件附到 PR 或 Agent Store 即可。
