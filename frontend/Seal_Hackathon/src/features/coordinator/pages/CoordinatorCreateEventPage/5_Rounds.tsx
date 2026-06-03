import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  ADVANCEMENT_RULE_TYPES,
  createEmptyRound,
  type CreateEventFormValues,
  type TrackFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

type RoundsStepProps = {
  tracks: TrackFormValues[];
  onBack: () => void;
  onNext: () => void;
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

const dateTimeFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
  "& .MuiInputLabel-root": {
    backgroundColor: "white",
    paddingInline: "4px",
  },
  ".dark & .MuiInputLabel-root": {
    backgroundColor: "#1e293b",
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

function formatRoundTime(value?: string | null) {
  if (!value) return "Not configured";
  return value.replace("T", " ");
}

export function RoundsStep({ tracks, onBack, onNext }: RoundsStepProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const rounds = useWatch({ control, name: "rounds" }) ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rounds",
    keyName: "fieldId",
  });

  const arrayErrorMessage = getArrayErrorMessage(errors.rounds);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Step 4: Round
        </h2>

        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
          Create round templates separately from tracks. Every track will contain
          the same list of rounds, and judges will be assigned to a specific
          track-round pair in the next step.
        </p>
      </div>

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

          {fields.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <CalendarTodayOutlinedIcon className="mb-2 text-slate-300" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No round added yet
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Click Add Round to create the first event-level round template.
              </p>
            </div>
          )}

          {fields.map((field, index) => {
            const roundErrors = errors.rounds?.[index];

            return (
              <div
                key={field.fieldId}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">
                      Round {index + 1}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      This round will appear under every track.
                    </p>
                  </div>

                  <IconButton color="error" onClick={() => remove(index)}>
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Round name"
                    fullWidth
                    sx={textFieldSx}
                    error={Boolean(roundErrors?.roundName)}
                    helperText={roundErrors?.roundName?.message}
                    {...register(`rounds.${index}.roundName`)}
                  />

                  <TextField
                    label="Order index"
                    type="number"
                    fullWidth
                    sx={textFieldSx}
                    error={Boolean(roundErrors?.orderIndex)}
                    helperText={roundErrors?.orderIndex?.message}
                    {...register(`rounds.${index}.orderIndex`)}
                  />

                  <TextField
                    label="Submission deadline"
                    type="datetime-local"
                    fullWidth
                    sx={dateTimeFieldSx}
                    error={Boolean(roundErrors?.submissionDeadline)}
                    helperText={roundErrors?.submissionDeadline?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.submissionDeadline`)}
                  />

                  <TextField
                    label="Judging deadline"
                    type="datetime-local"
                    fullWidth
                    sx={dateTimeFieldSx}
                    error={Boolean(roundErrors?.judgingDeadline)}
                    helperText={roundErrors?.judgingDeadline?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.judgingDeadline`)}
                  />

                  <Controller
                    name={`rounds.${index}.advancementRuleType`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <TextField
                        {...controllerField}
                        select
                        label="Advancement rule"
                        fullWidth
                        sx={textFieldSx}
                        error={Boolean(roundErrors?.advancementRuleType)}
                        helperText={roundErrors?.advancementRuleType?.message}
                      >
                        {ADVANCEMENT_RULE_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <TextField
                    label="Rule value"
                    fullWidth
                    sx={textFieldSx}
                    placeholder="Example: 10 or 70"
                    error={Boolean(roundErrors?.advancementRuleValue)}
                    helperText={roundErrors?.advancementRuleValue?.message}
                    {...register(`rounds.${index}.advancementRuleValue`)}
                  />

                  <FormControlLabel
                    control={<Checkbox {...register(`rounds.${index}.isFinal`)} />}
                    label="Final round"
                  />
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => append(createEmptyRound(fields.length))}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
          >
            Add Round
          </Button>
        </div>

        <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-900/20">
          <div className="mb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Track-round preview
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This is how Step 5 and the Edit page will assign judges: by track
              and round.
            </p>
          </div>

          {tracks.length === 0 && (
            <Alert severity="warning">Create at least one track before reviewing rounds.</Alert>
          )}

          {tracks.length > 0 && rounds.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
              No rounds to preview yet.
            </div>
          )}

          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1e293b]"
              >
                <p className="font-black text-slate-900 dark:text-white">
                  Track: {track.trackName || "Unnamed track"}
                </p>

                <div className="mt-3 space-y-2">
                  {rounds.map((round, index) => (
                    <div
                      key={`${track.id}-${round.id}`}
                      className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {round.roundName || `Round ${index + 1}`}
                        </p>
                        {round.isFinal && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                            Final
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Submit: {formatRoundTime(round.submissionDeadline)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Judge: {formatRoundTime(round.judgingDeadline)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
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
