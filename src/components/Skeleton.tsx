import React from "react";

import ScrambleText from "./ScrambleText";

interface SkeletonProps {
  type: "image" | "text" | "paragraph" | "avatar" | "page" | "video"; // 根据需要添加更多类型
}

const LoadingText: React.FC<{ text: string; className?: string }> = ({
  className = "",
  text,
}) => (
  <ScrambleText
    text={text}
    replayKey={text}
    durationMs={860}
    intervalMs={34}
    className={`circular-font text-xs font-medium uppercase tracking-[0.32em] text-neutral-500 dark:text-neutral-400 ${className}`}
  />
);

const Skeleton: React.FC<SkeletonProps> = ({ type }) => {
  switch (type) {
    case "image":
      return (
        <div className="w-full h-full min-h-20 place-items-center flex items-center justify-center rounded-sm bg-transparent">
          <LoadingText text="LOADING IMAGE" />
        </div>
      );
    case "text":
      return (
        <div className="max-w-full">
          <LoadingText text="LOADING TEXT" />
        </div>
      );
    case "paragraph":
      return (
        <div className="w-full bg-transparent shadow-none">
          <div className="p-6 flex min-h-40 items-center justify-center">
            <LoadingText text="LOADING CONTENT" />
          </div>
        </div>
      );
    case "avatar":
    case "page":
      return (
        <div className="mt-6 w-full bg-transparent p-4 shadow-none">
          <div className="relative grid h-56 place-items-center rounded-sm">
            <LoadingText text="LOADING PAGE" />
          </div>
        </div>
      );
    case "video":
      return (
        <div className="grid h-full max-h-[300px] min-h-[160px] w-full max-w-xs place-items-center rounded-lg bg-transparent">
          <LoadingText text="LOADING VIDEO" />
        </div>
      );
  }
};

export default Skeleton;
