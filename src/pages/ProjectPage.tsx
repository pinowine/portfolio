import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/all";

import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { useTransitionDirection } from "../hooks/useTransitionDirection";

import TransitionComponent from "../components/Transition";
import MarkdownRenderer from "../components/MarkdownRenderer/MdRenderer";
import Scrollbar from "../components/Scrollbar";
import {
  getProjectDescriptionKey,
  getProjectByCode,
  getProjectTaxonomyTranslationKeys,
  getProjectTitleKey,
  getSiblingProject,
  toImageUrl,
} from "../utils/projectData";

import { FaLink } from "react-icons/fa6";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTags } from "react-icons/fa";
import { BsStack } from "react-icons/bs";
import Skeleton from "../components/Skeleton";

const ProjectPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toggleDirection } = useTransitionDirection();

  const [isCenterLoaded, setIsCenterLoaded] = useState(false);
  const [isLeftLoaded, setIsLeftLoaded] = useState(false);
  const [isRightLoaded, setIsRightLoaded] = useState(false);

  const { projectId } = useParams();
  const project = getProjectByCode(projectId);

  if (!project) {
    return <div>{t("ui.projects.notFound")}</div>;
  }

  const prevProject = getSiblingProject(project.code, "prev");
  if (!prevProject) {
    return <div>{t("ui.projects.noPrevious")}</div>;
  }
  const nextProject = getSiblingProject(project.code, "next");
  if (!nextProject) {
    return <div>{t("ui.projects.noNext")}</div>;
  }

  const projectTaxonomyKeys = getProjectTaxonomyTranslationKeys(project);

  // lenis

  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      lerp: 0.1, // Adjust for desired smoothness
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Integrate Lenis with ScrollTrigger
    ScrollTrigger.scrollerProxy(".project", {
      scrollTop(value?: number) {
        if (lenis && typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis ? lenis.scroll : 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // Optionally, fix markers if you're using them
      fixedMarkers: true,
    });

    // Update ScrollTrigger on Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Start the RAF loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle ScrollTrigger refresh events
    ScrollTrigger.addEventListener("refresh", () => lenis.raf(0));

    // Clean up on unmount
    return () => {
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  return (
    <div className="project mt-4 p-4 sm:pl-8 sm:pr-8 flex flex-col items-center">
      {/* header */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-7 gap-6">
        {/* left */}
        <div className="hover:flex-shrink-0 transition-all overflow-hidden">
          <TransitionComponent>
            <Link
              to={`/${language}/projects/${t(prevProject.code)}`}
              className="group"
              onClick={() => toggleDirection(1)}
            >
              <div className="transition-opacity max-w-36 z-10 absolute m-4 group-hover:opacity-0 border-b-2 lg:max-w-24">
                <p className="text-xs">{t("ui.projects.previous")}:</p>
                <h3 className="text-base lg:text-sm truncate ...">
                  <b>
                    {t(getProjectTitleKey(prevProject), {
                      defaultValue: prevProject.title,
                    })}
                  </b>
                </h3>
              </div>
              {!isLeftLoaded && (
                <div className="top-0 h-80 max-h-24 lg:max-h-full w-full relative flex items-center justify-center">
                  <Skeleton type="image" />
                </div>
              )}
              <img
                src={toImageUrl(prevProject.thumbnail)}
                alt={`${t(getProjectTitleKey(prevProject), {
                  defaultValue: prevProject.title,
                })} ${t("ui.media.poster")}`}
                className={`relative h-80 transition-all ${isLeftLoaded ? "opacity-40" : "opacity-0"} blur-sm grayscale group-hover:grayscale-0 group-hover:blur-0 group-hover:opacity-100 max-h-24 lg:max-h-full w-full object-cover`}
                onLoad={() => setIsLeftLoaded(true)}
              />
            </Link>
          </TransitionComponent>
        </div>
        {/* mid */}
        <div className="w-full flex flex-col col-span-2 lg:col-span-5 h-full">
          <div className="w-full flex flex-col md:flex-row justify-center h-full">
            <div className="border-2 h-80 w-full md:w-80 flex items-center mb-5 md:mr-5 flex-shrink-0 overflow-hidden">
              <TransitionComponent>
                {!isCenterLoaded && (
                  <div className="top-0 w-80 h-full relative flex items-center justify-center">
                    <Skeleton type="image" />
                  </div>
                )}
                <img
                  src={toImageUrl(project.thumbnail)}
                  alt={`${t(getProjectTitleKey(project), {
                    defaultValue: project.title,
                  })} ${t("ui.media.thumbnail")}`}
                  className={`w-full object-cover ${isCenterLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setIsCenterLoaded(true)}
                />
              </TransitionComponent>
            </div>
            <div className="w-full overflow-hidden">
              <TransitionComponent>
                <div className="border-b pb-3">
                  <div className="flex justify-between">
                    <h4>{project.date}</h4>
                    {project.link && project.link !== "/" && (
                      <div className="pb-1 pt-1">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-center items-center"
                        >
                          <FaLink className="inline mr-1" />
                          {t("ui.projects.link")}
                        </a>
                      </div>
                    )}
                  </div>
                  <h1 className="font-serif">
                    {t(getProjectTitleKey(project), {
                      defaultValue: project.title,
                    })}
                  </h1>
                  <p>
                    {t(getProjectDescriptionKey(project), {
                      defaultValue: project.description,
                    })}
                  </p>
                </div>
                <div className="border-b pb-1 pt-1">
                  <p className="flex items-center justify-start">
                    <FaProjectDiagram className="mr-1" />
                    {t("ui.projects.type")}：
                    {t(projectTaxonomyKeys.type)}
                    {t("ui.projects.suffix")}
                  </p>
                </div>
                <div className="border-b pb-1 pt-1">
                  <p className="flex items-center justify-start">
                    <FaTags className="inline-flex mr-1" />
                    {t("ui.filters.tags")}:{" "}
                  </p>
                  <ul className="flex flex-wrap text-xs">
                    {projectTaxonomyKeys.tags.map((tag, index) => (
                      <li key={index} className="mr-1">
                        #{t(tag)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-b pb-1 pt-1">
                  <p className="flex items-center justify-start">
                    <BsStack className="inline-flex mr-1" />
                    {t("ui.filters.techs")}:
                  </p>
                  <ul className="flex flex-wrap text-xs">
                    {projectTaxonomyKeys.techs.map((tech, index) => (
                      <li key={index} className="mr-1">
                        #{t(tech)}
                      </li>
                    ))}
                  </ul>
                </div>
              </TransitionComponent>
            </div>
          </div>
          {/* main */}
          <main className="mt-12 mb-12">
            <TransitionComponent>
              <MarkdownRenderer filePath={project.route} />
            </TransitionComponent>
          </main>
        </div>
        {/* right */}
        <div className="hover:flex-shrink-0 transition-all text-right row-start-1 col-start-2 lg:col-start-7 overflow-hidden">
          <TransitionComponent>
            <Link
              to={`/${language}/projects/${t(nextProject.code)}`}
              className="group flex items-start justify-end"
              onClick={() => toggleDirection(-1)}
            >
              {!isRightLoaded && (
                <div className="top-0 h-80 max-h-24 lg:max-h-full w-full relative flex items-center justify-center">
                  <Skeleton type="image" />
                </div>
              )}
              <img
                src={toImageUrl(nextProject.thumbnail)}
                alt={`${t(getProjectTitleKey(nextProject), {
                  defaultValue: nextProject.title,
                })} ${t("ui.media.poster")}`}
                onLoad={() => setIsRightLoaded(true)}
                className={`h-80 transition-all ${isRightLoaded ? "opacity-40" : "opacity-0"} blur-sm grayscale group-hover:grayscale-0 group-hover:blur-0 group-hover:opacity-100 max-h-24 lg:max-h-full w-full object-cover`}
              />
              <div className="transition-opacity z-10 absolute m-4 group-hover:opacity-0 border-b-2 lg:max-w-24">
                <p className="text-xs">{t("ui.projects.next")}:</p>
                <h3 className="text-base lg:text-sm truncate ...">
                  <b>
                    {t(getProjectTitleKey(nextProject), {
                      defaultValue: nextProject.title,
                    })}
                  </b>
                </h3>
              </div>
            </Link>
          </TransitionComponent>
        </div>
      </div>
      <Scrollbar lenis={lenisInstance} />
    </div>
  );
};

export default ProjectPage;
