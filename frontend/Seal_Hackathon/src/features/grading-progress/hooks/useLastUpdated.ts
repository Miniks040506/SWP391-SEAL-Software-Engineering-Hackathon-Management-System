import { useEffect, useState } from "react";

function toLabel(dataUpdatedAt: number) {
  if (!dataUpdatedAt) return "";
  const seconds = Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/**
 * Ticking "updated Xs ago" label derived from a TanStack Query `dataUpdatedAt`.
 * The label is computed during render; an interval only forces a re-render
 * every 5s so the relative time stays fresh.
 */
export function useLastUpdated(dataUpdatedAt: number) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => forceTick((tick) => tick + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  return toLabel(dataUpdatedAt);
}
