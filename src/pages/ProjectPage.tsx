import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/all";

import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { useTransitionDirection } from "../hooks/useTransitionDirection";

import { SelectorData } from "../types/selector";
import TransitionComponent from "../components/Transition";
import MarkdownRenderer from "../components/MarkdownRenderer/MdRenderer";
import Scrollbar from "../components/Scrollbar";

import projectsData from "../data/projectsMetadata.json";
import tags from "../data/tags.json";
import techs from "../data/techs.json";
import types from "../data/types.json";

import { FaLink } from "react-icons/fa6";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTags } from "react-icons/fa";
import { BsStack } from "react-icons/bs";

const ProjectPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toggleDirection } = useTransitionDirection();

  const { projectName } = useParams();

  // if (!completed) {
  //   return null; // Or display a loading spinner/placeholder
  // }

  const project = projectsData.find((p) => p.title === projectName);
  if (!project) {
    return <div>{t("项目不存在")}</div>;
  }

  const projectsLength = projectsData.length;

  // deal with code
  const projectContext = (codeText: string, order: string) => {
    const code = Number(codeText);
    const offset = order === "prev" ? -1 : 1;
    const newCode = ((code - 1 + offset + projectsLength) % projectsLength) + 1;
    const paddedCode = String(newCode).padStart(3, "0");
    return projectsData.find((p) => p.code === paddedCode);
  };

  const prevProject = projectContext(project.code, "prev");
  if (!prevProject) {
    return <div>{t("前面没有啦")}</div>;
  }
  const nextProject = projectContext(project.code, "next");
  if (!nextProject) {
    return <div>{t("后面没有啦")}</div>;
  }

  const findMapping = (data: SelectorData[], parameter: string): string => {
    let result = parameter; // fallback if not found

    const search = (items: SelectorData[]): string | null => {
      for (let item of items) {
        if (item.parameter === parameter) return item.name;
        if (item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const foundResult = search(data);
    return foundResult || result;
  };

  const mappedTags = project.tags.map((tag) => findMapping(tags, tag));
  const mappedTechs = project.tech.map((tech) => findMapping(techs, tech));
  const mappedType = findMapping(types, project.type);

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
              to={`/${language}/projects/${t(prevProject.title)}`}
              className="group"
              onClick={() => toggleDirection(1)}
            >
              <div className="transition-opacity max-w-36 z-10 absolute m-4 group-hover:opacity-0 border-b-2 lg:max-w-24">
                <p className="text-xs">{t("上一个")}:</p>
                <h3 className="text-base lg:text-sm truncate ...">
                  <b>{t(prevProject.title)}</b>
                </h3>
              </div>
              <img
                src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${prevProject.thumbnail}`}
                alt={`${t(prevProject.title)} ${t("海报")}`}
                className="relative h-80 transition-all opacity-40 blur-sm grayscale group-hover:grayscale-0 group-hover:blur-0 group-hover:opacity-100 max-h-24 lg:max-h-full w-full object-cover"
              />
            </Link>
          </TransitionComponent>
        </div>
        {/* mid */}
        <div className="w-full flex flex-col col-span-2 lg:col-span-5 h-full">
          <div className="w-full flex flex-col md:flex-row justify-center h-full">
            <div className="border-2 mb-5 md:mr-5 flex-shrink-0 overflow-hidden">
              <TransitionComponent>
                <img
                  src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${project.thumbnail}`}
                  alt={`${t(project.title)} ${t("缩略图")}`}
                  className="h-80 w-full object-cover"
                />
              </TransitionComponent>
            </div>
            <div className="w-full overflow-hidden">
              <TransitionComponent>
                <div className="border-b pb-3">
                  <div className="flex justify-between">
                    <h4>{project.date}</h4>
                    {project.link != "/" && (
                      <div className="pb-1 pt-1">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-center items-center"
                        >
                          <FaLink className="inline mr-1" />
                          {t("项目链接")}
                        </a>
                      </div>
                    )}
                  </div>
                  <h1 className="font-serif">{t(project.title)}</h1>
                  <p>{t(project.description)}</p>
                </div>
                <div className="border-b pb-1 pt-1">
                  <p className="flex items-center justify-start">
                    <FaProjectDiagram className="mr-1" />
                    {t("类型")}
                    {t("：")}
                    {t(mappedType)}
                    {t("项目")}
                  </p>
                </div>
                <div className="border-b pb-1 pt-1">
                  <p className="flex items-center justify-start">
                    <FaTags className="inline-flex mr-1" />
                    {t("标签")}:{" "}
                  </p>
                  <ul className="flex flex-wrap text-xs">
                    {mappedTags.map((tag, index) => (
                      <li key={index} className="mr-1">
                        #{t(tag)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-b pb-1 pt-1">
                  <p className="flex items-center justify-start">
                    <BsStack className="inline-flex mr-1" />
                    {t("技术栈")}:
                  </p>
                  <ul className="flex flex-wrap text-xs">
                    {mappedTechs.map((tech, index) => (
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
              to={`/${language}/projects/${t(nextProject.title)}`}
              className="group flex items-start justify-end"
              onClick={() => toggleDirection(-1)}
            >
              <img
                src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${nextProject.thumbnail}`}
                alt={`${t(nextProject.title)} ${t("海报")}`}
                className="h-80 transition-all opacity-40 blur-sm grayscale group-hover:grayscale-0 group-hover:blur-0 group-hover:opacity-100 max-h-24 lg:max-h-full w-full object-cover"
              />
              <div className="transition-opacity z-10 absolute m-4 group-hover:opacity-0 border-b-2 lg:max-w-24">
                <p className="text-xs">{t("下一个")}:</p>
                <h3 className="text-base lg:text-sm truncate ...">
                  <b>{t(nextProject.title)}</b>
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
