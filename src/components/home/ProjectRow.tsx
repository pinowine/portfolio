import { MutableRefObject, memo } from "react";
import { useTranslation } from "react-i18next";
import { HomeGalleryProject } from "../../utils/projectData";
import GalleryThumb from "./GalleryThumb";

interface ProjectRowProps {
  index: number;
  project: HomeGalleryProject;
  projectRefs: MutableRefObject<HTMLDivElement[]>;
}

const ProjectRow = memo(({ index, project, projectRefs }: ProjectRowProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative flex flex-col lg:flex-row pb-72 gap-10"
      ref={(el) => {
        if (el) projectRefs.current[index] = el;
      }}
    >
      <div className="flex flex-col gap-4 md:pl-36 lg:pl-40 sm:pl-28 w-fit overflow-hidden">
        {project.galleryImages.map((imageSrc, imgIndex) => (
          <GalleryThumb
            key={`${project.code}-${imageSrc}`}
            imageSrc={imageSrc}
            alt={`${t("项目图片")} ${imgIndex + 1}`}
            eager={index === 0 && imgIndex === 0}
          />
        ))}
      </div>
    </div>
  );
});

ProjectRow.displayName = "ProjectRow";

export default ProjectRow;
