import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";

import Barcode from "../assets/barcode.svg?react";
import Drug from "../assets/drug.svg?react";

import { FaFigma, FaPhone, FaReact } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaGithub } from "react-icons/fa";
import { RiDoubanFill, RiOpenaiFill, RiTailwindCssFill } from "react-icons/ri";
import { FaWeixin } from "react-icons/fa";
import { FaBilibili } from "react-icons/fa6";
import { GoDiscussionOutdated } from "react-icons/go";
import GCore from "../assets/gcore.svg?react";
import { SiI18Next, SiMdnwebdocs, SiNetlify, SiVite } from "react-icons/si";
import ReactIcon from "../assets/react-icon.svg?react";
import RIVE from "../assets/rive.svg?react";
import GSAP from "../assets/gsap.svg?react";
import { BiLogoTypescript } from "react-icons/bi";
import { SiAdobephotoshop } from "react-icons/si";
import { SiAdobeillustrator } from "react-icons/si";
import Lenis from "../assets/lenis.svg?react";
import { IoLink } from "react-icons/io5";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMarkdown } from "react-icons/fa";
import { RiLayoutMasonryFill } from "react-icons/ri";
import { AiFillFilePdf } from "react-icons/ai";
import { BsSoundwave } from "react-icons/bs";
import { IoLogoYoutube } from "react-icons/io";
import { FaCloudflare } from "react-icons/fa6";
import { SiJsdelivr } from "react-icons/si";

