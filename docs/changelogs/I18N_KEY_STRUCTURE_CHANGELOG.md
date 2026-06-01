# 翻译键值化更新日志

日期：2026-05-29

## 本次目标

推进 `docs/project-data-architecture.md` 中关于“翻译 key 直接使用原文”和“翻译抽取脚本偏正则”的后续优化，让项目、分类和稳定 UI 文案逐步使用语义化 key。

## 已完成

### 1. 项目内容使用结构化 key

- 项目标题使用 `projects.{code}.title`。
- 项目描述使用 `projects.{code}.description`。
- 首页 Gallery、筛选结果页、项目详情页、Footer 精选项目区域均改为通过 `getProjectTitleKey` / `getProjectDescriptionKey` 读取结构化 key。
- 保留 `defaultValue`，在 locale 缺失时仍能回退到生成数据中的源文案。

### 2. 分类文案使用 taxonomy key

- `tags.json` / `techs.json` / `types.json` 的生成结果现在输出 `taxonomy.*` key，而不是中文 label。
- 分类组使用稳定 group key，例如：
  - `taxonomy.groups.tags.visualCommunication`
  - `taxonomy.groups.techs.graphicsTypography`
- 项目详情页的类型、标签、技术栈展示改为消费 taxonomy translation key。

### 3. UI 文案语义化

- 稳定 UI 文案集中到 `syncTranslationKeys.cjs` 的 `uiKeySources`。
- 导航、筛选器、项目状态、Footer、About 页面等已迁移到 `ui.*`、`languages.*` 等语义 key。

### 4. 翻译同步和检查自动化

- `scripts/syncTranslationKeys.cjs` 现在导出统一 key source，供其他脚本复用。
- 空字符串不再被视为有效翻译；同步时会回退到 legacy key 或源文案。
- `scripts/extract-content.cjs` 现在检查 UI、项目、分类三类结构化 key。
- 新增 `check:i18n`，可在缺失翻译时返回非零退出码。
- 新增 `refresh:i18n`，串联项目数据生成、翻译 key 同步、翻译报告生成。

## 验证

- 已运行 `sync:i18n`，同步 `en-US`、`zh-CN`、`zh-TW` 语义 key。
- 已运行 `check:i18n`，缺失翻译数为 0。
- 报告输出到 `scripts/extracted-content-report.json`。

## 仍可继续优化

- Markdown 正文目前仍作为报告项输出，尚未接入运行时正文级翻译。
- Footer 中第三方服务名称和社交平台名称仍沿用少量 legacy key，可在下一轮逐步迁移到 `links.*` / `tools.*`。
