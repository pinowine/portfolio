# 翻译自动化指南

日期：2026-05-29

## 目标

翻译维护以语义 key 为主，源文案只作为 fallback 和同步来源。

主要 key 结构：

- `ui.*`：稳定界面文案。
- `languages.*`：语言选择器文案。
- `projects.{code}.title`：项目标题。
- `projects.{code}.description`：项目描述。
- `taxonomy.types.*`：项目类型。
- `taxonomy.tags.*`：项目标签。
- `taxonomy.techs.*`：技术栈。
- `taxonomy.groups.tags.*` / `taxonomy.groups.techs.*`：筛选分组。

## 常用命令

```bash
npm run generate:projects
npm run sync:i18n
npm run check:i18n
```

或一次性刷新：

```bash
npm run refresh:i18n
```

## 新增项目后的流程

1. 新增或修改 `public/assets/markdown/{code}.md` 的 front matter。
2. 如有新增分类，先更新 `src/data/manual/categorySchema.json`。
3. 运行：

```bash
npm run refresh:i18n
```

4. 打开 `src/locales/{locale}/translation.json`，翻译新增或回填为源文案的值。
5. 运行：

```bash
npm run check:i18n
npm run build
```

## 新增 UI 文案后的流程

1. 在组件中使用语义 key，例如：

```tsx
t("ui.projects.notFound")
```

2. 在 `scripts/syncTranslationKeys.cjs` 的 `uiKeySources` 中补充该 key 的源文案。
3. 运行：

```bash
npm run sync:i18n
npm run check:i18n
```

4. 翻译 locale 中新生成的值。

## 新增分类后的流程

1. 在 `src/data/manual/categorySchema.json` 中新增分类参数、`label` 和 `group`。
2. 如新增分组，先在 `groups.tags` 或 `groups.techs` 中定义稳定 group key。
3. 运行：

```bash
npm run generate:projects
npm run sync:i18n
npm run check:i18n
```

4. 前端筛选器会从 `src/data/generated/tags.json`、`techs.json`、`types.json` 自动获得 `taxonomy.*` key。

## 报告位置

`npm run check:i18n` 会生成：

```text
scripts/extracted-content-report.json
```

重点查看：

- `totals.missingTranslations`
- `missingTranslations.en-US`
- `missingTranslations.zh-CN`
- `missingTranslations.zh-TW`

当 `missingTranslations` 大于 0 时，`check:i18n` 会失败，适合接入 CI。
