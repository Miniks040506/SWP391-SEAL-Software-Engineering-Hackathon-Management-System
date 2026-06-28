import { useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import type { EventCriteriaResponse } from "@/types/criteria.types";

interface CalibrationCriteriaScoreInputProps {
    criterion: EventCriteriaResponse;
    disabled?: boolean;
}

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

export const CalibrationCriteriaScoreInput = ({ criterion, disabled }: CalibrationCriteriaScoreInputProps) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const scoreFieldName = `scores.${criterion.id}.score`;
    const commentFieldName = `scores.${criterion.id}.comment`;
    const scoreError = (errors.scores as any)?.[criterion.id]?.score?.message;
    const commentError = (errors.scores as any)?.[criterion.id]?.comment?.message;

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {criterion.effectiveName}
                    </h3>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {criterion.templateCategory || "CUSTOM"}
                    </span>
                    <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                        Weight: {criterion.effectiveWeight}x
                    </span>
                </div>

                {criterion.effectiveDescription && (
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                        {criterion.effectiveDescription}
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Score
                    </label>
                    <div className="flex items-center gap-3">
                        <TextField
                            type="number"
                            size="small"
                            placeholder="0"
                            error={!!scoreError}
                            disabled={disabled}
                            {...register(scoreFieldName, {
                                valueAsNumber: true,
                                required: "Score is required",
                                min: { value: 0, message: "Score must be at least 0" },
                                max: {
                                    value: criterion.effectiveMaxScore,
                                    message: `Score must not exceed ${criterion.effectiveMaxScore}`,
                                },
                                validate: (value) => Number.isFinite(value) || "Score must be a number",
                            })}
                            sx={{ width: 100, ...textFieldSx }}
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    max: criterion.effectiveMaxScore,
                                    step: "0.1",
                                },
                            }}
                        />
                        <span className="font-bold text-slate-400 dark:text-slate-500">
                            / {criterion.effectiveMaxScore}
                        </span>
                    </div>
                    {scoreError && (
                        <span className="text-xs font-bold text-rose-500">{scoreError as string}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Comment <span className="font-medium text-slate-400">(Optional)</span>
                    </label>
                    <TextField
                        multiline
                        minRows={2}
                        maxRows={4}
                        placeholder="Leave a comment..."
                        error={!!commentError}
                        disabled={disabled}
                        {...register(commentFieldName, {
                            maxLength: {
                                value: 2000,
                                message: "Comment must not exceed 2000 characters",
                            },
                        })}
                        sx={textFieldSx}
                        slotProps={{ htmlInput: { maxLength: 2000 } }}
                    />
                    {commentError && (
                        <span className="text-xs font-bold text-rose-500">{commentError as string}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
