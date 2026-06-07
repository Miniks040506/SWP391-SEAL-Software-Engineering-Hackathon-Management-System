import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import type { ScoringCriteriaResponse } from "@/types";
import { Chip, IconButton, MenuItem, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { criteriaTextFieldSx } from "@/features/criteria/constants/criteriaUi";

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
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50"
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-slate-950 dark:text-white">
                        Criteria {index + 1}
                    </p>
                    <Chip
                        size="small"
                        label={isCustom ? "Custom" : " Template"}
                        sx={{ fontWeight: 800 }}
                    />
                </div>
                
                <IconButton color="error" onClick={() => onRemove(index)}>
                    <DeleteOutlineOutlinedIcon />
                </IconButton>
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
                            sx={criteriaTextFieldSx}
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
                                sx={criteriaTextFieldSx}
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
                
                
            </div>
        </div>
    );
}