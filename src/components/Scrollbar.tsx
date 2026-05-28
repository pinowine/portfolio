import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";

interface ScrollbarProps {
  lenis: Lenis | null;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ lenis }) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progressBar = progressBarRef.current;
    if (!lenis || !progressBar) return;

    const setProgress = gsap.quickSetter(progressBar, "scaleY");

    const updateProgressBar = () => {
      const limit = lenis.limit || 1;
      const progress = Math.min(Math.max(lenis.scroll / limit, 0), 1);

      setProgress(progress);
    };

    updateProgressBar();
    lenis.on("scroll", updateProgressBar);

    return () => {
      lenis.off("scroll", updateProgressBar);
    };
  }, [lenis]);

  return (
    <div
      ref={progressBarRef}
      aria-hidden="true"
      className="progress-bar fixed top-0 z-40 right-0 w-1 h-screen contrast-theme origin-top scale-y-0 transform-gpu"
    ></div>
  );
};

export default Scrollbar;
