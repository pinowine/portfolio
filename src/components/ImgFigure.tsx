import React, { useState } from "react";

interface Props {
    src: string;
    alt: string;
}

const ResponsiveImage: React.FC<Props> = ({ src, alt }) => {
    const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setIsLandscape(aspectRatio >= 1);
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
            <img
                className="object-cover"
                src={src}
                alt={alt}
                onLoad={handleImageLoad}
                loading="lazy"
            />
        </picture>
    );
};

export default ResponsiveImage;