import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Alert, CircularProgress, IconButton, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

import { trackApi } from "@/api/track.api";
import { REQUIRED_LINK_TYPES } from "@/features/coordinator/schemas/createEvent.schema";
import type { UUID } from "@/types/common.types";
import type { TrackResponse } from "@/types/track.types";

import { editFieldSx } from "./editEventUi";
import { TabShell } from "./TabShell";

type EditableTrack = TrackResponse & {
  id: UUID;
  name?: string;
  trackName?: string;
  description?: string | null;
  maxTeams?: number | null;
  requiredLinkTypes?: string[] | null;
};

type TrackForm = {
  name: string;
  description: string;
  maxTeams: string;
  requiredLinkTypes: string[];
};

type TracksTabProps = {
  eventId: UUID;
  tracks: TrackResponse[];
  isLoading: boolean;
  onChanged: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
};

const emptyTrack: TrackForm = {
  name: "",
  description: "",
  maxTeams: "",
  requiredLinkTypes: [],
};

function getId(track: TrackResponse) {
  return (track as EditableTrack).id;
}

function getTrackName(track: TrackResponse) {
  const raw = track as EditableTrack;
  return raw.name ?? raw.trackName ?? "Untitled track";
}

function getTrackDescription(track: TrackResponse) {
  return ((track as EditableTrack).description ?? "") as string;
}

function getMaxTeams(track: TrackResponse) {
  return (track as EditableTrack).maxTeams ?? "";
}

function getRequiredLinkTypes(track: TrackResponse) {
  return (track as EditableTrack).requiredLinkTypes ?? [];
}

function createTrackForm(track: TrackResponse): TrackForm {
  return {
    name: getTrackName(track),
    description: getTrackDescription(track),
    maxTeams: String(getMaxTeams(track) ?? ""),
    requiredLinkTypes: getRequiredLinkTypes(track),
  };
}

