import type { CalibrationLifecycle, VarianceTier } from "../utils/format";

/**
 * Design tokens for the Calibration workspace.
 * Identity: emerald → teal (benchmark), judge data stays canonical blue,
 * amber = pending / draft, rose = high variance.
 */
export const CALIB = {
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-400",
    gradientText: "bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent",
    glow: "shadow-lg shadow-emerald-500/30",
    eyebrow: "text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400",
    softSurface: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/10",
} as const;

type LifecycleConfig = {
    label: string;
    /** Pill classes (border / bg / text). */
    pill: string;
    /** Solid dot color inside the pill. */
    dot: string;
    /** Whether the dot should pulse (LIVE only). */
    pulse: boolean;
};

export const LIFECYCLE_CONFIG: Record<CalibrationLifecycle, LifecycleConfig> = {
    DRAFT: {
        label: "Draft",
        pill: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        dot: "bg-slate-400",
        pulse: false,
    },
    UPCOMING: {
        label: "Upcoming",
        pill: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
        dot: "bg-sky-500",
        pulse: false,
    },
    LIVE: {
        label: "Live",
        pill: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
        dot: "bg-emerald-500",
        pulse: true,
    },
    ENDED: {
        label: "Ended",
        pill: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400",
        dot: "bg-slate-400",
        pulse: false,
    },
    PUBLISHED: {
        label: "Published",
        pill: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
        dot: "bg-blue-500",
        pulse: false,
    },
};

type TierConfig = {
    label: string;
    /** Hex used for chart fills. */
    hex: string;
    /** Bar fill classes. */
    bar: string;
    /** Text color classes. */
    text: string;
    /** Chip classes. */
    chip: string;
};

export const VARIANCE_TIER_CONFIG: Record<VarianceTier, TierConfig> = {
    low: {
        label: "Low",
        hex: "#10b981",
        bar: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        chip: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    medium: {
        label: "Medium",
        hex: "#f59e0b",
        bar: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        chip: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    },
    high: {
        label: "High",
        hex: "#f43f5e",
        bar: "bg-rose-500",
        text: "text-rose-600 dark:text-rose-400",
        chip: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    },
    none: {
        label: "N/A",
        hex: "#cbd5e1",
        bar: "bg-slate-300 dark:bg-slate-600",
        text: "text-slate-400 dark:text-slate-500",
        chip: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
    },
};

/** Chart series colors — benchmark = emerald identity, judge = canonical blue. */
export const CHART_COLORS = {
    benchmark: "#10b981",
    judge: "#3b82f6",
    grid: "#e2e8f0",
    gridDark: "#334155",
    tick: "#64748b",
} as const;
