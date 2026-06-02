# Markdown 翻译与构建优化更新日志

日期：2026-06-01

## 范围

本次更新补齐项目详情页 Markdown 正文翻译，并处理图片流加载时机、GIF 兼容、Node 22 配置、Browserslist 更新尝试以及 Vite chunk size 优化。

## 已完成

### 1. Markdown 正文接入翻译键

- 新增 `src/utils/markdownI18n.ts`，在 Markdown fetch 后、渲染前按项目 code 将正文转换为翻译后的 Markdown 字符串。
- Markdown 正文使用稳定语义键：
  - `markdown.{code}.{NNN}.text`
  - `markdown.{code}.{NNN}.alt`
  - `markdown.{code}.{NNN}.description`
  - `markdown.{code}.{NNN}.title`
  - `markdown.{code}.{NNN}.name`
- `src/components/MarkdownRenderer/MdRenderer.tsx` 现在根据 Markdown 文件名推导项目 code，并对文本、图片说明、PDF、音频、网站、视频描述统一执行翻译。
- Markdown fetch 后会先剥离 UTF-8 BOM，再交给 `gray-matter` 解析，避免带 BOM 的文件把 front matter 当正文渲染或抽取。
- `src/components/MarkdownRenderer/RendererPlugins/Markdown.tsx` 不再对段落文本再次按原文查 key，避免翻译 key 与正文渲染重复处理。
- `scripts/syncTranslationKeys.cjs` 和 `scripts/extract-content.cjs` 已加入 Markdown 正文 key 生成和缺失检查。
- `scripts/syncTranslationKeys.cjs` 会清理过期的 `markdown.*` key，避免 front matter 行号错位后残留旧键。
- 已补齐近期项目 `025` 到 `034` 的 `en-US` 与 `zh-TW` Markdown 正文、图片说明和媒体说明翻译值。

### 2. 图片流加载与 GIF 适配

- `src/components/MarkdownRenderer/RendererPlugins/Masonry.tsx` 使用两个 `IntersectionObserver` 分别处理提前加载和显示动画。
- 图片资源在距离视口约 900px 时开始写入 `src`，避免进入视口后才开始请求。
- 图片卡片在更深的滚动位置再淡入，使用 `rootMargin: "0px 0px -35% 0px"` 和 `threshold: 0.18`。
- GIF 不再被额外改写为 webp，Markdown 中的 gif/png/jpg/jpeg/webp 路径会按原始路径进入图片流组件。

### 3. Node 22 与 Browserslist

- `package.json` 增加 `engines.node: ">=22 <23"`。
- 新增 `.nvmrc`，内容为 `22`。
- `netlify.toml` 增加 `NODE_VERSION = "22"`。
- 已尝试运行 Browserslist 数据更新，但当前本地环境缺少可用的 `npm`、`yarn`、`corepack` 命令，`update-browserslist-db` 无法调用包管理器更新 lockfile。因此构建中的 caniuse-lite 过期提示仍保留，需要在具备包管理器的环境中补跑。

### 4. Chunk size 优化

- MarkdownRenderer 的重型插件改为 `React.lazy` 加载：
  - Masonry
  - Lightbox
  - PdfViewer
  - Video
  - Audio
  - Frame
- `vite.config.ts` 增加 `manualChunks`，按功能域拆分：
  - `pdf-viewer`
  - `lightbox`
  - `markdown`
  - `motion`
  - `ui-vendor`
  - `media-widgets`
  - `icons`
  - `router`
  - `search`
  - `node-polyfills`
  - `utils`
  - `react`
  - `vendor`
- 构建后 Vite 不再输出 chunk 大于 500 kB 的警告。当前最大 JS chunk 为 `ui-vendor`，约 447.48 kB。

## 验证

- `node scripts/extract-content.cjs --fail-on-missing`
  - 通过
  - `expectedSemanticKeys: 673`
  - `missingTranslations: 0`
- `node node_modules/typescript/bin/tsc -b`
  - 通过
- `node node_modules/vite/bin/vite.js build`
  - 通过
  - 无 chunk size 警告
  - 仍有 Browserslist 数据过期提示
  - 仍有既有依赖 `gray-matter`、`pdfjs-dist` 的 `eval` 提示

## 后续注意

- 在有 `npm` 或 `yarn` 的 Node 22 环境中运行 `npx update-browserslist-db@latest`，并提交更新后的 lockfile。
- 如果继续压缩首屏体积，可进一步审查 `ui-vendor` 中的 Material Tailwind、MUI、Adobe Spectrum 是否仍需全部常驻。
- 如果新增 Markdown 媒体语法，需要同步更新 `markdownI18n.ts`、`syncTranslationKeys.cjs` 和 `extract-content.cjs` 的解析规则。
