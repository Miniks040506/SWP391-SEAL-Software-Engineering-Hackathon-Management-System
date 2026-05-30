import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import "./theme-transition.css";

export function ThemeTransitionLayer() {
  const transition = useThemeStore((state) => state.transition);
  const clearTransition = useThemeStore((state) => state.clearTransition);

  useEffect(() => {
    if (!transition) return;

    const timeout = window.setTimeout(() => {
      clearTransition();
    }, 1100);

    return () => window.clearTimeout(timeout);
  }, [transition, clearTransition]);

  if (!transition) return null;

  return (
    <div
      key={transition.id}
      className={[
        "theme-water-layer",
        transition.nextTheme === "dark"
          ? "theme-water-to-dark"
          : "theme-water-to-light",
      ].join(" ")}
    >
      <div className="theme-water-fill" />
      <div className="theme-water-front" />
      <div className="theme-water-foam theme-water-foam-one" />
      <div className="theme-water-foam theme-water-foam-two" />
      <div className="theme-water-bubbles" />
    </div>
  );
}