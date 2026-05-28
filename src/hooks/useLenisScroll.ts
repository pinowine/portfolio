import { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface UseLenisScrollOptions {
  lerp?: number;
  smoothWheel?: boolean;
}

export const useLenisScroll = ({
  lerp = 0.1,
  smoothWheel = true,
}: UseLenisScrollOptions = {}) => {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      lerp,
      smoothWheel,
    });

    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => {
      lenisInstance.raf(time * 1000);
    };
    const refreshLenis = () => {
      lenisInstance.raf(performance.now());
    };

    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    lenisInstance.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    ScrollTrigger.addEventListener("refresh", refreshLenis);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener("refresh", refreshLenis);
      lenisInstance.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateLenis);
      lenisInstance.destroy();

      if (lenisRef.current === lenisInstance) {
        lenisRef.current = null;
      }
    };
  }, [lerp, smoothWheel]);

  return { lenis, lenisRef };
};
