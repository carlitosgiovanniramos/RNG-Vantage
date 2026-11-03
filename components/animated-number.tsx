"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  format?: "currency" | "number";
  duration?: number;
  className?: string;
};

const FORMATTERS = {
  currency: new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }),
  number: new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 }),
};

/**
 * Cuenta desde el valor anterior hasta `value` con easing.
 * Respeta prefers-reduced-motion (salta directo al valor final).
 */
export function AnimatedNumber({
  value,
  format = "number",
  duration = 1200,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = currentRef.current;
    const total = reduceMotion ? 0 : duration;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = total === 0 ? 1 : Math.min((now - start) / total, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;
      currentRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  const shown = format === "number" ? Math.round(display) : display;

  return (
    <span className={className} aria-label={FORMATTERS[format].format(value)}>
      {FORMATTERS[format].format(shown)}
    </span>
  );
}
