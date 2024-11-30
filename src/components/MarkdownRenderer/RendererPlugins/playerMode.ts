import {
  ActiveUI,
  InterfaceGridTemplateArea,
  PlayListPlacement,
  ProgressUI,
  VolumeSliderPlacement
} from "react-modern-audio-player";

export const playerMode: Record<
    number,
    {
      interfacePlacement: InterfaceGridTemplateArea<10>;
      playListPlacement: PlayListPlacement;
      progressType: ProgressUI;
      volumeSliderPlacement?: VolumeSliderPlacement;
      width?: string;
      activeUI?: ActiveUI;
    }
  > = {
    0: {
      interfacePlacement: {
        artwork: "row1-1",
        trackInfo: "row1-2",
        trackTimeCurrent: "row1-3",
        trackTimeDuration: "row1-4",
        progress: "row1-5",
        repeatType: "row1-6",
        volume: "row1-7",
        playButton: "row1-8",
        playList: "row1-9",
      },
      playListPlacement: "bottom",
      progressType: "waveform",
    },
    1: {
      interfacePlacement: {
        artwork: "row1-1",
        playList: "row1-3",
        trackInfo: "row1-2",
        trackTimeCurrent: "row2-1",
        progress: "row2-2",
        trackTimeDuration: "row2-3",
        playButton: "row3-2",
        repeatType: "row3-1",
        volume: "row3-3",
      },
      playListPlacement: "top",
      volumeSliderPlacement: "left",
      progressType: "waveform",
    },
  };