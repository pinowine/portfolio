import Masonry from "react-masonry-css";
import { useTranslation } from "react-i18next";
import { memo, useEffect, useRef, useState } from "react";
import Skeleton from "../../Skeleton";
import { toImageUrl } from "../../../utils/projectData";

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

interface MasonryImageButtonProps {
  image: ImageData;
  index: number;
  onClick: (index: number) => void;
}

const MasonryImageButton = memo(
  ({ image, index, onClick }: MasonryImageButtonProps) => {
    const itemRef = useRef<HTMLButtonElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const src = toImageUrl(image.src);

    useEffect(() => {
      setIsImageLoaded(false);
    }, [src]);

    useEffect(() => {
      const item = itemRef.current;
      if (!item || typeof IntersectionObserver === "undefined") {
        setShouldLoad(true);
        setIsVisible(true);
        return;
      }

      const preloadObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          setShouldLoad(true);
          preloadObserver.disconnect();
        },
        {
          root: null,
          rootMargin: "900px 0px",
          threshold: 0,
        }
      );

      const revealObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          setIsVisible(true);
          revealObserver.disconnect();
        },
        {
          root: null,
          rootMargin: "0px 0px -35% 0px",
          threshold: 0.18,
        }
      );

      preloadObserver.observe(item);
      revealObserver.observe(item);

      return () => {
        preloadObserver.disconnect();
        revealObserver.disconnect();
      };
    }, []);

    return (
      <button
        ref={itemRef}
        onClick={() => onClick(index)}
        className={`flex flex-col items-center group overflow-visible transition-all duration-1000 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
        type="button"
      >
        {!isImageLoaded && <Skeleton type="image" />}
        <img
          src={shouldLoad ? src : undefined}
          alt={image.alt}
          className={`w-full h-auto object-cover transition-opacity duration-500 ${
            isImageLoaded ? "opacity-90" : "opacity-0"
          }`}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          loading="lazy"
          decoding="async"
        />
        <h4 className="text-sm m-0 mt-2">{image.alt}</h4>
      </button>
    );
  }
);

MasonryImageButton.displayName = "MasonryImageButton";

const MasonryPlugin: React.FC<MasonryPluginProps> = ({
  images,
  toggleLightbox,
  setInitialLightboxIndex,
}) => {
  const { t } = useTranslation();

  const onClickEvent = (index: number) => {
    setInitialLightboxIndex(index);
    toggleLightbox();
  };

  return (
    <section className="project-image-stream">
      <h4>{t("ui.media.projectImage")}</h4>
      <Masonry
        breakpointCols={{ default: 4, 768: 3, 480: 2 }}
        className="flex mt-6 gap-6"
        columnClassName="flex flex-col gap-6"
      >
        {images.map((image, index) => (
          <MasonryImageButton
            key={`${image.src}-${index}`}
            image={image}
            index={index}
            onClick={onClickEvent}
          />
        ))}
      </Masonry>
    </section>
  );
};

export default MasonryPlugin;
