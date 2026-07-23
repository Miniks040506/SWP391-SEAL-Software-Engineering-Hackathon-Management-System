import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import {
  useAdvanceRulesQuery,
  useRoundOperationStatusQuery,
} from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import {
  useCreateAdvanceRuleMutation,
  useCreateRoundMutation,
  useDeleteAdvanceRuleMutation,
  useDeleteRoundMutation,
  useLockSubmissionsMutation,
  useOpenRoundMutation,
  useUpdateAdvanceRuleMutation,
  useUpdateRoundMutation,
} from "@/features/coordinator/hooks/useCoordinatorEventMutations";
import type { UUID } from "@/types/common.types";
import type { EventDetailResponse } from "@/types/event.types";
import type {
  AdvanceRuleResponse,
  CreateAdvanceRuleRequest,
  RoundResponse,
} from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

import {
  editDateFieldSx,
  editDialogPaperSx,
  editFieldSx,
} from "./editEventUi";
import { TabShell } from "./TabShell";
import "./roundsTab.css";

type EditableRound = RoundResponse & {
  id: UUID;
  name?: string;
  roundName?: string;
  description?: string | null;
  orderIndex?: number;
  isFinal?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  submissionDeadline?: string | null;
  judgingDeadline?: string | null;
};

type RoundForm = {
  name: string;
  description: string;
  orderIndex: string;
  startAt: string;
  endAt: string;
  submissionDeadline: string;
  judgingDeadline: string;
};

type RoundsTabProps = {
  eventId: UUID;
  event: EventDetailResponse;
  tracks: TrackResponse[];
  rounds: RoundResponse[];
  isLoading: boolean;
  onChanged: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
  canOperate: boolean;
  operationReadonlyReason?: string;
};

type ApiErrorResponse = {
  message?: string;
};

function getOperationErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

const emptyRound: RoundForm = {
  name: "",
  description: "",
  orderIndex: "",
  startAt: "",
  endAt: "",
  submissionDeadline: "",
  judgingDeadline: "",
};

function getId(value: unknown) {
  return (value as { id: UUID }).id;
}

function getName(round: RoundResponse) {
  const raw = round as EditableRound;
  return raw.name ?? raw.roundName ?? "Untitled round";
}

