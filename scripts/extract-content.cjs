const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const {
  buildSemanticKeySources,
  buildMarkdownKeySources,
  uiKeySources,
} = require("./syncTranslationKeys.cjs");

const LOCALES_DIR = path.join(process.cwd(), "src/locales");
const MARKDOWN_DIR = path.join(process.cwd(), "public/assets/markdown");
const CATEGORY_SCHEMA_PATH = path.join(
  process.cwd(),
  "src/data/manual/categorySchema.json"
);
const PROJECTS_METADATA_PATH = path.join(
  process.cwd(),
  "src/data/generated/projectsMetadata.json"
);
const REPORT_PATH = path.join(__dirname, "extracted-content-report.json");

const chineseRegex = /[\u4e00-\u9fa5]/;

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const getNested = (target, dottedKey) => {
  return dottedKey.split(".").reduce((current, part) => {
    if (!current || typeof current !== "object") return undefined;
    return current[part];
  }, target);
};

const normalizeText = (value) => {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
};

const hasChinese = (value) => chineseRegex.test(value);

const pushTextItem = (items, item) => {
  const text = normalizeText(item.source);
  if (!text || !hasChinese(text)) return;

  items.push({
    ...item,
    source: text,
  });
};

const extractMarkdownBodyItems = (code, filePath, bodyContent) => {
  const items = [];
  let translatableIndex = 0;

  bodyContent.split(/\r?\n/).forEach((line) => {
    const source = line.trim();
    if (!source) return;

    const keyPrefix = `markdown.${code}.${String(
      translatableIndex + 1
    ).padStart(3, "0")}`;
    const relativeFile = path.relative(process.cwd(), filePath);
    translatableIndex += 1;

    const pushMarkdownItem = (keySuffix, value, type) => {
      pushTextItem(items, {
        file: relativeFile,
        key: `${keyPrefix}.${keySuffix}`,
        source: value,
        type,
      });
    };

    const imageMatch = /^!\[(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
    if (imageMatch) {
      pushMarkdownItem("alt", imageMatch[1], "markdownImageAlt");
      pushMarkdownItem(
        "description",
        imageMatch[2],
        "markdownImageDescription"
      );
      return;
    }

    const pdfMatch = /^\[pdf:(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
    if (pdfMatch) {
      pushMarkdownItem("description", pdfMatch[1], "markdownPdfDescription");
      return;
    }

    const audioMatch = /^\[audio:(.*?)\{(.*?)\}\]\((.*?)\{(.*?)\}\)$/.exec(
      source
    );
    if (audioMatch) {
      pushMarkdownItem("name", audioMatch[1], "markdownAudioName");
      pushMarkdownItem(
        "description",
        audioMatch[2],
        "markdownAudioDescription"
      );
      return;
    }

    const websiteMatch = /^\[website:(.*?)\{(.*?)\}\]\((.*?)\)$/.exec(source);
    if (websiteMatch) {
      pushMarkdownItem("title", websiteMatch[1], "markdownWebsiteTitle");
      pushMarkdownItem(
        "description",
        websiteMatch[2],
        "markdownWebsiteDescription"
      );
      return;
    }

    const videoMatch = /^\[video:(.*?)\]\((.*?)\)$/.exec(source);
    if (videoMatch) {
      pushMarkdownItem("description", videoMatch[1], "markdownVideoDescription");
      return;
    }

    pushMarkdownItem("text", source, "markdownBody");
  });

  return items;
};

const extractProjectFrontMatterItems = () => {
  return fs
    .readdirSync(MARKDOWN_DIR)
    .filter((file) => path.extname(file).toLowerCase() === ".md")
    .sort((a, b) => a.localeCompare(b, "en"))
    .flatMap((file) => {
      const code = path.parse(file).name;
      const filePath = path.join(MARKDOWN_DIR, file);
      const { data, content } = matter(
        fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
      );
      const items = [];

      pushTextItem(items, {
        file: path.relative(process.cwd(), filePath),
        key: `projects.${code}.title`,
        source: data.title,
        type: "projectTitle",
      });
      pushTextItem(items, {
        file: path.relative(process.cwd(), filePath),
        key: `projects.${code}.description`,
        source: data.description,
        type: "projectDescription",
      });

      return [...items, ...extractMarkdownBodyItems(code, filePath, content)];
    });
};

const extractTaxonomyItems = () => {
  const schema = readJson(CATEGORY_SCHEMA_PATH);
  const items = [];

  Object.entries(schema.types || {}).forEach(([parameter, entry]) => {
    pushTextItem(items, {
      file: path.relative(process.cwd(), CATEGORY_SCHEMA_PATH),
      key: `taxonomy.types.${parameter}`,
      source: entry.label,
      type: "taxonomyType",
    });
  });

  Object.entries(schema.tags || {}).forEach(([parameter, entry]) => {
    pushTextItem(items, {
      file: path.relative(process.cwd(), CATEGORY_SCHEMA_PATH),
      key: `taxonomy.tags.${parameter}`,
      source: entry.label,
      type: "taxonomyTag",
    });
  });

  Object.entries(schema.techs || {}).forEach(([parameter, entry]) => {
    pushTextItem(items, {
      file: path.relative(process.cwd(), CATEGORY_SCHEMA_PATH),
      key: `taxonomy.techs.${parameter}`,
      source: entry.label,
      type: "taxonomyTech",
    });
  });

  Object.entries(schema.groups?.tags || {}).forEach(([parameter, label]) => {
    pushTextItem(items, {
      file: path.relative(process.cwd(), CATEGORY_SCHEMA_PATH),
      key: `taxonomy.groups.tags.${parameter}`,
      source: label,
      type: "taxonomyTagGroup",
    });
  });

  Object.entries(schema.groups?.techs || {}).forEach(([parameter, label]) => {
    pushTextItem(items, {
      file: path.relative(process.cwd(), CATEGORY_SCHEMA_PATH),
      key: `taxonomy.groups.techs.${parameter}`,
      source: label,
      type: "taxonomyTechGroup",
    });
  });

  return items;
};

const extractUiItems = () => {
  return Object.entries(uiKeySources).flatMap(([key, source]) => {
    const items = [];

    pushTextItem(items, {
      file: path.relative(process.cwd(), __filename),
      key,
      source,
      type: "uiText",
    });

    return items;
  });
};

const buildExpectedSemanticKeys = () => {
  const projects = readJson(PROJECTS_METADATA_PATH);
  const categorySchema = readJson(CATEGORY_SCHEMA_PATH);

  return Object.keys({
    ...buildSemanticKeySources(projects, categorySchema),
    ...buildMarkdownKeySources(),
  });
};

const getLocaleFiles = () => {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((entry) =>
      fs.existsSync(path.join(LOCALES_DIR, entry, "translation.json"))
    )
    .map((locale) => ({
      locale,
      path: path.join(LOCALES_DIR, locale, "translation.json"),
    }));
};

const getMissingTranslations = (expectedKeys) => {
  return Object.fromEntries(
    getLocaleFiles().map(({ locale, path: localePath }) => {
      const localeData = readJson(localePath);
      const missing = expectedKeys.filter((key) => {
        const value = getNested(localeData, key);
        return typeof value !== "string" || !value.trim();
      });

      return [locale, missing];
    })
  );
};

const dedupeItems = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const signature = `${item.key}::${item.source}`;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
};

const main = () => {
  const items = dedupeItems([
    ...extractUiItems(),
    ...extractProjectFrontMatterItems(),
    ...extractTaxonomyItems(),
  ]);
  const expectedSemanticKeys = buildExpectedSemanticKeys();
  const missingTranslations = getMissingTranslations(expectedSemanticKeys);
  const missingTranslationCount = Object.values(missingTranslations).reduce(
    (total, missing) => total + missing.length,
    0
  );

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      items: items.length,
      expectedSemanticKeys: expectedSemanticKeys.length,
      missingTranslations: missingTranslationCount,
    },
    missingTranslations,
    items,
  };

  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Extracted content report written to ${REPORT_PATH}`);

  if (
    process.argv.includes("--fail-on-missing") &&
    missingTranslationCount > 0
  ) {
    console.error(`Missing translations: ${missingTranslationCount}`);
    process.exitCode = 1;
  }
};

main();
