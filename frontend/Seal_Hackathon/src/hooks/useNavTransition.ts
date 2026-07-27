import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateOptions, To } from "react-router-dom";

export type SealNavIntent = "signin" | "launch" | "authswap" | "podium";
export type SealNavDirection = "forward" | "back";

type NavOrigin = {
  x: number;
  y: number;
};

const NAV_CLASSES = [
  "seal-nav-signin",
  "seal-nav-launch",
  "seal-nav-authswap",
  "seal-nav-podium",
  "seal-nav-back",
  "seal-nav-wide",
];

const NAV_DURATION: Record<SealNavIntent, number> = {
  signin: 600,
  launch: 680,
  authswap: 460,
  podium: 620,
};

let cleanupTimer: number | undefined;

const clearOnInterruption = () => clearNavIntent();

export function clearNavIntent() {
  const root = document.documentElement;

  if (cleanupTimer !== undefined) {
    window.clearTimeout(cleanupTimer);
    cleanupTimer = undefined;
  }

  window.removeEventListener("pointerdown", clearOnInterruption);
  window.removeEventListener("popstate", clearOnInterruption);
  root.classList.remove(...NAV_CLASSES);
  root.style.removeProperty("--seal-nav-x");
  root.style.removeProperty("--seal-nav-y");
}

export function stampNavIntent(
  intent: SealNavIntent,
  direction: SealNavDirection = "forward",
  origin?: NavOrigin,
) {
  const root = document.documentElement;

  if (root.classList.contains("theme-wave-transitioning")) {
    return false;
  }

  clearNavIntent();
  root.classList.add(`seal-nav-${intent}`);

  if (direction === "back") {
    root.classList.add("seal-nav-back");
  }

  if (origin) {
    root.style.setProperty("--seal-nav-x", `${origin.x}px`);
    root.style.setProperty("--seal-nav-y", `${origin.y}px`);
  }

  return true;
}

export function scheduleNavIntentCleanup(duration: number) {
  cleanupTimer = window.setTimeout(clearNavIntent, duration + 200);
  window.addEventListener("pointerdown", clearOnInterruption, { once: true });
  window.addEventListener("popstate", clearOnInterruption, { once: true });
}

export function useNavTransition() {
  const navigate = useNavigate();

  const navigateWithTransition = (
    path: To,
    intent: SealNavIntent,
    event?: MouseEvent<HTMLElement>,
    opts?: NavigateOptions,
  ) => {
    let origin: NavOrigin | undefined;

    if (event) {
      const bounds = event.currentTarget.getBoundingClientRect();
      origin =
        event.clientX || event.clientY
          ? { x: event.clientX, y: event.clientY }
          : {
              x: bounds.left + bounds.width / 2,
              y: bounds.top + bounds.height / 2,
            };
    }

    if (!stampNavIntent(intent, "forward", origin)) {
      navigate(path, opts);
      return;
    }

    navigate(path, { ...opts, viewTransition: true });
    scheduleNavIntentCleanup(NAV_DURATION[intent]);
  };

  return { navigateWithTransition };
}
