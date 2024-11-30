import { useTranslation } from "react-i18next";

interface IframePluginProps {
  website: IframeData[];
}

interface IframeData {
  website: string;
  title: string;
  description: string;
}

const IframePlugin: React.FC<IframePluginProps> = ({ website }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      {website.map((web, index) => (
        <div key={index} className=" scroll w-full h-full">
          <h4>{t(web.title)}</h4>
          <p>{t(web.description)}</p>
          <iframe
            aria-labelledby={t(web.description)}
            src={web.website}
            width={"100%"}
            height={"500px"}
            className="scroll border border-neutral-300 dark:border-neutral-700 overflow-hidden"
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default IframePlugin;
