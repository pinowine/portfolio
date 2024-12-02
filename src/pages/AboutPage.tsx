import { useEffect, useState, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/all";
import Scrollbar from "../components/Scrollbar";

import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";

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
              <span>{t("关于本站")}</span>
            </legend>
            <article className="p-4 w-full prose prose-neutral prose-sm lg:prose-xl dark:prose-invert">
              <p>
                {t(
                  "这是一次对旧的作品集网站的翻新，我尝试了新的框架——React+TS+Vite+Tailwind，代替旧作品集的Vue+Vite+JS。整个网页的构建体验感受是tailwind确实帮我节省了很多想千奇百怪的类名的时间。"
                )}
              </p>
              <p>
                {t(
                  "其他主要用到的库和服务在Footer中已经全部列出。GSAP和Lenis对我的编程水平要求过高了，因此在性能优化方面可能并不能做到极致。项目中的大量图片、PDF文件、视频等我也找了一些新的方法托管，注册了Cloudflare用以加速。"
                )}
              </p>
              <p>
                {t(
                  "无障碍和通用设计方面，tailwind非常方便地提供了断点和深色模式伪类，在编写宽度变化的响应式设计时帮助很大。国际化则沿用上个网页使用的i18next，但使用了i18next-scanner插件相当程度上提高了翻译的效率。"
                )}
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
                    src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main/dev-${theme === "dark" ? "dark" : "light"}.webp`}
                  />
                </figure>
              </span>
              <span>{t("关于开发者")}</span>
            </legend>
            <article className="p-4 w-full prose prose-neutral prose-sm lg:prose-xl dark:prose-invert">
              <p>
                {t(
                  "你可以叫我布洛芬。本网站中所有文本和媒体素材权利均归属于开发者。"
                )}
              </p>
              <p>
                {t(
                  "本科毕业于浙江大学园林专业。平面设计爱好者，独立游戏玩家，书影音轻度用户。"
                )}
              </p>
              <p>
                {t(
                  "我不是专业前端开发人员，学习前端和网页交互纯粹是出于个人兴趣，因此代码优化能力有限。如果你遇到了一些卡顿问题，我大概无能为力。"
                )}
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
