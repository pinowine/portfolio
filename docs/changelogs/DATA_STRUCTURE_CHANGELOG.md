# 数据结构重构更新日志

日期：2026-05-28

## 本次目标

根据 `docs/project-data-architecture.md` 中“仍然存在的问题”部分，对项目数据边界、分类 schema、页面数据消费方式进行重构。

## 已完成

### 1. 明确生成数据与手工配置边界

- 新增 `src/data/generated/`，用于存放脚本生成的项目索引与筛选数据。
- 新增 `src/data/manual/`，用于存放人工维护配置。
- 将 `homeFeaturedProjects.json` 移入 `manual`，避免生成脚本覆盖首页精选配置。
- 将 `projectsMetadata.json`、`recentProjects.json`、`tags.json`、`techs.json`、`types.json`、`years.json` 移入 `generated`。
- 移除旧的 `yearlyProjects.json` 与带前导空格的旧 `projectsMetadata.json`，减少同类生成物并存导致的误用风险。

### 2. 合并分类映射 schema

- 新增 `src/data/manual/categorySchema.json`。
- 用统一 schema 替代原来的 `mappingData.json` 与 `stackData.json`。
- 分类项现在在同一处维护 `label` 与 `group`，生成脚本再输出 UI 需要的 `tags.json`、`techs.json`、`types.json`。

### 3. 重构项目数据生成脚本

- `scripts/generateProjects.cjs` 现在只写入 `src/data/generated/`。
- 增加 `gallery` / `media` front matter 兼容逻辑，后续可以逐步声明图片用途，而不必依赖文件名顺序。
- 增加 `generate:projects` npm script，便于后续手动刷新生成数据。

### 4. 收拢前端数据访问层

- 扩展 `src/utils/projectData.ts`，集中提供：
  - 项目索引与 `code` 查询。
  - 上一个 / 下一个项目查询。
  - 筛选参数解析与项目筛选纯函数。
  - tag / tech / type 显示名映射。
  - CDN 图片 URL 标准化。
  - 首页 Gallery 配置合并。
- `ProjectPage` 不再直接 import 多个 JSON，也不再在组件内递归查找分类映射。
- `FilterPage` 不再在组件内手写筛选逻辑，改为调用纯函数。
- `Filter` 统一从 `filterOptions` 获取筛选器配置。
- `Footer` 改为通过 `getProjectByCode` 查询项目标题，并统一使用 `toImageUrl`。

## 验证

- 已运行 `node scripts/generateProjects.cjs`，生成数据成功。
- 已运行 `tsc -b`，类型检查通过。
- 已运行 `vite build`，生产构建通过。

## 已知提示

- 生成脚本提示 `029` 项目没有 `details` 目录；当前项目仍可使用 `thumbnail`、`poster`、`banner` 兜底。
- Vite 构建保留既有警告：Browserslist 数据较旧、部分依赖含 `eval`、主 chunk 超过 500 kB。
