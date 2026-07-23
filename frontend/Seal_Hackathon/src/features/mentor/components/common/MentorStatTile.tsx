import type { CSSProperties, ReactNode } from "react";

import { useCountUp } from "../../hooks/useCountUp";

export type MentorStatTileAccent = "blue" | "indigo" | "emerald" | "amber" | "rose";

type MentorStatTileProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  accent: MentorStatTileAccent;
  stagger?: number;
};

const ACCENT_CLASSES: Record<MentorStatTileAccent, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

/**
 * Animated stat tile: count-up value + accent-tinted icon chip.
 * Shared across the mentor dashboard and team-detail overview band.
 */
export const MentorStatTile = ({
  title,
  value,
  description,
  icon,
  accent,
  stagger = 0,
}: MentorStatTileProps) => {
  const animatedValue = useCountUp(value);

  return (
    <div
      className="mt-fade-up mt-lift rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--mt-stagger": stagger } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums text-slate-950 dark:text-white">
            {Math.round(animatedValue)}
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            {description}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 ${ACCENT_CLASSES[accent]}`}>{icon}</div>
      </div>
    </div>
  );
};
