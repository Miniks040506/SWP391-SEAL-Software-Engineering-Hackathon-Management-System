import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
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

import { StepShell } from "./components/StepShell";
import {
  wizardDateFieldSx,
  wizardFieldSx,
} from "./components/wizardUi";

type RoundsStepProps = {
  tracks: TrackFormValues[];
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            backgroundImage: "none",
          },
        },
      }}
      classes={{ paper: "bg-white dark:bg-slate-900" }}
    >
      {/* Gradient header — same chrome as the Edit Event advance-rule popup */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-violet-500/25 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-400 text-white shadow-md">
            <RuleOutlinedIcon />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">Add Advance Rule</h2>
            <p className="text-xs font-medium text-slate-400">
              Decide which teams advance from this round
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <TextField
          select
          label="Rule Type"
          fullWidth
          size="small"
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value)}
          sx={{ ...wizardFieldSx, mt: 0.5 }}
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
          size="small"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          sx={wizardFieldSx}
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
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={!!valueError}
          helperText={valueError}
          sx={wizardFieldSx}
        />
        <TextField
          label="Priority"
          type="number"
          fullWidth
          size="small"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          error={!!priorityError}
          helperText={priorityError}
          sx={wizardFieldSx}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={wizardFieldSx}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: 800,
            boxShadow: "none",
            bgcolor: "#7c3aed",
            "&:hover": { bgcolor: "#6d28d9" },
          }}
        >
          Save Rule
        </Button>
      </div>
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
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-violet-300/70 bg-white px-3 py-1.5 text-xs font-black text-violet-600 transition-colors duration-200 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 dark:border-violet-500/30 dark:bg-slate-900 dark:text-violet-400 dark:hover:bg-violet-500/10"
        >
          <AddOutlinedIcon sx={{ fontSize: 15 }} />
          Add Advance Rule
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
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
                className={`group relative inline-flex max-w-full cursor-default items-center gap-2 rounded-full border py-1.5 pr-7 pl-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${getRuleChipStyle(field.ruleType)}`}
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

function FinalBadge() {
  return (
    <span className="rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm shadow-violet-500/30">
      Final
    </span>
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
    <StepShell
      step={4}
      title="Rounds"
      description="Create round templates separately from tracks. Every track will contain the same list of rounds, and judges will be assigned to a specific track-round pair in the next step."
      bodyClassName="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]"
      onBack={onBack}
      next={{ label: "Next Step", onClick: onNext }}
    >
      <div className="space-y-5">
        {arrayErrorMessage && (
          <Alert severity="error">{arrayErrorMessage}</Alert>
        )}

        {fields.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 px-8 py-14 text-center dark:border-slate-700">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 26 }} />
            </span>

            <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
              No round added yet
            </h3>

            <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
              Click Add Round to create the first event-level round template.
            </p>
          </div>
        )}

        {fields.map((field, index) => {
          const roundErrors = errors.rounds?.[index];

          return (
            <div
              key={field.fieldId}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-violet-300/70 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500/40"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-violet-500 to-indigo-400"
              />

              <div className="p-5 pl-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2.5 font-black text-slate-900 dark:text-white">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-400 text-sm font-black text-white shadow-md shadow-violet-500/25">
                        {index + 1}
                      </span>
                      Round {index + 1}
                      {rounds.length > 0 && index === rounds.length - 1 && (
                        <FinalBadge />
                      )}
                    </h3>
                    <p className="mt-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      This round will appear under every track.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove round ${index + 1}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 dark:hover:bg-rose-500/10"
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Round name"
                    fullWidth
                    size="small"
                    sx={wizardFieldSx}
                    error={Boolean(roundErrors?.roundName)}
                    helperText={roundErrors?.roundName?.message}
                    {...register(`rounds.${index}.roundName`)}
                  />

                  <TextField
                    label="Round instructions / competing exam"
                    fullWidth
                    multiline
                    minRows={3}
                    sx={wizardFieldSx}
                    error={Boolean(roundErrors?.description)}
                    helperText={roundErrors?.description?.message}
                    className="md:col-span-2"
                    {...register(`rounds.${index}.description`)}
                  />

                  <TextField
                    label="Round order"
                    type="number"
                    fullWidth
                    size="small"
                    value={index + 1}
                    sx={wizardFieldSx}
                    helperText="Automatically follows this round's position."
                    slotProps={{ input: { readOnly: true } }}
                  />

                  <TextField
                    label="Round start"
                    type="datetime-local"
                    fullWidth
                    size="small"
                    sx={wizardDateFieldSx}
                    error={Boolean(roundErrors?.startAt)}
                    helperText={roundErrors?.startAt?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.startAt`)}
                  />

                  <TextField
                    label="Round end"
                    type="datetime-local"
                    fullWidth
                    size="small"
                    sx={wizardDateFieldSx}
                    error={Boolean(roundErrors?.endAt)}
                    helperText={roundErrors?.endAt?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register(`rounds.${index}.endAt`)}
                  />

                  <TextField
                    label="Submission deadline"
                    type="datetime-local"
                    fullWidth
                    size="small"
                    sx={wizardDateFieldSx}
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
                    size="small"
                    sx={wizardDateFieldSx}
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
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => append(createEmptyRound(fields.length + 1))}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300/70 py-3.5 text-sm font-black text-violet-600 transition-colors duration-200 hover:border-violet-400 hover:bg-violet-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 dark:border-violet-500/30 dark:text-violet-400 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/5"
        >
          <AddOutlinedIcon sx={{ fontSize: 18 }} />
          Add Round
        </button>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-400 text-white shadow-md shadow-violet-500/25">
            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
          </span>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Track-round preview
            </h3>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              This is how Step 5 and the Edit page will assign judges: by track
              and round.
            </p>
          </div>
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
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="font-black text-slate-900 dark:text-white">
                {track.trackName || "Unnamed track"}
              </p>

              <div className="relative mt-4 space-y-4 pl-5">
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-1.5 w-px bg-slate-200 dark:bg-slate-700"
                />

                {rounds.map((round, index) => {
                  const isFinal =
                    rounds.length > 0 && index === rounds.length - 1;

                  return (
                    <div key={`${track.id}-${round.id}`} className="relative">
                      <span
                        aria-hidden
                        className={`absolute top-1 -left-5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          isFinal
                            ? "bg-linear-to-br from-violet-500 to-indigo-400"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />

                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {round.roundName || `Round ${index + 1}`}
                        </p>
                        {isFinal && <FinalBadge />}
                      </div>

                      <div className="mt-1.5 space-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                          {formatRoundTime(round.startAt)} →{" "}
                          {formatRoundTime(round.endAt)}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <UploadFileOutlinedIcon sx={{ fontSize: 13 }} />
                          Submit: {formatRoundTime(round.submissionDeadline)}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <GavelOutlinedIcon sx={{ fontSize: 13 }} />
                          Judge: {formatRoundTime(round.judgingDeadline)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {rounds.length > 0 && (
                  <div className="relative">
                    <span
                      aria-hidden
                      className="absolute top-0.5 -left-5 flex h-3 w-3 items-center justify-center"
                    >
                      <FlagOutlinedIcon
                        sx={{ fontSize: 14 }}
                        className="text-violet-500"
                      />
                    </span>
                    <p className="text-xs font-black uppercase tracking-widest text-violet-500 dark:text-violet-400">
                      Results
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </StepShell>
  );
}
