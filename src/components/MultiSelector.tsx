import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { MultiSelectorProps } from "../types/multiSelector";

import { RiCheckFill } from "react-icons/ri";
import { MdClear } from "react-icons/md";

const MultiSelector: React.FC<MultiSelectorProps> = ({
  title,
  data,
  disabled,
  onChange,
  selected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // menu open control
  const toggleLegend = () => {
    setIsOpen(!isOpen);
  };

  // checkbox change
  const handleCheckboxChange = (parameter: string, checked: boolean) => {
    let updatedSelected: string[];
    if (checked) {
      updatedSelected = [...selected, parameter];
    } else {
      updatedSelected = selected.filter((item) => item !== parameter);
    }
    onChange(updatedSelected);
  };

  // select or unselect all
  const handleToggleSelectAll = (parameters: string[]) => {
    const allSelected = parameters.every((param) => selected.includes(param));
    if (allSelected) {
      const updatedSelected = selected.filter(
        (item) => !parameters.includes(item)
      );
      onChange(updatedSelected);
    } else {
      const updatedSelected = Array.from(new Set([...selected, ...parameters]));
      onChange(updatedSelected);
    }
  };

  // all parameters
  const allItemsParameters = useMemo(() => {
    return data.reduce<string[]>((acc, item) => {
      if (item.children) {
        acc.push(...item.children.map((child) => child.parameter));
      } else {
        acc.push(item.parameter);
      }
      return acc;
    }, []);
  }, [data]);

  // all items selected state
  const allItemsSelected = useMemo(() => {
    return allItemsParameters.every((param) => selected.includes(param));
  }, [allItemsParameters, selected]);

  return (
    <fieldset className="border p-2 pb-3 mb-1 mt-1 w-full h-full border-neutral-400 dark:border-neutral-600">
      <legend className="ml-2 flex">
        <button
          className="contrast-theme pl-2 border-2 flex hover:no-underline"
          onClick={toggleLegend}
          type="button"
          disabled={disabled}
        >
          <span className="mr-1">{t(title)}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
            className={`self-center w-4 h-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <button
          className="ml-1 text-sm contrast-theme h-4 w-4 self-center border-0 outline-none flex justify-center items-center transition-all duration-300 ease-in-out transform "
          onClick={() => handleToggleSelectAll(allItemsParameters)}
          type="button"
          disabled={disabled}
          title={allItemsSelected ? t("清空") : t("全选")}
        >
          <MdClear
            className={`absolute transition-all duration-300 ease-in-out ${
              allItemsSelected
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75 pointer-events-none"
            }`}
          />
          <RiCheckFill
            className={`absolute transition-all duration-300 ease-in-out ${
              allItemsSelected
                ? "opacity-0 scale-75 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
          />
        </button>
      </legend>
      <div
        className={`h-full flex justify-between transition-all duration-300 ease-in-out transform
                ${isOpen ? "delay-100 max-h-screen opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-full w-full gap-2 md:mr-4">
          {data.map((item, index) => {
            if (item.children) {
              const childParameters = item.children.map(
                (child) => child.parameter
              );
              const allSelected = childParameters.every((param) =>
                selected.includes(param)
              );

              return (
                <fieldset
                  key={index}
                  className="border border-neutral-400 dark:border-neutral-600 pl-2 pt-2 pb-2 h-full"
                >
                  <legend className="ml-1 mr-2 text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(childParameters)}
                      className="text-sm flex items-center justify-between"
                      disabled={disabled}
                      title={allSelected ? t("清空") : t("全选")}
                    >
                      <span className="mr-2 text-balance text-left w-fit">
                        {t(item.name)}
                      </span>
                      <div className="mr-2 flex justify-center items-center transition-all duration-300 ease-in-out transform">
                        <MdClear
                          className={`absolute transition-all duration-300 ease-in-out ${
                            allSelected
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-75 pointer-events-none"
                          }`}
                        />
                        <RiCheckFill
                          className={`absolute transition-all duration-300 ease-in-out ${
                            allSelected
                              ? "opacity-0 scale-75 pointer-events-none"
                              : "opacity-100 scale-100"
                          }`}
                        />
                      </div>
                    </button>
                  </legend>
                  <div className="flex flex-col">
                    {item.children.map((child, childIndex) => (
                      <div
                        key={childIndex}
                        className="flex mb-1 flex-grow mr-2"
                      >
                        <input
                          type="checkbox"
                          id={child.parameter}
                          name={title}
                          value={child.parameter}
                          className="mr-1.5 flex-shrink-0"
                          checked={selected.includes(child.parameter)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              child.parameter,
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor={child.parameter}
                          className="text-sm text-balance font-thin text-left"
                        >
                          {t(child.name)}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex items-center justify-start gap-1 w-full"
                >
                  <input
                    type="checkbox"
                    id={item.parameter}
                    name={title}
                    value={item.parameter}
                    className=""
                    checked={selected.includes(item.parameter)}
                    onChange={(e) =>
                      handleCheckboxChange(item.parameter, e.target.checked)
                    }
                  />
                  <label
                    htmlFor={item.parameter}
                    className="text-sm font-thin text-left text-wrap overflow-clip hyphens-auto truncate ..."
                  >
                    {t(item.name)}
                  </label>
                </div>
              );
            }
          })}
        </div>
        <div
          className={`md:hidden text-sm flex-wrap max-w-56 justify-end dark:text-neutral-400 text-neutral-600 h-fit text-nowrap hidden`}
        >
          <span className="text-nowrap">{t("已选择：")}</span>
          <ul className="flex flex-wrap justify-end max-w-prose text-right">
            {selected.map((item, index) => (
              <li
                key={index}
                className={`mr-1 before:content-['#'] before:text-sm`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className={`flex text-sm w-full dark:text-neutral-400 text-neutral-600 transition-all duration-300 ease transform 
                ${isOpen ? "max-h-0 opacity-0" : "delay-150 max-h-screen opacity-100"}`}
      >
        <span className="text-nowrap">{t("已选择：")}</span>
        <ul className="flex flex-wrap text-right">
          {selected.map((item, index) => (
            <li
              key={index}
              className={`mr-1 before:content-['#'] before:text-sm`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </fieldset>
  );
};

export default MultiSelector;
