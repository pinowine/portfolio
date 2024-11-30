import { useTranslation } from "react-i18next";

interface VideoPluginProps {
  videoLinks: VideoData[];
}

interface VideoData {
  description: string;
  src: string;
}

const VideoPlugin: React.FC<VideoPluginProps> = ({ videoLinks }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h4>{t("项目视频")}</h4>
      {videoLinks.map((video, index) => (
        <div key={index}>
          <p>{t(video.description)}</p>
          <div className="relative w-full h-0 pb-[56.25%] border border-neutral-300 dark:border-neutral-700 overflow-hidden">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={video.src}
              frameBorder={0}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoPlugin;
