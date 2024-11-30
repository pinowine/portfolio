import React, { useState, useId, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { SelectorProps } from "../types/selector";
import classNames from "classnames";

const Selector: React.FC<SelectorProps> = ({
  disabled,
  label,
  data,
  buttonEvent,
  defaultName,
  showPara,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string>(defaultName);
  const { t } = useTranslation();
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  // t('简体中文') t('繁体中文') t('英语（美国）') t('汉语')  t('英语（英国）') t('日语')

  const toggleMenuOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleSelection = (parameter: string, name: string) => {
    setCurrentSelection(name);
    buttonEvent(parameter);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative inline-block text-left mx-1"
      data-headlessui-state={isOpen ? "open" : "closed"}
      ref={containerRef}
    >
      <button
        type="button"
        id={`selector-button-${id}`}
        className="hover:no-underline flex items-center space-x-2 font-medium text-sm py-2 px-4"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`selector-menu-${id}`}
        onClick={toggleMenuOpen}
        disabled={disabled}
      >
        <strong>{label}</strong>
        <span> | </span>
        <span>{t(currentSelection)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          data-slot="icon"
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
      <menu
        className={classNames(
          `absolute mt-2 p-2 text-xs shadow-lg transition-transform transform`,
          isOpen
            ? "scale-100 translate-y-0 duration-200"
            : "scale-0 -translate-y-10 duration-200",
          `bg-neutral-200 dark:bg-neutral-900`,
          "left-1/2 transform -translate-x-1/2"
        )}
        aria-labelledby={`selector-button-${id}`}
        id={`selector-menu-${id}`}
        role="menu"
        tabIndex={0}
      >
        {data.map((type, index) => (
          <div
            key={index}
            className="flex flex-col py-2 border-b last:border-b-0 border-neutral-400 dark:border-neutral-600"
            role="none"
          >
            {type.children &&
              type.children.map((item, childIndex) => (
                <button
                  key={childIndex}
                  onClick={() => handleSelection(item.parameter, item.name)}
                  disabled={item.name === currentSelection}
                  className={`group text-nowrap flex font-medium w-full text-left px-4 py-2 mr-2
                                        ${showPara ? "justify-between" : "justify-center"}`}
                >
                  <div>
                    {item.img && (
                      <img
                        src={`https://cdn.jsdelivr.net/gh/pinowine/portfolio@main/public${item.img}`}
                        alt={t(item.name)}
                        className="inline-block mr-2 h-5"
                      />
                    )}
                    {t(item.name)}
                  </div>
                  <div
                    className={`font-normal text-nowrap text-neutral-600 dark:text-neutral-400 
                                    group-disabled:text-neutral-400 group-hover:no-underline dark:group-disabled:text-neutral-600
                                    ${showPara ? "" : "hidden"}`}
                  >
                    {t(item.parameter)}
                  </div>
                </button>
              ))}
            {!type.children && (
              <button
                key={index}
                onClick={() => handleSelection(type.parameter, type.name)}
                disabled={type.name === currentSelection}
                className={`group text-nowrap flex font-medium w-full text-left px-4 py-2 mr-2
                                        ${showPara ? "justify-between" : "justify-center"}`}
              >
                <div>
                  {type.img && (
                    <img
                      src={`https://cdn.jsdelivr.net/gh/pinowine/portfolio@main/public${type.img}`}
                      alt={t(type.name)}
                      className="inline-block mr-2 w-5 h-5"
                    />
                  )}
                  {t(type.name)}
                </div>
                <div
                  className={`font-normal text-nowrap text-neutral-600 dark:text-neutral-400 
                                    group-disabled:text-neutral-400 group-hover:no-underline dark:group-disabled:text-neutral-600
                                    ${showPara ? "" : "hidden"}`}
                >
                  {t(type.parameter)}
                </div>
              </button>
            )}
          </div>
        ))}
      </menu>
    </div>
  );
};

export default Selector;
