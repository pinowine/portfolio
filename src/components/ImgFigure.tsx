import React, { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "./Skeleton";

interface Props {
  src: string;
  alt: string;
}

const ResponsiveImage: React.FC<Props> = ({ src, alt }) => {
  const { t } = useTranslation();
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setIsLandscape(aspectRatio >= 1);
    setIsLoaded(true);
  };

  return (
    <picture
      className={`${
        isLandscape === null
          ? "max-h-[calc(50vh-2rem)] w-auto"
          : isLandscape
            ? "lg:max-h-[70vh] lg:max-w-full w-auto md:max-h-[calc(50vw-6rem)]"
            : "lg:max-w-[calc(30vw-2rem)] lg:max-h-[calc(100vh-8rem)] md:max-h-[calc(50vw-2rem)] sm:w-full sm:max-w-full sm:max-h-full"
      } opacity-90 overflow-hidden flex lg:self-end sm:self-center justify-start items-center`}
    >
      {!isLoaded && <Skeleton type="image" />}
      <Suspense fallback={<Skeleton type="image" />}>
        <img
          className={`object-cover ${isLoaded ? "opacity-100" : "opacity-0"}`}
          src={src}
          alt={t(alt)}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      </Suspense>
    </picture>
  );
};

export default ResponsiveImage;
