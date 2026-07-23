import type { CSSProperties } from "react";

interface StatusSegmentBarProps {
    pending: number;
    draft: number;
    submitted: number;
    locked: number;
    size?: "sm" | "lg";
    showLegend?: boolean;
    stagger?: number;
}

/**
 * Fill segments ordered by completion stage (most final first) so the bar
 * reads as a single fill growing left → right — a progress bar, not a
 * side-by-side comparison chart. Pending is simply the unfilled track.
 */
const FILL_SEGMENTS = [
    { key: "locked", label: "Locked", barClass: "bg-violet-500", dotClass: "bg-violet-500" },
    { key: "submitted", label: "Submitted", barClass: "bg-emerald-500", dotClass: "bg-emerald-500" },
    { key: "draft", label: "Draft", barClass: "bg-blue-400", dotClass: "bg-blue-400" },
] as const;

export const StatusSegmentBar = ({
    pending,
    draft,
    submitted,
    locked,
    size = "lg",
    showLegend = true,
    stagger = 0,
}: StatusSegmentBarProps) => {
    const counts = { draft, submitted, locked };
    const total = pending + draft + submitted + locked;
    const filled = draft + submitted + locked;
    const fillPercent = total > 0 ? (filled / total) * 100 : 0;
    const heightClass = size === "lg" ? "h-3.5" : "h-2";

    const legendItems = [
        ...FILL_SEGMENTS.map(({ key, label, dotClass }) => ({
            label,
            count: counts[key],
            dotClass,
        })),
        { label: "Pending", count: pending, dotClass: "bg-slate-300 dark:bg-slate-600" },
    ];

    return (
        <div className={size === "lg" ? "space-y-3" : "space-y-1.5"}>
            <div
                className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${heightClass}`}
                role="img"
                aria-label={`Grading progress: ${locked} locked, ${submitted} submitted, ${draft} draft, ${pending} pending`}
            >
                {filled > 0 && (
                    <div
                        className="gp-bar-grow flex h-full overflow-hidden rounded-r-full"
                        style={
                            {
                                width: `${fillPercent}%`,
                                "--gp-stagger": stagger,
                            } as CSSProperties
                        }
                    >
                        {FILL_SEGMENTS.map(({ key, barClass }) =>
                            counts[key] > 0 ? (
                                <div
                                    key={key}
                                    className={`h-full ${barClass}`}
                                    style={{ width: `${(counts[key] / filled) * 100}%` }}
                                />
                            ) : null,
                        )}
                    </div>
                )}
            </div>
            {showLegend && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {legendItems.map(({ label, count, dotClass }) => {
                        const isZero = count === 0;
                        return (
                            <span
                                key={label}
                                className={`inline-flex items-center gap-1.5 text-xs font-bold tabular-nums ${
                                    isZero
                                        ? "text-slate-400 dark:text-slate-500"
                                        : "text-slate-700 dark:text-slate-200"
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${isZero ? "bg-slate-200 dark:bg-slate-700" : dotClass}`}
                                />
                                {label} · {count}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
