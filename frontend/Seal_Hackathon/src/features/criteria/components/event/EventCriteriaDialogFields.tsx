import { FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";

import { EventCriteriaRoundScopeSelector } from "@/features/criteria/components/event/EventCriteriaRoundScopeSelector";
import { criteriaTextFieldSx } from "@/features/criteria/constants/criteriaUi";
import type { UUID } from "@/types/common.types";
import type { EventCriteriaFormValues, ScoringCriteriaResponse } from "@/types/criteria.types";
import type { RoundResponse } from "@/types/round.types";

type EventCriteriaDialogFieldsProps = {
  values: EventCriteriaFormValues;
  setValues: Dispatch<SetStateAction<EventCriteriaFormValues>>;
  isEdit: boolean;
  rounds: RoundResponse[];
  templateOptions: ScoringCriteriaResponse[];
};

export function EventCriteriaDialogFields({ values, setValues, isEdit, rounds, templateOptions }: EventCriteriaDialogFieldsProps) {
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
            <MenuItem value="TEMPLATE">Use global template</MenuItem>
            <MenuItem value="CUSTOM">Create custom event-only criteria</MenuItem>
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
                maxScoreOverride: selected ? String(selected.maxScore) : current.maxScoreOverride,
                weightOverride: selected ? String(selected.defaultWeight) : current.weightOverride,
                isTechnicalOverride: Boolean(selected?.isTechnical ?? current.isTechnicalOverride),
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

        {(isCustom || isEdit) && (
          <TextField
            label={isCustom ? "Criteria name" : "Name override"}
            value={values.nameOverride}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                nameOverride: event.target.value,
              }))
            }
            required={isCustom}
            size="small"
            sx={criteriaTextFieldSx}
          />
        )}

        <TextField
          label="Weight"
          value={values.weightOverride}
          onChange={(event) => setValues((current) => ({ ...current, weightOverride: event.target.value }))}
          helperText="Blank uses template default. Weight must be >= 0."
          size="small"
          sx={criteriaTextFieldSx}
        />

        <TextField
          label="Max score"
          value={values.maxScoreOverride}
          onChange={(event) => setValues((current) => ({ ...current, maxScoreOverride: event.target.value }))}
          helperText="Blank uses template default. Custom defaults to 10."
          size="small"
          sx={criteriaTextFieldSx}
        />

        <TextField
          label="Display order"
          value={values.displayOrder}
          onChange={(event) => setValues((current) => ({ ...current, displayOrder: event.target.value }))}
          size="small"
          sx={criteriaTextFieldSx}
        />

        <FormControlLabel
          control={
            <Switch
              checked={values.isTechnicalOverride}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  isTechnicalOverride: event.target.checked,
                }))
              }
            />
          }
          label="Technical criteria"
        />

        {isEdit && (
          <FormControlLabel
            control={
              <Switch checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} />
            }
            label="Active in this event"
          />
        )}
      </div>

      <div className="mt-4 space-y-4">
        <TextField
          label="Description override"
          value={values.descriptionOverride}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              descriptionOverride: event.target.value,
            }))
          }
          multiline
          minRows={3}
          fullWidth
          sx={criteriaTextFieldSx}
        />

        <TextField
          label="Rubric override"
          value={values.rubricOverride}
          onChange={(event) => setValues((current) => ({ ...current, rubricOverride: event.target.value }))}
          multiline
          minRows={3}
          fullWidth
          sx={criteriaTextFieldSx}
        />

        <EventCriteriaRoundScopeSelector
          rounds={rounds}
          selectedRoundIds={values.appliesToRoundIds}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(appliesToRoundIds: any) => setValues((current) => ({ ...current, appliesToRoundIds }))}
        />
      </div>
    </>
  );
}
