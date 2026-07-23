import type { ReactNode } from "react";

import { useCountUp } from "../../hooks/useCountUp";

type JudgeProgressRingProps = {
  percent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: ReactNode;
};

/**
 * Animated SVG progress ring. The sweep and the centered label share the
 * same eased value from useCountUp, so they stay in sync and both respect
 * prefers-reduced-motion.
 */
export const JudgeProgressRing = ({
  percent,
  size = 96,
  strokeWidth = 8,
  label,
}: JudgeProgressRingProps) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const animated = useCountUp(clamped, 900);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animated / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`Progress ${Math.round(clamped)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-blue-600 dark:stroke-blue-400"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {label ?? (
          <span className="text-xl font-black tabular-nums text-slate-950 dark:text-white">
            {Math.round(animated)}%
          </span>
        )}
      </div>
    </div>
  );
};
