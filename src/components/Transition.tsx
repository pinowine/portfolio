import React, { ReactNode, useRef } from "react";
import { SwitchTransition, Transition } from "react-transition-group";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

import { useTransition } from "../hooks/useTransition";
import { useTransitionDirection } from "../hooks/useTransitionDirection";

interface TransitionComponentProps {
  children: ReactNode;
}

const TransitionComponent: React.FC<TransitionComponentProps> = ({
  children,
}) => {
  const { toggleCompleted } = useTransition();
  const { direction } = useTransitionDirection();
  const location = useLocation();

  const nodeRef = useRef<HTMLDivElement>(null); // Using ref to avoid findDOMNode

  return (
    <SwitchTransition>
      <Transition
        key={location.pathname}
        timeout={500}
        nodeRef={nodeRef} // Pass ref to Transition
        onEnter={() => {
          const node = nodeRef.current;
          if (!node) return;
          toggleCompleted(false);
          gsap.set(node, { autoAlpha: 0, xPercent: -100 * direction });
          gsap
            .timeline({
              paused: true,
              onComplete: () => toggleCompleted(true),
            })
            .to(node, { autoAlpha: 1, xPercent: 0, duration: 0.25 })
            .to(node, { duration: 0.25 })
            .play();
        }}
        onExit={() => {
          const node = nodeRef.current;
          if (!node) return;
          gsap
            .timeline({ paused: true })
            .to(node, { duration: 0.2 })
            .to(node, {
              xPercent: 100 * direction,
              autoAlpha: 0,
              duration: 0.2,
            })
            .play();
        }}
      >
        <div ref={nodeRef}>{children}</div>
      </Transition>
    </SwitchTransition>
  );
};

export default TransitionComponent;
