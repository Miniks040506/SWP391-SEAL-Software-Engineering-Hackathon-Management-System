import { useFieldArray, useFormContext } from "react-hook-form";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import {
  createEmptyPrize,
  prizeRankOptions,
  type CreateEventFormValues,
} from "../../schemas/createEvent.schema";

type PrizesStepProps = {
  onBack: () => void;
  onNext: () => void;
};

export const PrizesStep = ({ onBack, onNext }: PrizesStepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const {
    fields: prizeFields,
    append: appendPrize,
    remove: removePrize,
  } = useFieldArray({
    control,
    name: "prizes",
    keyName: "fieldId",
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 3: Prizes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure award titles and prize values. You can also skip this step
            and configure prizes later.
          </p>
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => appendPrize(createEmptyPrize())}
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
          Add Prize
        </Button>
      </div>

      <div className="space-y-4 px-7 py-6">
        {prizeFields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-gray-500">
              No prizes added yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Click Add Prize to configure awards, or skip this step.
            </p>
          </div>
        )}

        {prizeFields.map((field, index) => {
          const prizeErrors = errors.prizes?.[index];

          return (
            <div
              key={field.fieldId}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900">
                  Prize {index + 1}
                </h3>

                <IconButton color="error" onClick={() => removePrize(index)}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
                  select
                  label="Rank"
                  fullWidth
                  size="small"
                  {...register(`prizes.${index}.rank`)}
                >
                  {prizeRankOptions.map((rank) => (
                    <MenuItem key={rank} value={rank}>
                      {rank}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Prize Title"
                  placeholder="e.g. Champion Award"
                  error={Boolean(prizeErrors?.title)}
                  helperText={prizeErrors?.title?.message}
                  fullWidth
                  required
                  size="small"
                  {...register(`prizes.${index}.title`)}
                />

                <TextField
                  label="Prize Value"
                  placeholder="e.g. 5,000,000 VND"
                  error={Boolean(prizeErrors?.value)}
                  helperText={prizeErrors?.value?.message}
                  fullWidth
                  size="small"
                  {...register(`prizes.${index}.value`)}
                />

                <TextField
                  label="Description"
                  placeholder="Brief prize description"
                  error={Boolean(prizeErrors?.description)}
                  helperText={prizeErrors?.description?.message}
                  fullWidth
                  size="small"
                  {...register(`prizes.${index}.description`)}
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
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
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
          {prizeFields.length === 0 ? "Skip Step" : "Next Step"}
        </Button>
      </div>
    </section>
  );
};
