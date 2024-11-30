import { useTranslation } from "react-i18next";
import { useTheme } from "../../../hooks/useTheme";

import AudioPlayer, {
  InterfaceGridTemplateArea,
} from "react-modern-audio-player";
import { playerMode } from "./playerMode.ts";

import { useEffect, useState } from "react";

interface AudioPluginProps {
  audioLinks: AudioData[];
}

interface AudioData {
  description: string;
  src: string;
  name: string;
  img: string;
}

const AudioPlugin: React.FC<AudioPluginProps> = ({ audioLinks }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [interfacePlacement, setInterfacePlacement] =
    useState<InterfaceGridTemplateArea<10>>();

  const playList = audioLinks.map((audio, index) => ({
    name: t(audio.name),
    id: index + 1,
    src: audio.src,
    description: t(audio.description),
    img: audio.img,
    writer: "布洛芬",
  }));

  // Set the correct interface placement based on the screen size
  const setResponsiveInterfacePlacement = () => {
    if (window.innerWidth < 800) {
      setInterfacePlacement(playerMode[1].interfacePlacement); // Mobile
    } else {
      setInterfacePlacement(playerMode[0].interfacePlacement); // Tablet
    }
  };

  useEffect(() => {
    setResponsiveInterfacePlacement();

    // Add event listener to handle window resizing
    window.addEventListener("resize", setResponsiveInterfacePlacement);

    return () => {
      window.removeEventListener("resize", setResponsiveInterfacePlacement);
    };
  }, []);

  return (
    <div>
      <h4>{t("项目音频")}</h4>
      <div className="w-full">
        <div className="font-sans" style={{ colorScheme: theme }}>
          <AudioPlayer
            playList={playList}
            activeUI={{
              all: true,
              progress: "waveform",
              playList: "sortable",
            }}
            audioInitialState={{
              muted: false,
              curPlayId: 1,
            }}
            placement={{
              interface: {
                // @ts-ignore
                templateArea: interfacePlacement,
              },
            }}
            rootContainerProps={{ colorScheme: theme, locale: "en-US" }}
          ></AudioPlayer>
        </div>
      </div>
    </div>
  );
};

export default AudioPlugin;
