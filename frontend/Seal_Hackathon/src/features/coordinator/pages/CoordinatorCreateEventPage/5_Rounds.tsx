import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import type { CreateAdvanceRuleRequest } from "@/types/round.types";

import {
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

const RULE_TYPE_OPTIONS = [
  { value: "TOP_N", label: "Top-N Teams" },
  { value: "TOP_PERCENT", label: "Top Percent" },
  { value: "MIN_SCORE", label: "Threshold Score" },
  { value: "WILDCARD", label: "Wildcard" },
];

function AdvanceRuleModal({
  open,
  onClose,
  onSave,
  tracks,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (rule: CreateAdvanceRuleRequest) => void;
  tracks: TrackFormValues[];
}) {
  const [ruleType, setRuleType] = useState<string>("TOP_N");
  const [trackId, setTrackId] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [priority, setPriority] = useState<string>("1");
  const [description, setDescription] = useState<string>("");

  const numVal = value ? Number(value) : undefined;
  const numPriority = priority ? Number(priority) : undefined;

  let valueError = "";
  if (value && numVal !== undefined) {
    if (ruleType === "TOP_N" && (!Number.isInteger(numVal) || numVal < 1)) {
      valueError = "Must be an integer at least 1";
    }
    if (ruleType === "TOP_PERCENT" && (numVal < 1 || numVal > 100)) {
      valueError = "Must be between 1 and 100";
    }
    if (ruleType === "MIN_SCORE" && numVal <= 0) {
      valueError = "Must be greater than 0";
    }
    if (ruleType === "WILDCARD" && (!Number.isInteger(numVal) || numVal < 1)) {
      valueError = "Must be an integer at least 1";
    }
  }

  let priorityError = "";
  if (
    priority &&
    numPriority !== undefined &&
    (!Number.isInteger(numPriority) || numPriority < 1)
  ) {
    priorityError = "Must be an integer at least 1";
  }

  const isValid = value && priority && !valueError && !priorityError;

  const handleSave = () => {
    if (!isValid) return;
    const rule: CreateAdvanceRuleRequest = {
      ruleType,
      trackId: trackId || null,
      priority: Number(priority),
      description: description || undefined,
      ...(ruleType === "TOP_N" && { topN: numVal }),
      ...(ruleType === "TOP_PERCENT" && { topPercent: numVal }),
      ...(ruleType === "MIN_SCORE" && { minScore: numVal }),
      ...(ruleType === "WILDCARD" && { wildCardSlots: numVal }),
    };
    onSave(rule);
    onClose();
  };

  const getValueLabel = () => {
    if (ruleType === "TOP_N") return "Top N";
    if (ruleType === "TOP_PERCENT") return "Top Percent (1-100)";
    if (ruleType === "MIN_SCORE") return "Minimum Score";
    if (ruleType === "WILDCARD") return "Wildcard Slots";
    return "Value";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Advance Rule</DialogTitle>
      <DialogContent className="space-y-4 pt-2">
        <TextField
          select
          label="Rule Type"
          fullWidth
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value)}
          sx={{ ...textFieldSx, mt: 1 }}
        >
          {RULE_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Track (Optional, Global if empty)"
          fullWidth
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          sx={textFieldSx}
        >
          <MenuItem value="">
            <em>Global (All Tracks)</em>
          </MenuItem>
          {tracks.map((track) => (
            <MenuItem key={track.id} value={track.id}>
              {track.trackName || "Unnamed track"}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={getValueLabel()}
          type="number"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={!!valueError}
          helperText={valueError}
          sx={textFieldSx}
        />
        <TextField
          label="Priority"
          type="number"
          fullWidth
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          error={!!priorityError}
          helperText={priorityError}
          sx={textFieldSx}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={textFieldSx}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
        >
          Save Rule
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const getRuleChipStyle = (ruleType: string) => {
  switch (ruleType) {
    case "TOP_N":
      return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300";
    case "TOP_PERCENT":
      return "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-500/15 dark:border-violet-500/40 dark:text-violet-300";
    case "MIN_SCORE":
      return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300";
    case "WILDCARD":
      return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300";
    default:
      return "bg-slate-50 border-slate-200 text-slate-700";
  }
};

const getXButtonStyle = (ruleType: string) => {
  switch (ruleType) {
    case "TOP_N":
      return "bg-blue-100 text-blue-400 hover:bg-red-100 hover:text-red-500 dark:bg-blue-500/30 dark:text-blue-300";
    case "TOP_PERCENT":
      return "bg-violet-100 text-violet-400 hover:bg-red-100 hover:text-red-500 dark:bg-violet-500/30 dark:text-violet-300";
    case "MIN_SCORE":
      return "bg-emerald-100 text-emerald-400 hover:bg-red-100 hover:text-red-500 dark:bg-emerald-500/30 dark:text-emerald-300";
    case "WILDCARD":
      return "bg-amber-100 text-amber-400 hover:bg-red-100 hover:text-red-500 dark:bg-amber-500/30 dark:text-amber-300";
    default:
      return "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500";
  }
};

type AdvanceRulesSectionProps = {
  roundIndex: number;
  tracks: TrackFormValues[];
  isFinal: boolean;
};

function AdvanceRulesSection({
  roundIndex,
  tracks,
  isFinal,
}: AdvanceRulesSectionProps) {
  const { control } = useFormContext<CreateEventFormValues>();
  const { fields, append, remove } = useFieldArray<
    CreateEventFormValues,
    `rounds.${number}.advanceRules`,
    "fieldId"
  >({
    control,
    name: `rounds.${roundIndex}.advanceRules`,
    keyName: "fieldId",
  });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="col-span-1 mt-2 border-t border-slate-200 pt-4 md:col-span-2 dark:border-slate-700">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(isFinal)}
              disabled
              slotProps={{
                input: {
                  "aria-label": "Final round is assigned automatically",
                },
              }}
            />
          }
          label={
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Final round (automatic)
            </span>
          }
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => setModalOpen(true)}
          startIcon={<AddOutlinedIcon />}
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
        >
          Add Advance Rule
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-slate-500">
          No advance rules configured for this round.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-3">
          {fields.map((field, index) => {
            const trackName = field.trackId
              ? tracks.find((track) => track.id === field.trackId)?.trackName ||
                "Unknown track"
              : "Global";
            const val =
              field.topN ??
              field.topPercent ??
              field.minScore ??
              field.wildCardSlots ??
              0;

            return (
              <div
                key={field.fieldId}
                className={`group relative inline-flex max-w-full cursor-default items-center gap-2 rounded-full border py-1.5 pr-7 pl-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${getRuleChipStyle(field.ruleType)}`}
              >
                <span>
                  {field.ruleType} · {val}
                </span>
                {field.trackId && (
                  <span className="text-xs opacity-70">({trackName})</span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${field.ruleType} advance rule`}
                  className={`absolute -top-2 -right-2 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex transition-all duration-150 shadow-sm font-bold text-xs ${getXButtonStyle(field.ruleType)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(index);
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && (
        <AdvanceRuleModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          tracks={tracks}
          onSave={(rule) => append(rule)}
        />
      )}
    </div>
  );
}

export function RoundsStep({ tracks, onBack, onNext }: RoundsStepProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const rounds = useWatch({ control, name: "rounds" }) ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rounds",
    keyName: "fieldId",
  });

  useEffect(() => {
    fields.forEach((_field, index) => {
      setValue(`rounds.${index}.orderIndex`, index + 1);
    });
  }, [fields, setValue]);

  const arrayErrorMessage = getArrayErrorMessage(errors.rounds);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Step 4: Round
        </h2>

        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
          Create round templates separately from tracks. Every track will
          contain the same list of rounds, and judges will be assigned to a
          specific track-round pair in the next step.
        </p>
      </div>

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          {arrayErrorMessage && (
            <Alert severity="error">{arrayErrorMessage}</Alert>
          )}

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
                    <h3 className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                      Round {index + 1}
                      {rounds.length > 0 && index === rounds.length - 1 && (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                          Final
                        </span>
                      )}
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
                    label="Round instructions / competing exam"
                    fullWidth
                    multiline
                    minRows={3}
                    sx={textFieldSx}
                    error={Boolean(roundErrors?.description)}
                    helperText={roundErrors?.description?.message}
                    className="md:col-span-2"
                    {...register(`rounds.${index}.description`)}
                  />

                  <TextField
                    label="Round order"
                    type="number"
                    fullWidth
                    value={index + 1}
                    sx={textFieldSx}
                    helperText="Automatically follows this round's position."
                    slotProps={{ input: { readOnly: true } }}
                  />

                  <TextField
                    label="Round start"
                    type="datetime-local"
                    fullWidth
                    sx={dateTimeFieldSx}
                    error={Boolean(roundErrors?.startAt)}
                    helperText={roundErrors?.startAt?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.startAt`)}
                  />

                  <TextField
                    label="Round end"
                    type="datetime-local"
                    fullWidth
                    sx={dateTimeFieldSx}
                    error={Boolean(roundErrors?.endAt)}
                    helperText={roundErrors?.endAt?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.endAt`)}
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
                    required
                    fullWidth
                    sx={dateTimeFieldSx}
                    error={Boolean(roundErrors?.judgingDeadline)}
                    helperText={roundErrors?.judgingDeadline?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.judgingDeadline`)}
                  />

                  <AdvanceRulesSection
                    roundIndex={index}
                    tracks={tracks}
                    isFinal={index === fields.length - 1}
                  />
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => append(createEmptyRound(fields.length + 1))}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 900,
            }}
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
            <Alert severity="warning">
              Create at least one track before reviewing rounds.
            </Alert>
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
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {round.roundName || `Round ${index + 1}`}
                          </p>
                          {rounds.length > 0 && index === rounds.length - 1 && (
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                              Final
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Period: {formatRoundTime(round.startAt)} →{" "}
                        {formatRoundTime(round.endAt)}
                      </p>
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
