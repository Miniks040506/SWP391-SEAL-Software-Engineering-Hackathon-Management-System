import { FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";

import { criteriaTextFieldSx } from "@/features/criteria/constants/criteriaUi";
import type { CriteriaCategory, CriteriaFormValues } from "@/types/criteria.types";
import { CRITERIA_CATEGORIES } from "@/types/criteria.types";

type ScoringCriteriaFormFieldsProps = {
  values: CriteriaFormValues;
  setValues: Dispatch<SetStateAction<CriteriaFormValues>>;
  isEdit: boolean;
};

export function ScoringCriteriaFormFields({
  values,
  setValues,
  isEdit,
}: ScoringCriteriaFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          required
          size="small"
          sx={criteriaTextFieldSx}
        />

        <TextField
          select
          label="Category"
          value={values.category}
          onChange={(event) => {
            const category = event.target.value as CriteriaCategory;
            setValues((current) => ({
              ...current,
              category,
              isTechnical:
                category === "TECHNICAL" || category === "PROCESS"
                  ? true
                  : current.isTechnical,
            }));
          }}
          required
          size="small"
          sx={criteriaTextFieldSx}
        >
          {CRITERIA_CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Max score"
          value={values.maxScore}
          onChange={(event) =>
            setValues((current) => ({ ...current, maxScore: event.target.value }))
          }
          required
          size="small"
          sx={criteriaTextFieldSx}
        />

        <TextField
          label="Default weight"
          value={values.defaultWeight}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              defaultWeight: event.target.value,
            }))
          }
          required
          size="small"
          sx={criteriaTextFieldSx}
        />

        <FormControlLabel
          control={
            <Switch
              checked={values.isTechnical}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  isTechnical: event.target.checked,
                }))
              }
            />
          }
          label="Technical criteria"
        />

        <FormControlLabel
          control={
            <Switch
              checked={values.isDefault}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  isDefault: event.target.checked,
                }))
              }
            />
          }
          label="Default template"
        />

        {isEdit && (
          <FormControlLabel
            control={
              <Switch
                checked={values.isActive}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
            }
            label="Active"
          />
        )}
      </div>

      <div className="mt-4 space-y-4">
        <TextField
          label="Description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          multiline
          minRows={3}
          fullWidth
          sx={criteriaTextFieldSx}
        />

        <TextField
          label="Rubric"
          value={values.rubric}
          onChange={(event) =>
            setValues((current) => ({ ...current, rubric: event.target.value }))
          }
          multiline
          minRows={4}
          fullWidth
          sx={criteriaTextFieldSx}
        />
      </div>
    </>
  );
}
