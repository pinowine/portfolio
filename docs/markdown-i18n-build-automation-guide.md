# Markdown 翻译与构建自动化指南

日期：2026-06-01

## 新增或修改项目 Markdown 后

1. 修改 `public/assets/markdown/{code}.md`。
2. 如新增 tag、tech、type，先更新 `src/data/manual/categorySchema.json`。
3. 确认 Markdown front matter 位于文件开头。脚本会处理 UTF-8 BOM，但不要在 front matter 前加入正文或注释。
4. 运行项目数据与翻译 key 同步：

```bash
npm run refresh:i18n
```

5. 翻译 `src/locales/en-US/translation.json` 和 `src/locales/zh-TW/translation.json` 中新增的 `markdown.*`、`projects.*`、`taxonomy.*` key。
6. 检查缺失翻译：

```bash
npm run check:i18n
```

报告位置：

```text
scripts/extracted-content-report.json
```

检查重点：

- `totals.missingTranslations` 必须为 `0`。
- `missingTranslations.en-US`、`missingTranslations.zh-CN`、`missingTranslations.zh-TW` 必须为空数组。

## Markdown 正文 key 规则

Markdown 正文按项目 code 和非空正文行序号生成 key。序号从 `001` 开始，front matter 不参与计数。

普通段落：

```text
markdown.{code}.{NNN}.text
```

图片：

```markdown
![alt{description}](/projects/001/details/1.webp)
```

对应：

```text
markdown.{code}.{NNN}.alt
markdown.{code}.{NNN}.description
```

PDF：

```markdown
[pdf:description{mode}](/projects/001/file.pdf)
```

对应：

```text
markdown.{code}.{NNN}.description
```

音频：

```markdown
[audio:name{description}](/projects/001/audio.mp3{/projects/001/cover.webp})
```

对应：

```text
markdown.{code}.{NNN}.name
markdown.{code}.{NNN}.description
```

网站：

```markdown
[website:title{description}](https://example.com)
```

对应：

```text
markdown.{code}.{NNN}.title
markdown.{code}.{NNN}.description
```

视频：

```markdown
[video:description](https://example.com/video)
```

对应：

```text
markdown.{code}.{NNN}.description
```

## 新增 Markdown 媒体语法后

需要同时更新三个位置，保持运行时翻译、同步脚本、检查脚本一致：

- `src/utils/markdownI18n.ts`
- `scripts/syncTranslationKeys.cjs`
- `scripts/extract-content.cjs`

更新后运行：

```bash
npm run sync:i18n
npm run check:i18n
npm run build
```

`sync:i18n` 会清理已经不存在的 `markdown.*` key。如果 Markdown front matter 的行数变化，不要手工移动旧 key，直接重新同步后翻译新生成的目标语言值。

## 更新 Node 22 与 Browserslist

本项目已声明 Node 22：

- `.nvmrc`
- `package.json` 的 `engines.node`
- `netlify.toml` 的 `NODE_VERSION`

在本地切换 Node：

```bash
nvm use 22
```

更新 Browserslist 数据：

```bash
npx update-browserslist-db@latest
```

如果使用 Yarn，更新后确认 `yarn.lock` 已变化并提交。当前 Codex 本地运行环境缺少可用的 `npm`、`yarn`、`corepack` 命令，因此这一步需要在正常开发终端中执行。

## 构建体积检查

运行：

```bash
npm run build
```

关注 Vite 输出：

- 不应出现 `Some chunks are larger than 500 kB`。
- `index-*.js` 应保持为入口轻量 chunk。
- PDF、Markdown、Lightbox、媒体组件应分别落在独立 chunk 中。

如果新增重型依赖，优先检查是否应加入 `vite.config.ts` 的 `manualChunks`，或改为 `React.lazy` 延迟加载。
