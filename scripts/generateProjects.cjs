const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const categorySchema = require("../src/data/manual/categorySchema.json");

const GENERATED_DATA_DIR = path.join(process.cwd(), "src/data/generated");
const MARKDOWN_DIR = path.join(process.cwd(), "public/assets/markdown");
const PROJECTS_ASSETS_DIR = path.join(process.cwd(), "public/assets/projects");
const IMAGE_EXTENSION_PRIORITY = [".gif", ".webp", ".png", ".jpg", ".jpeg"];
const IMAGE_EXTENSIONS = new Set(IMAGE_EXTENSION_PRIORITY);
const ORIGINAL_IMAGE_EXTENSION_PRIORITY = [".png", ".jpg", ".jpeg", ".gif"];
const ORIGINAL_IMAGE_EXTENSIONS = new Set(ORIGINAL_IMAGE_EXTENSION_PRIORITY);

const getSchemaEntry = (section, parameter) => {
  return categorySchema[section]?.[parameter];
};

const getLabel = (section, parameter) => {
  return getSchemaEntry(section, parameter)?.label || parameter;
};

const getTaxonomyItemKey = (section, parameter) => {
  return `taxonomy.${section}.${parameter}`;
};

const getTaxonomyGroupKey = (section, parameter) => {
  return `taxonomy.groups.${section}.${parameter}`;
};

const uniqueTruthy = (items) => [...new Set(items.filter(Boolean))];

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const normalizeProjectPath = (projectCode, value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("/") || value.startsWith("http")) return value;
  return `/projects/${projectCode}/${value}`;
};

const normalizeMediaItem = (projectCode, item) => {
  if (typeof item === "string") {
    return { src: normalizeProjectPath(projectCode, item) };
  }

  if (!item || typeof item !== "object") return null;

  const src = normalizeProjectPath(projectCode, item.src || item.url || "");
  if (!src) return null;

  return {
    ...item,
    src,
  };
};

const normalizeMedia = (projectCode, media) => {
  return toArray(media)
    .map((item) => normalizeMediaItem(projectCode, item))
    .filter(Boolean);
};

const getPreferredImageFile = (files, baseName) => {
  const candidates = files.filter((file) => path.parse(file).name === baseName);

  return IMAGE_EXTENSION_PRIORITY.flatMap((extension) =>
    candidates.filter((file) => path.extname(file).toLowerCase() === extension)
  )[0];
};

const getOriginalImageFile = (files, baseName) => {
  const candidates = files.filter((file) => path.parse(file).name === baseName);

  return ORIGINAL_IMAGE_EXTENSION_PRIORITY.flatMap((extension) =>
    candidates.filter((file) => path.extname(file).toLowerCase() === extension)
  )[0];
};

const toProjectAssetPath = (filePath) => {
  return `/projects/${path
    .relative(PROJECTS_ASSETS_DIR, filePath)
    .replace(/\\/g, "/")}`;
};

const collectOriginalImagePaths = (folderPath, originalImagePaths) => {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const webpFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".webp"
  );
  const originalFiles = files.filter((file) =>
    ORIGINAL_IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())
  );

  webpFiles.forEach((webpFile) => {
    const originalFile = getOriginalImageFile(
      originalFiles,
      path.parse(webpFile).name
    );

    if (!originalFile) return;

    originalImagePaths[toProjectAssetPath(path.join(folderPath, webpFile))] =
      toProjectAssetPath(path.join(folderPath, originalFile));
  });

  entries
    .filter((entry) => entry.isDirectory())
    .forEach((entry) =>
      collectOriginalImagePaths(path.join(folderPath, entry.name), originalImagePaths)
    );
};

const generateOriginalImagePaths = () => {
  if (!fs.existsSync(PROJECTS_ASSETS_DIR)) return {};

  const originalImagePaths = {};
  collectOriginalImagePaths(PROJECTS_ASSETS_DIR, originalImagePaths);

  return Object.fromEntries(
    Object.entries(originalImagePaths).sort(([pathA], [pathB]) =>
      pathA.localeCompare(pathB, "en", { numeric: true })
    )
  );
};

const getProjectAssetPath = (projectCode, baseName) => {
  const projectFolderPath = path.join(PROJECTS_ASSETS_DIR, projectCode);

  if (!fs.existsSync(projectFolderPath)) return "";

  const files = fs
    .readdirSync(projectFolderPath)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const file = getPreferredImageFile(files, baseName);

  return file ? `/projects/${projectCode}/${file}` : "";
};

const getDetailImages = (projectCode) => {
  const detailsFolderPath = path.join(
    PROJECTS_ASSETS_DIR,
    projectCode,
    "details"
  );

  if (!fs.existsSync(detailsFolderPath)) {
    console.warn(`Details folder does not exist for project code: ${projectCode}`);
    return [];
  }

  const files = fs
    .readdirSync(detailsFolderPath)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const preferredFiles = [
    ...new Set(files.map((file) => path.parse(file).name)),
  ].flatMap((baseName) => getPreferredImageFile(files, baseName) || []);

  return preferredFiles
    .sort((a, b) => {
      const numA = parseInt(path.parse(a).name, 10);
      const numB = parseInt(path.parse(b).name, 10);
      if (Number.isNaN(numA) || Number.isNaN(numB)) {
        return a.localeCompare(b, "en", { numeric: true });
      }
      return numA - numB;
    })
    .map((file) => `/projects/${projectCode}/details/${file}`);
};

