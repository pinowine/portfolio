import { CSSProperties, useEffect, useMemo, useState } from "react";

type ScrambleElement = "span" | "strong" | "p" | "h1" | "h2" | "h3" | "h4" | "div";

interface ScrambleTextProps {
  as?: ScrambleElement;
  className?: string;
  durationMs?: number;
  intervalMs?: number;
  replayKey?: string | number;
  style?: CSSProperties;
  text: string;
}

const SCRAMBLE_RANGES: Array<[number, number]> = [
  [0x0030, 0x007a],
  [0x0370, 0x03ff],
  [0x0400, 0x04ff],
  [0x2200, 0x22ff],
  [0x3040, 0x30ff],
  [0x4e00, 0x9fff],
];

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomScrambleChar = () => {
  const [start, end] =
    SCRAMBLE_RANGES[randomBetween(0, SCRAMBLE_RANGES.length - 1)];

  return String.fromCodePoint(randomBetween(start, end));
};

const isFixedChar = (char: string) => /\s/.test(char);

const shuffleIndexes = (indexes: number[]) => {
  const shuffled = [...indexes];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomBetween(0, index);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const shouldReduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const ScrambleText = ({
  as: Tag = "span",
  className,
  durationMs = 560,
  intervalMs = 32,
  replayKey,
  style,
  text,
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (!characters.length || durationMs <= 0 || shouldReduceMotion()) {
      setDisplayText(text);
      return;
    }

    const animatedIndexes = characters
      .map((char, index) => (isFixedChar(char) ? -1 : index))
      .filter((index) => index >= 0);
    const revealOrder = shuffleIndexes(animatedIndexes);
    const revealPosition = new Map(
      revealOrder.map((index, position) => [index, position])
    );
    const start = performance.now();

    const renderFrame = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / durationMs);
      const revealedCount = Math.floor(progress * (revealOrder.length + 1));

      setDisplayText(
        characters
          .map((char, index) => {
            const position = revealPosition.get(index);

            if (position === undefined || position < revealedCount) {
              return char;
            }

            return randomScrambleChar();
          })
          .join("")
      );

      return progress >= 1;
    };

    renderFrame();

    const intervalId = window.setInterval(() => {
      if (renderFrame()) {
        window.clearInterval(intervalId);
        setDisplayText(text);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [characters, durationMs, intervalMs, replayKey, text]);

  return (
    <Tag aria-label={text} className={className} style={style}>
      <span aria-hidden="true">{displayText}</span>
    </Tag>
  );
};

export default ScrambleText;
