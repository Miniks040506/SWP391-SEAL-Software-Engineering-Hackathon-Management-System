import React from "react";
import { useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import type { EventCriteriaResponse } from "@/types/criteria.types";

interface BenchmarkScoreMatrixProps {
    criteria: EventCriteriaResponse[];
}

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

export const BenchmarkScoreMatrix = ({ criteria }: BenchmarkScoreMatrixProps) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    if (!criteria || criteria.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No criteria available for this round.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">Criterion</th>
                        <th className="w-32 px-4 py-3 font-bold text-slate-600 dark:text-slate-300">Category</th>
                        <th className="w-24 px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Weight</th>
                        <th className="w-48 px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">Benchmark Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {criteria.map((c) => {
                        const fieldName = `benchmarkScores.${c.id}`;
                        const error = (errors.benchmarkScores as any)?.[c.id];

                        return (
                            <tr key={c.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="px-4 py-4 align-middle">
                                    <div className="font-bold text-slate-900 dark:text-white">{c.effectiveName}</div>
                                    {c.effectiveDescription && (
                                        <div className="mt-1 max-w-md line-clamp-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {c.effectiveDescription}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-4 align-middle">
                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {c.templateCategory || "CUSTOM"}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right align-middle font-bold text-slate-600 dark:text-slate-300">
                                    {c.effectiveWeight}x
                                </td>
                                <td className="px-4 py-4 text-right align-middle">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <TextField
                                                size="small"
                                                type="number"
                                                sx={{ width: 90, ...textFieldSx }}
                                                error={!!error}
                                                {...register(fieldName, { valueAsNumber: true })}
                                            />
                                            <span className="font-bold text-slate-400 dark:text-slate-500">/ {c.effectiveMaxScore}</span>
                                        </div>
                                        {error && (
                                            <span className="text-xs font-bold text-rose-500">
                                                {error.message as string}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};