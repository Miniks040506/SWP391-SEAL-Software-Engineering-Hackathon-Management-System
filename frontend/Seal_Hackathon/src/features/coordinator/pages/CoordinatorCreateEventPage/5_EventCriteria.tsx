import { useFieldArray, useFormContext } from "react-hook-form";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
  createEmptyCriteria,
  criteriaTypeOptions,
  type CreateEventFormValues,
} from "../../schemas/createEvent.schema";

type EventCriteriaStepProps = {
  onBack: () => void;
  isSubmitting: boolean;
};

export const EventCriteriaStep = ({
  onBack,
  isSubmitting,
}: EventCriteriaStepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const {
    fields: criteriaFields,
    append: appendCriteria,
    remove: removeCriteria,
  } = useFieldArray({
    control,
    name: "criteria",
    keyName: "fieldId",
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 5: Event Criteria
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Define scoring criteria for judges. You can also skip this and
            configure criteria later.
          </p>
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => appendCriteria(createEmptyCriteria())}
          sx={{
            bgcolor: "white",
            color: "#2563eb",
            border: "1px solid #bfdbfe",
            fontWeight: 800,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#eff6ff",
              boxShadow: "none",
            },
          }}
        >
          Add Criteria
        </Button>
      </div>

      <div className="space-y-4 px-7 py-6">
        {criteriaFields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-gray-500">
              No criteria added yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              You can create the event now and configure criteria later.
            </p>
          </div>
        )}

        {criteriaFields.map((field, index) => {
          const criteriaErrors = errors.criteria?.[index];

          return (
            <div
              key={field.fieldId}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900">
                  Criteria {index + 1}
                </h3>

                <IconButton color="error" onClick={() => removeCriteria(index)}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
                  label="Criteria Name"
                  placeholder="e.g. Technical Implementation"
                  error={Boolean(criteriaErrors?.name)}
                  helperText={criteriaErrors?.name?.message}
                  fullWidth
                  required
                  size="small"
                  {...register(`criteria.${index}.name`)}
                />

                <TextField
                  select
                  label="Type"
                  error={Boolean(criteriaErrors?.type)}
                  helperText={criteriaErrors?.type?.message}
                  fullWidth
                  size="small"
                  {...register(`criteria.${index}.type`)}
                >
                  {criteriaTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Max Score"
                  placeholder="e.g. 10"
                  error={Boolean(criteriaErrors?.maxScore)}
                  helperText={criteriaErrors?.maxScore?.message}
                  fullWidth
                  required
                  size="small"
                  {...register(`criteria.${index}.maxScore`)}
                />

                <TextField
                  label="Weight"
                  placeholder="e.g. 30"
                  error={Boolean(criteriaErrors?.weight)}
                  helperText={criteriaErrors?.weight?.message}
                  fullWidth
                  size="small"
                  {...register(`criteria.${index}.weight`)}
                />

                <TextField
                  label="Description"
                  placeholder="Explain how judges should score this criterion"
                  error={Boolean(criteriaErrors?.description)}
                  helperText={criteriaErrors?.description?.message}
                  multiline
                  minRows={3}
                  fullWidth
                  className="md:col-span-2"
                  {...register(`criteria.${index}.description`)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            bgcolor: "#2563eb",
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </section>
  );
};
