# 性能优化更新日志

日期：2026-05-28

## 范围

本次更新聚焦主页上下滑动卡顿和日期数字分割动画卡顿。

涉及文件：

- `src/pages/HomePage.tsx`
- `src/components/Gallery.tsx`
- `src/components/Scrollbar.tsx`
- `src/components/ImgFigure.tsx`
- `src/components/Navbar.tsx`
- `src/hooks/useLenisScroll.ts`

## 总览

主页原先同时存在手写 Lenis `requestAnimationFrame` 循环、ScrollTrigger 更新、滚动条逐帧新建 GSAP tween、每张图各自创建 ScrollTrigger，以及 Gallery 预览/日期切换触发 React 重渲染等问题。本次优化保留现有视觉方向，但减少滚动期间的主线程工作，并补齐动画生命周期清理。

## 具体变更

### 1. 集中管理主页 Lenis 生命周期

文件：`src/hooks/useLenisScroll.ts`

- 新增 `useLenisScroll` hook 管理 Lenis 初始化。
- 改用 `gsap.ticker` 驱动 Lenis，让 GSAP 与 Lenis 共用动画时钟。
- 移除主页中没有取消句柄的手写 `requestAnimationFrame` 循环。
- 在 cleanup 中显式移除：
  - Lenis scroll listener。
  - GSAP ticker callback。
  - ScrollTrigger refresh listener。
  - Lenis instance。

审查备注：

- 当前 hook 先应用于主页。`AboutPage`、`DescriptionPage`、`FilterPage`、`ProjectPage` 仍保留旧的 Lenis 写法，可作为后续统一迁移项。

### 2. 简化主页组件

文件：`src/pages/HomePage.tsx`

- 用 `useLenisScroll` 替代本地 Lenis state/effect 样板代码。
- 移除未实际参与逻辑的 `mainRef`。
- 移除主页内重复的 GSAP 插件注册，保留 `src/App.tsx` 中的应用级注册。
- 继续向 `Gallery` 传递 Lenis ref，用于点击项目名滚动定位。
- 继续向 `Scrollbar` 传递 Lenis instance，用于进度条更新。

### 3. 降低自定义滚动条逐帧成本

文件：`src/components/Scrollbar.tsx`

- 将每次滚动都执行的 `gsap.to(".progress-bar", ...)` 改为一次性创建的 `gsap.quickSetter`。
- 从全局 `.progress-bar` 选择器改为组件内 `ref`。
- 将进度值限制在 `0..1`，并处理 `limit` 为 0 的情况。
- 为进度条添加 `transform-gpu` 和 `aria-hidden`。

预期效果：

- 避免滚动期间不断创建 tween。
- 进度条更新保持 transform-only。

### 4. 重构 Gallery 渲染结构

文件：`src/components/Gallery.tsx`

- 移除主页 Gallery 流程中的 `imagesloaded`。
- 修复原先在 `project.details.map(...)` 内部调用 Hook 的问题。
- 新增 memo 化子组件：
  - `GalleryThumb`
  - `ProjectRow`
  - `SplitDate`
- 将每张缩略图的加载状态移动到 `GalleryThumb` 内部。
- 缩略图继续 lazy load，第一张缩略图 eager load。
- 为 Gallery 缩略图添加 `decoding="async"`。
- 新增统一 CDN URL helper，避免预览图初始状态使用空路径或相对路径。
- 对没有 detail 图片的项目增加 thumbnail/poster 预览兜底。

预期效果：

- Gallery 的 active/preview 状态变化不再导致所有缩略图行一起重渲染。
- React Hook 调用顺序稳定。
- 预览图初始化更可靠。

### 5. 降低日期数字分割动画压力

文件：`src/components/Gallery.tsx`

- 保留可见的数字拆分渲染，但移除每个数字的独立 ref。
- 停止同时动画 mask container、digit wrapper 和每个 digit。
- 日期进入/离开现在只动画 `digit-wrapper` 的 transform/opacity。
- 非激活项目的 mask container 从 `fixed` 改为 `absolute`，只有当前激活日期被提升为 `fixed`。
- 为日期数字和指示器添加 `transform-gpu`。

预期效果：

- 每次项目切换时 GSAP target 数量明显减少。
- 避免父子元素叠加 transform。
- 减少滚动期间的 fixed-position 元素数量。

### 6. 用 IntersectionObserver 替代每张图的预览 ScrollTrigger

