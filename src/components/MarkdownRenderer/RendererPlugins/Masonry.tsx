import Masonry from "react-masonry-css";
import { useTranslation } from "react-i18next";
import { Suspense, useState } from "react";
import Skeleton from "../../Skeleton";

interface ImageData {
  src: string;
  alt: string;
  desc: string;
}

interface MasonryPluginProps {
  images: ImageData[];
  toggleLightbox: () => void;
  setInitialLightboxIndex: (index: number) => void;
}

const MasonryPlugin: React.FC<MasonryPluginProps> = ({
  images,
  toggleLightbox,
  setInitialLightboxIndex,
}) => {
  const { t } = useTranslation();
  const onClickEvent = (index: number) => {
    toggleLightbox();
    setInitialLightboxIndex(index);
  };
  return (
    <div>
      <h4>{t("项目图集")}</h4>
      <Masonry
        breakpointCols={{ default: 4, 768: 3, 480: 2 }}
        className="flex mt-6 gap-6"
        columnClassName="flex flex-col gap-6"
      >
        {images.map((image, index) => {
          const [isImageLoaded, setIsImageLoaded] = useState(false);
          return (
            <button
              onClick={() => onClickEvent(index)}
              key={index}
              className="flex flex-col items-center group overflow-visible"
            >
              <Suspense fallback={<Skeleton type="image" />}>
                {!isImageLoaded && <Skeleton type="image" />}
                <img
                  src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${image.src}`}
                  alt={t(image.alt)}
                  className={`opacity-90 w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </Suspense>
              <h4 className="text-sm m-0 mt-2">{t(image.alt)}</h4>
            </button>
          );
        })}
      </Masonry>
    </div>
  );
};

export default MasonryPlugin;
