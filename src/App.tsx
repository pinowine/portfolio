import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import gsap from "gsap";
import { ScrollTrigger, ScrollToPlugin, Observer } from "gsap/all";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP, Observer);

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import { TransitionProvider } from "./contexts/TransitionProvider";

import { useApplyTheme } from "./hooks/useApplyTheme";
import { useApplyLanguage } from "./hooks/useApplyLanguage";
import { useLanguage } from "./hooks/useLanguage";

import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import FilterPage from "./pages/FilterPage";
import AboutPage from "./pages/AboutPage";
import DescriptionPage from "./pages/DescriptionPage";

const App = () => {
  useApplyTheme();
  useApplyLanguage();

  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const currentPath = location.pathname;
    console.log(currentPath);
    // 如果路径没有以当前语言前缀开头，则替换为语言前缀的路径
    if (!currentPath.startsWith(`/${language}`)) {
      navigate(`/${language}`, { replace: true });
    }
  }, [language, location.pathname, navigate]);

  return (
    <div>
      <Navbar />
      <TransitionProvider>
        <Routes>
          <Route path="/" index element={<HomePage />} />
          <Route path="/:lang/" index element={<HomePage />} />
          <Route
            path={`/:lang/projects/:projectId`}
            element={<ProjectPage />}
          />
          <Route path="/:lang/projects/filter" element={<FilterPage />} />
          <Route path="/:lang/about" element={<AboutPage />} />
          <Route path="/:lang/description" element={<DescriptionPage />} />
        </Routes>
      </TransitionProvider>
      <Footer />
    </div>
  );
};

export default App;
