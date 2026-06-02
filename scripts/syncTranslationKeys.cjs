const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(process.cwd(), "src/locales");
const PROJECTS_METADATA_PATH = path.join(
  process.cwd(),
  "src/data/generated/projectsMetadata.json"
);
const MARKDOWN_DIR = path.join(process.cwd(), "public/assets/markdown");
const CATEGORY_SCHEMA_PATH = path.join(
  process.cwd(),
  "src/data/manual/categorySchema.json"
);

const uiKeySources = {
  "ui.actions.apply": "应用",
  "ui.actions.clear": "清空",
  "ui.actions.selectAll": "全选",
  "ui.filters.title": "过滤器",
  "ui.filters.years": "年份",
  "ui.filters.types": "类型",
  "ui.filters.tags": "标签",
  "ui.filters.techs": "技术栈",
  "ui.filters.selectedPrefix": "已选择：",
  "ui.nav.home": "主页",
  "ui.nav.description": "简介",
  "ui.nav.works": "作品",
  "ui.nav.about": "关于",
  "ui.nav.language": "语言",
  "ui.projects.noMatches": "没有匹配的项目",
  "ui.projects.notFound": "项目不存在",
  "ui.projects.noPrevious": "前面没有啦",
  "ui.projects.noNext": "后面没有啦",
  "ui.projects.previous": "上一个",
  "ui.projects.next": "下一个",
  "ui.projects.link": "项目链接",
  "ui.projects.type": "类型",
  "ui.projects.suffix": "项目",
  "ui.media.poster": "海报",
  "ui.media.thumbnail": "缩略图",
  "ui.media.projectImage": "项目图片",
  "ui.footer.developer": "开发者",
  "ui.footer.duotone": "双色",
  "ui.footer.image": "图片",
  "ui.footer.latestProjects": "最新项目",
  "ui.footer.relatedLinks": "相关链接",
  "ui.footer.slogan": "一个生活的容器，一个回答的回答。",
  "ui.footer.groups.build": "构建",
  "ui.footer.groups.rendering": "渲染",
  "ui.footer.groups.accessibility": "无障碍",
  "ui.footer.groups.interaction": "交互",
  "ui.footer.groups.design": "设计",
  "ui.footer.groups.assistance": "协助",
  "ui.footer.groups.hosting": "托管",
  "ui.footer.groups.service": "服务",
  "ui.about.site.title": "关于本站",
  "ui.about.site.body.1":
    "这是一次对旧的作品集网站的翻新，我尝试了新的框架——React+TS+Vite+Tailwind，代替旧作品集的Vue+Vite+JS。整个网页的构建体验感受是tailwind确实帮我节省了很多想千奇百怪的类名的时间。",
  "ui.about.site.body.2":
    "其他主要用到的库和服务在Footer中已经全部列出。GSAP和Lenis对我的编程水平要求过高了，因此在性能优化方面可能并不能做到极致。项目中的大量图片、PDF文件、视频等我也找了一些新的方法托管，注册了Cloudflare用以加速。",
  "ui.about.site.body.3":
    "无障碍和通用设计方面，tailwind非常方便地提供了断点和深色模式伪类，在编写宽度变化的响应式设计时帮助很大。国际化则沿用上个网页使用的i18next，但使用了i18next-scanner插件相当程度上提高了翻译的效率。",
  "ui.about.developer.title": "关于开发者",
  "ui.about.developer.body.1":
    "你可以叫我布洛芬。本网站中所有文本和媒体素材权利均归属于开发者。",
  "ui.about.developer.body.2":
    "本科毕业于浙江大学园林专业。平面设计爱好者，独立游戏玩家，书影音轻度用户。",
  "ui.about.developer.body.3":
    "我不是专业前端开发人员，学习前端和网页交互纯粹是出于个人兴趣，因此代码优化能力有限。如果你遇到了一些卡顿问题，我大概无能为力。",
  "languages.zh": "汉语",
  "languages.zh-CN": "简体中文",
  "languages.zh-TW": "繁体中文",
  "languages.en": "英语",
  "languages.en-US": "英语（美国）",
};

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const getNested = (target, dottedKey) => {
  return dottedKey.split(".").reduce((current, part) => {
    if (!current || typeof current !== "object") return undefined;
    return current[part];
  }, target);
};

const setNested = (target, dottedKey, value) => {
  const parts = dottedKey.split(".");
  const last = parts.pop();
  let current = target;

  parts.forEach((part) => {
    if (!current[part] || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part];
  });

  current[last] = value;
};

const pruneMarkdownKeys = (localeData, keySources) => {
  const expectedKeys = new Set(
    Object.keys(keySources).filter((key) => key.startsWith("markdown."))
  );

  const pruneNode = (node, pathParts) => {
    if (!node || typeof node !== "object") return false;

    Object.keys(node).forEach((key) => {
      const childPath = [...pathParts, key];
      const child = node[key];

      if (child && typeof child === "object") {
        const hasChildren = pruneNode(child, childPath);
        if (!hasChildren) delete node[key];
        return;
      }

      if (!expectedKeys.has(childPath.join("."))) {
        delete node[key];
      }
    });

    return Object.keys(node).length > 0;
  };

  pruneNode(localeData.markdown, ["markdown"]);
};

const getTranslatedValue = (localeData, semanticKey, sourceValue) => {
  const existingSemanticValue = getNested(localeData, semanticKey);
  if (
    typeof existingSemanticValue === "string" &&
    existingSemanticValue.trim()
  ) {
    return existingSemanticValue;
  }

  if (
    sourceValue &&
    Object.prototype.hasOwnProperty.call(localeData, sourceValue)
  ) {
    const legacyValue = localeData[sourceValue];
    if (typeof legacyValue === "string" && legacyValue.trim()) {
      return legacyValue;
    }
  }

  return sourceValue;
};