const Footer = () => {
  // const { theme } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();

  const selectedWorks = [
    {
      key: "独立",
      children: [
        "情绪立方",
        "迷因大师",
        "城市洞穴",
        "夹层与拥抱",
        "甜蜜的盛宴，献给饥饿的人",
        "自我的静观",
      ],
    },
    {
      key: "私人",
      children: [
        "影迷在宜家",
        "迭代器的评论",
        "危机合约唱片汇编",
        "泰拉旅游指南",
        "MOC设计文档",
      ],
    },
    {
      key: "合作",
      children: ["空虚综合征", "智能营销系统", "生活在浙大"],
    },
    {
      key: "主修",
      children: ["回溯", "远游", "城市榫卯", "杰克的冒险"],
    },
  ];

  const pages = [
    {
      name: "主页",
      href: "/",
    },
    // {
    //   name: "简介",
    //   href: "/description",
    // },
    {
      name: "作品",
      href: "/projects/filter",
    },
    {
      name: "关于",
      href: "/about",
    },
  ];

  const relevantLinks = [
    {
      name: "豆瓣",
      href: "https://www.douban.com/people/192041489/?_i=3944320GoLuv42",
      icon: <RiDoubanFill />,
    },
    {
      name: "GitHub",
      href: "https://github.com/pinowine",
      icon: <FaGithub />,
    },
    {
      name: "微信公众号",
      href: "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzg3NDYzODk3Nw==&scene=124#wechat_redirect",
      icon: <FaWeixin />,
    },
    {
      name: "Bilibili",
      href: "https://space.bilibili.com/22824068",
      icon: <FaBilibili />,
    },
    {
      name: "机核",
      href: "https://www.gcores.com/users/660637/talks",
      icon: <GCore />,
    },
    {
      name: "作品集（旧）",
      href: "http://ibuprofennist.com/",
      icon: <GoDiscussionOutdated />,
    },
  ];

  const buildingTools = [
    {
      title: "构建",
      children: [
        { name: "Vite", icon: <SiVite />, href: "https://vite.dev/" },
        { name: "React", icon: <FaReact />, href: "https://react.dev/" },
        {
          name: "TypeScript",
          icon: <BiLogoTypescript />,
          href: "https://www.typescriptlang.org/",
        },
      ],
    },
    {
      title: "无障碍",
      children: [
        {
          name: "react-i18next",
          icon: <SiI18Next />,
          href: "https://react.i18next.com/",
        },
        {
          name: "tailwindcss",
          icon: <RiTailwindCssFill />,
          href: "https://tailwindcss.com/",
        },
      ],
    },
    {
      title: "渲染",
      children: [
        {
          name: "react-icons",
          icon: <ReactIcon />,
          href: "https://react-icons.github.io/react-icons/",
        },
        {
          name: "react-markdown",
          icon: <FaMarkdown />,
          href: "https://github.com/remarkjs/react-markdown",
        },
        {
          name: "react-masonry-css",
          icon: <RiLayoutMasonryFill />,
          href: "https://github.com/paulcollett/react-masonry-css",
        },
      ],
    },
    {
      title: "交互",
      children: [
        {
          name: "RIVE",
          icon: <RIVE />,
          href: "https://rive.app/",
        },
        {
          name: "GSAP",
          icon: <GSAP />,
          href: "https://gsap.com/",
        },
        {
          name: "Lenis",
          icon: <Lenis />,
          href: "https://lenis.darkroom.engineering/",
        },
        {
          name: "Yet Another React Lightbox",
          icon: <MdOutlineZoomOutMap />,
          href: "https://yet-another-react-lightbox.com/",
        },
        {
          name: "react-pdf-viewer",
          icon: <AiFillFilePdf />,
          href: "https://react-pdf-viewer.dev/",
        },
        {
          name: "react-modern-audio-player",
          icon: <BsSoundwave />,
          href: "https://github.com/slash9494/react-modern-audio-player",
        },
      ],
    },
    {
      title: "设计",
      children: [
        {
          name: "Figma",
          icon: <FaFigma />,
          href: "https://figma.com/",
        },
        {
          name: "Adobe Photoshop",
          icon: <SiAdobephotoshop />,
          href: "https://www.adobe.com/products/photoshop.html",
        },
        {
          name: "Adobe Illustrator",
          icon: <SiAdobeillustrator />,
          href: "https://www.adobe.com/products/illustrator.html",
        },
      ],
    },
    {
      title: "协助",
      children: [
        {
          name: "ChatGPT",
          icon: <RiOpenaiFill />,
          href: "https://openai.com/",
        },

        {
          name: "MDN Web Docs",
          icon: <SiMdnwebdocs />,
          href: "https://developer.mozilla.org/",
        },
      ],
    },
    {
      title: "托管",
      children: [
        {
          name: "GitHub",
          icon: <FaGithub />,
          href: "https://github.com/",
        },
        {
          name: "Netlify",
          icon: <SiNetlify />,
          href: "https://www.netlify.com/",
        },
        {
          name: "Youtube",
          icon: <IoLogoYoutube />,
          href: "https://www.youtube.com/",
        },
      ],
    },
    {
      title: "服务",
      children: [
        {
          name: "Cloudflare",
          icon: <FaCloudflare />,
          href: "https://www.cloudflare.com/",
        },
        {
          name: "jsDelivr",
          icon: <SiJsdelivr />,
          href: "https://www.jsdelivr.com/",
        },
        {
          name: "Chinajsdelivr",
          icon: <SiJsdelivr />,
          href: "https://github.com/54ayao/JSDMirror",
        },
      ],
    },
  ];
  const developerImages = [
    { title: "C&Y", src: "/dev-dua-1.webp" },
    { title: "M&Y", src: "/dev-dua-2.webp" },
    { title: "C&M", src: "/dev-dua-3.webp" },
    { title: "Y&C", src: "/dev-dua-4.webp" },
  ];

  return (
    <footer className="w-full p-4 font-sans sticky z-30 default-theme flex flex-col gap-4">
      {/* main */}
      <div className="grid grid-cols-10 gap-4 w-full h-fit">
        {/* left panel */}
        <div className="grid grid-cols-4 col-span-10 lg:col-span-4 gap-4">
          {/* dev-images */}
          <div className="col-span-4 grid grid-cols-4">
            {developerImages.map((img, index) => (
              <div key={`${img.title}-${index}`}>
                <img
                  src={`https://cdn.ibuprofennist.com/gh/pinowine/portfolio-images@main${img.src}`}
                  alt={t("开发者") + t("双色") + t("图片") + (index + 1)}
                  className="opacity-90"
                />
              </div>
            ))}
          </div>
          {/* barcode & contact */}
          <div className="col-span-4 grid gap-4 lg:border-b lg:pb-4">
            <div className="col-span-4 grid grid-cols-10 gap-2 h-fit">
              <div className="col-span-4">
                <Barcode className="w-full" />
              </div>
              <div className="col-span-6 flex h-full items-center flex-wrap">
                <address className="flex flex-col justify-between items-start text-sm">
                  <Link
                    to="mailto:chenzeyuan36@gmail.com"
                    className="flex justify-start items-center"
                  >
                    <MdEmail className="inline-block mr-1" />
                    <p className="text-wrap line-clamp-1 break-all truncate ... text-sm">
                      chenzeyuan36@gmail.com
                    </p>
                  </Link>
                  <Link
                    to="tel:+8615355584087"
                    className="flex justify-start items-center"
                  >
                    <FaPhone className="inline-block mr-1" />
                    +86 15355584087
                  </Link>
                </address>
              </div>
            </div>
          </div>
        </div>
        {/* right panel */}
        <div className="grid grid-cols-5 col-span-10 lg:col-span-6 border-b">
          <div className="flex flex-col md:flex-row items-center col-span-5 border-b border-t justify-between gap-1 lg:gap-4 p-2">
            {/* router */}
            <div className="flex gap-4">
              {pages.map((page) => (
                <Link
                  key={page.name}
                  to={`/${language}${page.href}`}
                  className="text-sm"
                  title={t(page.name)}
                >
                  {t(page.name)}
                </Link>
              ))}
            </div>
            {/* links */}
            <div className="flex sm:gap-4 flex-wrap items-center justify-center">
              <h4 className="leading-none flex gap-1 items-center">
                <IoLink />
                <p className="text-sm">{t("相关链接") + t("：")}</p>
              </h4>
              <address className="flex gap-4 flex-wrap">
                {relevantLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="flex items-center gap-1"
                    aria-label={t(link.name)}
                    title={t(link.name)}
                  >
                    <div className="w-4">{link.icon}</div>
                  </Link>
                ))}
              </address>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 col-span-5 p-2 pb-6 pt-4 md:pt-2 md:pb-2">
            {selectedWorks.map((work, workIndex) => (
              <div
                key={`work-${workIndex}`}
                className="flex flex-col w-full h-full items-center text-center md:items-start md:text-start"
              >
                <h4 className="text-base">{t(work.key) + t("项目")}</h4>
                <address className="flex flex-col gap-1">
                  {work.children.map((name, nameIndex) => (
                    <Link
                      key={`work-${workIndex}-child-${nameIndex}`}
                      to={`/${language}/projects/${t(name)}`}
                      title={t(name)}
                      aria-label={t(name)}
                    >
                      <p className="text-sm line-clamp-1">{t(name)}</p>
                    </Link>
                  ))}
                </address>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* bottom */}
      <div className="grid grid-cols-10 pb-4 gap-4 w-full h-full">
        {/* Copyright */}
        <div className="col-span-10 lg:col-span-4 flex items-center gap-2 h-full pl-2">
          <div className="">
            <Drug width={"30px"} />
          </div>
          <div className="">
            <h4 className="text-sm">
              COPYRIGHT<sup>©</sup> Drug.Store, All Rights Reserved.
            </h4>
            <p className="text-sm">{t("一个生活的容器，一个回答的回答。")}</p>
          </div>
        </div>
        {/* special thanks */}
        <div className="col-span-10 border-b pb-6 lg:border-0 lg:pb-0 row-start-1 lg:col-start-5 lg:col-span-6 pl-4 pr-4 h-full">
          <address className="flex gap-2 items-center justify-evenly md:justify-between h-full flex-wrap">
            {buildingTools.map((group) => (
              <div className="flex items-center gap-2">
                <span>|</span>
                <div
                  key={group.title}
                  className="flex flex-col gap-2 items-center justify-between"
                >
                  <p className="text-sm">{t(group.title)}</p>
                  <div className="flex gap-2 flex-wrap items-center justify-center">
                    {group.children.map((tool) => (
                      <Link
                        key={`${group.title}-${tool.name}`}
                        to={tool.href}
                        title={t(tool.name)}
                      >
                        <div className="w-5">{tool.icon}</div>
                      </Link>
                    ))}
                  </div>
                </div>
                <span>|</span>
              </div>
            ))}
          </address>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
