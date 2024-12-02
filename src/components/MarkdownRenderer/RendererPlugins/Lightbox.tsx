import { useRef } from "react";
import { useTranslation } from "react-i18next";

import Lightbox, {
  CaptionsRef,
  ThumbnailsRef,
} from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

interface ImageData {
  src: string;
  alt: string;
  desc: string;
}

interface LightboxPluginProps {
  images: ImageData[];
  toggleLightbox: () => void;
  open: boolean;
  initialIndex: number;
}

const LightboxPlugin: React.FC<LightboxPluginProps> = ({
  images,
  toggleLightbox,
  open,
  initialIndex,
}) => {
  const { t } = useTranslation();

  const captionsRef = useRef<CaptionsRef>(null);
  const fullscreenRef = useRef(null);
  const zoomRef = useRef(null);
  const thumbnailsRef = useRef<ThumbnailsRef>(null);

  const slides = images.map((image) => ({
    src: `https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${image.src}`,
    title: t(image.alt),
    description: t(image.desc),
  }));

  return (
    <Lightbox
      open={open}
      close={toggleLightbox}
      slides={slides}
      index={initialIndex}
      plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
      captions={{ ref: captionsRef, showToggle: true }}
      fullscreen={{ ref: fullscreenRef }}
      thumbnails={{ ref: thumbnailsRef, showToggle: true }}
      zoom={{ ref: zoomRef, scrollToZoom: true }}
      labels={{
        Next: t("下一个"),
        Previous: t("上一个"),
        "Zoom in": t("放大"),
        "Zoom out": t("缩小"),
        "Hide thumbnails": t("隐藏缩略图"),
        "Show thumbnails": t("显示缩略图"),
        "Hide captions": t("隐藏说明"),
        "Show captions": t("显示说明"),
        "Enter Fullscreen": t("全屏"),
        "Exit Fullscreen": t("退出全屏"),
        Close: t("关闭"),
      }}
    />
  );
};

export default LightboxPlugin;
