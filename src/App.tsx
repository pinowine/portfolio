import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import { useApplyTheme } from './hooks/useApplyTheme';
import { useApplyLanguage } from './hooks/useApplyLanguage';
import { useLanguage } from './hooks/useLanguage';

import HomePage from './pages/HomePage/HomePage';
import ProjectPage from './pages/ProjectPage/ProjectPage';

const App = () => {
  useApplyTheme();
  useApplyLanguage();

  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const currentPath = location.pathname;
    // 如果路径没有以当前语言前缀开头，则替换为语言前缀的路径
    if (!currentPath.startsWith(`/${language}`)) {
      navigate(`/${language}`, { replace: true });
    }
  }, [language, location.pathname, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/:lang/' element={<HomePage/>} />
        <Route path='/:lang/project/:id' element={<ProjectPage/>} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
