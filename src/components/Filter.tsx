import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLanguage } from "../hooks/useLanguage";

import MultiSelector from "./MultiSelector";

import { FaFilter } from "react-icons/fa";
import { FaMousePointer } from "react-icons/fa";

import tags from "../data/tags.json";
import techs from "../data/techs.json";
import years from "../data/years.json";
import types from "../data/types.json";

const Filter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const yearsParam = params.get("years");
    const typesParam = params.get("types");
    const techsParam = params.get("techs");
    const tagsParam = params.get("tags");

    if (yearsParam) {
      setSelectedYears(yearsParam.split(","));
    }

    if (typesParam) {
      setSelectedTypes(typesParam.split(","));
    }

    if (techsParam) {
      setSelectedTechs(techsParam.split(","));
    }

    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }
  }, [location.search]);

  const handleFilter = () => {
    const queryParams = new URLSearchParams();

    if (selectedYears.length)
      queryParams.append("years", selectedYears.join(","));
    if (selectedTypes.length)
      queryParams.append("types", selectedTypes.join(","));
    if (selectedTechs.length)
      queryParams.append("techs", selectedTechs.join(","));
    if (selectedTags.length) queryParams.append("tags", selectedTags.join(","));

    navigate(`/${language}/projects/filter?${queryParams.toString()}`);
  };

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <form className="mb-8 h-full">
      <div className="pl-4 pr-4 sm:pl-8 sm:pr-8 flex justify-between items-center sticky top-0 default-theme z-20">
        <div className="flex w-full md:w-fit font-normal justify-between pt-1 md:justify-start text-nowrap">
          <button
            className="flex items-center justify-center hover:no-underline p-1 pl-2"
            onClick={toggleIsOpen}
            type="button"
          >
            <FaFilter />
            <span className="mr-1 ml-1">{t("过滤器")}</span>
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
            className="pt-1 pb-1 pl-3 pr-4 flex items-center"
            type="button"
            onClick={handleFilter}
            title={t("应用")}
          >
            <FaMousePointer className="mr-1" />
            {t("应用")}
          </button>
        </div>
        <code className="text-sm hidden md:flex">
          {t("（")}
          {t("年份")}
          {t("：")}
          <code>{selectedYears.length}</code>
          {t("，")}
          {t("类型")}
          {t("：")}
          <code>{selectedTypes.length}</code>
          {t("，")}
          {t("标签")}
          {t("：")}
          <code>{selectedTags.length}</code>
          {t("，")}
          {t("技术栈")}
          {t("：")}
          <code>{selectedTechs.length}</code>
          {t("）")}
        </code>
      </div>
      <div
        className={`pl-4 pr-4 pt-2 transition-all duration-300 ease-in-out transform h-fit
                ${isOpen ? "opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10 -z-50"}`}
      >
        <div className="grid grid-cols-2 gap-2 mb-2 h-fit">
          <MultiSelector
            disabled={false}
            title={t("年份")}
            data={years}
            onChange={setSelectedYears}
            selected={selectedYears}
          />
          <MultiSelector
            disabled={false}
            title={t("类型")}
            data={types}
            onChange={setSelectedTypes}
            selected={selectedTypes}
          />
        </div>
        <MultiSelector
          disabled={false}
          title={t("标签")}
          data={tags}
          onChange={setSelectedTags}
          selected={selectedTags}
        />
        <MultiSelector
          disabled={false}
          title={t("技术栈")}
          data={techs}
          onChange={setSelectedTechs}
          selected={selectedTechs}
        />
      </div>
    </form>
  );
};

export default Filter;
