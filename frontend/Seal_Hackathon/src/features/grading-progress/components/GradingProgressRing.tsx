import { useId } from "react";
import { useCountUp } from "../hooks/useCountUp";
import {
    formatProgressPercent,
    normalizeProgressPercent,
} from "../utils/gradingProgressFormat";

interface GradingProgressRingProps {
    percent: number;
    completed: number;
    total: number;
    caption?: string;
}

const SIZE = 176;
const STROKE = 13;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Large SVG radial ring with an animated fill + count-up percentage.
 * Dependency-free: the count-up hook drives stroke-dashoffset directly,
 * so reduced-motion users get the final value instantly.
 */
export const GradingProgressRing = ({
    percent,
    completed,
    total,
    caption = "submissions graded",
}: GradingProgressRingProps) => {
    const gradientId = useId();
    const normalized = normalizeProgressPercent(percent);
    const animated = useCountUp(normalized, 900);
    const dashOffset = CIRCUMFERENCE * (1 - animated / 100);

    return (
        <div
            className="relative flex shrink-0 items-center justify-center"
            role="img"
            aria-label={`Grading progress ${formatProgressPercent(normalized)}%: ${completed} of ${total} assigned submissions graded`}
        >
            <svg width={SIZE} height={SIZE} className="-rotate-90">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                </defs>
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    className="stroke-slate-200/80 dark:stroke-slate-700/70"
                />
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    stroke={`url(#${gradientId})`}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black tabular-nums text-slate-900 dark:text-white">
                    {formatProgressPercent(animated)}
                    <span className="text-xl font-extrabold text-slate-400 dark:text-slate-500">%</span>
                </span>
                <span className="mt-1 text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
                    {completed} / {total}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {caption}
                </span>
            </div>
        </div>
    );
};
