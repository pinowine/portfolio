import { Suspense } from "react";

import { useTheme } from "../hooks/useTheme";
import { useLenisScroll } from "../hooks/useLenisScroll";

import Skeleton from "../components/Skeleton";

import FloatingSVG from "../components/FloatingSVG";
import Gallery from "../components/Gallery";
import Scrollbar from "../components/Scrollbar";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const { lenis, lenisRef } = useLenisScroll();

  return (
    <main className="home transition-transform duration-1000 overflow-visible default-theme z-0">
      <div>
        <section className="section top-16 fixed z-0 w-full h-[calc(100vh-4rem)] default-theme overflow-hidden home-svg-container">
          <Suspense fallback={<Skeleton type="page" />}>
            <FloatingSVG suffix={theme} key={theme} />
          </Suspense>
        </section>
        <section className="section sticky top-[calc(100vh)] w-full default-theme">
          <Suspense fallback={<Skeleton type="page" />}>
            <Gallery lenis={lenisRef} />
          </Suspense>
        </section>
        <Scrollbar lenis={lenis} />
      </div>
    </main>
  );
};

export default HomePage;
