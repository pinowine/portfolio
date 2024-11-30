import Masonry from "react-masonry-css";
import { useTranslation } from "react-i18next";

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
        className="flex mt-12 gap-6"
        columnClassName="flex flex-col gap-6"
      >
        {images.map((image, index) => (
          <button
            onClick={() => onClickEvent(index)}
            key={index}
            className="flex flex-col items-center group overflow-visible"
          >
            <img
              src={`https://cdn.jsdelivr.net/gh/pinowine/portfolio@main/public${image.src}`}
              alt={image.alt}
              className="shadow-md m-0 w-full object-cover group-hover:-translate-y-2 transition-transform"
            />
            <h4 className="text-sm m-0 mt-2">{image.alt}</h4>
          </button>
        ))}
      </Masonry>
    </div>
  );
};

export default MasonryPlugin;
