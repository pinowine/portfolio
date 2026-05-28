import homeFeaturedProjects from "../data/homeFeaturedProjects.json";
import projectsMetadata from "../data/projectsMetadata.json";

export const IMAGE_CDN_BASE =
  "https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main";

export type ProjectMetadata = (typeof projectsMetadata)[number];

export interface HomeFeaturedProjectConfig {
  code: string;
  images?: string[];
  previewImage?: string;
}

export type HomeGalleryProject = ProjectMetadata & {
  galleryImages: string[];
  previewImage: string;
};

const HOME_GALLERY_FALLBACK_IMAGE_LIMIT = 6;

const projectByCode = new Map(
  projectsMetadata.map((project) => [project.code, project])
);

export const toImageUrl = (src?: string) => {
  if (!src) return "";
  return src.startsWith("http") ? src : `${IMAGE_CDN_BASE}${src}`;
};

const uniqueTruthy = (paths: Array<string | null | undefined>) => {
  return [...new Set(paths.filter(Boolean))] as string[];
};

export const getProjectFallbackImages = (
  project: ProjectMetadata,
  limit = HOME_GALLERY_FALLBACK_IMAGE_LIMIT
) => {
  return uniqueTruthy([
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
      const project = projectByCode.get(config.code);

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
