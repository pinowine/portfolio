import React, { MutableRefObject, Suspense, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import imagesLoaded from "imagesloaded";
import projects from "../data/recentProjects.json";
import ResponsiveImage from "./ImgFigure";

import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import Skeleton from "./Skeleton";

interface ScrollerProps {
  lenis: MutableRefObject<Lenis | null>;
}

const Gallery: React.FC<ScrollerProps> = ({ lenis }) => {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const projectRefs = useRef<HTMLDivElement[]>([]);
  const maskRefs = useRef<HTMLDivElement[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const digitWrapperRefs = useRef<HTMLDivElement[]>([]);
  const digitSpanRefs = useRef<HTMLSpanElement[][]>([]);
  const isFixedStates = useRef<boolean[]>([]);
  const activeIndexRef = useRef(-1);
  const panelRef = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gallery.current) {
        return;
      }

      imagesLoaded(gallery.current, () => {
        // Set the initial preview image
        if (projects.length > 0) {
          setPreviewSrc(projects[0].details[0] || "");
        }

        // Initialize refs
        projectRefs.current = projectRefs.current.slice(0, projects.length);
        maskRefs.current = maskRefs.current.slice(0, projects.length);
        digitWrapperRefs.current = digitWrapperRefs.current.slice(
          0,
          projects.length
        );
        digitSpanRefs.current = digitSpanRefs.current.slice(0, projects.length);
        isFixedStates.current = isFixedStates.current.slice(0, projects.length);

        // Indicator step (adjust according to your design)
        const indicatorStep = 23;

        // GSAP animations and ScrollTriggers
        projects.forEach((project, index) => {
          if (!project) return;
          const projectElement = projectRefs.current[index];
          const mask = maskRefs.current[index];
          const digitWrapper = digitWrapperRefs.current[index];
          const digitSpans = digitSpanRefs.current[index];
          if (projectElement && mask && digitWrapper && digitSpans) {
            // Set initial positions
            gsap.set([mask, digitWrapper, digitSpans], { y: 0 });
            gsap.set(mask, {
              position: "absolute",
              top: "16",
            });

            // Set up ScrollTrigger for preview image change
            const imgElements =
              projectElement.querySelectorAll<HTMLImageElement>(".img img");

            imgElements.forEach((img) => {
              ScrollTrigger.create({
                trigger: img,
                start: "top 50%",
                end: "bottom 50%",
                invalidateOnRefresh: true,
                onEnter: () => {
                  setPreviewSrc(img.src);
                },
                onEnterBack: () => {
                  setPreviewSrc(img.src);
                },
              });
            });

            // ScrollTrigger for mask and digit animations
            ScrollTrigger.create({
              trigger: projectElement,
              start: "top center",
              end: "bottom center",
              invalidateOnRefresh: true,
              onEnter: () => {
                setActiveIndex(index);
                activeIndexRef.current = index;
                isFixedStates.current[index] = true;

                gsap.set(mask, {
                  position: "fixed",
                  top: "40vh",
                });

                gsap.fromTo(
                  [mask, digitWrapper, ...digitSpans],
                  { y: 80 },
                  {
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: true,
                  }
                );

                gsap.to(indicatorRef.current, {
                  top: `${16 + index * indicatorStep}px`,
                  duration: 0.3,
                  ease: "power2.out",
                });
              },
              onLeave: () => {
                isFixedStates.current[index] = false;

                gsap.to([mask, digitWrapper, ...digitSpans], {
                  y: -80,
                  duration: 0.5,
                  ease: "power2.out",
                  overwrite: true,
                  onComplete: () => {
                    gsap.set(mask, {
                      position: "absolute",
                      top: "0",
                    });
                  },
                });
                activeIndexRef.current = index + 1;
              },
              onEnterBack: () => {
                setActiveIndex(index);
                activeIndexRef.current = index;
                isFixedStates.current[index] = true;

                gsap.set(mask, {
                  position: "fixed",
                  top: "40vh",
                });

                gsap.fromTo(
                  [mask, digitWrapper, ...digitSpans],
                  { y: -80 },
                  {
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: true,
                  }
                );

                gsap.to(indicatorRef.current, {
                  top: `${16 + index * indicatorStep}px`,
                  duration: 0.3,
                  ease: "power2.out",
                });
              },
              onLeaveBack: () => {
                isFixedStates.current[index] = false;

                gsap.to([mask, digitWrapper, ...digitSpans], {
                  y: 80,
                  duration: 0.5,
                  ease: "power2.out",
                  overwrite: true,
                  onComplete: () => {
                    gsap.set(mask, {
                      position: "absolute",
                      top: "0",
                    });
                  },
                });
                activeIndexRef.current = index - 1;
              },
            });
          }
        });
      });

      // // Get the actual height of the gallery
      // const galleryHeight = gallery.current.offsetHeight;
      // let endValue = `+=${galleryHeight - 400}px 80%`;

      // right-panel

      ScrollTrigger.create({
        trigger: panelRef.current,
        start: "top 15%",
        end: "+=1500% 80%",
        // markers: true, // Uncomment for debugging
        pin: true,
      });
    },
    { scope: gallery }
  );

  // deal with button event
  const handleNameClick = (index: number) => {
    const projectElement = projectRefs.current[index];
    if (projectElement && lenis.current) {
      lenis.current.scrollTo(projectElement, { offset: -280 });
    }
  };

  return (
    <div
      className="gallery flex flex-row sm:flex-row w-full h-full justify-between p-8 mt-[100vh] pt-64 overflow-hidden default-theme"
      ref={gallery}
    >
      {/* Left Panel */}
      <div className="left-panel flex-shrink w-fit overflow-hidden">
        {/* Projects */}
        {projects.map((project, index) => (
          <div
            key={index}
            className="relative flex flex-col lg:flex-row pb-72 gap-10"
            ref={(el) => {
              if (el) projectRefs.current[index] = el;
            }}
          >
            {/* Mask with Year and Month */}
            <div className="mask-container fixed top-0 w-[130px] overflow-hidden z-10 text-neutral-400 dark:text-neutral-200 mix-blend-difference">
              <div
                className="overflow-hidden will-change-transform flex flex-col h-[4rem] w-fit"
                ref={(el) => {
                  if (el) maskRefs.current[index] = el;
                }}
              >
                <h1 className="circular-font relative will-change-transform font-medium mb-0 text-3xl md:text-4xl lg:text-5xl">
                  <div
                    className="digit-wrapper"
                    ref={(el) => {
                      if (el) digitWrapperRefs.current[index] = el;
                    }}
                  >
                    <Suspense fallback={<Skeleton type="text" />}>
                      {String(
                        `${project.year.toString().slice(2)}/${project.month.toString().padStart(2, "0")}`
                      )
                        .split("")
                        .map((digit, idx) => (
                          <span
                            key={idx}
                            className={`digit-${idx}`}
                            ref={(el) => {
                              if (!digitSpanRefs.current[index]) {
                                digitSpanRefs.current[index] = [];
                              }
                              if (el) digitSpanRefs.current[index][idx] = el;
                            }}
                          >
                            {digit}
                          </span>
                        ))}
                    </Suspense>
                  </div>
                </h1>
              </div>
            </div>
            {/* Images */}
            <div className="flex flex-col gap-4 md:pl-36 lg:pl-40 sm:pl-28 w-fit overflow-hidden">
              {project.details.slice(0, 6).map((imageSrc, imgIndex) => {
                const [isImageLoaded, setIsImageLoaded] = useState(false);
                return (
                  <div
                    key={imgIndex}
                    className="img flex-1 flex-shrink max-h-48 w-[20%] sm:w-[150px] md:w-[180px] overflow-hidden"
                  >
                    {!isImageLoaded && <Skeleton type="image" />}
                    <Suspense fallback={<Skeleton type="image" />}>
                      <img
                        src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${imageSrc}`}
                        alt={`${t("项目图片")} ${imgIndex + 1}`}
                        className={`opacity-90 w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                        onLoad={() => setIsImageLoaded(true)}
                      />
                    </Suspense>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Right Panel */}
      <div
        className="right-panel absolute top-32 pr-8 gap-14 right-0 w-[65%] sm:w-[50%] md:w-[50%] lg:w-[60%] h-[calc(100vh-10rem)] flex flex-col-reverse md:flex-col lg:flex-row items-center justify-between overflow-hidden"
        ref={panelRef}
      >
        {/* Names and Indicator */}
        <div className="names-container w-fit h-fit md:w-full lg:w-[350px] mb-1">
          {/* Indicator */}
          <div
            className="indicator w-full relative top-0 right-0 left-48 lg:left-0 flex lg:justify-end items-center will-change-transform"
            ref={indicatorRef}
          >
            <div
              className="w-[12px] h-[12px] contrast-theme"
              style={{ clipPath: "polygon(0 50%, 100% 100%, 100% 0)" }}
            ></div>
          </div>
          {/* Names */}
          <div className="names-container flex flex-col gap-1">
            {projects.map((project, index) => (
              <div key={index} className="h-[18px]">
                <button
                  onClick={() => handleNameClick(index)}
                  className={`text-[14px] font-medium uppercase font-circular transition-colors duration-300 ${
                    index === activeIndex
                      ? ""
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  <p className="text-sm line-clamp-1 ... text-left max-w-52">
                    {t(project.title)}
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Preview Image */}
        <div className="preview-img w-full relative overflow-hidden right-0 h-[calc(50vh-2em)] lg:h-fit opacity-90 self-end flex justify-end items-center md:items-end">
          <Link to={`/${language}/projects/${t(projects[activeIndex].code)}`}>
            <ResponsiveImage src={previewSrc} alt="Preview" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
