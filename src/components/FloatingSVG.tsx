import { useRive } from "@rive-app/react-canvas";
import Skeleton from "./Skeleton";
import { Suspense, useState } from "react";

interface FloatingSVGProps {
  suffix: string;
}

const FloatingSVG: React.FC<FloatingSVGProps> = ({ suffix }) => {
  const [isRiveLoaded, setIsRiveLoaded] = useState(false);
  const { RiveComponent } = useRive({
    src: `${process.env.NODE_ENV === "production" ? "/" : "/"}rive/portfolio-${suffix}.riv`,
    stateMachines: ["State Machine 1"],
    autoplay: true,
    onLoad: () => setIsRiveLoaded(true),
    isTouchScrollEnabled: true,
  });

  return (
    <div className="w-full h-full z-0" id={`rive-home-${suffix}`}>
      {!isRiveLoaded && <Skeleton type="image" />}
      <Suspense fallback={<Skeleton type="image" />}>
        <RiveComponent />
      </Suspense>
    </div>
  );
};

export default FloatingSVG;
