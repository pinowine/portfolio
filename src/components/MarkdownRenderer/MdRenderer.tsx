import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import matter from "gray-matter";

import MarkdownPlugin from "./RendererPlugins/Markdown";
import Skeleton from "../Skeleton";
import { translateMarkdownContent } from "../../utils/markdownI18n";

const MasonryPlugin = lazy(() => import("./RendererPlugins/Masonry"));
const LightboxPlugin = lazy(() => import("./RendererPlugins/Lightbox"));
const PdfViewerPlugin = lazy(() => import("./RendererPlugins/PdfViewer"));
const VideoPlugin = lazy(() => import("./RendererPlugins/Video"));
const AudioPlugin = lazy(() => import("./RendererPlugins/Audio"));
const IframePlugin = lazy(() => import("./RendererPlugins/Frame"));

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
  const markdownCode = useMemo(() => {
    return filePath.split("/").pop()?.replace(/\.md$/, "") || "";
  }, [filePath]);

  useEffect(() => {
    const fetchMarkdown = async () => {
      setMdOnLoad(false);
      try {
        const rawFilePath = `https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${filePath}`;
        const response = await fetch(rawFilePath);
        if (!response.ok) {
          throw new Error(`${t("无法加载Markdown文件")}: ${rawFilePath}`);
        }
        const rawText = (await response.text()).replace(/^\uFEFF/, "");
        const { content } = matter(rawText);
        const translatedContent = translateMarkdownContent(
          markdownCode,
          content,
          t
        );

        setMarkdownContent(translatedContent);
        setImages(extractImages(translatedContent));
        setPdfLinks(extractPdfLinks(translatedContent));
        setVideoLinks(extractVideoLinks(translatedContent));
        setAudioLinks(extractAudioLinks(translatedContent));
        setWebsiteLinks(extractWebsiteLinks(translatedContent));
        setMdOnLoad(true);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : t("加载失败，请稍后重试");
        console.error(error);
        setMarkdownContent(`${t("加载失败，请稍后重试")}: ${message}`);
        setMdOnLoad(true);
      }
    };

    fetchMarkdown();
  }, [filePath, markdownCode, t]);

  const extractImages = (content: string): ImageData[] => {
    const imgRegex = /!\[(.*?)\{(.*?)\}\]\((.*?)\)/g;
    const matches: ImageData[] = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      matches.push({
        alt: match[1],
        desc: match[2],
        src: match[3],
      });
    }
    return matches;
  };

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
      <MarkdownPlugin markdownContent={markdownContent} />
      {pdfLinks.length > 0 && (
        <Suspense fallback={<Skeleton type="paragraph" />}>
          <PdfViewerPlugin pdfLinks={pdfLinks} />
        </Suspense>
      )}
      {videoLinks.length > 0 && (
        <Suspense fallback={<Skeleton type="paragraph" />}>
          <VideoPlugin videoLinks={videoLinks} />
        </Suspense>
      )}
      {audioLinks.length > 0 && (
        <Suspense fallback={<Skeleton type="paragraph" />}>
          <AudioPlugin audioLinks={audioLinks} />
        </Suspense>
      )}
      {websiteLinks.length > 0 && (
        <Suspense fallback={<Skeleton type="paragraph" />}>
          <IframePlugin website={websiteLinks} />
        </Suspense>
      )}
      {images.length > 0 && (
        <Suspense fallback={<Skeleton type="image" />}>
          <MasonryPlugin
            images={images}
            toggleLightbox={toggleLightbox}
            setInitialLightboxIndex={setInitialLightboxIndex}
          />
        </Suspense>
      )}
      {images.length > 0 && (
        <Suspense fallback={null}>
          <LightboxPlugin
            images={images}
            toggleLightbox={toggleLightbox}
            open={open}
            initialIndex={lightboxIndex}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MarkdownRenderer;
