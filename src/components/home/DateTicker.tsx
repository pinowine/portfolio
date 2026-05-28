import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface DateTickerProps {
  direction: number;
  value: string;
  visible: boolean;
}

const DateTicker = memo(({ direction, value, visible }: DateTickerProps) => {
  const currentValueRef = useRef(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const previousCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nextCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stableCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [transition, setTransition] = useState({
    current: value,
    direction,
    previous: value,
    sequence: 0,
  });

  useEffect(() => {
    if (value === currentValueRef.current) return;

    const previous = currentValueRef.current;
    currentValueRef.current = value;
    setTransition((state) => ({
      current: value,
      direction,
      previous,
      sequence: state.sequence + 1,
    }));
  }, [direction, value]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.to(root, {
      autoAlpha: visible ? 1 : 0,
      duration: visible ? 0.28 : 0.18,
      ease: visible ? "power2.out" : "power2.in",
      overwrite: true,
      y: visible ? 0 : 10,
    });
  }, [visible]);

  useLayoutEffect(() => {
    const directionValue = transition.direction >= 0 ? 1 : -1;
    const slotCount = Math.max(
      transition.previous.length,
      transition.current.length
    );

    stableCharRefs.current.forEach((char) => {
      if (!char) return;
      gsap.set(char, {
        autoAlpha: 1,
        filter: "blur(0px)",
        rotateX: 0,
        yPercent: 0,
      });
    });

    if (transition.sequence === 0) {
      nextCharRefs.current.forEach((char) => {
        if (!char) return;
        gsap.set(char, {
          autoAlpha: 1,
          filter: "blur(0px)",
          rotateX: 0,
          yPercent: 0,
        });
      });
      return;
    }

    let changedOrder = 0;
    for (let index = 0; index < slotCount; index += 1) {
      const previousChar = transition.previous[index] ?? "";
      const nextChar = transition.current[index] ?? "";
      if (previousChar === nextChar) continue;

      const previousNode = previousCharRefs.current[index];
      const nextNode = nextCharRefs.current[index];
      const delay = changedOrder * 0.045 + index * 0.012;
      changedOrder += 1;

      if (previousNode) {
        gsap.fromTo(
          previousNode,
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            rotateX: 0,
            yPercent: 0,
          },
          {
            autoAlpha: 0,
            delay,
            duration: 0.34,
            ease: "power3.in",
            filter: "blur(4px)",
            force3D: true,
            overwrite: true,
            rotateX: -10 * directionValue,
            yPercent: -95 * directionValue,
          }
        );
      }

      if (nextNode) {
        gsap.fromTo(
          nextNode,
          {
            autoAlpha: 0,
            filter: "blur(5px)",
            rotateX: 14 * directionValue,
            yPercent: 115 * directionValue,
          },
          {
            autoAlpha: 1,
            delay: delay + 0.035,
            duration: 0.56,
            ease: "expo.out",
            filter: "blur(0px)",
            force3D: true,
            overwrite: true,
            rotateX: 0,
            yPercent: 0,
          }
        );
      }
    }
  }, [transition]);

  const slotCount = Math.max(
    transition.previous.length,
    transition.current.length
  );

  return (
    <div
      ref={rootRef}
      className="fixed left-8 top-[40vh] z-10 w-[160px] lg:w-[200px] overflow-visible text-neutral-400 dark:text-neutral-200 mix-blend-difference pointer-events-none invisible"
    >
      <h1
        className="circular-font relative font-medium mb-0 text-3xl md:text-4xl lg:text-5xl leading-none"
        aria-label={transition.current}
      >
        <span
          className="inline-flex h-[1.05em] overflow-visible transform-gpu"
          aria-hidden="true"
          style={{
            fontVariantNumeric: "tabular-nums",
            perspective: "480px",
          }}
        >
          {Array.from({ length: slotCount }, (_, index) => {
            const previousChar = transition.previous[index] ?? "";
            const nextChar = transition.current[index] ?? "";
            const hasChanged = previousChar !== nextChar;
            const slotWidth =
              previousChar === "/" || nextChar === "/" ? "0.6em" : "0.55em";

            return (
              <span
                key={index}
                className="relative inline-block h-[1.05em] overflow-hidden align-top"
                style={{ paddingInline: "0.02em", width: slotWidth }}
              >
                {hasChanged ? (
                  <>
                    <span
                      ref={(node) => {
                        previousCharRefs.current[index] = node;
                      }}
                      className="absolute inset-0 inline-flex items-center justify-center will-change-transform"
                    >
                      {previousChar}
                    </span>
                    <span
                      ref={(node) => {
                        nextCharRefs.current[index] = node;
                      }}
                      className="absolute inset-0 inline-flex items-center justify-center will-change-transform"
                    >
                      {nextChar}
                    </span>
                  </>
                ) : (
                  <span
                    ref={(node) => {
                      stableCharRefs.current[index] = node;
                    }}
                    className="absolute inset-0 inline-flex items-center justify-center"
                  >
                    {nextChar}
                  </span>
                )}
              </span>
            );
          })}
        </span>
      </h1>
    </div>
  );
});

DateTicker.displayName = "DateTicker";

export default DateTicker;