const buildProjectKeySources = (projects) => {
  return Object.fromEntries(
    projects.flatMap((project) => [
      [`projects.${project.code}.title`, project.title],
      [`projects.${project.code}.description`, project.description],
    ])
  );
};

const buildTaxonomyKeySources = (schema) => {
  const keySources = {};

  Object.entries(schema.types || {}).forEach(([parameter, entry]) => {
    keySources[`taxonomy.types.${parameter}`] = entry.label;
  });

  Object.entries(schema.tags || {}).forEach(([parameter, entry]) => {
    keySources[`taxonomy.tags.${parameter}`] = entry.label;
  });

  Object.entries(schema.techs || {}).forEach(([parameter, entry]) => {
    keySources[`taxonomy.techs.${parameter}`] = entry.label;
  });

  Object.entries(schema.groups?.tags || {}).forEach(([parameter, label]) => {
    keySources[`taxonomy.groups.tags.${parameter}`] = label;
  });

  Object.entries(schema.groups?.techs || {}).forEach(([parameter, label]) => {
    keySources[`taxonomy.groups.techs.${parameter}`] = label;
  });

  return keySources;
};

const padMarkdownIndex = (index) => String(index + 1).padStart(3, "0");

const setKeySource = (keySources, key, value) => {
  const source = String(value || "").trim();
  if (!source) return;

  keySources[key] = source;
};

const buildMarkdownKeySources = () => {
  const keySources = {};

  if (!fs.existsSync(MARKDOWN_DIR)) return keySources;

  fs.readdirSync(MARKDOWN_DIR)
    .filter((file) => path.extname(file).toLowerCase() === ".md")
    .sort((a, b) => a.localeCompare(b, "en"))
    .forEach((file) => {
      const code = path.parse(file).name;
      const content = fs.readFileSync(path.join(MARKDOWN_DIR, file), "utf8");
      const body = content.replace(/^\uFEFF?---[\s\S]*?---\s*/, "");
      let translatableIndex = 0;

      body.split(/\r?\n/).forEach((line) => {
        const source = line.trim();
        if (!source) return;

        const keyPrefix = `markdown.${code}.${padMarkdownIndex(
          translatableIndex
        )}`;
        translatableIndex += 1;

        const imageMatch = /^!\[(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
        if (imageMatch) {
          setKeySource(keySources, `${keyPrefix}.alt`, imageMatch[1]);
          setKeySource(
            keySources,
            `${keyPrefix}.description`,
            imageMatch[2]
          );
          return;
        }

        const pdfMatch = /^\[pdf:(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
        if (pdfMatch) {
          setKeySource(keySources, `${keyPrefix}.description`, pdfMatch[1]);
          return;
        }

        const audioMatch = /^\[audio:(.*?)\{(.*?)\}\]\((.*?)\{(.*?)\}\)$/.exec(
          source
        );
        if (audioMatch) {
          setKeySource(keySources, `${keyPrefix}.name`, audioMatch[1]);
          setKeySource(
            keySources,
            `${keyPrefix}.description`,
            audioMatch[2]
          );
          return;
        }

        const websiteMatch = /^\[website:(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(
          source
        );
        if (websiteMatch) {
          setKeySource(keySources, `${keyPrefix}.title`, websiteMatch[1]);
          setKeySource(
            keySources,
            `${keyPrefix}.description`,
            websiteMatch[2]
          );
          return;
        }

        const videoMatch = /^\[video:(.*?)\]\((.*?)\)$/.exec(source);
        if (videoMatch) {
          setKeySource(keySources, `${keyPrefix}.description`, videoMatch[1]);
          return;
        }

        setKeySource(keySources, `${keyPrefix}.text`, source);
      });
    });

  return keySources;
};

const buildSemanticKeySources = (projects, categorySchema) => {
  return {
    ...uiKeySources,
    ...buildProjectKeySources(projects),
    ...buildMarkdownKeySources(),
    ...buildTaxonomyKeySources(categorySchema),
  };
};

const syncLocaleFile = (localeFilePath, keySources) => {
  const localeData = readJson(localeFilePath);

  Object.entries(keySources).forEach(([semanticKey, sourceValue]) => {
    setNested(
      localeData,
      semanticKey,
      getTranslatedValue(localeData, semanticKey, sourceValue)
    );
  });

  pruneMarkdownKeys(localeData, keySources);

  writeJson(localeFilePath, localeData);
};

const main = () => {
  const projects = readJson(PROJECTS_METADATA_PATH);
  const categorySchema = readJson(CATEGORY_SCHEMA_PATH);
  const keySources = buildSemanticKeySources(projects, categorySchema);

  fs.readdirSync(LOCALES_DIR)
    .filter((entry) =>
      fs.existsSync(path.join(LOCALES_DIR, entry, "translation.json"))
    )
    .forEach((locale) => {
      const localeFilePath = path.join(LOCALES_DIR, locale, "translation.json");
      syncLocaleFile(localeFilePath, keySources);
      console.log(`Synced semantic keys for ${locale}`);
    });
};

if (require.main === module) {
  main();
}

module.exports = {
  buildProjectKeySources,
  buildMarkdownKeySources,
  buildSemanticKeySources,
  buildTaxonomyKeySources,
  getNested,
  uiKeySources,
};
