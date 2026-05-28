# 项目数据结构与维护流程审查

日期：2026-05-28

## 当前结构

### 项目内容

项目正文存放在 `public/assets/markdown/*.md`。每个 Markdown 文件通过 front matter 提供基础元数据，例如：

- `title`
- `description`
- `date`
- `type`
- `tags`
- `tech`
- `link`

正文中的图片、PDF、视频、音频等内容通过 MarkdownRenderer 自定义语法解析。

### 项目图片

图片按项目编号存放在 Cloudflare/CDN 对应的 `/projects/{code}/...` 结构中，生成后的前端数据引用相对路径：

- `/projects/{code}/poster.webp`
- `/projects/{code}/thumbnail.webp`
- `/projects/{code}/banner.webp`
- `/projects/{code}/details/{number}.webp`

`scripts/generateProjects.cjs` 会扫描 `public/assets/projects/{code}/details`，按文件名数字顺序生成 `details` 数组。

### 元数据 JSON

`scripts/generateProjects.cjs` 从 Markdown front matter 和图片目录生成以下文件：

- `src/data/projectsMetadata.json`：完整项目列表。
- `src/data/recentProjects.json`：按日期取最新 8 个项目，旧主页直接使用它。
- `src/data/tags.json`：从项目 tags 聚合、去重、按 `stackData` 分组。
- `src/data/techs.json`：从项目 tech 聚合、去重、按 `stackData` 分组。
- `src/data/types.json`：从项目 type 聚合、去重。
- `src/data/years.json`：从项目 date 聚合、去重。

### 翻译文本

翻译文件存放在：

- `src/locales/zh-CN/translation.json`
- `src/locales/zh-TW/translation.json`
- `src/locales/en-US/translation.json`

`scripts/extract-content.cjs` 会扫描 `src` 和 `public` 中的 JSON/Markdown，抽取中文文本并写入 `scripts/extracted-content.js`，以注释形式提供给 i18next-scanner 或人工整理。

## 本次完成的结构调整

### 首页项目选择独立配置化

新增 `src/data/homeFeaturedProjects.json`。

主页不再直接使用 `recentProjects.json`，而是读取这个手动维护的精选配置。每一项支持：

- `code`：项目编号，对应 `projectsMetadata.json` 中的项目。
- `previewImage`：右侧大预览图的初始图片。
- `images`：主页左侧滚动图列展示的图片列表。

示例：

```json
{
  "code": "028",
  "previewImage": "/projects/028/details/1.webp",
  "images": [
    "/projects/028/details/1.webp",
    "/projects/028/details/3.webp"
  ]
}
```

这样新增或调整首页展示时，只需要编辑 `homeFeaturedProjects.json`，不再受“最新 8 个项目”和“details 前 6 张”的硬编码限制。

### 项目数据整理函数集中化

新增 `src/utils/projectData.ts`。

职责：

- 建立 `projectsMetadata` 的 code 索引。
- 将 `homeFeaturedProjects.json` 合并为 Gallery 可直接消费的数据。
- 提供 CDN URL 标准化函数 `toImageUrl`。
- 提供项目兜底图片选择函数 `getProjectFallbackImages`。
- 提供首页预览图与日期格式化函数。

这样 Gallery 不再关心“项目从哪个 JSON 来、图片如何兜底、CDN URL 如何拼接”。

### 首页组件解耦

新增：

- `src/components/home/DateTicker.tsx`
- `src/components/home/GalleryThumb.tsx`
- `src/components/home/ProjectRow.tsx`

`src/components/Gallery.tsx` 现在主要负责：

- 主页 Gallery 布局。
- ScrollTrigger 生命周期。
- active project / preview image / DateTicker 状态协调。
- 项目名称点击滚动。

日期动画、缩略图加载、项目行渲染被拆成独立高内聚组件。

## 仍然存在的问题

### 1. 生成脚本和源数据边界不清

目前 `generateProjects.cjs` 会生成多个前端 JSON，但 Markdown front matter 才是真正的项目元数据源。生成物被提交后，源数据和生成数据会同时存在，容易出现“忘记跑脚本”或“脚本覆盖手工改动”的问题。

