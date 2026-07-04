import type { CriterionDistributionResponse } from "@/types/calibration.types";
import { Chip } from "@mui/material";

interface CalibrationDistributionTableProps {
    data: CriterionDistributionResponse[];
}

const getVarianceBadge = (stdDev: number | null | undefined) => {
    if (stdDev === null || stdDev === undefined) {
        return <span className="text-slate-400">N/A</span>;
    }
    
    if (stdDev < 1.0) {
        return <Chip label="Low" size="small" color="success" sx={{ fontWeight: 700, borderRadius: "6px" }} />;
    } else if (stdDev < 2.0) {
        return <Chip label="Medium" size="small" color="warning" sx={{ fontWeight: 700, borderRadius: "6px" }} />;
    } else {
        return <Chip label="High" size="small" color="error" sx={{ fontWeight: 700, borderRadius: "6px" }} />;
    }
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
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">Criterion</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Benchmark</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Mean</th>
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
                                <td className="px-4 py-4 align-middle font-bold text-slate-900 dark:text-slate-200">
                                    {row.criteriaName}
                                </td>
                                <td className="px-4 py-4 text-right align-middle font-medium text-emerald-600 dark:text-emerald-400">
                                    {row.benchmarkScore ?? "-"}
                                </td>
                                <td className="px-4 py-4 text-right align-middle font-medium text-blue-600 dark:text-blue-400">
                                    {row.mean?.toFixed(1) ?? "-"}
                                </td>
                                <td className="px-4 py-4 text-right align-middle text-slate-600 dark:text-slate-400">
                                    {row.min ?? "-"}
                                </td>
                                <td className="px-4 py-4 text-right align-middle text-slate-600 dark:text-slate-400">
                                    {row.max ?? "-"}
                                </td>
                                <td className="px-4 py-4 text-right align-middle text-slate-600 dark:text-slate-400">
                                    {row.standardDeviation?.toFixed(2) ?? "-"}
                                </td>
                                <td className="px-4 py-4 text-right align-middle text-slate-600 dark:text-slate-400">
                                    {row.judgeCount}
                                </td>
                                <td className="px-4 py-4 text-center align-middle">
                                    {getVarianceBadge(row.standardDeviation)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
