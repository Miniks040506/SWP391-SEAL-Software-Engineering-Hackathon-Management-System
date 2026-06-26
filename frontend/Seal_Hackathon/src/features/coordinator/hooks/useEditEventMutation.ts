import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  editEventMock,
  eventTeamsMock,
  type EditEventData,
  type EventRound,
  type EventTeam,
  type EventTrack,
} from "../mocks/coordinatorEditEvent.mock";

const USE_MOCK = false;

const emptyEvent: EditEventData = {
  id: "",
  name: "",
  season: "Spring",
  description: "",
  startDate: "",
  endDate: "",
  status: "DRAFT",
  tracks: [],
};

export type TabId =
  | "info"
  | "tracks"
  | "rounds"
  | "prizes"
  | "assignments"
  | "criteria"
  | "teams";

export type TeamStatus = "PENDING" | "APPROVED" | "REJECTED";

export type EventFormErrors = {
  name?: string;
  startDate?: string;
  endDate?: string;
};

export type DialogState =
  | {
    kind: "addJudge";
    trackId: string;
    roundId: string;
    initialSelectedIds: string[];
  }
  | {
    kind: "addMentor";
    trackId: string;
    initialSelectedIds: string[];
  }
  | {
    kind: "editCriteria";
    trackId: string;
    roundId: string;
    initialSelectedIds: string[];
  }
  | { kind: "addRound"; trackId: string }
  | { kind: "addTrack" }
  | {
    kind: "editTrack";
    trackId: string;
    initialName: string;
    initialDesc: string;
  }
  | {
    kind: "editRound";
    trackId: string;
    roundId: string;
    initialName: string;
    initialStart: string;
    initialEnd: string;
  }
  | { kind: "teamDetail"; team: EventTeam }
  | null;

export type UseEditEventMutationReturn = ReturnType<
  typeof useEditEventMutation
>;

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

