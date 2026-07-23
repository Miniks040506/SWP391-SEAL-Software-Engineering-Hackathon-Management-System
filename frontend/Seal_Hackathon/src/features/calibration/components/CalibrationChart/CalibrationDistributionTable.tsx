import type { CriterionDistributionResponse } from "@/types/calibration.types";
import { VARIANCE_TIER_CONFIG } from "../../constants/calibrationUi";
import { formatScore, getVarianceTier } from "../../utils/format";

interface CalibrationDistributionTableProps {
    data: CriterionDistributionResponse[];
}

const VarianceChip = ({ stdDev }: { stdDev: number | null | undefined }) => {
    const tier = getVarianceTier(stdDev);
    if (tier === "none") {
        return <span className="text-slate-400">—</span>;
    }
    const config = VARIANCE_TIER_CONFIG[tier];
    return (
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${config.chip}`}>
            {config.label}
        </span>
    );
};

export const CalibrationDistributionTable = ({ data }: CalibrationDistributionTableProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No data available.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                        <tr>
                            <th className="sticky left-0 bg-slate-50 px-4 py-3 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                Criterion
                            </th>
                            <th className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">Benchmark</th>
                            <th className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">Mean</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Min</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Max</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Std Dev</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Judges</th>
                            <th className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-300">Variance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row) => (
                            <tr key={row.eventCriteriaId} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="sticky left-0 bg-white px-4 py-4 align-middle font-bold text-slate-900 dark:bg-slate-900 dark:text-slate-200">
                                    {row.criteriaName}
                                </td>
                                <td className="px-4 py-4 text-right align-middle font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                    {formatScore(row.benchmarkScore)}
                                </td>
                                <td className="px-4 py-4 text-right align-middle font-bold tabular-nums text-blue-600 dark:text-blue-400">
                                    {formatScore(row.mean)}
                                </td>
                                <td className="px-4 py-4 text-right align-middle tabular-nums text-slate-600 dark:text-slate-400">
                                    {formatScore(row.min)}
                                </td>
                                <td className="px-4 py-4 text-right align-middle tabular-nums text-slate-600 dark:text-slate-400">
                                    {formatScore(row.max)}
                                </td>
                                <td className="px-4 py-4 text-right align-middle tabular-nums text-slate-600 dark:text-slate-400">
                                    {formatScore(row.standardDeviation, 2)}
                                </td>
                                <td className="px-4 py-4 text-right align-middle tabular-nums text-slate-600 dark:text-slate-400">
                                    {row.judgeCount}
                                </td>
                                <td className="px-4 py-4 text-center align-middle">
                                    <VarianceChip stdDev={row.standardDeviation} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
