import { memo, useEffect, useState } from "react";
import Skeleton from "../Skeleton";
import { toImageUrl } from "../../utils/projectData";

interface GalleryThumbProps {
  alt: string;
  eager?: boolean;
  imageSrc: string;
}

const GalleryThumb = memo(
  ({ alt, eager = false, imageSrc }: GalleryThumbProps) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const src = toImageUrl(imageSrc);

    useEffect(() => {
      setIsImageLoaded(false);
    }, [src]);

    return (
      <div className="img gallery-thumb flex-1 flex-shrink max-h-48 w-[20%] sm:w-[150px] md:w-[180px] aspect-[4/3] overflow-hidden">
        {!isImageLoaded && <Skeleton type="image" />}
        <img
          src={src}
          data-preview-src={src}
          alt={alt}
          className={`gallery-preview-source w-full h-full object-cover transition-opacity duration-500 ${
            isImageLoaded ? "opacity-90" : "opacity-0"
          }`}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }
);

GalleryThumb.displayName = "GalleryThumb";

export default GalleryThumb;
