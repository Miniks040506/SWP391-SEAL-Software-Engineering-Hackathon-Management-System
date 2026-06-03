import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  createEmptyTrack,
  REQUIRED_LINK_TYPES,
  type CreateEventFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

type TracksStepProps = {
  onBack: () => void;
  onNext: () => void;
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

function getArrayErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "";

  const maybeError = error as {
    message?: string;
    root?: { message?: string };
  };

  return maybeError.message ?? maybeError.root?.message ?? "";
}

export function TracksStep({ onBack, onNext }: TracksStepProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const tracks = useWatch({ control, name: "tracks" }) ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tracks",
    keyName: "fieldId",
  });

  const arrayErrorMessage = getArrayErrorMessage(errors.tracks);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Step 2: Track
        </h2>

        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
          Add tracks only when you need them. At least one track is required
          before creating the event.
        </p>
      </div>

      <div className="space-y-5 px-7 py-6">
        {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

        {fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              No track added yet
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Click Add Track to create the first competition track.
            </p>
          </div>
        )}

        {fields.map((field, index) => {
          const selectedTypes = tracks[index]?.requiredLinkTypes ?? [];
          const trackErrors = errors.tracks?.[index];

          return (
            <div
              key={field.fieldId}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-white">
                  Track {index + 1}
                </h3>

                <IconButton color="error" onClick={() => remove(index)}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Track name"
                  fullWidth
                  sx={textFieldSx}
                  error={Boolean(trackErrors?.trackName)}
                  helperText={trackErrors?.trackName?.message}
                  {...register(`tracks.${index}.trackName`)}
                />

                <TextField
                  label="Max teams"
                  type="number"
                  fullWidth
                  sx={textFieldSx}
                  error={Boolean(trackErrors?.maxTeams)}
                  helperText={trackErrors?.maxTeams?.message}
                  {...register(`tracks.${index}.maxTeams`)}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={3}
                  className="md:col-span-2"
                  sx={textFieldSx}
                  error={Boolean(trackErrors?.description)}
                  helperText={trackErrors?.description?.message}
                  {...register(`tracks.${index}.description`)}
                />

                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                    Required submission links
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {REQUIRED_LINK_TYPES.map((type) => {
                      const checked = selectedTypes.includes(type);

                      return (
                        <FormControlLabel
                          key={type}
                          label={type}
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={(_, nextChecked) => {
                                const next = nextChecked
                                  ? [...selectedTypes, type]
                                  : selectedTypes.filter((item) => item !== type);

                                setValue(
                                  `tracks.${index}.requiredLinkTypes`,
                                  next,
                                  { shouldDirty: true, shouldValidate: true },
                                );
                              }}
                            />
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={() => append(createEmptyTrack())}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
        >
          Add Track
        </Button>
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5 dark:border-slate-700">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
        >
          Next Step
        </Button>
      </div>
    </section>
  );
}
