import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Checkbox, CircularProgress, FormControlLabel, IconButton, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

import { trackApi } from "@/api/track.api";
import { REQUIRED_LINK_TYPES } from "@/features/coordinator/schemas/createEvent.schema";
import type { UUID } from "@/types/common.types";
import type { TrackResponse } from "@/types/track.types";

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
};

const emptyTrack: TrackForm = {
  name: "",
  description: "",
  maxTeams: "",
  requiredLinkTypes: [],
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

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

export function TracksTab({
  eventId,
  tracks,
  isLoading,
  onChanged,
}: TracksTabProps) {
  const [newTrack, setNewTrack] = useState<TrackForm>(emptyTrack);
  const [editing, setEditing] = useState<Record<string, TrackForm>>({});

  useEffect(() => {
    setEditing((current) => {
      const next: Record<string, TrackForm> = {};

      tracks.forEach((track) => {
        const id = (track as EditableTrack).id;
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
      enqueueSnackbar("Track created.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to create track.", { variant: "error" });
    }
  };

  const handleUpdate = async (track: TrackResponse) => {
    const raw = track as EditableTrack;
    const values = editing[raw.id];

    if (!values?.name?.trim()) {
      enqueueSnackbar("Track name is required.", { variant: "error" });
      return;
    }

    try {
      await trackApi.updateTrack(raw.id, {
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
    try {
      await trackApi.deleteTrack(trackId);
      enqueueSnackbar("Track deleted.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to delete track.", { variant: "error" });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
          Tracks
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-500">
          Create and manage event tracks. This layout matches the create-event track step.
        </p>
      </div>

      <div className="space-y-5 px-7 py-6">
        <div className="rounded-2xl border border-dashed border-slate-200 p-5 dark:border-slate-700">
          <h3 className="mb-4 font-black text-slate-800 dark:text-white">
            Add Track
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Track name"
              value={newTrack.name}
              onChange={(event) =>
                setNewTrack((current) => ({ ...current, name: event.target.value }))
              }
              size="small"
              sx={textFieldSx}
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
              sx={textFieldSx}
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
              sx={textFieldSx}
            />

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                Required submission links
              </p>

              <div className="flex flex-wrap gap-3">
                {REQUIRED_LINK_TYPES.map((type) => (
                  <FormControlLabel
                    key={type}
                    label={type}
                    control={
                      <Checkbox
                        checked={newTrack.requiredLinkTypes.includes(type)}
                        onChange={(_, checked) =>
                          setNewTrack((current) => ({
                            ...current,
                            requiredLinkTypes: toggleRequiredLinkType(current, type, checked),
                          }))
                        }
                      />
                    }
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Button
                variant="outlined"
                startIcon={<AddOutlinedIcon />}
                onClick={handleCreate}
                sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
              >
                Add Track
              </Button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <CircularProgress />
          </div>
        )}

        {tracks.map((track, index) => {
          const raw = track as EditableTrack;
          const values = editing[raw.id] ?? createTrackForm(track);

          return (
            <div
              key={raw.id}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-white">
                  Track {index + 1}
                </h3>

                <IconButton color="error" onClick={() => handleDelete(raw.id)}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Track name"
                  value={values.name}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [raw.id]: { ...values, name: event.target.value },
                    }))
                  }
                  size="small"
                  sx={textFieldSx}
                />

                <TextField
                  label="Max teams"
                  type="number"
                  value={values.maxTeams}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [raw.id]: { ...values, maxTeams: event.target.value },
                    }))
                  }
                  size="small"
                  sx={textFieldSx}
                />

                <TextField
                  label="Description"
                  value={values.description}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      [raw.id]: { ...values, description: event.target.value },
                    }))
                  }
                  multiline
                  minRows={3}
                  className="md:col-span-2"
                  size="small"
                  sx={textFieldSx}
                />

                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                    Required submission links
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {REQUIRED_LINK_TYPES.map((type) => (
                      <FormControlLabel
                        key={type}
                        label={type}
                        control={
                          <Checkbox
                            checked={values.requiredLinkTypes.includes(type)}
                            onChange={(_, checked) =>
                              setEditing((current) => ({
                                ...current,
                                [raw.id]: {
                                  ...values,
                                  requiredLinkTypes: toggleRequiredLinkType(values, type, checked),
                                },
                              }))
                            }
                          />
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => handleUpdate(track)}
                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
                  >
                    Save Track
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && tracks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
            No tracks yet.
          </div>
        )}
      </div>
    </section>
  );
}
