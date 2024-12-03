import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import matter from "gray-matter";

import MarkdownPlugin from "./RendererPlugins/Markdown";
import MasonryPlugin from "./RendererPlugins/Masonry";
import LightboxPlugin from "./RendererPlugins/Lightbox";
import PdfViewerPlugin from "./RendererPlugins/PdfViewer";
import VideoPlugin from "./RendererPlugins/Video";
import AudioPlugin from "./RendererPlugins/Audio";
import IframePlugin from "./RendererPlugins/Frame";
import Skeleton from "../Skeleton";

interface MarkdownRendererProps {
  filePath: string;
}

interface ImageData {
  src: string;
  alt: string;
  desc: string;
}

interface AudioData {
  description: string;
  src: string;
  name: string;
  img: string;
}

interface PdfData {
  description: string;
  src: string;
  pageMode: string;
}

interface VideoData {
  description: string;
  src: string;
}

interface IframeData {
  website: string;
  title: string;
  description: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ filePath }) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [mdOnLoad, setMdOnLoad] = useState<boolean>(false);
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageData[]>([]);
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(1);
  const [pdfLinks, setPdfLinks] = useState<PdfData[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoData[]>([]);
  const [audioLinks, setAudioLinks] = useState<AudioData[]>([]);
  const [websiteLinks, setWebsiteLinks] = useState<IframeData[]>([]);

  useEffect(() => {
    const fetchMarkdown = async () => {
      setMdOnLoad(false);
      try {
        const rawFilePath = `https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${filePath}`;
        // const rawFilePath = filePath;
        const response = await fetch(rawFilePath);
        if (!response.ok) {
          throw new Error(`${t("无法加载Markdown文件")}: ${rawFilePath}`);
        }
        const rawText = await response.text();
        // text
        const { content } = matter(rawText);
        setMarkdownContent(content);
        // images
        const extractedImages = extractImages(content);
        setImages(extractedImages);
        // pdf
        const extractedPdfs = extractPdfLinks(content);
        setPdfLinks(extractedPdfs);
        // video
        const extractedVideos = extractVideoLinks(content);
        setVideoLinks(extractedVideos);
        // audio
        const extractedAudios = extractAudioLinks(content);
        setAudioLinks(extractedAudios);
        // website
        const extractedWebsites = extractWebsiteLinks(content);
        setWebsiteLinks(extractedWebsites);
        setMdOnLoad(true);
      } catch (error: any) {
        console.error(error);
        setMarkdownContent(`${t("加载失败，请稍后重试")}: ${error.message}`);
        setMdOnLoad(true);
      }
    };

    fetchMarkdown();
  }, [filePath, t]);

  // 提取 Markdown 中的图片信息
  const extractImages = (content: string): ImageData[] => {
    const imgRegex = /!\[(.*?)\{(.*?)\}\]\((.*?)\)/g;
    const matches: ImageData[] = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      matches.push({
        alt: match[1], // 方括号内的内容
        desc: match[2], // 花括号内的说明
        src: match[3], // 圆括号内的路径
      });
    }
    return matches;
  };

  // extract pdf links
  const extractPdfLinks = (content: string): PdfData[] => {
    const mediaRegex = /\[pdf:(.*?)\{(.*?)\}\]\((.*?)\)/g;
    const matches: PdfData[] = [];
    let match;
    while ((match = mediaRegex.exec(content)) !== null) {
      matches.push({
        description: match[1],
        pageMode: match[2],
        src: match[3],
      });
    }
    return matches;
  };

  // extract video links
  const extractVideoLinks = (content: string): VideoData[] => {
    const mediaRegex = /\[video:(.*?)\]\((.*?)\)/g;
    const matches: VideoData[] = [];
    let match;
    while ((match = mediaRegex.exec(content)) !== null) {
      matches.push({
        description: match[1],
        src: match[2],
      });
    }
    return matches;
  };

  // extract audio links
  const extractAudioLinks = (content: string): AudioData[] => {
    const mediaRegex = /\[audio:(.*?)\{(.*?)\}\]\((.*?)\{(.*?)\}\)/g;
    const matches: AudioData[] = [];
    let match;
    while ((match = mediaRegex.exec(content)) !== null) {
      matches.push({
        name: match[1],
        description: match[2],
        src: match[3],
        img: match[4],
      });
    }
    return matches;
  };

  // extract website links
  const extractWebsiteLinks = (content: string): IframeData[] => {
    const mediaRegex = /\[website:(.*?)\{(.*?)\}\]\((.*?)\)/g;
    const matches: IframeData[] = [];
    let match;
    while ((match = mediaRegex.exec(content)) !== null) {
      matches.push({
        title: match[1],
        description: match[2],
        website: match[3],
      });
    }
    // console.log(mediaRegex.exec(content));
    return matches;
  };

  const toggleLightbox = () => {
    setOpen(!open);
  };

  const setInitialLightboxIndex = (index: number) => {
    setLightboxIndex(index);
  };

  return (
    <div className="markdown-body prose prose-neutral dark:prose-invert max-w-none default-theme">
      {!mdOnLoad && <Skeleton type="paragraph" />}
      {/* text */}
      <MarkdownPlugin markdownContent={markdownContent} />
      {/* pdf */}
      {pdfLinks.length > 0 && <PdfViewerPlugin pdfLinks={pdfLinks} />}
      {/* video */}
      {videoLinks.length > 0 && <VideoPlugin videoLinks={videoLinks} />}
      {/* audio */}
      {audioLinks.length > 0 && <AudioPlugin audioLinks={audioLinks} />}
      {/* website */}
      {websiteLinks.length > 0 && <IframePlugin website={websiteLinks} />}
      {/* masonry */}
      {images.length > 0 && (
        <MasonryPlugin
          images={images}
          toggleLightbox={toggleLightbox}
          setInitialLightboxIndex={setInitialLightboxIndex}
        />
      )}
      {/* lightbox */}
      {images.length > 0 && (
        <LightboxPlugin
          images={images}
          toggleLightbox={toggleLightbox}
          open={open}
          initialIndex={lightboxIndex}
        />
      )}
    </div>
  );
};

export default MarkdownRenderer;
