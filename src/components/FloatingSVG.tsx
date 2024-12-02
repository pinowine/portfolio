import { useRive } from "@rive-app/react-canvas";
import Skeleton from "./Skeleton";
import { Suspense } from "react";

interface FloatingSVGProps {
  suffix: string;
}

const FloatingSVG: React.FC<FloatingSVGProps> = ({ suffix }) => {
  const { RiveComponent } = useRive({
    src: `${process.env.NODE_ENV === "production" ? "/" : "/"}assets/rive/portfolio-${suffix}.riv`,
    stateMachines: ["State Machine 1"],
    autoplay: true,
  });

  return (
    <div className="w-full h-full z-0" id={`rive-home-${suffix}`}>
      <Suspense fallback={<Skeleton type="image" />}>
        <RiveComponent />
      </Suspense>
    </div>
  );
};

export default FloatingSVG;
