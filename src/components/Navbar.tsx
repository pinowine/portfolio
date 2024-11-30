// components/NavBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";

import Switcher from "./Switcher";
import Selector from "./Selector";

import languageData from "../data/static/languageStructure.json";

import Moon from "../assets/moon.svg?react";
import Sun from "../assets/sun.svg?react";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdOutlineClose } from "react-icons/md";

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isCurrentTheme, setIsCurrentTheme] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const defaultLang = i18n.resolvedLanguage ?? "zh-CN";
  const [currentLang, setCurrentLang] = useState(defaultLang);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  function toggleLanguage(lg: string) {
    setLanguage(lg);
    setCurrentLang(lg);

    const currentPath = location.pathname.split("/").slice(2).join("/");
    navigate(`/${lg}/${currentPath}`);
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const prefersDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsCurrentTheme((prefersDarkMode ? "dark" : "light") === theme);
  }, [theme]);

  const findLanguageName = (lang: string | undefined, data: any[]): string => {
    for (const item of data) {
      // 检查顶级语言
      if (item.parameter === lang) {
        return item.name;
      }
      // 检查子级语言
      if (item.children) {
        for (const child of item.children) {
          if (child.parameter === lang) {
            return child.name;
          }
        }
      }
    }
    return "zh-Hans";
  };

  const defaultLangName = findLanguageName(defaultLang, languageData);

  useEffect(() => {
    setCurrentLang(currentLang);
    i18n.changeLanguage(language); // 确保 i18n 的语言切换和 NavBar 保持同步
  }, [language, i18n]);

  // gsap
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef<number>(0);
  const isNavHidden = useRef<boolean>(false);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (
      currentScrollY > lastScrollY.current &&
      currentScrollY > 50 &&
      !isNavHidden.current
    ) {
      // Scrolling down
      gsap.to(navRef.current, {
        y: "-100%",
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });
      isNavHidden.current = true;
    } else if (currentScrollY < lastScrollY.current && isNavHidden.current) {
      // Scrolling up
      gsap.to(navRef.current, {
        y: "0%",
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });
      isNavHidden.current = false;
    }

    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className="navbar sticky w-full top-0 h-16 select-none z-40 default-theme"
    >
      <nav className="p-4 pl-4 pr-4 sm:pl-8 sm:pr-8 flex z-40 justify-between w-full transition">
        <div className="flex justify-start items-center w-fit">
          <div className="font-serif font-bold text-2xl">
            <Link to={`/${language}`} className="hover:no-underline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="serif w-[200px] h-[35px]"
                fill="currentColor"
              >
                <text x="0" y="25" fontSize="25">
                  {currentLang === "zh-CN" || currentLang === "zh-TW"
                    ? "藥盒"
                    : "Drug.Store"}
                </text>
                <text
                  x={
                    currentLang === "zh-CN" || currentLang === "zh-TW"
                      ? "53"
                      : "140"
                  }
                  y={
                    currentLang === "zh-CN" || currentLang === "zh-TW"
                      ? "26"
                      : "25"
                  }
                  fontSize="12"
                >
                  {currentLang === "zh-CN" || currentLang === "zh-TW"
                    ? "Drug.Store"
                    : "藥盒"}
                </text>
                <text
                  x={
                    currentLang === "zh-CN" || currentLang === "zh-TW"
                      ? "53"
                      : "141"
                  }
                  y={
                    currentLang === "zh-CN" || currentLang === "zh-TW"
                      ? "11"
                      : "10"
                  }
                  fontSize="10"
                >
                  ©
                </text>
              </svg>
            </Link>
          </div>
        </div>
        <div className="md:flex justify-between items-center text-sm w-full hidden">
          <ul className="flex justify-between items-center pr-4 pl-4 h-full w-1/3 gap-2">
            <li className="">
              <Link to={`/${language}`}>{t("主页")}</Link>
            </li>
            <li className="">
              <Link to={`/${language}/description`}>{t("简介")}</Link>
            </li>
            <li className="">
              <Link to={`/${language}/projects/filter`}>{t("作品")}</Link>
            </li>
            <li className="">
              <Link to={`/${language}/about`}>{t("关于")}</Link>
            </li>
          </ul>
          <div className="flex text-nowrap">
            <div className="items-center text-center">
              <Selector
                disabled={false}
                data={languageData}
                label={t("语言")}
                buttonEvent={toggleLanguage}
                defaultName={defaultLangName}
                showPara={true}
              />
            </div>
            <div className="pl-1 items-center text-center">
              <Switcher
                toggleEvent={toggleTheme}
                imgLeft={Sun}
                imgRight={Moon}
                label=""
                disabled={false}
                checked={isCurrentTheme}
                imgLeftColor="neutral"
                imgRightColor="neutral"
              />
            </div>
          </div>
        </div>
        <div className="h-[35px] flex justify-center items-center md:hidden">
          <button onClick={toggleMenu}>
            <div
              className={`${isMenuOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"} transition-transform relative`}
            >
              <GiHamburgerMenu />
            </div>
            <div
              className={`${isMenuOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition-transform absolute`}
            >
              <MdOutlineClose />
            </div>
          </button>
        </div>
      </nav>
      <div
        className={`absolute w-full top-16 default-theme transition transform z-30 ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0 pointer-events-none"}`}
      >
        <ul className="flex flex-col justify-center text-center items-center pr-4 pl-4 h-full w-full p-4 gap-4">
          <li className="before:content-['#'] before:mr-1">
            <Link to={`/${language}`}>{t("主页")}</Link>
          </li>
          <li className="before:content-['#'] before:mr-1">
            <Link to={`/${language}/description`}>{t("简介")}</Link>
          </li>
          <li className="before:content-['#'] before:mr-1">
            <Link to={`/${language}/projects/filter`}>{t("作品")}</Link>
          </li>
          <li className="before:content-['#'] before:mr-1">
            <Link to={`/${language}/about`}>{t("关于")}</Link>
          </li>
          <li className="pl-1 items-center text-center border-t border-neutral-400 dark:border-neutral-600 w-full pt-4">
            <Switcher
              toggleEvent={toggleTheme}
              imgLeft={Sun}
              imgRight={Moon}
              label=""
              disabled={false}
              checked={isCurrentTheme}
              imgLeftColor="neutral"
              imgRightColor="neutral"
            />
          </li>
          <li className="items-center text-center">
            <Selector
              disabled={false}
              data={languageData}
              label={t("语言")}
              buttonEvent={toggleLanguage}
              defaultName={defaultLangName}
              showPara={true}
            />
          </li>
        </ul>
      </div>
      <button
        onClick={toggleMenu}
        className={`fixed w-screen h-screen z-10 transition-opacity bg-neutral-950 ${isMenuOpen ? "opacity-80" : "opacity-0 pointer-events-none"}`}
      ></button>
    </header>
  );
};

export default NavBar;
