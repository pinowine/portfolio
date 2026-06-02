import React, { ReactNode, useRef } from "react";
import { SwitchTransition, Transition } from "react-transition-group";
import { useLocation } from "react-router-dom";
import { useTransition } from "../hooks/useTransition";

interface TransitionComponentProps {
  children: ReactNode;
}

const TransitionComponent: React.FC<TransitionComponentProps> = ({
  children,
}) => {
  const { toggleCompleted } = useTransition();
  const location = useLocation();

  const nodeRef = useRef<HTMLDivElement>(null); // Using ref to avoid findDOMNode

  return (
    <SwitchTransition>
      <Transition
        key={location.pathname}
        timeout={0}
        nodeRef={nodeRef} // Pass ref to Transition
        onEnter={() => {
          const node = nodeRef.current;
          if (!node) return;
          toggleCompleted(false);
          node.style.removeProperty("opacity");
          node.style.removeProperty("visibility");
          node.style.removeProperty("filter");
          node.style.removeProperty("transform");
          toggleCompleted(true);
        }}
        onExit={() => {
          const node = nodeRef.current;
          if (!node) return;
          node.style.removeProperty("opacity");
          node.style.removeProperty("visibility");
          node.style.removeProperty("filter");
          node.style.removeProperty("transform");
        }}
      >
        <div ref={nodeRef}>{children}</div>
      </Transition>
    </SwitchTransition>
  );
};

export default TransitionComponent;
