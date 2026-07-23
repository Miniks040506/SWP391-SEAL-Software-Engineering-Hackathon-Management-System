import { Tooltip } from "@mui/material";
import type { CriterionDistributionResponse } from "@/types/calibration.types";
import { VARIANCE_TIER_CONFIG } from "../../constants/calibrationUi";
import { formatScore, getVarianceTier } from "../../utils/format";

interface CriterionVarianceCardProps {
    data: CriterionDistributionResponse[];
}

/**
 * Horizontal std-dev bar list, sorted highest variance first.
 * Bars are normalized against the largest std-dev in the group (min 1.0 so a
 * lone tiny value doesn't render as a full bar).
 */
export const CriterionVarianceCard = ({ data }: CriterionVarianceCardProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No variance data available.
            </div>
        );
    }

    const sorted = [...data].sort(
        (a, b) => (b.standardDeviation ?? -1) - (a.standardDeviation ?? -1),
    );
    const scaleMax = Math.max(
        1,
        ...sorted.map((d) => d.standardDeviation ?? 0),
    );

    return (
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Variance by Criterion</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Standard deviation of judge scores — lower means stronger consensus.
                </p>
            </div>

            <ul className="flex flex-col gap-4">
                {sorted.map((criterion, index) => {
                    const tier = getVarianceTier(criterion.standardDeviation);
                    const config = VARIANCE_TIER_CONFIG[tier];
                    const pct =
                        criterion.standardDeviation != null
                            ? Math.max(4, Math.round((criterion.standardDeviation / scaleMax) * 100))
                            : 0;

                    return (
                        <li key={criterion.eventCriteriaId}>
                            <div className="flex items-baseline justify-between gap-3">
                                <Tooltip title={criterion.criteriaName} placement="top-start">
                                    <span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {criterion.criteriaName}
                                    </span>
                                </Tooltip>
                                <span className={`shrink-0 text-sm font-black tabular-nums ${config.text}`}>
                                    σ {formatScore(criterion.standardDeviation, 2)}
                                </span>
                            </div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className={`calib-bar-grow h-full rounded-full ${config.bar}`}
                                    style={{ width: `${pct}%`, "--calib-stagger": index } as React.CSSProperties}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low &lt; 1.0
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium &lt; 2.0
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> High ≥ 2.0
                </span>
            </div>
        </div>
    );
};
