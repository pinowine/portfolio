import React, {
  MutableRefObject,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import projects from "../data/recentProjects.json";
import ResponsiveImage from "./ImgFigure";

import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import Skeleton from "./Skeleton";

interface ScrollerProps {
  lenis: MutableRefObject<Lenis | null>;
}

type ProjectSummary = (typeof projects)[number];

const IMAGE_CDN_BASE =
  "https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main";

const toImageUrl = (src?: string) => {
  if (!src) return "";
  return src.startsWith("http") ? src : `${IMAGE_CDN_BASE}${src}`;
};

const getProjectPreviewPath = (project: ProjectSummary) => {
  return project.details[0] || project.thumbnail || project.poster || "";
};

const formatProjectDate = (project: ProjectSummary) => {
  return `${project.year.toString().slice(2)}/${project.month
    .toString()
    .padStart(2, "0")}`;
};

const SplitDate = memo(({ value }: { value: string }) => (
  <>
    {value.split("").map((digit, idx) => (
      <span key={`${digit}-${idx}`} className="inline-block transform-gpu">
        {digit}
      </span>
    ))}
  </>
));

SplitDate.displayName = "SplitDate";

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

interface ProjectRowProps {
  digitWrapperRefs: MutableRefObject<HTMLDivElement[]>;
  index: number;
  maskRefs: MutableRefObject<HTMLDivElement[]>;
  project: ProjectSummary;
  projectRefs: MutableRefObject<HTMLDivElement[]>;
}

const ProjectRow = memo(
  ({
    digitWrapperRefs,
    index,
    maskRefs,
    project,
    projectRefs,
  }: ProjectRowProps) => {
    const { t } = useTranslation();
    const dateValue = formatProjectDate(project);

    return (
      <div
        className="relative flex flex-col lg:flex-row pb-72 gap-10"
        ref={(el) => {
          if (el) projectRefs.current[index] = el;
        }}
      >
        <div className="mask-container absolute top-0 w-[130px] overflow-hidden z-10 text-neutral-400 dark:text-neutral-200 mix-blend-difference pointer-events-none">
          <div
            className="overflow-hidden will-change-transform flex flex-col h-[4rem] w-fit"
            ref={(el) => {
              if (el) maskRefs.current[index] = el;
            }}
          >
            <h1
              className="circular-font relative will-change-transform font-medium mb-0 text-3xl md:text-4xl lg:text-5xl"
              aria-label={dateValue}
            >
              <div
                className="digit-wrapper transform-gpu"
                aria-hidden="true"
                ref={(el) => {
                  if (el) digitWrapperRefs.current[index] = el;
                }}
              >
                <SplitDate value={dateValue} />
              </div>
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:pl-36 lg:pl-40 sm:pl-28 w-fit overflow-hidden">
          {project.details.slice(0, 6).map((imageSrc, imgIndex) => (
            <GalleryThumb
              key={`${project.code}-${imgIndex}`}
              imageSrc={imageSrc}
              alt={`${t("项目图片")} ${imgIndex + 1}`}
              eager={index === 0 && imgIndex === 0}
            />
          ))}
        </div>
      </div>
    );
  }
);

ProjectRow.displayName = "ProjectRow";

const Gallery: React.FC<ScrollerProps> = ({ lenis }) => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const initialPreviewSrc = toImageUrl(getProjectPreviewPath(projects[0]));

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [previewSrc, setPreviewSrc] = useState<string>(initialPreviewSrc);
  const projectRefs = useRef<HTMLDivElement[]>([]);
  const maskRefs = useRef<HTMLDivElement[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const digitWrapperRefs = useRef<HTMLDivElement[]>([]);
  const activeIndexRef = useRef(0);
  const previewSrcRef = useRef(initialPreviewSrc);
  const panelRef = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);

  const setActiveProject = useCallback((index: number) => {
    if (activeIndexRef.current === index) return;

    activeIndexRef.current = index;
    startTransition(() => {
      setActiveIndex(index);
    });
  }, []);

  const setPreviewImage = useCallback((src: string) => {
    const nextSrc = toImageUrl(src);
    if (!nextSrc || previewSrcRef.current === nextSrc) return;

    previewSrcRef.current = nextSrc;
    startTransition(() => {
      setPreviewSrc(nextSrc);
    });
  }, []);

  useEffect(() => {
    const galleryElement = gallery.current;
    if (!galleryElement || typeof IntersectionObserver === "undefined") {
      return;
    }

    const getDistanceFromViewportCenter = (entry: IntersectionObserverEntry) =>
      Math.abs(
        entry.boundingClientRect.top +
          entry.boundingClientRect.height / 2 -
          window.innerHeight / 2
      );

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (!visibleEntries.length) return;

        const closestEntry = visibleEntries.reduce((closest, entry) =>
          getDistanceFromViewportCenter(entry) <
          getDistanceFromViewportCenter(closest)
            ? entry
            : closest
        );
        const image = closestEntry.target as HTMLImageElement;

        setPreviewImage(
          image.dataset.previewSrc || image.currentSrc || image.src
        );
      },
      {
        root: null,
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0,
      }
    );

    galleryElement
      .querySelectorAll<HTMLImageElement>(".gallery-preview-source")
      .forEach((image) => observer.observe(image));

    return () => {
      observer.disconnect();
    };
  }, [setPreviewImage]);

  useGSAP(
    () => {
      const galleryElement = gallery.current;
      if (!galleryElement) return;

      projectRefs.current = projectRefs.current.slice(0, projects.length);
      maskRefs.current = maskRefs.current.slice(0, projects.length);
      digitWrapperRefs.current = digitWrapperRefs.current.slice(
        0,
        projects.length
      );

      const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];
      const indicatorStep = 23;
      const moveIndicator = indicatorRef.current
        ? gsap.quickTo(indicatorRef.current, "y", {
            duration: 0.3,
            ease: "power2.out",
          })
        : null;

      if (indicatorRef.current) {
        gsap.set(indicatorRef.current, { y: 16, force3D: true });
      }

      const showDate = (
        project: ProjectSummary,
        index: number,
        mask: HTMLDivElement,
        digitWrapper: HTMLDivElement,
        fromY: number
      ) => {
        setActiveProject(index);
        setPreviewImage(getProjectPreviewPath(project));

        gsap.set(mask, {
          position: "fixed",
          top: "40vh",
        });

        gsap.fromTo(
          digitWrapper,
          { autoAlpha: 0, y: fromY },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            ease: "power3.out",
            force3D: true,
            overwrite: true,
          }
        );

        moveIndicator?.(16 + index * indicatorStep);
      };

      const hideDate = (
        mask: HTMLDivElement,
        digitWrapper: HTMLDivElement,
        toY: number
      ) => {
        gsap.to(digitWrapper, {
          autoAlpha: 0,
          y: toY,
          duration: 0.32,
          ease: "power2.in",
          force3D: true,
          overwrite: true,
          onComplete: () => {
            gsap.set(mask, {
              position: "absolute",
              top: 0,
            });
          },
        });
      };

      projects.forEach((project, index) => {
        const projectElement = projectRefs.current[index];
        const mask = maskRefs.current[index];
        const digitWrapper = digitWrapperRefs.current[index];

        if (!projectElement || !mask || !digitWrapper) return;

        gsap.set(mask, {
          position: "absolute",
          top: 0,
        });
        gsap.set(digitWrapper, {
          autoAlpha: 0,
          force3D: true,
          y: 0,
        });

        triggers.push(
          ScrollTrigger.create({
            trigger: projectElement,
            start: "top center",
            end: "bottom center",
            invalidateOnRefresh: true,
            onEnter: () => {
              showDate(project, index, mask, digitWrapper, 80);
            },
            onLeave: () => {
              hideDate(mask, digitWrapper, -80);
            },
            onEnterBack: () => {
              showDate(project, index, mask, digitWrapper, -80);
            },
            onLeaveBack: () => {
              hideDate(mask, digitWrapper, 80);
            },
          })
        );
      });

      if (panelRef.current) {
        triggers.push(
          ScrollTrigger.create({
            trigger: panelRef.current,
            start: "top 15%",
            end: () => {
              const galleryHeight = galleryElement.scrollHeight;
              const pinnedDistance = Math.max(
                galleryHeight - window.innerHeight,
                window.innerHeight
              );

              return `+=${pinnedDistance}px`;
            },
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          })
        );
      }

      const refreshFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        cancelAnimationFrame(refreshFrame);
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    { scope: gallery, dependencies: [setActiveProject, setPreviewImage] }
  );

  const handleNameClick = (index: number) => {
    const projectElement = projectRefs.current[index];
    const project = projects[index];

    if (projectElement && lenis.current) {
      setActiveProject(index);
      setPreviewImage(getProjectPreviewPath(project));
      lenis.current.scrollTo(projectElement, { offset: -280 });
    }
  };

  const activeProject = projects[activeIndex] || projects[0];

  return (
    <div
      className="gallery flex flex-row sm:flex-row w-full h-full justify-between p-8 mt-[100vh] pt-64 overflow-hidden default-theme"
      ref={gallery}
    >
      <div className="left-panel flex-shrink w-fit overflow-hidden">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.code}
            project={project}
            index={index}
            projectRefs={projectRefs}
            maskRefs={maskRefs}
            digitWrapperRefs={digitWrapperRefs}
          />
        ))}
      </div>
      <div
        className="right-panel absolute top-32 pr-8 gap-14 right-0 w-[65%] sm:w-[50%] md:w-[50%] lg:w-[60%] h-[calc(100vh-10rem)] flex flex-col-reverse md:flex-col lg:flex-row items-center justify-between overflow-hidden"
        ref={panelRef}
      >
        <div className="names-container w-fit h-fit md:w-full lg:w-[350px] mb-1">
          <div
            className="indicator w-full relative top-0 right-0 left-48 lg:left-0 flex lg:justify-end items-center will-change-transform transform-gpu"
            ref={indicatorRef}
          >
            <div
              className="w-[12px] h-[12px] contrast-theme"
              style={{ clipPath: "polygon(0 50%, 100% 100%, 100% 0)" }}
            ></div>
          </div>
          <div className="names-container flex flex-col gap-1">
            {projects.map((project, index) => (
              <div key={project.code} className="h-[18px]">
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
        <div className="preview-img w-full relative overflow-hidden right-0 h-[calc(50vh-2em)] lg:h-fit opacity-90 self-end flex justify-end items-center md:items-end">
          <Link to={`/${language}/projects/${t(activeProject.code)}`}>
            {previewSrc ? (
              <ResponsiveImage key={previewSrc} src={previewSrc} alt="Preview" />
            ) : (
              <Skeleton type="image" />
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
