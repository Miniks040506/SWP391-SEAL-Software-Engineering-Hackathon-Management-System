import { useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import { formatScore } from "../../utils/format";

interface BenchmarkScoreMatrixProps {
    criteria: EventCriteriaResponse[];
    disabled?: boolean;
}

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

export const BenchmarkScoreMatrix = ({ criteria, disabled }: BenchmarkScoreMatrixProps) => {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext();

    if (!criteria || criteria.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No criteria available for this round.
            </div>
        );
    }

    const scores = (watch("benchmarkScores") ?? {}) as Record<string, number>;

    return (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
            {criteria.map((criterion) => {
                const fieldName = `benchmarkScores.${criterion.id}`;
                const error = (
                    errors.benchmarkScores as
                        | Record<string, { message?: string } | undefined>
                        | undefined
                )?.[criterion.id];
                const rawValue = scores[criterion.id];
                const value = typeof rawValue === "number" && !Number.isNaN(rawValue) ? rawValue : null;
                const pct =
                    value !== null && criterion.effectiveMaxScore > 0
                        ? Math.min(100, Math.max(0, (value / criterion.effectiveMaxScore) * 100))
                        : 0;

                return (
                    <li key={criterion.id} className="flex items-center gap-6 px-5 py-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {criterion.effectiveName}
                                </span>
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    {criterion.templateCategory || "CUSTOM"}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                    ×{formatScore(criterion.effectiveWeight)}
                                </span>
                            </div>
                            {criterion.effectiveDescription && (
                                <p className="mt-1 line-clamp-1 max-w-xl text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {criterion.effectiveDescription}
                                </p>
                            )}
                            {/* Realtime score preview bar */}
                            <div className="mt-2.5 h-1.5 max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-300 ease-out"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            {error && (
                                <p className="mt-1.5 text-xs font-bold text-rose-500">
                                    {error.message as string}
                                </p>
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <TextField
                                size="small"
                                type="number"
                                disabled={disabled}
                                slotProps={{
                                    htmlInput: {
                                        step: 0.5,
                                        min: 0,
                                        max: criterion.effectiveMaxScore,
                                        "aria-label": `Benchmark score for ${criterion.effectiveName}`,
                                    },
                                }}
                                sx={{ width: 92, ...textFieldSx }}
                                error={!!error}
                                {...register(fieldName, { valueAsNumber: true })}
                            />
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                                / {criterion.effectiveMaxScore}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
