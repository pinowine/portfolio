import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ScrollTrigger } from "gsap/all";
import Lenis from "@studio-freight/lenis";

import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";

import Filter from "../components/Filter";
import Scrollbar from "../components/Scrollbar";
import Skeleton from "../components/Skeleton";
import {
  filterProjects,
  getProjectDescriptionKey,
  getProjectFiltersFromSearchParams,
  getProjectTitleKey,
  toImageUrl,
} from "../utils/projectData";

const FilterPage = () => {
  const [searchParams] = useSearchParams();

  const { language } = useLanguage();
  const { t } = useTranslation();

  const filters = useMemo(
    () => getProjectFiltersFromSearchParams(searchParams),
    [searchParams]
  );
  const filteredProjects = useMemo(() => filterProjects(filters), [filters]);
  const filteredProjectKey = useMemo(
    () => filteredProjects.map((project) => project.code).join("|"),
    [filteredProjects]
  );

  const [imageLoadStates, setImageLoadStates] = useState(() =>
    new Array(filteredProjects.length).fill(false)
  );

  useEffect(() => {
    setImageLoadStates(new Array(filteredProjects.length).fill(false));
  }, [filteredProjectKey, filteredProjects.length]);

  const handleImageLoad = (index: number) => {
    setImageLoadStates((prevStates) => {
      const updatedStates = [...prevStates];
      updatedStates[index] = true;
      return updatedStates;
    });
  };

  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    ScrollTrigger.scrollerProxy(".filter", {
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
      fixedMarkers: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    ScrollTrigger.addEventListener("refresh", () => lenis.raf(0));

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  return (
    <div className="filter w-full mb-20">
      <Filter />
      <div className="pl-4 pr-4 grid grid-flow-row grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <div key={project.code} className="pb-6 text-balance group">
              <Link
                id={project.title}
                to={`/${language}/projects/${t(project.code)}`}
                className="h-full overflow-hidden hover:no-underline"
              >
                <div className="border-second mb-2 group-hover:-translate-y-2 transition-transform">
                  {!imageLoadStates[index] && <Skeleton type="image" />}
                  <Suspense fallback={<Skeleton type="image" />}>
                    <img
                      src={toImageUrl(project.thumbnail)}
                      alt={t(getProjectTitleKey(project), {
                        defaultValue: project.title,
                      })}
                      onLoad={() => handleImageLoad(index)}
                      className={`transition-all ease-in-out object-cover grayscale group-hover:grayscale-0 group-hover:transition-all group-hover:shadow-2xl ${imageLoadStates[index] ? "opacity-100" : "opacity-0"}`}
                    />
                  </Suspense>
                </div>
                <label htmlFor={project.title} className="hover:cursor-pointer">
                  <p className="pl-2 pr-2 mb-1 group-hover:underline contrast-theme w-fit font-semibold">
                    {t(getProjectTitleKey(project), {
                      defaultValue: project.title,
                    })}
                  </p>
                  <p className="text-sm">
                    {t(getProjectDescriptionKey(project), {
                      defaultValue: project.description,
                    })}
                  </p>
                </label>
              </Link>
            </div>
          ))
        ) : (
          <p>{t("ui.projects.noMatches")}</p>
        )}
      </div>
      <Scrollbar lenis={lenisInstance} />
    </div>
  );
};

export default FilterPage;
