import { useEffect, useState, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/all";
import Scrollbar from "../components/Scrollbar";

import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";
import { toImageUrl } from "../utils/projectData";

import Drug from "../assets/drug.svg?react";

const AboutPage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Lenis
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
    ScrollTrigger.scrollerProxy(".about", {
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
    <div className="about w-full mt-16 mb-20 flex flex-col justify-center items-center">
      <main className="p-4 lg:w-1/2 flex flex-col justify-center items-center gap-10">
        <section className="w-full">
          <fieldset className="border border-neutral-400 dark:border-neutral-600 pl-2 pt-2 pb-2 h-full">
            <legend className="ml-1 pl-2 pr-2 text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center justify-between">
              <span className="w-10 mr-2">
                <Drug />
              </span>
              <span>{t("ui.about.site.title")}</span>
            </legend>
            <article className="p-4 w-full prose prose-neutral prose-sm lg:prose-xl dark:prose-invert">
              <p>
                {t("ui.about.site.body.1")}
              </p>
              <p>
                {t("ui.about.site.body.2")}
              </p>
              <p>
                {t("ui.about.site.body.3")}
              </p>
            </article>
          </fieldset>
        </section>
        <section className="w-full">
          <fieldset className="border border-neutral-400 dark:border-neutral-600 pl-2 pt-2 pb-2 h-full">
            <legend className="ml-1 pl-2 pr-2 text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center justify-between">
              <span className="w-10 mr-10">
                <figure className="w-[80px]">
                  <img
                    className="object-cover"
                    src={toImageUrl(
                      `/dev-${theme === "dark" ? "dark" : "light"}.webp`
                    )}
                  />
                </figure>
              </span>
              <span>{t("ui.about.developer.title")}</span>
            </legend>
            <article className="p-4 w-full prose prose-neutral prose-sm lg:prose-xl dark:prose-invert">
              <p>
                {t("ui.about.developer.body.1")}
              </p>
              <p>
                {t("ui.about.developer.body.2")}
              </p>
              <p>
                {t("ui.about.developer.body.3")}
              </p>
            </article>
          </fieldset>
        </section>
      </main>
      <Scrollbar lenis={lenisInstance} />
    </div>
  );
};

export default AboutPage;
