import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../hooks/useLanguage";

import {
  Viewer,
  Worker,
  ScrollMode,
  ViewMode,
  SpecialZoomLevel,
  ProgressBar,
  Icon,
  MinimalButton,
  Position,
  Tooltip,
  LocalizationMap,
  LocalizationContext,
} from "@react-pdf-viewer/core";
import { RenderZoomProps, zoomPlugin } from "@react-pdf-viewer/zoom";
import {
  pageNavigationPlugin,
  RenderCurrentPageLabelProps,
  RenderGoToPageProps,
} from "@react-pdf-viewer/page-navigation";
import {
  ExitFullScreenIcon,
  FullScreenIcon,
  fullScreenPlugin,
  RenderEnterFullScreenProps,
} from "@react-pdf-viewer/full-screen";
import { scrollModePlugin } from "@react-pdf-viewer/scroll-mode";
import { selectionModePlugin } from "@react-pdf-viewer/selection-mode";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
// import { localeSwitcherPlugin } from "@react-pdf-viewer/locale-switcher";

// css
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";

// icons
import { LuLayoutGrid } from "react-icons/lu";
import { RiLayoutLeft2Fill } from "react-icons/ri";
import { RiLayoutLeftFill } from "react-icons/ri";

// import LocalizationMap
import zh_CN from "@react-pdf-viewer/locales/lib/zh_CN.json";
import zh_TW from "@react-pdf-viewer/locales/lib/zh_TW.json";
import en_US from "@react-pdf-viewer/locales/lib/en_US.json";

interface PdfViewerProps {
  pdfLinks: PdfData[];
}

interface PdfData {
  description: string;
  src: string;
  pageMode: string;
}

