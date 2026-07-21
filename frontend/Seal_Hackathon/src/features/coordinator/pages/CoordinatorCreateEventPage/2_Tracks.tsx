import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import { Alert, TextField } from "@mui/material";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  createEmptyTrack,
  REQUIRED_LINK_TYPES,
  type CreateEventFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

import { StepShell } from "./components/StepShell";
import { wizardFieldSx } from "./components/wizardUi";

type TracksStepProps = {
  onBack: () => void;
  onNext: () => void;
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
    <StepShell
      step={2}
      title="Competition Tracks"
      description="Add tracks only when you need them. At least one track is required before creating the event."
      bodyClassName="space-y-5 px-7 py-6"
      onBack={onBack}
      next={{ label: "Next Step", onClick: onNext }}
    >
      {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

      {fields.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 px-8 py-14 text-center dark:border-slate-700">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
            <RouteOutlinedIcon sx={{ fontSize: 28 }} />
          </span>

          <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
            No track added yet
          </h3>

          <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
            Tracks group teams by topic — AI, Web, Mobile… Click Add Track to
            create the first competition track.
          </p>
        </div>
      )}

      {fields.map((field, index) => {
        const selectedTypes = tracks[index]?.requiredLinkTypes ?? [];
        const trackErrors = errors.tracks?.[index];

        return (
          <div
            key={field.fieldId}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-emerald-300/70 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-500/40"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-emerald-500 to-teal-400"
            />

            <div className="p-5 pl-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 text-sm font-black text-white shadow-md shadow-emerald-500/25">
                    {index + 1}
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white">
                    Track {index + 1}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove track ${index + 1}`}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 dark:hover:bg-rose-500/10"
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Track name"
                  fullWidth
                  size="small"
                  sx={wizardFieldSx}
                  error={Boolean(trackErrors?.trackName)}
                  helperText={trackErrors?.trackName?.message}
                  {...register(`tracks.${index}.trackName`)}
                />

                <TextField
                  label="Max teams"
                  type="number"
                  fullWidth
                  size="small"
                  sx={wizardFieldSx}
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
                  sx={wizardFieldSx}
                  error={Boolean(trackErrors?.description)}
                  helperText={trackErrors?.description?.message}
                  {...register(`tracks.${index}.description`)}
                />

                <div className="md:col-span-2">
                  <p className="mb-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Required submission links
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {REQUIRED_LINK_TYPES.map((type) => {
                      const checked = selectedTypes.includes(type);

                      return (
                        <button
                          key={type}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => {
                            const next = checked
                              ? selectedTypes.filter((item) => item !== type)
                              : [...selectedTypes, type];

                            setValue(
                              `tracks.${index}.requiredLinkTypes`,
                              next,
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }}
                          className={[
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                            checked
                              ? "border-emerald-500/60 bg-emerald-50 text-emerald-600 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200",
                          ].join(" ")}
                        >
                          {checked && (
                            <CheckOutlinedIcon sx={{ fontSize: 14 }} />
                          )}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => append(createEmptyTrack())}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300/70 py-3.5 text-sm font-black text-emerald-600 transition-colors duration-200 hover:border-emerald-400 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5"
      >
        <AddOutlinedIcon sx={{ fontSize: 18 }} />
        Add Track
      </button>
    </StepShell>
  );
}
