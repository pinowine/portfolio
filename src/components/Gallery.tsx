import {
  MutableRefObject,
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
import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import Skeleton from "./Skeleton";
import ResponsiveImage from "./ImgFigure";
import DateTicker from "./home/DateTicker";
import ProjectRow from "./home/ProjectRow";
import {
  formatProjectDate,
  getHomeGalleryProjects,
  getProjectPreviewPath,
  getProjectTitleKey,
  HomeGalleryProject,
  toOriginalImageUrl,
} from "../utils/projectData";

interface ScrollerProps {
  lenis: MutableRefObject<Lenis | null>;
}

const projects = getHomeGalleryProjects();

const Gallery = ({ lenis }: ScrollerProps) => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const firstProject = projects[0];
  const initialPreviewSrc = firstProject
    ? toOriginalImageUrl(getProjectPreviewPath(firstProject))
    : "";
  const initialDate = firstProject ? formatProjectDate(firstProject) : "";

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [previewSrc, setPreviewSrc] = useState<string>(initialPreviewSrc);
  const [dateTicker, setDateTicker] = useState({
    direction: 1,
    value: initialDate,
    visible: false,
  });
  const projectRefs = useRef<HTMLDivElement[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const dateTickerProjectRef = useRef(-1);
  const previewSrcRef = useRef(initialPreviewSrc);
  const panelRef = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);

  const setActiveProject = useCallback((index: number) => {
    const project = projects[index];
    if (!project) return;

    const previousIndex = activeIndexRef.current;
    const direction = index >= previousIndex ? 1 : -1;
    const nextValue = formatProjectDate(project);
    const shouldUpdateActiveIndex = previousIndex !== index;

    activeIndexRef.current = index;
    dateTickerProjectRef.current = index;
    startTransition(() => {
      if (shouldUpdateActiveIndex) {
        setActiveIndex(index);
      }
      setDateTicker({
        direction,
        value: nextValue,
        visible: true,
      });
    });
  }, []);

  const hideDateTicker = useCallback((index: number) => {
    if (dateTickerProjectRef.current !== index) return;

    dateTickerProjectRef.current = -1;
    startTransition(() => {
      setDateTicker((state) => ({
        ...state,
        visible: false,
      }));
    });
  }, []);

  const setPreviewImage = useCallback((src: string) => {
    const nextSrc = toOriginalImageUrl(src);
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

      const showProject = (project: HomeGalleryProject, index: number) => {
        setActiveProject(index);
        setPreviewImage(getProjectPreviewPath(project));
        moveIndicator?.(16 + index * indicatorStep);
      };

      projects.forEach((project, index) => {
        const projectElement = projectRefs.current[index];
        if (!projectElement) return;

        triggers.push(
          ScrollTrigger.create({
            trigger: projectElement,
            start: "top center",
            end: "bottom center",
            invalidateOnRefresh: true,
            onEnter: () => {
              showProject(project, index);
            },
            onLeave: () => {
              hideDateTicker(index);
            },
            onEnterBack: () => {
              showProject(project, index);
            },
            onLeaveBack: () => {
              hideDateTicker(index);
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
    {
      scope: gallery,
      dependencies: [hideDateTicker, setActiveProject, setPreviewImage],
    }
  );

  const handleNameClick = (index: number) => {
    const projectElement = projectRefs.current[index];
    const project = projects[index];

    if (projectElement && project && lenis.current) {
      setActiveProject(index);
      setPreviewImage(getProjectPreviewPath(project));
      lenis.current.scrollTo(projectElement, { offset: -280 });
    }
  };

  const activeProject = projects[activeIndex] || firstProject;

  if (!firstProject || !activeProject) {
    return (
      <div className="gallery p-8 mt-[100vh] pt-64 default-theme">
        <p>{t("ui.projects.noMatches")}</p>
      </div>
    );
  }

  return (
    <div
      className="gallery flex flex-row sm:flex-row w-full h-full justify-between p-8 mt-[100vh] pt-64 overflow-hidden default-theme"
      ref={gallery}
    >
      <DateTicker
        direction={dateTicker.direction}
        value={dateTicker.value}
        visible={dateTicker.visible}
      />
      <div className="left-panel flex-shrink w-fit overflow-hidden">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.code}
            project={project}
            index={index}
            projectRefs={projectRefs}
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
                    {t(getProjectTitleKey(project), {
                      defaultValue: project.title,
                    })}
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