文件：`src/components/Gallery.tsx`

- 移除每张 Gallery 图片各自创建的预览切换 ScrollTrigger。
- 新增一个 `IntersectionObserver`，监听靠近视口中心的 `.gallery-preview-source` 图片。
- 保留项目级日期激活和右侧面板 pinning 所需的 ScrollTrigger。

预期效果：

- 减少 ScrollTrigger 数量和 refresh 成本。
- 将图片可见性判断交给浏览器原生 observer。

### 7. 降低项目激活状态更新优先级

文件：`src/components/Gallery.tsx`

- 用 ref 去重 active project 和 preview image 更新。
- 将 active project 与 preview image 的 React state 更新包进 `startTransition`。
- 点击项目名滚动前会先同步更新 active/preview 目标。

预期效果：

- 避免滚动阈值附近的无效 state 更新。
- 让 React 将预览图/高亮变化视为非紧急更新，减少对滚动输入的竞争。

### 8. 优化右侧面板 pin 距离

文件：`src/components/Gallery.tsx`

- 将固定的 `end: "+=1600% 80%"` 改为基于 Gallery 实际 `scrollHeight` 计算。
- 增加 `anticipatePin: 1` 与 `invalidateOnRefresh: true`。

预期效果：

- 避免过长的固定 pin 区间。
- ScrollTrigger 测量跟随实际渲染内容。

### 9. 预览图源变化时重置加载状态

文件：`src/components/ImgFigure.tsx`

- 当 `src` 变化时重置 `isLandscape` 和 `isLoaded`。
- 添加 `onError` 兜底，避免图片失败后 skeleton 永久存在。
- 将当前可见预览图设为 eager loading，并使用 async decoding。

预期效果：

- 避免上一张预览图的宽高方向状态污染下一张图。
- 当前可见预览图响应更及时。

### 10. 降低 Navbar 滚动监听负担

文件：`src/components/Navbar.tsx`

- 为 window scroll listener 添加 `{ passive: true }`。
- 为 Navbar 显示/隐藏 tween 添加 `overwrite: "auto"`。

预期效果：

- 避免不调用 `preventDefault` 的 scroll listener 阻塞滚动。
- 快速改变滚动方向时不堆叠 Navbar tween。

## 验证结果

已完成：

- `git diff --check`
  - 结果：通过。
  - 备注：仅出现 Git 行尾标准化提示，无空白错误。
- 静态搜索确认以下旧模式已从本次重点优化代码中移除：
  - `Gallery` 中的 `imagesLoaded`。
  - `Gallery` 中的 `digitSpanRefs`。
  - `Scrollbar` 中逐帧 `gsap.to(".progress-bar", ...)`。
  - `HomePage` 中手写 `requestAnimationFrame(raf)` 循环。

本环境未完成：

- `yarn lint`
  - 结果：未运行。
  - 原因：当前环境 PATH 中没有 `yarn`。
- `yarn build`
  - 结果：未运行。
  - 原因：当前环境 PATH 中没有 `yarn`。
- 本地浏览器 QA
  - 结果：未运行。
  - 原因：仓库当前没有 `node_modules`，包管理器不可用，无法启动 Vite dev server。

环境备注：

- 直接执行 `node --version` 被沙箱拒绝。
- Codex 内置 Node 可用，路径为 `C:\Users\pinowine\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`。
- 该内置 Node 不包含本仓库的 Vite/TypeScript/ESLint 依赖图，因此无法替代项目级构建。

## 审查清单

- 确认桌面触控板、鼠标滚轮、移动端触摸下主页滚动手感仍自然。
- 确认滚动项目缩略图时右侧预览图正常更新。
- 确认点击项目名称后仍能滚动定位到对应项目。
- 确认日期数字在上下滚动时进入、离开、反向进入都顺滑。
- 确认右侧面板在 Gallery 末尾附近正常解除 pin。
- 确认主题/语言切换不会残留旧的预览图或日期状态。

## 后续建议

- 将 `AboutPage`、`DescriptionPage`、`FilterPage`、`ProjectPage` 迁移到 `useLenisScroll`，统一清理全站旧 RAF 写法。
- 在本地依赖恢复后运行 `yarn lint` 与 `yarn build`。
- 启动浏览器性能录制，重点观察 ScrollTrigger refresh 成本和首屏 Rive autoplay 对滚动帧率的影响。