function getTrackName(track: TrackResponse) {
  const raw = track as { name?: string; trackName?: string };
  return raw.name ?? raw.trackName ?? "Untitled track";
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

function formatRoundTime(value?: string | null) {
  if (!value) return "Not configured";
  return value.replace("T", " ").slice(0, 16);
}

/**
 * Lifecycle phase of a round, used to drive the pure-CSS motion treatment.
 * A round is "live" when its status says so, or (as a fallback) when the
 * current time sits inside its start/end window.
 */
type RoundPhase = "live" | "upcoming" | "completed" | "unscheduled";

const LIVE_ROUND_STATUSES = ["OPEN", "ONGOING", "IN_PROGRESS", "ACTIVE"];
const DONE_ROUND_STATUSES = [
  "CLOSED",
  "COMPLETED",
  "FINISHED",
  "DONE",
  "ARCHIVED",
];

function getRoundPhase(round: RoundResponse, now: Date): RoundPhase {
  const status = (round.status ?? "").toUpperCase();
  if (LIVE_ROUND_STATUSES.includes(status)) return "live";
  if (DONE_ROUND_STATUSES.includes(status)) return "completed";

  const raw = round as EditableRound;
  const start = raw.startAt ? new Date(raw.startAt) : null;
  const end = raw.endAt ? new Date(raw.endAt) : null;

  if (!start || !end) return "unscheduled";
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "live";
}

const ROUND_PHASE_META: Record<
  RoundPhase,
  { label: string; chipClass: string; dotClass: string }
> = {
  live: {
    label: "Live now",
    chipClass:
      "border-violet-400/60 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-300",
    dotClass: "bg-violet-500",
  },
  upcoming: {
    label: "Upcoming",
    chipClass:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300",
    dotClass: "bg-sky-400",
  },
  completed: {
    label: "Completed",
    chipClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  unscheduled: {
    label: "Not scheduled",
    chipClass:
      "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dotClass: "bg-slate-400",
  },
};

function createRoundForm(round: RoundResponse): RoundForm {
  const raw = round as EditableRound;

  return {
    name: getName(round),
    description: raw.description ?? "",
    orderIndex: String(raw.orderIndex ?? 0),
    startAt: toDateTimeLocal(raw.startAt),
    endAt: toDateTimeLocal(raw.endAt),
    submissionDeadline: toDateTimeLocal(raw.submissionDeadline),
    judgingDeadline: toDateTimeLocal(raw.judgingDeadline),
  };
}

function toApiDateTime(value?: string | null) {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

function getEventPeriod(event: EventDetailResponse) {
  return {
    competitionStartAt: toDateTimeLocal(event.competitionStartAt),
    competitionEndAt: toDateTimeLocal(event.competitionEndAt),
  };
}

function validateRoundTiming(
  values: RoundForm,
  event: EventDetailResponse,
  rounds: RoundResponse[],
  excludedRoundId?: UUID,
) {
  if (!values.name.trim()) {
    enqueueSnackbar("Round name is required.", { variant: "error" });
    return false;
  }

  if (
    !values.startAt ||
    !values.endAt ||
    !values.submissionDeadline ||
    !values.judgingDeadline
  ) {
    enqueueSnackbar(
      "Round start, end, submission, and judging deadlines are required.",
      {
        variant: "error",
      },
    );
    return false;
  }

  if (values.startAt >= values.endAt) {
    enqueueSnackbar("Round end time must be after start time.", {
      variant: "error",
    });
    return false;
  }

  const { competitionStartAt, competitionEndAt } = getEventPeriod(event);

  if (competitionStartAt && values.startAt < competitionStartAt) {
    enqueueSnackbar(
      "Round start time must be within the event competition period.",
      {
        variant: "error",
      },
    );
    return false;
  }

  if (competitionEndAt && values.endAt > competitionEndAt) {
    enqueueSnackbar(
      "Round end time must be within the event competition period.",
      {
        variant: "error",
      },
    );
    return false;
  }

  if (
    values.submissionDeadline < values.startAt ||
    values.submissionDeadline > values.endAt
  ) {
    enqueueSnackbar("Submission deadline must be within the round period.", {
      variant: "error",
    });
    return false;
  }

  if (values.submissionDeadline >= values.judgingDeadline) {
    enqueueSnackbar("Judging deadline must be after submission deadline.", {
      variant: "error",
    });
    return false;
  }

  if (values.judgingDeadline > values.endAt) {
    enqueueSnackbar("Judging deadline must be within the round period.", {
      variant: "error",
    });
    return false;
  }

  const overlapsExistingRound = rounds.some((round) => {
    if (excludedRoundId && round.id === excludedRoundId) return false;

    const raw = round as EditableRound;
    const startAt = toDateTimeLocal(raw.startAt);
    const endAt = toDateTimeLocal(raw.endAt);

    return Boolean(
      startAt && endAt && values.startAt < endAt && values.endAt > startAt,
    );
  });

  if (overlapsExistingRound) {
    enqueueSnackbar("Round period overlaps with another round in this event.", {
      variant: "error",
    });
    return false;
  }

  return true;
}

const RULE_TYPE_OPTIONS = [
  { value: "TOP_N", label: "Top-N Teams" },
  { value: "TOP_PERCENT", label: "Top Percent" },
  { value: "MIN_SCORE", label: "Threshold Score" },
  { value: "WILDCARD", label: "Wildcard" },
];

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

type AdvanceRuleModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateAdvanceRuleRequest) => void | Promise<void>;
  tracks: TrackResponse[];
  initialData?: AdvanceRuleResponse | null;
};

function AdvanceRuleModal({
  open,
  onClose,
  onSave,
  tracks,
  initialData,
}: AdvanceRuleModalProps) {
  const [ruleType, setRuleType] = useState<string>(
    initialData?.ruleType || "TOP_N",
  );
  const [trackId, setTrackId] = useState<string>(initialData?.trackId || "");
  const [value, setValue] = useState<string>(
    initialData
      ? String(
          initialData.topN ??
            initialData.topPercent ??
            initialData.minScore ??
            initialData.wildCardSlots ??
            initialData.value ??
            "",
        )
      : "",
  );
  const [priority, setPriority] = useState<string>(
    String(initialData?.priority || 1),
  );
  const [description, setDescription] = useState<string>(
    initialData?.description || "",
  );

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
      sx={editDialogPaperSx}
      classes={{ paper: "bg-white dark:bg-slate-900" }}
    >
      {/* Gradient header — same chrome as the other edit-event popups */}
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
            <h2 className="text-lg font-black text-white">
              {initialData ? "Edit Advance Rule" : "Add Advance Rule"}
            </h2>
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
          sx={{ ...editFieldSx, mt: 0.5 }}
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
          sx={editFieldSx}
        >
          <MenuItem value="">
            <em>Global (All Tracks)</em>
          </MenuItem>
          {tracks.map((track) => (
            <MenuItem key={track.id} value={track.id}>
              {track.name || "Unnamed track"}
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
          sx={editFieldSx}
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
          sx={editFieldSx}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={editFieldSx}
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

function RoundAdvanceRules({
  eventId,
  roundId,
  tracks,
  canEdit,
}: {
  eventId: UUID;
  roundId: UUID;
  tracks: TrackResponse[];
  canEdit: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AdvanceRuleResponse | null>(
    null,
  );
  const [ruleToDelete, setRuleToDelete] = useState<UUID | null>(null);
  const rulesQuery = useAdvanceRulesQuery(roundId);
  const createRuleMutation = useCreateAdvanceRuleMutation(eventId);
  const updateRuleMutation = useUpdateAdvanceRuleMutation(eventId);
  const deleteRuleMutation = useDeleteAdvanceRuleMutation(eventId);
  const rules = (rulesQuery.data ?? []) as AdvanceRuleResponse[];

  const handleCreate = async (payload: CreateAdvanceRuleRequest) => {
    try {
      await createRuleMutation.mutateAsync({ roundId, payload });
      enqueueSnackbar("Rule created.", { variant: "success" });
      setModalOpen(false);
    } catch {
      enqueueSnackbar("Failed to create rule.", { variant: "error" });
    }
  };

  const handleUpdate = async (
    ruleId: UUID,
    payload: CreateAdvanceRuleRequest,
  ) => {
    try {
      await updateRuleMutation.mutateAsync({ roundId, ruleId, payload });
      enqueueSnackbar("Rule updated.", { variant: "success" });
      setEditingRule(null);
    } catch {
      enqueueSnackbar("Failed to update rule.", { variant: "error" });
    }
  };

  const handleDelete = (ruleId: UUID) => setRuleToDelete(ruleId);

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteRuleMutation.mutateAsync({ roundId, ruleId: ruleToDelete });
      enqueueSnackbar("Rule deleted.", { variant: "success" });
      setRuleToDelete(null);
    } catch {
      enqueueSnackbar("Failed to delete rule.", { variant: "error" });
    }
  };

  if (rulesQuery.isLoading)
    return (
      <div className="mt-4 flex justify-center">
        <CircularProgress size={20} />
      </div>
    );

  return (
    <div className="col-span-1 md:col-span-2 mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-200">
          <RuleOutlinedIcon
            sx={{ fontSize: 16 }}
            className="text-violet-500"
          />
          Advance Rules
        </h4>
        {canEdit && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-600 transition-colors duration-200 hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
          >
            <AddOutlinedIcon sx={{ fontSize: 14 }} />
            Add Rule
          </button>
        )}
      </div>

      {rules.length === 0 ? (
        <p className="text-xs font-medium text-slate-500">
          No advance rules configured for this round.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {rules.map((rule) => {
            const trackName = rule.trackId
              ? tracks.find((track) => track.id === rule.trackId)?.name ||
                "Unknown track"
              : "Global";
            const val =
              rule.topN ??
              rule.topPercent ??
              rule.minScore ??
              rule.wildCardSlots ??
              rule.value ??
              0;

            return (
              <div
                key={rule.id}
                className={`relative inline-flex group items-center gap-2 px-3.5 py-1.5 rounded-full border font-medium text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${getRuleChipStyle(rule.ruleType)}`}
                onClick={() => canEdit && setEditingRule(rule)}
              >
                <span>
                  {rule.ruleType} / {val}
                </span>
                {rule.trackId && (
                  <span className="text-xs opacity-70">({trackName})</span>
                )}
                {canEdit && (
                  <button
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex transition-all duration-150 shadow-sm font-bold text-xs ${getXButtonStyle(rule.ruleType)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(rule.id);
                    }}
                  >
                    x
                  </button>
                )}
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
          onSave={handleCreate}
        />
      )}
      {editingRule && (
        <AdvanceRuleModal
          open={Boolean(editingRule)}
          onClose={() => setEditingRule(null)}
          tracks={tracks}
          initialData={editingRule}
          onSave={(payload) => handleUpdate(editingRule.id, payload)}
        />
      )}
      <ActionConfirmDialog
        open={ruleToDelete !== null}
        title="Delete advance rule?"
        description="This rule will no longer be used when calculating round advancement."
        confirmLabel="Delete rule"
        severity="error"
        onClose={() => setRuleToDelete(null)}
        onConfirm={confirmDelete}
        isPending={deleteRuleMutation.isPending}
      />
    </div>
  );
}

function RoundOperationPanel({
  eventId,
  roundId,
  canOperate,
  readonlyReason,
}: {
  eventId: UUID;
  roundId: UUID;
  canOperate: boolean;
  readonlyReason?: string;
}) {
  const statusQuery = useRoundOperationStatusQuery(roundId);
  const openRoundMutation = useOpenRoundMutation(eventId);
  const lockSubmissionsMutation = useLockSubmissionsMutation(eventId);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const status = statusQuery.data;
  const operating =
    openRoundMutation.isPending ||
    lockSubmissionsMutation.isPending;

  const handleOpen = async () => {
    try {
      await openRoundMutation.mutateAsync(roundId);
      enqueueSnackbar("Round opened.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        getOperationErrorMessage(error, "Failed to open round."),
        { variant: "error" },
      );
    }
  };

  const handleLock = async () => {
    try {
      await lockSubmissionsMutation.mutateAsync(roundId);
      enqueueSnackbar("Submissions locked.", { variant: "success" });
      setLockConfirmOpen(false);
    } catch (error) {
      enqueueSnackbar(
        getOperationErrorMessage(error, "Failed to lock submissions."),
        { variant: "error" },
      );
    }
  };

  if (statusQuery.isLoading) {
    return (
      <div className="col-span-1 md:col-span-2 mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 dark:border-slate-700">
        <CircularProgress size={16} />
        Loading round operation status...
      </div>
    );
  }

  if (statusQuery.isError || !status) {
    return (
      <Alert severity="warning" className="col-span-1 md:col-span-2 mt-4">
        Cannot load round operation status.
      </Alert>
    );
  }

  return (
    <div className="col-span-1 md:col-span-2 mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1 sm:min-w-[280px]">
          <p className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
            <span className="inline-flex h-2 w-2 rounded-full bg-violet-500" />
            Operation status: {status.roundStatus}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Period: {formatRoundTime(status.startAt)} →{" "}
            {formatRoundTime(status.endAt)}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Submitted/late: {status.submittedOrLateSubmissionCount} / Drafts:{" "}
            {status.draftSubmissionCount} / Judge assignments:{" "}
            {status.judgeAssignmentCount}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span
              className={`rounded-full px-2.5 py-1 ${
                status.deadlineConfigured
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              }`}
            >
              Deadlines: {status.deadlineConfigured ? "Ready" : "Missing"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                status.criteriaConfigured
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              }`}
            >
              Criteria: {status.criteriaCount}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                status.judgeAssignmentsConfigured
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              }`}
            >
              Judge coverage:{" "}
              {status.judgeAssignmentsConfigured ? "Ready" : "Missing"} (
              {status.trackCount} tracks)
            </span>
          </div>
          {status.openBlockers?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1.5, borderRadius: "12px" }}>
              <p className="text-xs font-bold">Complete before opening:</p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {status.openBlockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </Alert>
          )}
          {status.submissionLockedAt && (
            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <LockOutlinedIcon sx={{ fontSize: 13 }} />
              Locked at {formatRoundTime(status.submissionLockedAt)}
            </p>
          )}
          {!canOperate && readonlyReason && (
            <p className="mt-3 text-xs font-semibold text-amber-600">
              {readonlyReason}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="small"
            variant="outlined"
            startIcon={<PlayArrowOutlinedIcon />}
            disabled={!canOperate || !status.canOpen || operating}
            onClick={handleOpen}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            Open
          </Button>
          <Button
            size="small"
            variant="contained"
            color="warning"
            startIcon={<LockOutlinedIcon />}
            disabled={!canOperate || !status.canLockSubmissions || operating}
            onClick={() => setLockConfirmOpen(true)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 800,
              whiteSpace: "nowrap",
              boxShadow: "none",
            }}
          >
            Lock submissions
          </Button>
        </div>
      </div>
      <ActionConfirmDialog
        open={lockConfirmOpen}
        title="Lock submissions for this round?"
        description="This locks participant submissions and closes the round. Locking the final round also moves the event to judging."
        confirmLabel="Lock submissions"
        onClose={() => setLockConfirmOpen(false)}
        onConfirm={handleLock}
        isPending={lockSubmissionsMutation.isPending}
      />
    </div>
  );
}

export function RoundsTab({
  eventId,
  event,
  tracks,
  rounds,
  isLoading,
  onChanged,
  canEdit,
  readonlyReason,
  canOperate,
  operationReadonlyReason,
}: RoundsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRound, setNewRound] = useState<RoundForm>(emptyRound);
  const [editing, setEditing] = useState<Record<string, RoundForm>>({});
  const [selectedRoundId, setSelectedRoundId] = useState<UUID | null>(null);
  const createRoundMutation = useCreateRoundMutation(eventId);
  const updateRoundMutation = useUpdateRoundMutation(eventId);
  const deleteRoundMutation = useDeleteRoundMutation(eventId);
  const now = new Date();

  // Focused round for the big 3:1 frame — user selection first, then the
  // live round, then the first round.
  const liveRound = rounds.find((r) => getRoundPhase(r, now) === "live");
  const selectedRound =
    rounds.find((r) => getId(r) === selectedRoundId) ?? liveRound ?? rounds[0];
  const selectedIndex = selectedRound ? rounds.indexOf(selectedRound) : -1;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditing((current) => {
      const next: Record<string, RoundForm> = {};

      rounds.forEach((round) => {
        const id = getId(round);
        next[id] = current[id] ?? createRoundForm(round);
      });

      return next;
    });
  }, [rounds]);

  const handleCreate = async () => {
    if (!canEdit) return;

    if (!validateRoundTiming(newRound, event, rounds)) return;

    try {
      const orderIndex = rounds.length + 1;

      await createRoundMutation.mutateAsync({
        name: newRound.name.trim(),
        description: newRound.description.trim() || undefined,
        orderIndex,
        isFinal: true,
        startAt: toApiDateTime(newRound.startAt),
        endAt: toApiDateTime(newRound.endAt),
        submissionDeadline: toApiDateTime(newRound.submissionDeadline),
        judgingDeadline: toApiDateTime(newRound.judgingDeadline),
      });

      // Update other rounds to ensure only max has isFinal
      const otherFinalRounds = rounds.filter((r) => r.isFinal);
      await Promise.all(
        otherFinalRounds.map((r) =>
          updateRoundMutation.mutateAsync({
            roundId: r.id,
            payload: {
              name: r.name,
              orderIndex: r.orderIndex,
              isFinal: false,
              startAt: r.startAt,
              endAt: r.endAt,
              submissionDeadline: r.submissionDeadline,
              judgingDeadline: r.judgingDeadline,
            },
          }),
        ),
      );

      setNewRound(emptyRound);
      setShowAddForm(false);
      enqueueSnackbar("Round created.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to create round.", { variant: "error" });
    }
  };

  const handleUpdate = async (round: RoundResponse) => {
    if (!canEdit) return;

    const id = getId(round);
    const values = editing[id];

    if (!values || !validateRoundTiming(values, event, rounds, id)) return;

    try {
      const orderIndex = round.orderIndex;
      const maxOI = Math.max(...rounds.map((r) => r.orderIndex ?? 0));
      const isFinal = orderIndex === maxOI;

      await updateRoundMutation.mutateAsync({
        roundId: id,
        payload: {
          name: values.name.trim(),
          description: values.description.trim(),
          orderIndex,
          isFinal,
          startAt: toApiDateTime(values.startAt),
          endAt: toApiDateTime(values.endAt),
          submissionDeadline: toApiDateTime(values.submissionDeadline),
          judgingDeadline: toApiDateTime(values.judgingDeadline),
        },
      });

      enqueueSnackbar("Round updated.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to update round.", { variant: "error" });
    }
  };

  const handleDelete = async (roundId: UUID) => {
    if (!canEdit) return;

    try {
      await deleteRoundMutation.mutateAsync(roundId);

      const remainingRounds = rounds
        .filter((r) => r.id !== roundId)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

      await Promise.all(
        remainingRounds.map((r, idx) => {
          const expectedOrder = idx + 1;
          const isFinal = expectedOrder === remainingRounds.length;
          if (r.orderIndex !== expectedOrder || r.isFinal !== isFinal) {
            return updateRoundMutation.mutateAsync({
              roundId: r.id,
              payload: {
                name: r.name,
                orderIndex: expectedOrder,
                isFinal,
                startAt: r.startAt,
                endAt: r.endAt,
                submissionDeadline: r.submissionDeadline,
                judgingDeadline: r.judgingDeadline,
              },
            });
          }
        }),
      );

      enqueueSnackbar("Round deleted.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to delete round.", { variant: "error" });
    }
  };

  return (
    <TabShell
      tab="ROUNDS"
      title="Rounds"
      description="Create event-level round templates separately. Round structure is locked from ONGOING onward."
      headerActions={
        canEdit && !showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 motion-reduce:transition-none"
          >
            <AddOutlinedIcon sx={{ fontSize: 17 }} />
            Add Round
          </button>
        ) : undefined
      }
      bodyClassName="space-y-8 px-7 py-6"
    >
      <div className="space-y-5">
        {!canEdit && readonlyReason && (
          <Alert severity="warning" sx={{ borderRadius: "14px" }}>
            {readonlyReason}
          </Alert>
        )}

        {canEdit && showAddForm && (
          <div className="rounded-2xl border-2 border-dashed border-violet-300/70 bg-violet-50/40 p-6 dark:border-violet-500/30 dark:bg-violet-500/5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-400 text-white shadow-md shadow-violet-500/25">
                  <AddOutlinedIcon sx={{ fontSize: 19 }} />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  New Round
                </h3>
              </div>
              <IconButton
                onClick={() => setShowAddForm(false)}
                size="small"
                aria-label="Close add round form"
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Round name"
                value={newRound.name}
                onChange={(event) =>
                  setNewRound((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                size="small"
                sx={editFieldSx}
              />

              <TextField
                label="Order index"
                type="number"
                value={rounds.length + 1}
                size="small"
                sx={editFieldSx}
                disabled
              />

              <TextField
                label="Round instructions / competing exam"
                value={newRound.description}
                onChange={(event) =>
                  setNewRound((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                multiline
                minRows={3}
                size="small"
                sx={editFieldSx}
                className="md:col-span-2"
              />

              <TextField
                label="Round start"
                type="datetime-local"
                value={newRound.startAt}
                onChange={(event) =>
                  setNewRound((current) => ({
                    ...current,
                    startAt: event.target.value,
                  }))
                }
                size="small"
                sx={editDateFieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="Round end"
                type="datetime-local"
                value={newRound.endAt}
                onChange={(event) =>
                  setNewRound((current) => ({
                    ...current,
                    endAt: event.target.value,
                  }))
                }
                size="small"
                sx={editDateFieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="Submission deadline"
                type="datetime-local"
                value={newRound.submissionDeadline}
                onChange={(event) =>
                  setNewRound((current) => ({
                    ...current,
                    submissionDeadline: event.target.value,
                  }))
                }
                size="small"
                sx={editDateFieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="Judging deadline"
                type="datetime-local"
                required
                value={newRound.judgingDeadline}
                onChange={(event) =>
                  setNewRound((current) => ({
                    ...current,
                    judgingDeadline: event.target.value,
                  }))
                }
                size="small"
                sx={editDateFieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 motion-reduce:transition-none"
                >
                  <AddOutlinedIcon sx={{ fontSize: 17 }} />
                  Add Round
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <CircularProgress />
          </div>
        )}

        {/* Big 3:1 frame — left (3): full detail of the focused round with the
            live motion treatment; right (1): compact list of every round. */}
        {!isLoading && selectedRound && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
            {(() => {
              const round = selectedRound;
              const index = selectedIndex;
              const id = getId(round);
              const values = editing[id] ?? createRoundForm(round);
              const isFinalRound = index === rounds.length - 1;
              const phase = getRoundPhase(round, now);
              const isLive = phase === "live";
              const phaseMeta = ROUND_PHASE_META[phase];

              return (
            <div
              key={id}
              className={
                isLive
                  ? "seal-round-live rounded-2xl border border-transparent bg-violet-50/40 p-6 dark:bg-slate-900/80"
                  : phase === "completed"
                    ? "rounded-2xl border border-slate-200 bg-slate-50/70 p-6 opacity-80 dark:border-slate-700 dark:bg-slate-800/20"
                    : "rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/30"
              }
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-400 text-sm font-black text-white shadow-md shadow-violet-500/25 ${
                      isLive ? "seal-round-live-badge" : ""
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                      Round {index + 1}
                    </p>
                    <h3 className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                      {values.name || `Round ${index + 1}`}
                      {isFinalRound && (
                        <span className="rounded-full bg-linear-to-r from-violet-500 to-indigo-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm shadow-violet-500/25">
                          Final
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${phaseMeta.chipClass}`}
                      >
                        <span
                          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${phaseMeta.dotClass} ${
                            isLive ? "seal-live-dot" : ""
                          }`}
                        />
                        {phaseMeta.label}
                      </span>
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      This round appears under every track.
                    </p>
                  </div>
                </div>

                {canEdit && (
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(id)}
                    aria-label={`Delete round ${values.name || index + 1}`}
                  >
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Round name"
                  value={values.name}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: { ...values, name: event.target.value },
                    }))
                  }
                  size="small"
                  sx={editFieldSx}
                  disabled={!canEdit}
                />

                <TextField
                  label="Order index"
                  type="number"
                  value={index + 1}
                  size="small"
                  sx={editFieldSx}
                  disabled
                />

                <TextField
                  label="Round instructions / competing exam"
                  value={values.description}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: { ...values, description: event.target.value },
                    }))
                  }
                  multiline
                  minRows={3}
                  size="small"
                  sx={editFieldSx}
                  className="md:col-span-2"
                  disabled={!canEdit}
                />

                <TextField
                  label="Round start"
                  type="datetime-local"
                  value={values.startAt}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: {
                        ...values,
                        startAt: event.target.value,
                      },
                    }))
                  }
                  size="small"
                  sx={editDateFieldSx}
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={!canEdit}
                />

                <TextField
                  label="Round end"
                  type="datetime-local"
                  value={values.endAt}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: {
                        ...values,
                        endAt: event.target.value,
                      },
                    }))
                  }
                  size="small"
                  sx={editDateFieldSx}
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={!canEdit}
                />

                <TextField
                  label="Submission deadline"
                  type="datetime-local"
                  value={values.submissionDeadline}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: {
                        ...values,
                        submissionDeadline: event.target.value,
                      },
                    }))
                  }
                  size="small"
                  sx={editDateFieldSx}
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={!canEdit}
                />

                <TextField
                  label="Judging deadline"
                  type="datetime-local"
                  required
                  value={values.judgingDeadline}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: {
                        ...values,
                        judgingDeadline: event.target.value,
                      },
                    }))
                  }
                  size="small"
                  sx={editDateFieldSx}
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={!canEdit}
                />

                {canEdit && (
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleUpdate(round)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 motion-reduce:transition-none"
                    >
                      <SaveOutlinedIcon sx={{ fontSize: 17 }} />
                      Save Round
                    </button>
                  </div>
                )}
              </div>

              <RoundOperationPanel
                eventId={eventId}
                roundId={id}
                canOperate={canOperate}
                readonlyReason={operationReadonlyReason}
              />

              <RoundAdvanceRules
                eventId={eventId}
                roundId={id}
                tracks={tracks}
                canEdit={canEdit}
              />
            </div>
              );
            })()}

            {/* Right rail (1 part): every round of the event, click to focus. */}
            <aside className="space-y-3">
              <p className="px-1 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                All rounds · {rounds.length}
              </p>

              {rounds.map((r, i) => {
                const rId = getId(r);
                const rRaw = r as EditableRound;
                const rPhase = getRoundPhase(r, now);
                const rMeta = ROUND_PHASE_META[rPhase];
                const isSelected = rId === getId(selectedRound);
                const rIsLive = rPhase === "live";

                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => setSelectedRoundId(rId)}
                    aria-pressed={isSelected}
                    className={`w-full cursor-pointer rounded-xl border p-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 motion-reduce:transition-none ${
                      isSelected
                        ? "border-violet-400 bg-violet-50/70 shadow-md shadow-violet-500/10 dark:border-violet-500/60 dark:bg-violet-500/10"
                        : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/5"
                    } ${rIsLive ? "seal-preview-live" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          isSelected || rIsLive
                            ? "bg-linear-to-br from-violet-500 to-indigo-400 text-white shadow-sm shadow-violet-500/25"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                          {getName(r)}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
                          {formatRoundTime(rRaw.startAt)} →{" "}
                          {formatRoundTime(rRaw.endAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${rMeta.chipClass}`}
                    >
                      <span
                        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${rMeta.dotClass} ${
                          rIsLive ? "seal-live-dot" : ""
                        }`}
                      />
                      {rMeta.label}
                    </span>
                  </button>
                );
              })}
            </aside>
          </div>
        )}

        {!isLoading && rounds.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-500/10">
              <TimelineOutlinedIcon />
            </span>
            <p className="mt-4 font-black text-slate-600 dark:text-slate-300">
              No rounds yet
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Add rounds to define the competition timeline.
            </p>
          </div>
        )}
      </div>

      {/* Track-round preview — moved below the rounds list as a full-width panel. */}
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 dark:border-slate-700 dark:bg-slate-900/20">
        <div className="mb-5">
          <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-400 text-white shadow-md shadow-violet-500/25">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            </span>
            Track-round preview
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Judges are assigned to a specific track and round pair.
          </p>
        </div>

        {tracks.length === 0 && (
          <Alert severity="warning" sx={{ borderRadius: "12px" }}>
            Create at least one track before reviewing rounds.
          </Alert>
        )}

        {tracks.length > 0 && rounds.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
            No rounds to preview yet.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={getId(track)}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                {getTrackName(track)}
              </p>

              <div className="mt-3 space-y-2">
                {rounds.map((round, index) => {
                  const raw = round as EditableRound;
                  const phase = getRoundPhase(round, now);
                  const isLive = phase === "live";

                  return (
                    <div
                      key={`${getId(track)}-${getId(round)}`}
                      className={
                        isLive
                          ? "seal-preview-live rounded-lg bg-violet-50/70 p-3 dark:bg-violet-500/10"
                          : "rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isLive && (
                            <span className="seal-live-dot relative inline-flex h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                          )}
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {getName(round) || `Round ${index + 1}`}
                          </p>
                          {isLive && (
                            <span className="rounded-full border border-violet-300/70 bg-violet-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-300">
                              Live
                            </span>
                          )}
                          {rounds.length > 0 &&
                            index === rounds.length - 1 && (
                              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                                Final
                              </span>
                            )}
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Period: {formatRoundTime(raw.startAt)} →{" "}
                        {formatRoundTime(raw.endAt)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Submit: {formatRoundTime(raw.submissionDeadline)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Judge: {formatRoundTime(raw.judgingDeadline)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </TabShell>
  );
}
