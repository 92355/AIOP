"use client";

import { useEffect, useMemo, useState } from "react";

type FlipNumberProps = {
  value: number | string;
  className?: string;
};

function toNumericValue(value: number | string): number | null {
  if (typeof value === "number") return value;
  const normalized = value.replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function FlipNumber({ value, className }: FlipNumberProps) {
  const renderedValue = useMemo(() => String(value), [value]);
  const [previousValue, setPreviousValue] = useState(renderedValue);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (renderedValue === previousValue) return;

    const prevNumericValue = toNumericValue(previousValue);
    const nextNumericValue = toNumericValue(renderedValue);
    if (prevNumericValue !== null && nextNumericValue !== null) {
      setDirection(nextNumericValue >= prevNumericValue ? "up" : "down");
    }

    setPreviousValue(renderedValue);
    setIsAnimating(true);
    const timer = window.setTimeout(() => setIsAnimating(false), 240);
    return () => window.clearTimeout(timer);
  }, [previousValue, renderedValue]);

  const animationClassName = isAnimating
    ? direction === "up"
      ? "animate-number-flip-up"
      : "animate-number-flip-down"
    : "";

  return <span className={`${animationClassName} ${className ?? ""}`.trim()}>{renderedValue}</span>;
}