const parseDate = (dateStr) => {
  const longTermMatch = /^(\d{4})至今$/.exec(dateStr);
  if (longTermMatch) {
    return {
      date: new Date(Number(longTermMatch[1]), 0, 1),
      month: "长期",
      type: "long-term",
      year: Number(longTermMatch[1]),
    };
  }

  const date = new Date(dateStr);
  if (!Number.isNaN(date.getTime())) {
    return {
      date,
      month: date.getMonth() + 1,
      type: "specific",
      year: date.getUTCFullYear(),
    };
  }

  return {
    date: null,
    month: "长期",
    type: "unknown",
    year: "长期",
  };
};

const createSelectorItem = (section, parameter) => ({
  parameter,
  name: getTaxonomyItemKey(section, parameter),
});

const createFlatSelectorData = (section, parameters) => {
  return uniqueTruthy(parameters).map((parameter) =>
    createSelectorItem(section, parameter)
  );
};

const createGroupedSelectorData = (section, parameters) => {
  const uniqueParameters = uniqueTruthy(parameters);
  const usedParameters = new Set(uniqueParameters);
  const schemaParameters = Object.keys(categorySchema[section] || {}).filter(
    (parameter) => usedParameters.has(parameter)
  );
  const unknownParameters = uniqueParameters.filter(
    (parameter) => !getSchemaEntry(section, parameter)
  );
  const byGroup = new Map();

  [...schemaParameters, ...unknownParameters].forEach((parameter) => {
    const group = getSchemaEntry(section, parameter)?.group || "其他";
    const items = byGroup.get(group) || [];

    items.push(createSelectorItem(section, parameter));
    byGroup.set(group, items);
  });

  const orderedGroups = uniqueTruthy([
    ...Object.keys(categorySchema.groups?.[section] || {}),
    ...byGroup.keys(),
  ]);

  return orderedGroups.flatMap((group) => {
    const children = byGroup.get(group);
    if (!children?.length) return [];

    return [
      {
        name: getTaxonomyGroupKey(section, group),
        parameter: group,
        children,
      },
    ];
  });
};

const buildProjectRecord = (fileName) => {
  const fullPath = path.join(MARKDOWN_DIR, fileName);
  const code = path.parse(fileName).name;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);
  const parsedDate = parseDate(String(data.date));
  const details = getDetailImages(code);
  const gallery = normalizeMedia(code, data.gallery);
  const media = normalizeMedia(code, data.media);

  return {
    code,
    title: data.title || code,
    description: data.description || "这篇文章暂缺说明",
    date: String(data.date),
    year: parsedDate.year,
    month: parsedDate.month,
    type: data.type,
    tags: toArray(data.tags),
    tech: toArray(data.tech),
    link: data.link || null,
    route: `/markdown/${code}.md`,
    poster: getProjectAssetPath(code, "poster"),
    thumbnail: getProjectAssetPath(code, "thumbnail"),
    banner: getProjectAssetPath(code, "banner"),
    details,
    ...(gallery.length ? { gallery } : {}),
    ...(media.length ? { media } : {}),
  };
};

const generateProjectData = () => {
  const files = fs
    .readdirSync(MARKDOWN_DIR)
    .filter((file) => path.extname(file).toLowerCase() === ".md")
    .sort((a, b) => a.localeCompare(b, "en"));

  const projects = files.map(buildProjectRecord);

  return {
    projects,
    originalImagePaths: generateOriginalImagePaths(),
    tags: createGroupedSelectorData(
      "tags",
      projects.flatMap((project) => project.tags)
    ),
    techs: createGroupedSelectorData(
      "techs",
      projects.flatMap((project) => project.tech)
    ),
    types: createFlatSelectorData(
      "types",
      projects.map((project) => project.type)
    ),
    years: uniqueTruthy(projects.map((project) => String(project.year)))
      .sort((a, b) => {
        const yearA = Number(a);
        const yearB = Number(b);

        if (Number.isFinite(yearA) && Number.isFinite(yearB)) {
          return yearB - yearA;
        }

        if (Number.isFinite(yearA)) return -1;
        if (Number.isFinite(yearB)) return 1;

        return a.localeCompare(b, "zh-Hans-CN");
      })
      .map((year) => ({
        parameter: year,
        name: year,
      })),
  };
};

const generateRecentProjects = (projects) => {
  return projects
    .map((project) => {
      const parsedDate = parseDate(project.date);
      return parsedDate.date ? { project, date: parsedDate.date } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.date - a.date)
    .slice(0, 8)
    .map(({ project }) => project);
};

const writeGeneratedJson = (fileName, data) => {
  fs.mkdirSync(GENERATED_DATA_DIR, { recursive: true });

  const outputPath = path.join(GENERATED_DATA_DIR, `${fileName}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`${fileName}.json generated successfully at ${outputPath}`);
};

const generateAndSave = () => {
  const { projects, originalImagePaths, tags, techs, types, years } =
    generateProjectData();

  writeGeneratedJson("projectsMetadata", projects);
  writeGeneratedJson("recentProjects", generateRecentProjects(projects));
  writeGeneratedJson("originalImagePaths", originalImagePaths);
  writeGeneratedJson("tags", tags);
  writeGeneratedJson("techs", techs);
  writeGeneratedJson("types", types);
  writeGeneratedJson("years", years);
};

generateAndSave();
