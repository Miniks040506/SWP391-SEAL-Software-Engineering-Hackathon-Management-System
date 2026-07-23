import type { CSSProperties, ReactNode } from "react";

import { useCountUp } from "../../hooks/useCountUp";

export type JudgeStatTileAccent = "blue" | "indigo" | "emerald" | "amber" | "rose";

type JudgeStatTileProps = {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  accent: JudgeStatTileAccent;
  stagger?: number;
};

const ACCENT_CLASSES: Record<JudgeStatTileAccent, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

const NumericValue = ({ value }: { value: number }) => {
  const animatedValue = useCountUp(value);
  return <>{Math.round(animatedValue)}</>;
};

/**
 * Animated stat tile: count-up value (numbers) or plain text (strings)
 * + accent-tinted icon chip. Shared across the judge dashboard and
 * submissions queue band.
 */
export const JudgeStatTile = ({
  title,
  value,
  description,
  icon,
  accent,
  stagger = 0,
}: JudgeStatTileProps) => {
  return (
    <div
      className="jd-fade-up jd-lift rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--jd-stagger": stagger } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p
            className={`mt-2 font-black tabular-nums text-slate-950 dark:text-white ${
              typeof value === "number" ? "text-3xl" : "text-lg leading-snug"
            }`}
          >
            {typeof value === "number" ? <NumericValue value={value} /> : value}
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            {description}
          </p>
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${ACCENT_CLASSES[accent]}`}>{icon}</div>
      </div>
    </div>
  );
};
