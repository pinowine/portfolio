// components/NavBar.tsx
import React, {useState, useEffect} from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Switcher from '../Switcher/Switcher';
import Selector from '../Selector/Selector';

import languageData from '../../data/languageStructure.json'

import Moon from '../../assets/moon.svg?react'
import Sun from '../../assets/sun.svg?react'

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [ isCurrentTheme, setIsCurrentTheme ] = useState(true);
  
  const defaultLang = i18n.resolvedLanguage ?? 'zh-Hans'
  const [currentLang, setCurrentLang] = useState(defaultLang);

  function toggleLanguage(lg:string) {
    setLanguage(lg)
    setCurrentLang(lg)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsCurrentTheme((prefersDarkMode ? 'dark' : 'light') === theme);
  }, [theme]);

  const findLanguageName = (lang: string | undefined, data: any[]):string => {
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
    return 'zh-Hans'
  };

  const defaultLangName = findLanguageName(defaultLang, languageData);

  useEffect(() => {
    setCurrentLang(currentLang)
    i18n.changeLanguage(language); // 确保 i18n 的语言切换和 NavBar 保持同步
  }, [language, i18n]);

  return (
    <header className='sticky'>
      <nav className="p-4 flex justify-between border-b-2 w-full transition">
        <div className="flex items-center">
          <div className='font-serif font-semibold text-2xl'>
            <Link to={'/'} className='hover:no-underline'>
              <svg width="200" height="35" xmlns="http://www.w3.org/2000/svg" className='serif' fill='currentColor'>
                <text x="0" y="25" fontSize="25">
                  {currentLang === 'zh-Hans' || currentLang === 'zh-Hant' ? '藥盒' : 'Drug.Store'}
                </text>
                <text x={currentLang === 'zh-Hans' || currentLang === 'zh-Hant' ? "53" : '140'} y={currentLang === 'zh-Hans' || currentLang === 'zh-Hant' ? "26" : '25'} fontSize="12">
                  {currentLang === 'zh-Hans' || currentLang === 'zh-Hant' ? 'Drug.Store' : '藥盒'}
                </text>
                <text x={currentLang === 'zh-Hans' || currentLang === 'zh-Hant' ? "53" : '141'} y={currentLang === 'zh-Hans' || currentLang === 'zh-Hant' ? "11" : '10'} fontSize="10">©</text>
              </svg>
            </Link>
          </div>
        </div>
        <div className="flex justify-evenly items-center text-sm w-full">
          <ul className='flex justify-evenly items-center pr-4 pl-4 h-full w-full'>
            <li className='mr-2'>
              <Link to={'/'}>{t('简介')}</Link>
            </li>
            <li className='mr-2'>
              <Link to={'/'}>{t('技能')}</Link>
            </li>
            <li>
              <Link to={'/'}>{t('项目')}</Link>
            </li>
          </ul>
          <div className='flex text-nowrap'>
            <div className="items-center text-center">
              <Selector disabled={false} data={languageData} label={t('语言')} buttonEvent={toggleLanguage} defaultName={defaultLangName} />
            </div>
            <div className="pl-1 items-center text-center">
              <Switcher toggleEvent={toggleTheme} imgLeft={Sun} imgRight={Moon} label='' disabled={false} checked={isCurrentTheme} imgLeftColor='neutral' imgRightColor='neutral' />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;