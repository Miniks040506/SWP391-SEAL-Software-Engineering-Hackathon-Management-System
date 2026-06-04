import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

import { roundApi } from "@/api/round.api";
import type { UUID } from "@/types/common.types";
import type { RoundResponse } from "@/types/round.types";
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
  isFinal: boolean;
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
  isFinal: false,
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
    isFinal: Boolean(raw.isFinal),
    submissionDeadline: toDateTimeLocal(raw.submissionDeadline),
    judgingDeadline: toDateTimeLocal(raw.judgingDeadline),
  };
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
      await roundApi.createRound(eventId, {
        name: newRound.name.trim(),
        orderIndex: newRound.orderIndex
          ? Number(newRound.orderIndex)
          : rounds.length,
        isFinal: newRound.isFinal,
        submissionDeadline: newRound.submissionDeadline
          ? `${newRound.submissionDeadline}:00`
          : undefined,
        judgingDeadline: newRound.judgingDeadline
          ? `${newRound.judgingDeadline}:00`
          : undefined,
      });

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
      await roundApi.updateRound(id, {
        name: values.name.trim(),
        orderIndex: values.orderIndex ? Number(values.orderIndex) : 0,
        isFinal: values.isFinal,
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
                  value={newRound.orderIndex}
                  onChange={(event) =>
                    setNewRound((current) => ({
                      ...current,
                      orderIndex: event.target.value,
                    }))
                  }
                  size="small"
                  sx={textFieldSx}
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

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newRound.isFinal}
                      onChange={(_, checked) =>
                        setNewRound((current) => ({
                          ...current,
                          isFinal: checked,
                        }))
                      }
                    />
                  }
                  label="Final round"
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
                    <h3 className="font-black text-slate-900 dark:text-white">
                      Round {index + 1}
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
                    value={values.orderIndex}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        [id]: { ...values, orderIndex: event.target.value },
                      }))
                    }
                    size="small"
                    sx={textFieldSx}
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

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.isFinal}
                        disabled={!canEdit}
                        onChange={(_, checked) =>
                          setEditing((current) => ({
                            ...current,
                            [id]: { ...values, isFinal: checked },
                          }))
                        }
                      />
                    }
                    label="Final round"
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
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {getName(round) || `Round ${index + 1}`}
                          </p>
                          {raw.isFinal && (
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                              Final
                            </span>
                          )}
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