const PdfViewerPlugin: React.FC<PdfViewerProps> = ({ pdfLinks }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  // customize navigation
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { GoToNextPage, GoToPreviousPage, CurrentPageLabel } =
    pageNavigationPluginInstance;
  // customize zoom
  const zoomPluginInstance = zoomPlugin();
  const { Zoom, ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;
  // fullscreen
  const fullScreenPluginInstance = fullScreenPlugin({
    getFullScreenTarget: (pagesContainer) =>
      pagesContainer.closest(".js-viewer-container")!,
    renderExitFullScreenButton: () => <></>,
    onEnterFullScreen: (zoom) => {
      zoom(SpecialZoomLevel.PageFit);
      setIsFullscreen(true);
    },
    onExitFullScreen: (zoom) => {
      zoom(SpecialZoomLevel.PageFit);
      setIsFullscreen(false);
    },
  });
  const { EnterFullScreen } = fullScreenPluginInstance;
  // scrollMode
  const scrollModePluginInstance = scrollModePlugin();
  // SelectionMode
  const selectionModePluginInstance = selectionModePlugin();
  // thumbnail
  const thumbnailPluginInstance = thumbnailPlugin({
    thumbnailWidth: 70,
  });
  const { Thumbnails } = thumbnailPluginInstance;
  const toggleThumbnails = useCallback(() => {
    setIsThumbnailsOpen((prev) => !prev);
  }, []);
  const [l10n, setL10n] = useState(zh_CN as any as LocalizationMap);
  const localizationContext = { l10n, setL10n };
  useEffect(() => {
    if (language === "zh-CN") {
      setL10n(zh_CN as any as LocalizationMap);
    } else if (language === "zh-TW") {
      setL10n(zh_TW as any as LocalizationMap);
    } else if (language === "en-US") {
      setL10n(en_US as any as LocalizationMap);
    }
  }, [language]);

  return (
    <div className="pdf-list my-4">
      <h3 className="text-lg font-bold mb-2">项目文档</h3>
      {pdfLinks.map((pdf, index) => (
        <div
          key={index}
          className={`pdf-item mb-8 rpv-core__viewer rpv-core__viewer--${theme}`}
        >
          <p className="text-sm text-nowrap">{pdf.description}</p>
          <LocalizationContext.Provider value={localizationContext}>
            <div className="h-[600px]">
              <Worker
                workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
              >
                {/* main viewer */}
                <div className="js-viewer-container h-full border-neutral-300 dark:border-neutral-700 border">
                  {/* toolbar */}
                  <div
                    className={`toolbar h-[3rem] items-center border-b w-full flex dark:bg-neutral-800 pl-4 pr-4 bg-neutral-200 border-neutral-300 dark:border-neutral-700 `}
                  >
                    {/* md */}
                    <div className="hidden w-full md:flex items-center justify-between">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center justify-center border-r pr-2 border-neutral-300 dark:border-neutral-700">
                          <Tooltip
                            position={Position.BottomCenter}
                            target={
                              <MinimalButton onClick={toggleThumbnails}>
                                <LuLayoutGrid />
                              </MinimalButton>
                            }
                            content={() =>
                              `${isThumbnailsOpen ? t("收起") : t("展开")}${t("缩略图")}`
                            }
                            offset={{ left: 0, top: 8 }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <EnterFullScreen>
                            {(props: RenderEnterFullScreenProps) => (
                              <Tooltip
                                position={Position.BottomCenter}
                                target={
                                  <MinimalButton onClick={props.onClick}>
                                    {isFullscreen ? (
                                      <ExitFullScreenIcon />
                                    ) : (
                                      <FullScreenIcon />
                                    )}
                                  </MinimalButton>
                                }
                                content={() =>
                                  `${isFullscreen ? t("退出") : t("进入")}${t("全屏")}`
                                }
                                offset={{ left: 0, top: 8 }}
                              />
                            )}
                          </EnterFullScreen>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <CurrentPageLabel>
                          {(props: RenderCurrentPageLabelProps) => (
                            <span>{`${props.currentPage + 1} / ${props.numberOfPages}`}</span>
                          )}
                        </CurrentPageLabel>
                      </div>
                      <div className="right flex gap-2 items-center justify-center">
                        <div className="flex gap-2 items-center justify-center border-r pr-2 border-neutral-300 dark:border-neutral-700">
                          <Zoom>
                            {(props: RenderZoomProps) => (
                              <Tooltip
                                position={Position.BottomCenter}
                                target={
                                  <MinimalButton
                                    onClick={() =>
                                      props.onZoom(SpecialZoomLevel.ActualSize)
                                    }
                                  >
                                    <RiLayoutLeft2Fill />
                                  </MinimalButton>
                                }
                                content={() => `${t("实际尺寸")}`}
                                offset={{ left: 0, top: 8 }}
                              />
                            )}
                          </Zoom>
                          <Zoom>
                            {(props: RenderZoomProps) => (
                              <Tooltip
                                position={Position.BottomCenter}
                                target={
                                  <MinimalButton
                                    onClick={() =>
                                      props.onZoom(SpecialZoomLevel.PageFit)
                                    }
                                  >
                                    <RiLayoutLeftFill />
                                  </MinimalButton>
                                }
                                content={() => `${t("适应屏幕")}`}
                                offset={{ left: 0, top: 8 }}
                              />
                            )}
                          </Zoom>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <ZoomOutButton />
                          <ZoomPopover />
                          <ZoomInButton />
                        </div>
                      </div>
                    </div>
                    {/* mobile */}
                    <div className="md:hidden flex items-center justify-between w-full">
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center border-r pr-2 border-neutral-300 dark:border-neutral-700">
                          <Tooltip
                            position={Position.BottomCenter}
                            target={
                              <MinimalButton onClick={toggleThumbnails}>
                                <LuLayoutGrid />
                              </MinimalButton>
                            }
                            content={() =>
                              `${isThumbnailsOpen ? t("收起") : t("展开")}${t("缩略图")}`
                            }
                            offset={{ left: 0, top: 8 }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 border-r pr-2 border-neutral-300 dark:border-neutral-700">
                          <EnterFullScreen>
                            {(props: RenderEnterFullScreenProps) => (
                              <Tooltip
                                position={Position.BottomCenter}
                                target={
                                  <MinimalButton onClick={props.onClick}>
                                    {isFullscreen ? (
                                      <ExitFullScreenIcon />
                                    ) : (
                                      <FullScreenIcon />
                                    )}
                                  </MinimalButton>
                                }
                                content={() =>
                                  `${isFullscreen ? t("退出") : t("进入")}${t("全屏")}`
                                }
                                offset={{ left: 0, top: 8 }}
                              />
                            )}
                          </EnterFullScreen>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center justify-center">
                        <CurrentPageLabel>
                          {(props: RenderCurrentPageLabelProps) => (
                            <span>{`${props.currentPage + 1} / ${props.numberOfPages}`}</span>
                          )}
                        </CurrentPageLabel>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex gap-2 items-center justify-center">
                          <Zoom>
                            {(props: RenderZoomProps) => (
                              <Tooltip
                                position={Position.BottomCenter}
                                target={
                                  <MinimalButton
                                    onClick={() =>
                                      props.onZoom(SpecialZoomLevel.ActualSize)
                                    }
                                  >
                                    <RiLayoutLeft2Fill />
                                  </MinimalButton>
                                }
                                content={() => `${t("实际尺寸")}`}
                                offset={{ left: 0, top: 8 }}
                              />
                            )}
                          </Zoom>
                          <Zoom>
                            {(props: RenderZoomProps) => (
                              <Tooltip
                                position={Position.BottomCenter}
                                target={
                                  <MinimalButton
                                    onClick={() =>
                                      props.onZoom(SpecialZoomLevel.PageFit)
                                    }
                                  >
                                    <RiLayoutLeftFill />
                                  </MinimalButton>
                                }
                                content={() => `${t("适应屏幕")}`}
                                offset={{ left: 0, top: 8 }}
                              />
                            )}
                          </Zoom>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <ZoomOutButton />
                          <ZoomPopover />
                          <ZoomInButton />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[calc(100%-3rem)] flex ">
                    {isThumbnailsOpen && (
                      <div className="scroll w-[18%] border-r border-neutral-300 dark:border-neutral-700">
                        <Thumbnails />
                      </div>
                    )}

                    <div className="h-full w-full relative flex-[1]">
                      {/* Previous Page */}
                      <div
                        style={{
                          left: 0,
                          position: "absolute",
                          top: "50%",
                          transform: "translate(24px, -50%)",
                          zIndex: 1,
                        }}
                        className={`${theme === "dark" ? "mix-blend-difference" : "mix-blend-multiply"} text-nowrap default-theme rounded-sm`}
                      >
                        <GoToPreviousPage>
                          {(props: RenderGoToPageProps) => (
                            <Tooltip
                              position={Position.BottomCenter}
                              target={
                                <MinimalButton onClick={props.onClick}>
                                  <Icon size={16}>
                                    <path d="M18.4.5,5.825,11.626a.5.5,0,0,0,0,.748L18.4,23.5" />
                                  </Icon>
                                </MinimalButton>
                              }
                              content={() => t("上一页")}
                              offset={{ left: 0, top: 8 }}
                            />
                          )}
                        </GoToPreviousPage>
                      </div>
                      {/* next page */}
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50%",
                          transform: "translate(-24px, -50%)",
                          zIndex: 1,
                        }}
                        className={`${theme === "dark" ? "mix-blend-difference" : "mix-blend-multiply"} text-nowrap default-theme rounded-sm`}
                      >
                        <GoToNextPage>
                          {(props: RenderGoToPageProps) => (
                            <Tooltip
                              position={Position.BottomCenter}
                              target={
                                <MinimalButton onClick={props.onClick}>
                                  <Icon size={16}>
                                    <path d="M5.651,23.5,18.227,12.374a.5.5,0,0,0,0-.748L5.651.5" />
                                  </Icon>
                                </MinimalButton>
                              }
                              content={() => t("下一页")}
                              offset={{ left: 0, top: 8 }}
                            />
                          )}
                        </GoToNextPage>
                      </div>
                      {/* content */}
                      <div className="h-full">
                        <Viewer
                          fileUrl={`https://raw.githubusercontent.com/pinowine/portfolio/main/public/assets${pdf.src}`}
                          scrollMode={ScrollMode.Page}
                          defaultScale={SpecialZoomLevel.PageFit}
                          plugins={[
                            zoomPluginInstance,
                            pageNavigationPluginInstance,
                            fullScreenPluginInstance,
                            scrollModePluginInstance,
                            selectionModePluginInstance,
                            thumbnailPluginInstance,
                          ]}
                          theme={theme}
                          renderLoader={(percentages: number) => (
                            <div style={{ width: "240px" }}>
                              <ProgressBar progress={Math.round(percentages)} />
                            </div>
                          )}
                          viewMode={
                            pdf.pageMode === "dual"
                              ? ViewMode.DualPageWithCover
                              : ViewMode.SinglePage
                          }
                          localization={language as unknown as LocalizationMap}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Worker>
            </div>
          </LocalizationContext.Provider>
        </div>
      ))}
    </div>
  );
};

export default PdfViewerPlugin;
