import { useRive } from "@rive-app/react-canvas";

interface FloatingSVGProps {
  suffix: string;
}

const FloatingSVG: React.FC<FloatingSVGProps> = ({ suffix }) => {
  const { RiveComponent } = useRive({
    src: `src/assets/rive/portfolio-${suffix}.riv`,
    stateMachines: ["State Machine 1"],
    autoplay: true,
  });

  return (
    <div className="w-full h-full z-0" id={`rive-home-${suffix}`}>
      <RiveComponent />
    </div>
  );
};

export default FloatingSVG;
