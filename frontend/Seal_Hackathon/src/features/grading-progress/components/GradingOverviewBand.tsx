import type { CSSProperties } from "react";
import { GradingProgressRing } from "./GradingProgressRing";
import { StatusSegmentBar } from "./StatusSegmentBar";

export interface OverviewTile {
    label: string;
    value: string;
    hint?: string;
}

interface GradingOverviewBandProps {
    percent: number;
    completed: number;
    total: number;
    pending: number;
    draft: number;
    submitted: number;
    locked: number;
    tiles: OverviewTile[];
}

/**
 * Overview band replacing the old six equal-weight KPI cards:
 * progress ring on the left, status distribution bar + compact stat tiles
 * on the right. One glance = overall state.
 */
export const GradingOverviewBand = ({
    percent,
    completed,
    total,
    pending,
    draft,
    submitted,
    locked,
    tiles,
}: GradingOverviewBandProps) => {
    return (
        <section
            className="gp-fade-up rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700 dark:bg-slate-900"
            style={{ "--gp-stagger": 1 } as CSSProperties}
            aria-label="Grading overview"
        >
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
                <GradingProgressRing percent={percent} completed={completed} total={total} />

                <div className="w-full min-w-0 flex-1 space-y-6">
                    <div>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Grading pipeline
                        </h2>
                        <StatusSegmentBar
                            pending={pending}
                            draft={draft}
                            submitted={submitted}
                            locked={locked}
                            size="lg"
                            stagger={1}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                        {tiles.map((tile) => (
                            <div
                                key={tile.label}
                                className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                            >
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {tile.label}
                                </p>
                                <p className="mt-0.5 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                                    {tile.value}
                                </p>
                                {tile.hint && (
                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                        {tile.hint}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
