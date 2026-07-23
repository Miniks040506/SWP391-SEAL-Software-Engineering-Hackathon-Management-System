import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * rAF-driven count-up toward `target` with ease-out cubic.
 * Respects prefers-reduced-motion by jumping straight to the final value.
 * Animates from the currently displayed value, so interrupted or re-run
 * effects (StrictMode) resume instead of freezing.
 */
export function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  const valueRef = useRef(value);

  useEffect(() => {
    if (valueRef.current === target) {
      return;
    }

    if (prefersReducedMotion()) {
      const frame = requestAnimationFrame(() => {
        valueRef.current = target;
        setValue(target);
      });
      return () => cancelAnimationFrame(frame);
    }

    const from = valueRef.current;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      valueRef.current = next;
      setValue(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