建议：

- 将 `src/data/generated/*` 作为生成目录，明确区分生成物。
- 将手工配置放入 `src/data/manual/*`，例如 `homeFeaturedProjects.json`。
- 让脚本只覆盖 `generated`，不触碰手工配置。

### 2. 图片选择过度依赖文件名顺序

旧首页从 `details.slice(0, 6)` 取图，这对作品叙事不够友好。现在首页已改为 `homeFeaturedProjects.json` 手动选择，但项目页和图集仍可继续优化。

建议：

- 在 Markdown front matter 增加 `media` 或 `gallery` 字段，用于声明图片用途：
  - `role: hero`
  - `role: homepage`
  - `role: detail`
  - `role: thumbnail`
- 让脚本根据这些声明生成不同视图所需的图片列表。

### 3. 翻译 key 直接使用原文，后期维护成本高

当前翻译 key 大量使用中文原文。这对早期开发很快，但当原文修改时，key 也会改变，导致翻译关系断裂和重复 key 增加。

建议：

- 对稳定 UI 文案使用语义 key，例如 `nav.home`、`project.notFound`。
- 对项目标题/描述使用结构化 key，例如：
  - `projects.028.title`
  - `projects.028.description`
- 保留原文抽取脚本作为迁移辅助，而不是作为最终 key 体系。

### 4. 翻译抽取脚本偏正则，误提取和漏提取风险较高

`extract-content.cjs` 通过正则扫描 JSON 和 Markdown。它能快速工作，但不理解 AST，也不知道哪些字段应该翻译、哪些路径/代码不该翻译。

建议：

- 对 Markdown 使用 `gray-matter` + Markdown AST。
- 对 JSON 使用结构化遍历，只抽取白名单字段，例如 `title`、`description`、正文文本。
- 输出缺失翻译报告，而不是注释形式的 `extracted-content.js`。

### 5. 分类映射可以更 schema 化

`mappingData.json` 和 `stackData.json` 现在拆分存放。含义清晰，但新增 tag/tech 时需要同时维护 mapping 与 stack，容易漏。

建议：

- 合并为一个 schema，例如：

```json
{
  "tags": {
    "concept": {
      "label": "概念策划",
      "group": "design"
    }
  }
}
```

然后由脚本生成 UI 需要的 `tags.json` / `techs.json`。

## 推荐的新项目添加流程

短期可执行流程：

1. 新增 `public/assets/markdown/{code}.md`，在 front matter 填写项目基础信息。
2. 放入图片：
   - `poster.webp`
   - `thumbnail.webp`
   - `banner.webp`
   - `details/*.webp`
3. 运行图片转换脚本和项目数据生成脚本。
4. 如需首页展示，编辑 `src/data/homeFeaturedProjects.json`，手动选择项目和首页图片。
5. 运行类型检查与构建。

中长期理想流程：

1. 只维护一个项目 manifest 或 Markdown front matter。
2. 在 manifest/front matter 中声明所有媒体角色和首页展示策略。
3. 运行一个统一脚本：
   - 校验 schema。
   - 生成项目索引。
   - 生成 filter 数据。
   - 生成翻译 key 模板。
   - 检查缺失图片和缺失翻译。
4. 首页、筛选页、项目页全部消费统一数据访问层，而不是直接 import 多个 JSON。

## 解耦方向

已完成：

- Gallery 不再直接依赖 `recentProjects.json`。
- 首页图片选择不再硬编码为 `details.slice(0, 6)`。
- 数据合并逻辑移动到 `projectData.ts`。
- DateTicker、ProjectRow、GalleryThumb 从 Gallery 中拆出。

后续建议：

- 将 Lenis 初始化进一步迁移到所有页面共用的 hook。
- 将 ProjectPage 中的 prev/next 逻辑移动到 `projectData.ts`。
- 将 FilterPage 中的筛选逻辑移动到纯函数，便于单元测试。
- 将 CDN 拼接统一替换为 `toImageUrl`，避免各页面重复字符串拼接。
