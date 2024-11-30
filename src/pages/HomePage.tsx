import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
import Lenis from "@studio-freight/lenis";

import { useTheme } from "../hooks/useTheme";
// import { useTransition } from "../hooks/useTransition";
// import { useLanguage } from "../hooks/useLanguage";

// import { useTranslation } from "react-i18next";

import FloatingSVG from "../components/FloatingSVG";
import Gallery from "../components/Gallery";
import Scrollbar from "../components/Scrollbar";

import gsap from "gsap";
import { ScrollTrigger, ScrollToPlugin, Observer } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  // const { language } = useLanguage();
  // const { completed } = useTransition();
  // const { t } = useTranslation();

  const mainRef = useRef<HTMLElement | null>(null);

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
    ScrollTrigger.scrollerProxy(".home", {
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
    <main
      className="home transition-transform duration-1000 overflow-auto default-theme z-0"
      ref={mainRef}
    >
      <div>
        <section className="section top-16 fixed z-0 w-full h-[calc(100vh-4rem)] default-theme overflow-hidden home-svg-container">
          <FloatingSVG suffix={theme} key={theme} />
        </section>
        <section className="section sticky top-[calc(100vh)] w-full default-theme">
          <Gallery lenis={lenisRef} />
        </section>
        <Scrollbar lenis={lenisInstance} />
      </div>
    </main>
  );
};

export default HomePage;