export function useEditEventMutation() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("info");

  // Áp dụng USE_MOCK vào khởi tạo State
  const [event, setEvent] = useState<EditEventData>(
    USE_MOCK ? editEventMock : emptyEvent,
  );
  const [teams, setTeams] = useState<EventTeam[]>(
    USE_MOCK ? eventTeamsMock : [],
  );
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(
    Object.fromEntries(
      (USE_MOCK ? editEventMock.tracks : []).map((t) => [t.id, true]),
    ),
  );

  const [dialog, setDialog] = useState<DialogState>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<EventFormErrors>({});

  const pendingCount = useMemo(
    () => teams.filter((t) => t.status === "PENDING").length,
    [teams],
  );

  const closeDialog = () => setDialog(null);

  const openAddTrack = () => setDialog({ kind: "addTrack" });

  const openEditTrack = (trackId: string) => {
    const track = event.tracks.find((t) => t.id === trackId);
    if (!track) return;
    setDialog({
      kind: "editTrack",
      trackId,
      initialName: track.name,
      initialDesc: track.description,
    });
  };

  const openAddRound = (trackId: string) =>
    setDialog({ kind: "addRound", trackId });

  const openEditRound = (trackId: string, roundId: string) => {
    const round = event.tracks
      .find((t) => t.id === trackId)
      ?.rounds.find((r) => r.id === roundId);
    if (!round) return;
    setDialog({
      kind: "editRound",
      trackId,
      roundId,
      initialName: round.name,
      initialStart: round.startDate,
      initialEnd: round.endDate,
    });
  };

  const openAddJudge = (trackId: string, roundId: string) => {
    const initialSelectedIds = [
      ...(event.tracks
        .find((t) => t.id === trackId)
        ?.rounds.find((r) => r.id === roundId)?.judgeIds ?? []),
    ];
    setDialog({ kind: "addJudge", trackId, roundId, initialSelectedIds });
  };

  const openAddMentor = (trackId: string) => {
    const initialSelectedIds = [
      ...(event.tracks.find((t) => t.id === trackId)?.mentorIds ?? []),
    ];
    setDialog({ kind: "addMentor", trackId, initialSelectedIds });
  };

  const openEditCriteria = (trackId: string, roundId: string) => {
    const initialSelectedIds = [
      ...(event.tracks
        .find((t) => t.id === trackId)
        ?.rounds.find((r) => r.id === roundId)?.criteriaIds ?? []),
    ];
    setDialog({ kind: "editCriteria", trackId, roundId, initialSelectedIds });
  };

  const openTeamDetail = (team: EventTeam) =>
    setDialog({ kind: "teamDetail", team });

  const confirmAddTrack = (name: string, desc: string) => {
    if (!name.trim()) return;
    const newTrack: EventTrack = {
      id: `track-${Date.now()}`,
      name,
      description: desc,
      mentorIds: [],
      rounds: [],
    };
    setEvent((prev) => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
    setExpandedTracks((prev) => ({ ...prev, [newTrack.id]: true }));
    closeDialog();
  };

  const confirmEditTrack = (name: string, desc: string) => {
    if (dialog?.kind !== "editTrack" || !name.trim()) return;
    setEvent((prev) => ({
      ...prev,
      tracks: patchTrack(prev.tracks, dialog.trackId, {
        name,
        description: desc,
      }),
    }));
    closeDialog();
  };

  const confirmAddRound = (name: string, start: string, end: string) => {
    if (dialog?.kind !== "addRound" || !name.trim()) return;
    const newRound: EventRound = {
      id: `round-${Date.now()}`,
      name,
      startDate: start,
      endDate: end,
      criteriaIds: [],
      judgeIds: [], // Đã bổ sung judgeIds vào Round
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

  const confirmEditRound = (name: string, start: string, end: string) => {
    if (dialog?.kind !== "editRound" || !name.trim()) return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId
          ? {
            ...t,
            rounds: t.rounds.map((r) =>
              r.id === dialog.roundId
                ? { ...r, name, startDate: start, endDate: end }
                : r,
            ),
          }
          : t,
      ),
    }));
    closeDialog();
  };

  const confirmAddJudge = (ids: string[]) => {
    if (dialog?.kind !== "addJudge") return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId
          ? {
            ...t,
            rounds: t.rounds.map((r) =>
              r.id === dialog.roundId ? { ...r, judgeIds: ids } : r,
            ),
          }
          : t,
      ),
    }));
    closeDialog();
  };

  const confirmAddMentor = (ids: string[]) => {
    if (dialog?.kind !== "addMentor") return;
    setEvent((prev) => ({
      ...prev,
      tracks: patchTrack(prev.tracks, dialog.trackId, { mentorIds: ids }),
    }));
    closeDialog();
  };

  const confirmEditCriteria = (ids: string[]) => {
    if (dialog?.kind !== "editCriteria") return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId
          ? {
            ...t,
            rounds: t.rounds.map((r) =>
              r.id === dialog.roundId ? { ...r, criteriaIds: ids } : r,
            ),
          }
          : t,
      ),
    }));
    closeDialog();
  };

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
    setEvent(USE_MOCK ? editEventMock : emptyEvent);
    setTeams(USE_MOCK ? eventTeamsMock : []);
    setErrors({});
    navigate("/coordinator/events");
  };

  const handleEventChange = (field: keyof EditEventData, value: string) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof EventFormErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

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

  const removeMentor = (trackId: string, userId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, mentorIds: t.mentorIds.filter((id) => id !== userId) }
          : t,
      ),
    }));

  const removeJudge = (trackId: string, roundId: string, userId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? {
            ...t,
            rounds: t.rounds.map((r) =>
              r.id === roundId
                ? { ...r, judgeIds: r.judgeIds.filter((id) => id !== userId) }
                : r,
            ),
          }
          : t,
      ),
    }));

  const updateTeamStatus = (teamId: string, status: TeamStatus) =>
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status } : t)),
    );

  const handleSelectAllTrackTeams = (teamIds: string[], checked: boolean) => {
    setSelectedTeamIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...teamIds]))
        : prev.filter((id) => !teamIds.includes(id)),
    );
  };

  const handleToggleSelectTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const handleBulkTeamStatusUpdate = (
    teamIds: string[],
    status: TeamStatus,
  ) => {
    const toUpdate = selectedTeamIds.filter((id) => teamIds.includes(id));
    setTeams((prev) =>
      prev.map((t) => (toUpdate.includes(t.id) ? { ...t, status } : t)),
    );
    setSelectedTeamIds((prev) => prev.filter((id) => !toUpdate.includes(id)));
  };

  return {
    activeTab,
    setActiveTab,
    event,
    teams,
    expandedTracks,
    dialog,
    selectedTeamIds,
    isSaving,
    errors,
    pendingCount,
    closeDialog,
    openAddTrack,
    openEditTrack,
    openAddRound,
    openEditRound,
    openAddJudge,
    openAddMentor,
    openEditCriteria,
    openTeamDetail,
    confirmAddTrack,
    confirmEditTrack,
    confirmAddRound,
    confirmEditRound,
    confirmAddJudge,
    confirmAddMentor,
    confirmEditCriteria,
    handleSave,
    handleDiscard,
    handleEventChange,
    toggleExpand,
    removeTrack,
    removeRound,
    removeMentor,
    removeJudge,
    updateTeamStatus,
    handleSelectAllTrackTeams,
    handleToggleSelectTeam,
    handleBulkTeamStatusUpdate,
  };
}