/** Pill-style toggle for required submission link types. */
function LinkTypeChips({
  selected,
  disabled,
  onToggle,
}: {
  selected: string[];
  disabled?: boolean;
  onToggle: (type: string, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {REQUIRED_LINK_TYPES.map((type) => {
        const checked = selected.includes(type);

        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            aria-pressed={checked}
            onClick={() => onToggle(type, !checked)}
            className={[
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50",
              checked
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            {checked && <CheckOutlinedIcon sx={{ fontSize: 13 }} />}
            {type}
          </button>
        );
      })}
    </div>
  );
}

export function TracksTab({
  eventId,
  tracks,
  isLoading,
  onChanged,
  canEdit,
  readonlyReason,
}: TracksTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrack, setNewTrack] = useState<TrackForm>(emptyTrack);
  const [editing, setEditing] = useState<Record<string, TrackForm>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditing((current) => {
      const next: Record<string, TrackForm> = {};

      tracks.forEach((track) => {
        const id = getId(track);
        next[id] = current[id] ?? createTrackForm(track);
      });

      return next;
    });
  }, [tracks]);

  const toggleRequiredLinkType = (
    values: TrackForm,
    type: string,
    checked: boolean,
  ) => {
    const selected = values.requiredLinkTypes ?? [];

    return checked
      ? Array.from(new Set([...selected, type]))
      : selected.filter((item) => item !== type);
  };

  const handleCreate = async () => {
    if (!canEdit) return;

    if (!newTrack.name.trim()) {
      enqueueSnackbar("Track name is required.", { variant: "error" });
      return;
    }

    try {
      await trackApi.createTrack(eventId, {
        name: newTrack.name.trim(),
        description: newTrack.description.trim() || undefined,
        maxTeams: newTrack.maxTeams ? Number(newTrack.maxTeams) : undefined,
        requiredLinkTypes: newTrack.requiredLinkTypes,
      });

      setNewTrack(emptyTrack);
      setShowAddForm(false);
      enqueueSnackbar("Track created.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to create track.", { variant: "error" });
    }
  };

  const handleUpdate = async (track: TrackResponse) => {
    if (!canEdit) return;

    const id = getId(track);
    const values = editing[id];

    if (!values?.name?.trim()) {
      enqueueSnackbar("Track name is required.", { variant: "error" });
      return;
    }

    try {
      await trackApi.updateTrack(id, {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        maxTeams: values.maxTeams ? Number(values.maxTeams) : undefined,
        requiredLinkTypes: values.requiredLinkTypes,
      });

      enqueueSnackbar("Track updated.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to update track.", { variant: "error" });
    }
  };

  const handleDelete = async (trackId: UUID) => {
    if (!canEdit) return;

    try {
      await trackApi.deleteTrack(trackId);
      enqueueSnackbar("Track deleted.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to delete track.", { variant: "error" });
    }
  };

  return (
    <TabShell
      tab="TRACKS"
      title="Tracks"
      description="Create and manage event tracks. Track structure is locked from ONGOING onward."
      headerActions={
        canEdit && !showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 motion-reduce:transition-none"
          >
            <AddOutlinedIcon sx={{ fontSize: 17 }} />
            Add Track
          </button>
        ) : undefined
      }
      bodyClassName="space-y-5 px-7 py-6"
    >
      {!canEdit && readonlyReason && (
        <Alert severity="warning" sx={{ borderRadius: "14px" }}>
          {readonlyReason}
        </Alert>
      )}

      {canEdit && showAddForm && (
        <div className="rounded-2xl border-2 border-dashed border-emerald-300/70 bg-emerald-50/40 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/25">
                <AddOutlinedIcon sx={{ fontSize: 19 }} />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                New Track
              </h3>
            </div>
            <IconButton
              onClick={() => setShowAddForm(false)}
              size="small"
              aria-label="Close add track form"
            >
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Track name"
              value={newTrack.name}
              onChange={(event) =>
                setNewTrack((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              size="small"
              sx={editFieldSx}
            />

            <TextField
              label="Max teams"
              type="number"
              value={newTrack.maxTeams}
              onChange={(event) =>
                setNewTrack((current) => ({
                  ...current,
                  maxTeams: event.target.value,
                }))
              }
              size="small"
              sx={editFieldSx}
            />

            <TextField
              label="Description"
              value={newTrack.description}
              onChange={(event) =>
                setNewTrack((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              multiline
              minRows={3}
              className="md:col-span-2"
              size="small"
              sx={editFieldSx}
            />

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                Required submission links
              </p>

              <LinkTypeChips
                selected={newTrack.requiredLinkTypes}
                onToggle={(type, checked) =>
                  setNewTrack((current) => ({
                    ...current,
                    requiredLinkTypes: toggleRequiredLinkType(
                      current,
                      type,
                      checked,
                    ),
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 motion-reduce:transition-none"
              >
                <AddOutlinedIcon sx={{ fontSize: 17 }} />
                Add Track
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

      {tracks.map((track, index) => {
        const id = getId(track);
        const values = editing[id] ?? createTrackForm(track);

        return (
          <div
            key={id}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-colors dark:border-slate-700 dark:bg-slate-800/30"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 text-sm font-black text-white shadow-md shadow-emerald-500/25">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Track {index + 1}
                  </p>
                  <h3 className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                    <RouteOutlinedIcon
                      sx={{ fontSize: 16 }}
                      className="text-emerald-500"
                    />
                    {values.name || "Untitled track"}
                  </h3>
                </div>
              </div>

              {canEdit && (
                <IconButton
                  color="error"
                  onClick={() => handleDelete(id)}
                  aria-label={`Delete track ${values.name || index + 1}`}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Track name"
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
                label="Max teams"
                type="number"
                value={values.maxTeams}
                onChange={(event) =>
                  setEditing((current) => ({
                    ...current,
                    [id]: { ...values, maxTeams: event.target.value },
                  }))
                }
                size="small"
                sx={editFieldSx}
                disabled={!canEdit}
              />

              <TextField
                label="Description"
                value={values.description}
                onChange={(event) =>
                  setEditing((current) => ({
                    ...current,
                    [id]: { ...values, description: event.target.value },
                  }))
                }
                multiline
                minRows={3}
                className="md:col-span-2"
                size="small"
                sx={editFieldSx}
                disabled={!canEdit}
              />

              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                  Required submission links
                </p>

                <LinkTypeChips
                  selected={values.requiredLinkTypes}
                  disabled={!canEdit}
                  onToggle={(type, checked) =>
                    setEditing((current) => ({
                      ...current,
                      [id]: {
                        ...values,
                        requiredLinkTypes: toggleRequiredLinkType(
                          values,
                          type,
                          checked,
                        ),
                      },
                    }))
                  }
                />
              </div>

              {canEdit && (
                <div className="md:col-span-2 flex justify-end border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
                  <button
                    type="button"
                    onClick={() => handleUpdate(track)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 motion-reduce:transition-none"
                  >
                    <SaveOutlinedIcon sx={{ fontSize: 17 }} />
                    Save Track
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!isLoading && tracks.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
            <RouteOutlinedIcon />
          </span>
          <p className="mt-4 font-black text-slate-600 dark:text-slate-300">
            No tracks yet
          </p>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Add the first track so teams can register and compete.
          </p>
        </div>
      )}
    </TabShell>
  );
}
