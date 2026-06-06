import type { EventCriteriaFormValues, RoundResponse, ScoringCriteriaResponse, UUID } from "@/types"
import { MenuItem, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { criteriaTextFieldSx } from "../../constants/criteriaUi";

type EventCriteriaDialogFieldsProps = {
    values: EventCriteriaFormValues;
    setValues: Dispatch<SetStateAction<EventCriteriaFormValues>>;
    isEdit: boolean;
    rounds: RoundResponse[];
    templateOptions: ScoringCriteriaResponse[];
};

export function EventCriteriaDialogFields({
    values,
    setValues,
    isEdit,
    rounds,
    templateOptions
}: EventCriteriaDialogFieldsProps) {
    
    const isCustom = values.mode === "CUSTOM";
    
    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {!isEdit && (
                    <TextField
                        select
                        label="Criteria source"
                        value={values.mode}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                mode: event.target.value as EventCriteriaFormValues["mode"],
                                criteriaId: "",
                            }))
                        }
                        size="small"
                        sx={criteriaTextFieldSx}
                    >
                        <MenuItem value="TEMPLATE">
                            Use global template
                        </MenuItem>
                        <MenuItem value="CUSTOM">
                            Create custom event-only criteria
                        </MenuItem>
                    </TextField>
                )}
                
                {!isEdit && values.mode === "TEMPLATE" && (
                    <TextField
                        select
                        label="Global scoring criteria"
                        value={values.criteriaId}
                        onChange={(event) => {
                            const criteriaId = event.target.value as UUID;
                            const selected = templateOptions.find((item) => item.id === criteriaId);
                            setValues((current) => ({
                                ...current,
                                criteriaId,
                                maxScoreOverride: selected
                                    ? String(selected.maxScore)
                                    : current.maxScoreOverride,
                                weightOverride: selected
                                    ? String(selected.defaultWeight)
                                    : current.weightOverride,
                                isTechnicalOverride: Boolean(
                                    selected?.isTechnical ?? current.isTechnicalOverride,
                                ),
                            }));
                        }}
                        size="small"
                        sx={criteriaTextFieldSx}
                    >
                        {templateOptions.map((criteria) => (
                            <MenuItem key={criteria.id} value={criteria.id}>
                                {criteria.name} · {criteria.category}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            </div>
        </>
    )
}