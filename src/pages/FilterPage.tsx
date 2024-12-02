import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/all";
import Lenis from "@studio-freight/lenis";

import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";

import Filter from "../components/Filter";
import Scrollbar from "../components/Scrollbar";
import projects from "../data/projectsMetadata.json";
import Skeleton from "../components/Skeleton";

const FilterPage = () => {
  const [searchParams] = useSearchParams();

  const { language } = useLanguage();

  const { t } = useTranslation();

  // Get the filter values from the query string
  const yearsFilter = searchParams.get("years")?.split(",") || [];
  const typesFilter = searchParams.get("types")?.split(",") || [];
  const techsFilter = searchParams.get("techs")?.split(",") || [];
  const tagsFilter = searchParams.get("tags")?.split(",") || [];

  // Filter projects using the extracted filter parameters
  const filteredProjects = projects.filter((project) => {
    const matchesYears = yearsFilter.length
      ? yearsFilter.includes(String(project.year))
      : true;
    const matchesTypes = typesFilter.length
      ? typesFilter.includes(String(project.type))
      : true;
    const matchesTechs = techsFilter.length
      ? techsFilter.some((tech) => project.tech.includes(tech))
      : true;
    const matchesTags = tagsFilter.length
      ? tagsFilter.some((tag) => project.tags.includes(tag))
      : true;

    return matchesYears && matchesTypes && matchesTechs && matchesTags;
  });

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
    <div className="filter w-full mb-20">
      <Filter />
      <div className="pl-4 pr-4 grid grid-flow-row grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const [isImageLoaded, setIsImageLoaded] = useState(false);
            return (
              <div key={project.code} className="pb-6 text-balance group">
                <Link
                  id={project.title}
                  to={`/${language}/projects/${t(project.code)}`}
                  className="h-full overflow-hidden hover:no-underline"
                >
                  <div className="border-second mb-2 group-hover:-translate-y-2 transition-transform">
                    {!isImageLoaded && <Skeleton type="image" />}
                    <Suspense fallback={<Skeleton type="image" />}>
                      <img
                        src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${project.thumbnail}`}
                        alt={t(project.title)}
                        onLoad={() => setIsImageLoaded(true)}
                        className={`transition-all ease-in-out object-cover grayscale group-hover:grayscale-0 group-hover:transition-all group-hover:shadow-2xl ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                      />
                    </Suspense>
                  </div>
                  <label
                    htmlFor={project.title}
                    className="hover:cursor-pointer"
                  >
                    <p className="pl-2 pr-2 mb-1 group-hover:underline contrast-theme w-fit font-semibold">
                      {t(project.title)}
                    </p>
                    <p className="text-sm">{t(project.description)}</p>
                  </label>
                </Link>
              </div>
            );
          })
        ) : (
          <p>{t("没有匹配的项目")}</p>
        )}
      </div>
      <Scrollbar lenis={lenisInstance} />
    </div>
  );
};

export default FilterPage;
