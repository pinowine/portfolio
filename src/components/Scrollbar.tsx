import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";

interface ScrollbarProps {
  lenis: Lenis | null;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ lenis }) => {
  useEffect(() => {
    if (!lenis) return;

    const updateProgressBar = () => {
      const scroll = lenis.scroll;
      const limit = lenis.limit;
      const progress = scroll / limit;

      gsap.to(".progress-bar", {
        scaleY: progress,
        overwrite: "auto",
      });
    };

    lenis.on("scroll", updateProgressBar);

    // Cleanup
    return () => {
      lenis.off("scroll", updateProgressBar);
    };
  }, [lenis]);

  return (
    <div className="progress-bar fixed top-0 z-40 right-0 w-1 h-screen contrast-theme origin-top scale-y-0"></div>
  );
};

export default Scrollbar;
