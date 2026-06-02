import homeFeaturedProjects from "../data/manual/homeFeaturedProjects.json";
import originalImagePaths from "../data/generated/originalImagePaths.json";
import projectsMetadata from "../data/generated/projectsMetadata.json";
import tags from "../data/generated/tags.json";
import techs from "../data/generated/techs.json";
import types from "../data/generated/types.json";
import years from "../data/generated/years.json";
import { SelectorData } from "../types/selector";

export const IMAGE_CDN_BASE =
  "https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main";

const originalImagePathMap = originalImagePaths as Record<string, string>;

export type ProjectMetadata = (typeof projectsMetadata)[number];

export interface HomeFeaturedProjectConfig {
  code: string;
  images?: string[];
  previewImage?: string;
}

export interface ProjectFilterParams {
  years: string[];
  types: string[];
  techs: string[];
  tags: string[];
}

export type HomeGalleryProject = ProjectMetadata & {
  galleryImages: string[];
  previewImage: string;
};

interface ProjectMediaItem {
  src: string;
  role?: string;
}

const HOME_GALLERY_FALLBACK_IMAGE_LIMIT = 6;

export const allProjects = projectsMetadata;

export const filterOptions = {
  years: years as SelectorData[],
  types: types as SelectorData[],
  tags: tags as SelectorData[],
  techs: techs as SelectorData[],
};

const projectByCode = new Map(
  allProjects.map((project) => [project.code, project])
);

const labelBySection = {
  tags: new Map<string, string>(),
  techs: new Map<string, string>(),
  types: new Map<string, string>(),
};

const addSelectorLabels = (
  map: Map<string, string>,
  selectorItems: SelectorData[]
) => {
  selectorItems.forEach((item) => {
    map.set(item.parameter, item.name);
    if (item.children) {
      addSelectorLabels(map, item.children);
    }
  });
};

addSelectorLabels(labelBySection.tags, filterOptions.tags);
addSelectorLabels(labelBySection.techs, filterOptions.techs);
addSelectorLabels(labelBySection.types, filterOptions.types);

export const toImageUrl = (src?: string) => {
  if (!src) return "";
  return src.startsWith("http") ? src : `${IMAGE_CDN_BASE}${src}`;
};

export const toOriginalImageUrl = (src?: string) => {
  if (!src) return "";

  if (src.startsWith("http") && !src.startsWith(IMAGE_CDN_BASE)) {
    return src;
  }

  const relativeSrc = src.startsWith(IMAGE_CDN_BASE)
    ? src.slice(IMAGE_CDN_BASE.length)
    : src;
  const originalSrc = originalImagePathMap[relativeSrc] || relativeSrc;

  return toImageUrl(originalSrc);
};

const uniqueTruthy = (paths: Array<string | null | undefined>) => {
  return [...new Set(paths.filter(Boolean))] as string[];
};

const getDeclaredGalleryImages = (project: ProjectMetadata) => {
  const gallery = (project as ProjectMetadata & { gallery?: ProjectMediaItem[] })
    .gallery;

  return gallery?.map((item) => item.src) || [];
};

export const getAllProjects = () => allProjects;

export const getProjectByCode = (code?: string | null) => {
  return code ? projectByCode.get(code) : undefined;
};

export const getSiblingProject = (
  code: string,
  direction: "prev" | "next"
) => {
  const projectIndex = allProjects.findIndex((project) => project.code === code);
  if (projectIndex < 0 || !allProjects.length) return undefined;

  const offset = direction === "prev" ? -1 : 1;
  const siblingIndex =
    (projectIndex + offset + allProjects.length) % allProjects.length;

  return allProjects[siblingIndex];
};

export const getSelectorTranslationKey = (
  section: keyof typeof labelBySection,
  parameter: string
) => {
  return labelBySection[section].get(parameter) || parameter;
};

export const getProjectTitleKey = (project: ProjectMetadata) => {
  return `projects.${project.code}.title`;
};

export const getProjectDescriptionKey = (project: ProjectMetadata) => {
  return `projects.${project.code}.description`;
};

export const getTaxonomyTranslationKey = (
  section: keyof typeof labelBySection,
  parameter: string
) => {
  return `taxonomy.${section}.${parameter}`;
};

export const getProjectTaxonomyTranslationKeys = (project: ProjectMetadata) => {
  return {
    tags: project.tags.map((tag) => getSelectorTranslationKey("tags", tag)),
    techs: project.tech.map((tech) => getSelectorTranslationKey("techs", tech)),
    type: getSelectorTranslationKey("types", project.type),
  };
};

export const getProjectFallbackImages = (
  project: ProjectMetadata,
  limit = HOME_GALLERY_FALLBACK_IMAGE_LIMIT
) => {
  return uniqueTruthy([
    ...getDeclaredGalleryImages(project),
    ...project.details,
    project.thumbnail,
    project.poster,
    project.banner,
  ]).slice(0, limit);
};

export const getProjectPreviewPath = (project: HomeGalleryProject) => {
  return (
    project.previewImage ||
    project.galleryImages[0] ||
    project.details[0] ||
    project.thumbnail ||
    project.poster ||
    project.banner ||
    ""
  );
};

export const formatProjectDate = (project: ProjectMetadata) => {
  return `${project.year.toString().slice(2)}/${project.month
    .toString()
    .padStart(2, "0")}`;
};

export const getHomeGalleryProjects = () => {
  return (homeFeaturedProjects as HomeFeaturedProjectConfig[]).flatMap(
    (config) => {
      const project = getProjectByCode(config.code);

      if (!project) {
        console.warn(`Home gallery project not found: ${config.code}`);
        return [];
      }

      const galleryImages = config.images?.length
        ? config.images
        : getProjectFallbackImages(project);

      return [
        {
          ...project,
          galleryImages,
          previewImage:
            config.previewImage ||
            galleryImages[0] ||
            getProjectFallbackImages(project, 1)[0] ||
            "",
        },
      ];
    }
  );
};

export const getProjectFiltersFromSearchParams = (
  searchParams: URLSearchParams
): ProjectFilterParams => {
  return {
    years: searchParams.get("years")?.split(",").filter(Boolean) || [],
    types: searchParams.get("types")?.split(",").filter(Boolean) || [],
    techs: searchParams.get("techs")?.split(",").filter(Boolean) || [],
    tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
  };
};

export const filterProjects = (
  filters: ProjectFilterParams,
  projects = allProjects
) => {
  const yearsFilter = new Set(filters.years);
  const typesFilter = new Set(filters.types);
  const techsFilter = new Set(filters.techs);
  const tagsFilter = new Set(filters.tags);

  return projects.filter((project) => {
    const matchesYears =
      !yearsFilter.size || yearsFilter.has(String(project.year));
    const matchesTypes = !typesFilter.size || typesFilter.has(project.type);
    const matchesTechs =
      !techsFilter.size || project.tech.some((tech) => techsFilter.has(tech));
    const matchesTags =
      !tagsFilter.size || project.tags.some((tag) => tagsFilter.has(tag));

    return matchesYears && matchesTypes && matchesTechs && matchesTags;
  });
};
