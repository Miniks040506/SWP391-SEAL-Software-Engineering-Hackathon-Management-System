import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  editEventMock,
  eventTeamsMock,
} from "../mocks/coordinatorEditEvent.mock";
import type {
  DialogState,
  EditEventData,
  EventFormErrors,
  EventRound,
  EventTeam,
  EventTrack,
  TabId,
  TeamStatus,
} from "../types/coordinator.types";

// Types

export type UseEditEventReturn = ReturnType<typeof useEditEvent>;

// Helpers

function validateEvent(data: EditEventData): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!data.name.trim()) errors.name = "Event name is required.";
  if (!data.startDate) errors.startDate = "Start date is required.";
  if (!data.endDate) errors.endDate = "End date is required.";
  if (data.startDate && data.endDate && data.endDate < data.startDate)
    errors.endDate = "End date must be on or after start date.";
  return errors;
}

function patchTrack(
  tracks: EventTrack[],
  trackId: string,
  patch: Partial<EventTrack>,
): EventTrack[] {
  return tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t));
}

// Hook

export function useEditEvent() {
  const navigate = useNavigate();

  // State

  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [event, setEvent] = useState<EditEventData>(editEventMock);
  const [teams, setTeams] = useState<EventTeam[]>(eventTeamsMock);
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(
    Object.fromEntries(editEventMock.tracks.map((t) => [t.id, true])),
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundStart, setNewRoundStart] = useState("");
  const [newRoundEnd, setNewRoundEnd] = useState("");
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackDesc, setNewTrackDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<EventFormErrors>({});

  const pendingCount = useMemo(
    () => teams.filter((t) => t.status === "PENDING").length,
    [teams],
  );

  // Dialog

  const closeDialog = () => setDialog(null);

  const openAddJudge = (trackId: string) => {
    setSelectedIds([
      ...(event.tracks.find((t) => t.id === trackId)?.judgeIds ?? []),
    ]);
    setDialog({ kind: "addJudge", trackId });
  };

  const openAddMentor = (trackId: string) => {
    setSelectedIds([
      ...(event.tracks.find((t) => t.id === trackId)?.mentorIds ?? []),
    ]);
    setDialog({ kind: "addMentor", trackId });
  };

  const openEditCriteria = (trackId: string, roundId: string) => {
    const criteriaIds =
      event.tracks
        .find((t) => t.id === trackId)
        ?.rounds.find((r) => r.id === roundId)?.criteriaIds ?? [];
    setSelectedIds([...criteriaIds]);
    setDialog({ kind: "editCriteria", trackId, roundId });
  };

  const openAddRound = (trackId: string) => {
    setNewRoundName("");
    setNewRoundStart("");
    setNewRoundEnd("");
    setDialog({ kind: "addRound", trackId });
  };

  const openAddTrack = () => {
    setNewTrackName("");
    setNewTrackDesc("");
    setDialog({ kind: "addTrack" });
  };

  // Thêm sau openAddTrack
  const openEditTrack = (trackId: string) => {
    const track = event.tracks.find((t) => t.id === trackId);
    if (!track) return;
    setNewTrackName(track.name);
    setNewTrackDesc(track.description);
    setDialog({ kind: "editTrack", trackId });
  };

  const openEditRound = (trackId: string, roundId: string) => {
    const round = event.tracks
      .find((t) => t.id === trackId)
      ?.rounds.find((r) => r.id === roundId);
    if (!round) return;
    setNewRoundName(round.name);
    setNewRoundStart(round.startDate);
    setNewRoundEnd(round.endDate);
    setDialog({ kind: "editRound", trackId, roundId });
  };

  const confirmEditTrack = () => {
    if (dialog?.kind !== "editTrack" || !newTrackName.trim()) return;
    setEvent((prev) => ({
      ...prev,
      tracks: patchTrack(prev.tracks, dialog.trackId, {
        name: newTrackName,
        description: newTrackDesc,
      }),
    }));
    closeDialog();
  };

  const confirmEditRound = () => {
    if (dialog?.kind !== "editRound" || !newRoundName.trim()) return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId
          ? {
              ...t,
              rounds: t.rounds.map((r) =>
                r.id === dialog.roundId
                  ? {
                      ...r,
                      name: newRoundName,
                      startDate: newRoundStart,
                      endDate: newRoundEnd,
                    }
                  : r,
              ),
            }
          : t,
      ),
    }));
    closeDialog();
  };

  // Dialog confirms

  const confirmAddRound = () => {
    if (dialog?.kind !== "addRound" || !newRoundName) return;
    const newRound: EventRound = {
      id: `round-${Date.now()}`,
      name: newRoundName,
      startDate: newRoundStart,
      endDate: newRoundEnd,
      criteriaIds: [],
    };
    setEvent((prev) => ({
      ...prev,
      tracks: patchTrack(prev.tracks, dialog.trackId, {
        rounds: [
          ...(prev.tracks.find((t) => t.id === dialog.trackId)?.rounds ?? []),
          newRound,
        ],
      }),
    }));
    closeDialog();
  };

  const confirmAddTrack = () => {
    if (!newTrackName) return;
    const newTrack: EventTrack = {
      id: `track-${Date.now()}`,
      name: newTrackName,
      description: newTrackDesc,
      judgeIds: [],
      mentorIds: [],
      rounds: [],
    };
    setEvent((prev) => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
    setExpandedTracks((prev) => ({ ...prev, [newTrack.id]: true }));
    closeDialog();
  };

  const confirmAddJudge = () => {
    if (dialog?.kind !== "addJudge") return;
    setEvent((prev) => ({
      ...prev,
      tracks: patchTrack(prev.tracks, dialog.trackId, {
        judgeIds: selectedIds,
      }),
    }));
    closeDialog();
  };

  const confirmAddMentor = () => {
    if (dialog?.kind !== "addMentor") return;
    setEvent((prev) => ({
      ...prev,
      tracks: patchTrack(prev.tracks, dialog.trackId, {
        mentorIds: selectedIds,
      }),
    }));
    closeDialog();
  };

  const confirmEditCriteria = () => {
    if (dialog?.kind !== "editCriteria") return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId
          ? {
              ...t,
              rounds: t.rounds.map((r) =>
                r.id === dialog.roundId
                  ? { ...r, criteriaIds: selectedIds }
                  : r,
              ),
            }
          : t,
      ),
    }));
    closeDialog();
  };

  // Event handlers

  const handleSave = async () => {
    const validationErrors = validateEvent(event);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab("info");
      return;
    }
    setIsSaving(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    navigate("/coordinator/events");
  };

  const handleDiscard = () => {
    setEvent(editEventMock);
    setTeams(eventTeamsMock);
    setErrors({});
    navigate("/coordinator/events");
  };

  const handleEventChange = (field: keyof EditEventData, value: string) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof EventFormErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Track handlers

  const toggleExpand = (id: string) =>
    setExpandedTracks((prev) => ({ ...prev, [id]: !prev[id] }));

  const removeTrack = (trackId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
    }));

  const removeRound = (trackId: string, roundId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, rounds: t.rounds.filter((r) => r.id !== roundId) }
          : t,
      ),
    }));

  const removeUser = (
    trackId: string,
    userId: string,
    field: "judgeIds" | "mentorIds",
  ) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, [field]: t[field].filter((id) => id !== userId) }
          : t,
      ),
    }));

  // Selection helpers

  const toggleSelectId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Team handlers

  const updateTeamStatus = (teamId: string, status: TeamStatus) =>
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status } : t)),
    );

  const handleSelectAllTrackTeams = (trackId: string, checked: boolean) => {
    const trackTeamIds = teams
      .filter((t) => t.trackId === trackId)
      .map((t) => t.id);
    setSelectedTeamIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...trackTeamIds]))
        : prev.filter((id) => !trackTeamIds.includes(id)),
    );
  };

  const handleToggleSelectTeam = (teamId: string) =>
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );

  const handleBulkTeamStatusUpdate = (trackId: string, status: TeamStatus) => {
    const trackTeamIds = teams
      .filter((t) => t.trackId === trackId)
      .map((t) => t.id);
    const toUpdate = selectedTeamIds.filter((id) => trackTeamIds.includes(id));
    setTeams((prev) =>
      prev.map((t) => (toUpdate.includes(t.id) ? { ...t, status } : t)),
    );
    setSelectedTeamIds((prev) => prev.filter((id) => !toUpdate.includes(id)));
  };

  return {
    // State
    activeTab,
    setActiveTab,
    event,
    teams,
    expandedTracks,
    dialog,
    setDialog,
    selectedIds,
    selectedTeamIds,
    newRoundName,
    setNewRoundName,
    newRoundStart,
    setNewRoundStart,
    newRoundEnd,
    setNewRoundEnd,
    newTrackName,
    setNewTrackName,
    newTrackDesc,
    setNewTrackDesc,
    isSaving,
    errors,
    pendingCount,
    // Handlers
    closeDialog,
    handleSave,
    handleDiscard,
    handleEventChange,
    toggleExpand,
    removeTrack,
    removeRound,
    removeUser,
    openAddJudge,
    openAddMentor,
    openEditCriteria,
    openAddRound,
    openAddTrack,
    confirmAddRound,
    confirmAddTrack,
    confirmAddJudge,
    confirmAddMentor,
    openEditTrack,
    openEditRound,
    confirmEditTrack,
    confirmEditRound,
    confirmEditCriteria,
    toggleSelectId,
    updateTeamStatus,
    handleSelectAllTrackTeams,
    handleToggleSelectTeam,
    handleBulkTeamStatusUpdate,
  };
}
