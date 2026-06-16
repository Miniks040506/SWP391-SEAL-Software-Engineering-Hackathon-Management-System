import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

import { roundApi } from "@/api/round.api";
import type { UUID } from "@/types/common.types";
import type { AdvanceRuleResponse, RoundResponse } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";

type EditableRound = RoundResponse & {
  id: UUID;
  name?: string;
  roundName?: string;
  orderIndex?: number;
  isFinal?: boolean;
  submissionDeadline?: string | null;
  judgingDeadline?: string | null;
};

type RoundForm = {
  name: string;
  orderIndex: string;
  submissionDeadline: string;
  judgingDeadline: string;
};

type RoundsTabProps = {
  eventId: UUID;
  tracks: TrackResponse[];
  rounds: RoundResponse[];
  isLoading: boolean;
  onChanged: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
};

const emptyRound: RoundForm = {
  name: "",
  orderIndex: "",
  submissionDeadline: "",
  judgingDeadline: "",
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
    backgroundColor: "#0f172a",
  },
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

function createRoundForm(round: RoundResponse): RoundForm {
  const raw = round as EditableRound;

  return {
    name: getName(round),
    orderIndex: String(raw.orderIndex ?? 0),
    submissionDeadline: toDateTimeLocal(raw.submissionDeadline),
    judgingDeadline: toDateTimeLocal(raw.judgingDeadline),
  };
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

function AdvanceRuleModal({ open, onClose, onSave, tracks, initialData }: any) {
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
    const rule: any = {
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
      <DialogTitle>
        {initialData ? "Edit Advance Rule" : "Add Advance Rule"}
      </DialogTitle>
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
          {tracks.map((t: any) => (
            <MenuItem key={t.id ?? t.trackId} value={t.id ?? t.trackId}>
              {t.name || t.trackName || "Unnamed track"}
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

function RoundAdvanceRules({
  roundId,
  tracks,
  canEdit,
}: {
  roundId: string;
  tracks: any[];
  canEdit: boolean;
}) {
  const [rules, setRules] = useState<AdvanceRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AdvanceRuleResponse | null>(
    null,
  );

  const fetchRules = async () => {
    try {
      const data = await roundApi.getAdvanceRules(roundId);
      setRules(data);
    } catch {
      enqueueSnackbar("Failed to load advance rules.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [roundId]);

  const handleCreate = async (payload: any) => {
    try {
      await roundApi.createAdvanceRule(roundId, payload);
      enqueueSnackbar("Rule created.", { variant: "success" });
      setModalOpen(false);
      fetchRules();
    } catch {
      enqueueSnackbar("Failed to create rule.", { variant: "error" });
    }
  };

  const handleUpdate = async (ruleId: string, payload: any) => {
    try {
      await roundApi.updateAdvanceRule(ruleId, payload);
      enqueueSnackbar("Rule updated.", { variant: "success" });
      setEditingRule(null);
      fetchRules();
    } catch {
      enqueueSnackbar("Failed to update rule.", { variant: "error" });
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm("Delete this advance rule?")) return;
    try {
      await roundApi.deleteAdvanceRule(ruleId);
      enqueueSnackbar("Rule deleted.", { variant: "success" });
      fetchRules();
    } catch {
      enqueueSnackbar("Failed to delete rule.", { variant: "error" });
    }
  };

  if (loading)
    return (
      <div className="mt-4 flex justify-center">
        <CircularProgress size={20} />
      </div>
    );

  return (
    <div className="col-span-1 md:col-span-2 mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Advance Rules
        </h4>
        {canEdit && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setModalOpen(true)}
            startIcon={<AddOutlinedIcon />}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
          >
            Add Rule
          </Button>
        )}
      </div>

      {rules.length === 0 ? (
        <p className="text-xs text-slate-500">
          No advance rules configured for this round.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mt-3">
          {rules.map((rule) => {
            const trackName = rule.trackId
              ? tracks.find((t: any) => (t.id ?? t.trackId) === rule.trackId)
                  ?.name ||
                tracks.find((t: any) => (t.id ?? t.trackId) === rule.trackId)
                  ?.trackName ||
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
                className={`relative inline-flex group items-center gap-2 px-3.5 py-1.5 rounded-full border font-medium text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${getRuleChipStyle(rule.ruleType)}`}
                onClick={() => canEdit && setEditingRule(rule)}
              >
                <span>
                  {rule.ruleType} · {val}
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
                    ×
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
          onSave={(payload: any) => handleUpdate(editingRule.id, payload)}
        />
      )}
    </div>
  );
}

export function RoundsTab({
  eventId,
  tracks,
  rounds,
  isLoading,
  onChanged,
  canEdit,
  readonlyReason,
}: RoundsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRound, setNewRound] = useState<RoundForm>(emptyRound);
  const [editing, setEditing] = useState<Record<string, RoundForm>>({});

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

    if (!newRound.name.trim()) {
      enqueueSnackbar("Round name is required.", { variant: "error" });
      return;
    }

    try {
      const orderIndex = rounds.length + 1;

      await roundApi.createRound(eventId, {
        name: newRound.name.trim(),
        orderIndex,
        isFinal: true,
        submissionDeadline: newRound.submissionDeadline
          ? `${newRound.submissionDeadline}:00`
          : undefined,
        judgingDeadline: newRound.judgingDeadline
          ? `${newRound.judgingDeadline}:00`
          : undefined,
      });

      // Update other rounds to ensure only max has isFinal
      const otherFinalRounds = rounds.filter((r) => r.isFinal);
      await Promise.all(
        otherFinalRounds.map((r) =>
          roundApi.updateRound(r.id, {
            name: r.name,
            orderIndex: r.orderIndex,
            isFinal: false,
            submissionDeadline: r.submissionDeadline,
            judgingDeadline: r.judgingDeadline,
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

    if (!values?.name?.trim()) {
      enqueueSnackbar("Round name is required.", { variant: "error" });
      return;
    }

    try {
      const orderIndex = round.orderIndex;
      const maxOI = Math.max(...rounds.map((r) => r.orderIndex ?? 0));
      const isFinal = orderIndex === maxOI;

      await roundApi.updateRound(id, {
        name: values.name.trim(),
        orderIndex,
        isFinal,
        submissionDeadline: values.submissionDeadline
          ? `${values.submissionDeadline}:00`
          : undefined,
        judgingDeadline: values.judgingDeadline
          ? `${values.judgingDeadline}:00`
          : undefined,
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
      await roundApi.deleteRound(roundId);

      const remainingRounds = rounds
        .filter((r) => r.id !== roundId)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

      await Promise.all(
        remainingRounds.map((r, idx) => {
          const expectedOrder = idx + 1;
          const isFinal = expectedOrder === remainingRounds.length;
          if (r.orderIndex !== expectedOrder || r.isFinal !== isFinal) {
            return roundApi.updateRound(r.id, {
              name: r.name,
              orderIndex: expectedOrder,
              isFinal,
              submissionDeadline: r.submissionDeadline,
              judgingDeadline: r.judgingDeadline,
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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-7 py-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
              Rounds
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Create event-level round templates separately. Round structure is
              locked from ONGOING onward.
            </p>
          </div>

          {canEdit && !showAddForm && (
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => setShowAddForm(true)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 900,
              }}
            >
              Add Round
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          {!canEdit && readonlyReason && (
            <Alert severity="warning">{readonlyReason}</Alert>
          )}

          {canEdit && showAddForm && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-black text-slate-800 dark:text-white">
                  Add Round
                </h3>
                <IconButton onClick={() => setShowAddForm(false)}>
                  <CloseOutlinedIcon />
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
                  sx={textFieldSx}
                />

                <TextField
                  label="Order index"
                  type="number"
                  value={rounds.length + 1}
                  size="small"
                  sx={textFieldSx}
                  disabled
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
                  sx={dateTimeFieldSx}
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  label="Judging deadline"
                  type="datetime-local"
                  value={newRound.judgingDeadline}
                  onChange={(event) =>
                    setNewRound((current) => ({
                      ...current,
                      judgingDeadline: event.target.value,
                    }))
                  }
                  size="small"
                  sx={dateTimeFieldSx}
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <Button
                  variant="outlined"
                  startIcon={<AddOutlinedIcon />}
                  onClick={handleCreate}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Add Round
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-12">
              <CircularProgress />
            </div>
          )}

          {rounds.map((round, index) => {
            const id = getId(round);
            const values = editing[id] ?? createRoundForm(round);

            return (
              <div
                key={id}
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
                      This round appears under every track.
                    </p>
                  </div>

                  {canEdit && (
                    <IconButton color="error" onClick={() => handleDelete(id)}>
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
                    sx={textFieldSx}
                    disabled={!canEdit}
                  />

                  <TextField
                    label="Order index"
                    type="number"
                    value={index + 1}
                    size="small"
                    sx={textFieldSx}
                    disabled
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
                    sx={dateTimeFieldSx}
                    slotProps={{ inputLabel: { shrink: true } }}
                    disabled={!canEdit}
                  />

                  <TextField
                    label="Judging deadline"
                    type="datetime-local"
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
                    sx={dateTimeFieldSx}
                    slotProps={{ inputLabel: { shrink: true } }}
                    disabled={!canEdit}
                  />

                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<SaveOutlinedIcon />}
                      onClick={() => handleUpdate(round)}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 900,
                      }}
                    >
                      Save Round
                    </Button>
                  )}
                </div>

                <RoundAdvanceRules
                  roundId={id}
                  tracks={tracks}
                  canEdit={canEdit}
                />
              </div>
            );
          })}

          {!isLoading && rounds.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
              No rounds yet.
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-900/20">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <CalendarTodayOutlinedIcon
                fontSize="small"
                className="text-blue-500"
              />
              Track-round preview
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Judges are assigned to a specific track and round pair.
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
                key={getId(track)}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-black text-slate-900 dark:text-white">
                  Track: {getTrackName(track)}
                </p>

                <div className="mt-3 space-y-2">
                  {rounds.map((round, index) => {
                    const raw = round as EditableRound;

                    return (
                      <div
                        key={`${getId(track)}-${getId(round)}`}
                        className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {getName(round) || `Round ${index + 1}`}
                            </p>
                            {rounds.length > 0 &&
                              index === rounds.length - 1 && (
                                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                  Final
                                </span>
                              )}
                          </div>
                        </div>
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
        </aside>
      </div>
    </section>
  );
}
