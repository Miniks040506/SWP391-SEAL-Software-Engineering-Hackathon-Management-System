import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import type { ScoringCriteriaResponse } from "@/types";
import { Controller, useFormContext } from "react-hook-form";
import { FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import { CreateEventCriteriaRoundScope } from "./CreateEventCriteriaRoundScope";
import { wizardFieldSx } from "./wizardUi";

type CreateEventCriteriaCardProps = {
    index: number;
    fieldId: string;
    item: CreateEventFormValues["criteria"][number] | undefined;
    rounds: CreateEventFormValues["rounds"];
    templateOptions: ScoringCriteriaResponse[];
    onRemove: (index: number) => void;
};

export function CreateEventCriteriaCard({
    index,
    fieldId,
    item,
    rounds,
    templateOptions,
    onRemove,
}: CreateEventCriteriaCardProps) {
    const {
        control,
        register,
        setValue,
        formState: {errors},
    } = useFormContext<CreateEventFormValues>();

    const isCustom = item?.sourceType === "CUSTOM";
    const fieldErrors = errors.criteria?.[index];

    return (
        <div
            key={fieldId}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-rose-300/70 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-500/40"
        >
            <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-rose-500 to-pink-400"
            />

            <div className="p-5 pl-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-400 text-sm font-black text-white shadow-md shadow-rose-500/25">
                            {index + 1}
                        </span>

                        <p className="font-black text-slate-950 dark:text-white">
                            Criteria {index + 1}
                        </p>

                        <span
                            className={[
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                isCustom
                                    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
                                    : "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
                            ].join(" ")}
                        >
                            {isCustom ? "Custom" : "Template"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        aria-label={`Remove criteria ${index + 1}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 dark:hover:bg-rose-500/10"
                    >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Controller
                        name={`criteria.${index}.sourceType`}
                        control={control}
                        render={({ field: sourceField }) => (
                            <TextField
                                {...sourceField}
                                select
                                label="Source"
                                size="small"
                                sx={wizardFieldSx}
                                onChange={(event) => {
                                    sourceField.onChange(event);
                                    setValue(`criteria.${index}.criteriaId`, "");
                                }}
                            >
                                <MenuItem value="TEMPLATE">Use global template</MenuItem>
                                <MenuItem value="CUSTOM">Custom event-only criteria</MenuItem>
                            </TextField>
                        )}
                    />

                    {!isCustom && (
                        <Controller
                            name={`criteria.${index}.criteriaId`}
                            control={control}
                            render={({ field: templateField }) => (
                                <TextField
                                    {...templateField}
                                    select
                                    label="Global template"
                                    size="small"
                                    error={Boolean(fieldErrors?.criteriaId)}
                                    helperText={fieldErrors?.criteriaId?.message}
                                    sx={wizardFieldSx}
                                    onChange={(event) => {
                                        templateField.onChange(event);
                                        const selected = templateOptions.find(
                                            (template) => template.id === event.target.value,
                                        );
                                        if (selected) {
                                            setValue(`criteria.${index}.weightOverride`, selected.defaultWeight);
                                            setValue(`criteria.${index}.maxScoreOverride`, selected.maxScore);
                                            setValue(`criteria.${index}.isTechnicalOverride`, selected.isTechnical);
                                        }
                                    }}
                                >
                                    {templateOptions.map((template) => (
                                        <MenuItem key={template.id} value={template.id}>
                                            {template.name} · {template.category}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    )}

                    {(isCustom || item?.nameOverride) && (
                        <TextField
                            label={isCustom ? "Custom criteria name" : "Name override"}
                            error={Boolean(fieldErrors?.nameOverride)}
                            helperText={fieldErrors?.nameOverride?.message}
                            size="small"
                            sx={wizardFieldSx}
                            {...register(`criteria.${index}.nameOverride`)}
                        />
                    )}

                    <TextField
                        label="Weight override"
                        error={Boolean(fieldErrors?.weightOverride)}
                        helperText={fieldErrors?.weightOverride?.message || "Blank uses template default."}
                        size="small"
                        sx={wizardFieldSx}
                        {...register(`criteria.${index}.weightOverride`)}
                    />

                    <TextField
                        label="Max score override"
                        size="small"
                        sx={wizardFieldSx}
                        error={Boolean(fieldErrors?.maxScoreOverride)}
                        helperText={fieldErrors?.maxScoreOverride?.message || "Blank uses template default."}
                        {...register(`criteria.${index}.maxScoreOverride`)}
                    />

                    <TextField
                        label="Display order"
                        size="small"
                        sx={wizardFieldSx}
                        error={Boolean(fieldErrors?.displayOrder)}
                        helperText={fieldErrors?.displayOrder?.message}
                        {...register(`criteria.${index}.displayOrder`)}
                    />

                    <Controller
                        name={`criteria.${index}.isTechnicalOverride`}
                        control={control}
                        render={({ field: technicalField }) => (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={Boolean(technicalField.value)}
                                        onChange={(event) => technicalField.onChange(event.target.checked)}
                                    />
                                }
                                label={
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        Technical criteria
                                    </span>
                                }
                            />
                        )}
                    />
                </div>

                <div className="mt-4 space-y-4">
                    <TextField
                        label="Description override"
                        multiline
                        minRows={2}
                        fullWidth
                        sx={wizardFieldSx}
                        {...register(`criteria.${index}.descriptionOverride`)}
                    />

                    <TextField
                        label="Rubric override"
                        multiline
                        minRows={3}
                        fullWidth
                        sx={wizardFieldSx}
                        {...register(`criteria.${index}.rubricOverride`)}
                    />

                    <CreateEventCriteriaRoundScope
                        criteriaIndex={index}
                        rounds={rounds}
                        selectedRoundIds={item?.appliesToRoundLocalIds ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
