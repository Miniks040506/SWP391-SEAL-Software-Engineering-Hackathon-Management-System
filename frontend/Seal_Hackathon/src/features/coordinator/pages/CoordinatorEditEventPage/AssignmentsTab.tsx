import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";

import {
  coordinatorEventKeys,
  useAssignableUsersQuery,
  useJudgeAssignmentsQueries,
  useMentorAssignmentsQueries,
} from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import {
  useAssignJudgeMutation,
  useAssignMentorMutation,
  useRemoveJudgeAssignmentMutation,
  useRemoveMentorAssignmentMutation,
} from "@/features/coordinator/hooks/useCoordinatorEventMutations";
import type { UUID } from "@/types/common.types";

import type {
  JudgeAssignmentResponse,
  RoundResponse,
} from "@/types/round.types";
import type {
  MentorAssignmentResponse,
  TrackResponse,
} from "@/types/track.types";
import type {
  AssignableUserResponse,
  AssignableUserRole,
  GuestJudgeResponse,
} from "@/types/user.types";
import { CreateGuestJudgeModal } from "../CoordinatorCreateEventPage/components/CreateGuestJugdeModal";

import { editFieldSx } from "./editEventUi";
import { TabShell } from "./TabShell";
import "./assignmentsTab.css";

type AssignmentsTabProps = {
  eventId: UUID;
  tracks: TrackResponse[];
  rounds: RoundResponse[];
  canEdit: boolean;
  readonlyReason?: string;
};

function getId(value: unknown) {
  return (value as { id: UUID }).id;
}

function getTrackName(track: TrackResponse) {
  const raw = track as { name?: string; trackName?: string };
  return raw.name ?? raw.trackName ?? "Untitled track";
}

function getRoundName(round: RoundResponse) {
  const raw = round as { name?: string; roundName?: string };
  return raw.name ?? raw.roundName ?? "Untitled round";
}

function getAssignmentId(value: unknown) {
  return (
    (value as { id?: UUID; assignmentId?: UUID }).id ??
    (value as { assignmentId?: UUID }).assignmentId
  );
}

function getAssignmentUserName(value: unknown) {
  const raw = value as {
    fullName?: string;
    mentorName?: string;
    judgeName?: string;
    email?: string;
  };

  return (
    raw.fullName ??
    raw.mentorName ??
    raw.judgeName ??
    raw.email ??
    "Assigned user"
  );
}

function getMentorUserId(value: unknown) {
  const raw = value as { mentorUserId?: UUID; userId?: UUID; id?: UUID };
  return raw.mentorUserId ?? raw.userId ?? raw.id;
}

function getJudgeAssignmentJudgeId(value: unknown) {
  const raw = value as { judgeId?: UUID; userId?: UUID; id?: UUID };
  return raw.judgeId ?? raw.userId ?? raw.id;
}

function getJudgeId(user: AssignableUserResponse) {
  return user.judgeId ?? user.userId;
}

function matchesTargetJudgeAssignment(
  assignment: JudgeAssignmentResponse,
  trackId: UUID | "",
  roundId: UUID | "",
) {
  if (!trackId || !roundId) return false;

  return assignment.roundId === roundId && assignment.trackId === trackId;
}

function upsertAssignment<T extends { id?: UUID }>(items: T[] | undefined, item: T) {
  const current = items ?? [];
  const existingIndex = current.findIndex((entry) => entry.id === item.id);

  if (existingIndex === -1) {
    return [item, ...current];
  }

  return current.map((entry, index) =>
    index === existingIndex ? item : entry,
  );
}

/**
 * Two clearly separated color identities so the user always knows which mode
 * they are in: Mentors = emerald/teal, Judges = violet/indigo.
 */
const ROLE_THEME = {
  MENTOR: {
    label: "Mentors",
    noun: "mentor",
    icon: SchoolOutlinedIcon,
    segRing: "focus-visible:ring-emerald-500/50",
    activeSeg:
      "bg-linear-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30",
    iconChip: "from-emerald-500 to-teal-400 shadow-emerald-500/25",
    chipActive:
      "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300",
    assignBtn:
      "bg-linear-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-400",
    bannerReady:
      "seal-target-ready-emerald border-emerald-300/80 bg-emerald-50/95 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/80 dark:text-emerald-200",
    dotText: "text-emerald-500",
    accentText: "text-emerald-600 dark:text-emerald-300",
    groupTarget:
      "border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/5",
    groupDot: "bg-emerald-500",
    targetChip:
      "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  JUDGE: {
    label: "Judges",
    noun: "judge",
    icon: GavelOutlinedIcon,
    // Blue/indigo — mirrors the judge identity in the Create Event wizard
    // (MentorJudgeAssignmentTable: from-blue-500 to-indigo-400).
    segRing: "focus-visible:ring-blue-500/50",
    activeSeg:
      "bg-linear-to-r from-blue-500 to-indigo-400 text-white shadow-md shadow-blue-500/30",
    iconChip: "from-blue-500 to-indigo-400 shadow-blue-500/25",
    chipActive:
      "border-blue-400 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300",
    assignBtn:
      "bg-linear-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-400",
    bannerReady:
      "seal-target-ready-blue border-blue-300/80 bg-blue-50/95 text-blue-800 dark:border-blue-500/40 dark:bg-blue-950/80 dark:text-blue-200",
    dotText: "text-blue-500",
    accentText: "text-blue-600 dark:text-blue-300",
    groupTarget:
      "border-blue-300 bg-blue-50/50 dark:border-blue-500/40 dark:bg-blue-500/5",
    groupDot: "bg-blue-500",
    targetChip:
      "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300",
  },
} as const;

const contextChipBase =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none";

const contextChipIdle =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";

export function AssignmentsTab({
  eventId,
  tracks,
  rounds,
  canEdit,
  readonlyReason,
}: AssignmentsTabProps) {
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<AssignableUserRole>("MENTOR");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<UUID | "">(
    tracks[0]?.id ?? "",
  );
  const [selectedRoundId, setSelectedRoundId] = useState<UUID | "">(
    rounds[0]?.id ?? "",
  );
  const [totalToScore, setTotalToScore] = useState("10");
  const [guestJudgeModalOpen, setGuestJudgeModalOpen] = useState(false);
  const [createdGuestJudges, setCreatedGuestJudges] = useState<
    AssignableUserResponse[]
  >([]);

  const assignMentorMutation = useAssignMentorMutation(eventId);
  const assignJudgeMutation = useAssignJudgeMutation(eventId);
  const removeMentorMutation = useRemoveMentorAssignmentMutation(eventId);
  const removeJudgeMutation = useRemoveJudgeAssignmentMutation(eventId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!tracks.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTrackId("");
      return;
    }

    if (!selectedTrackId || !tracks.some((track) => getId(track) === selectedTrackId)) {
      setSelectedTrackId(getId(tracks[0]));
    }
  }, [selectedTrackId, tracks]);

  useEffect(() => {
    if (!rounds.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRoundId("");
      return;
    }

    if (!selectedRoundId || !rounds.some((round) => getId(round) === selectedRoundId)) {
      setSelectedRoundId(getId(rounds[0]));
    }
  }, [rounds, selectedRoundId]);

  const usersQuery = useAssignableUsersQuery(activeRole, debouncedSearch);

  const visibleUsers = useMemo<AssignableUserResponse[]>(() => {
    const users = (usersQuery.data ?? []) as AssignableUserResponse[];

    if (activeRole !== "JUDGE") return users;

    return [...createdGuestJudges, ...users].filter(
      (user, index, allUsers) =>
        allUsers.findIndex((item) => item.userId === user.userId) === index,
    );
  }, [activeRole, createdGuestJudges, usersQuery.data]);

  const mentorAssignmentQueries = useMentorAssignmentsQueries(
    tracks.map((track) => getId(track)),
  );
  const judgeAssignmentQueries = useJudgeAssignmentsQueries(
    rounds.map((round) => getId(round)),
  );

  const mentorAssignments = useMemo(() => {
    return tracks.flatMap((track, index) => {
      const data = (mentorAssignmentQueries[index]?.data ??
        []) as MentorAssignmentResponse[];

      return data.map((assignment) => ({
        assignment,
        track,
      }));
    });
  }, [mentorAssignmentQueries, tracks]);

  const judgeAssignments = useMemo(() => {
    return rounds.flatMap((round, index) => {
      const data = (judgeAssignmentQueries[index]?.data ??
        []) as JudgeAssignmentResponse[];

      return data.map((assignment) => ({
        assignment,
        round,
      }));
    });
  }, [judgeAssignmentQueries, rounds]);

  const selectedTrack = tracks.find(
    (track) => getId(track) === selectedTrackId,
  );
  const selectedRound = rounds.find(
    (round) => getId(round) === selectedRoundId,
  );

  const assignedMentorIdsForTarget = useMemo(() => {
    if (!selectedTrackId) return new Set<UUID>();

    return new Set(
      mentorAssignments
        .filter(({ track }) => getId(track) === selectedTrackId)
        .map(({ assignment }) => getMentorUserId(assignment))
        .filter((id): id is UUID => Boolean(id)),
    );
  }, [mentorAssignments, selectedTrackId]);

  const assignedJudgeIdsForTarget = useMemo(() => {
    if (!selectedTrackId || !selectedRoundId) return new Set<UUID>();

    return new Set(
      judgeAssignments
        .filter(({ assignment }) =>
          matchesTargetJudgeAssignment(
            assignment,
            selectedTrackId,
            selectedRoundId,
          ),
        )
        .map(({ assignment }) => getJudgeAssignmentJudgeId(assignment))
        .filter((id): id is UUID => Boolean(id)),
    );
  }, [judgeAssignments, selectedRoundId, selectedTrackId]);

  const handleAssignMentor = async (user: AssignableUserResponse) => {
    if (!canEdit) return;

    const mentorUserId = user.userId;

    if (!mentorUserId || !selectedTrackId) {
      enqueueSnackbar("Select a track before assigning mentor.", {
        variant: "error",
      });
      return;
    }

    if (assignedMentorIdsForTarget.has(mentorUserId)) {
      enqueueSnackbar(
        "This mentor is already assigned to the selected track.",
        { variant: "warning" },
      );
      return;
    }

    try {
      const assignment = await assignMentorMutation.mutateAsync({
        trackId: selectedTrackId,
        payload: { mentorUserId },
      });
      queryClient.setQueryData<MentorAssignmentResponse[]>(
        coordinatorEventKeys.mentorAssignments(selectedTrackId),
        (current) => upsertAssignment(current, assignment),
      );
      enqueueSnackbar("Mentor assigned.", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to assign mentor.", { variant: "error" });
    }
  };

  const handleAssignJudge = async (user: AssignableUserResponse) => {
    if (!canEdit) return;

    const judgeId = getJudgeId(user);

    if (!judgeId || !selectedTrackId || !selectedRoundId) {
      enqueueSnackbar("Select a track and round before assigning judge.", {
        variant: "error",
      });
      return;
    }

    if (assignedJudgeIdsForTarget.has(judgeId)) {
      enqueueSnackbar(
        "This judge is already assigned to the selected track-round pair.",
        { variant: "warning" },
      );
      return;
    }

    try {
      const assignment = await assignJudgeMutation.mutateAsync({
        roundId: selectedRoundId,
        payload: {
          judgeId,
          trackId: selectedTrackId,
          totalToScore: totalToScore ? Number(totalToScore) : undefined,
        },
      });
      queryClient.setQueryData<JudgeAssignmentResponse[]>(
        coordinatorEventKeys.judgeAssignments(selectedRoundId),
        (current) => upsertAssignment(current, assignment),
      );

      enqueueSnackbar("Judge assigned.", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to assign judge.", { variant: "error" });
    }
  };

  const handleRemoveMentor = async (trackId: UUID, assignmentId: UUID) => {
    if (!canEdit) return;

    try {
      await removeMentorMutation.mutateAsync({ trackId, assignmentId });
      queryClient.setQueryData<MentorAssignmentResponse[]>(
        coordinatorEventKeys.mentorAssignments(trackId),
        (current) => (current ?? []).filter((item) => item.id !== assignmentId),
      );
      enqueueSnackbar("Mentor assignment removed.", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to remove mentor assignment.", {
        variant: "error",
      });
    }
  };

  const handleRemoveJudge = async (roundId: UUID, assignmentId: UUID) => {
    if (!canEdit) return;

    try {
      await removeJudgeMutation.mutateAsync({ roundId, assignmentId });
      queryClient.setQueryData<JudgeAssignmentResponse[]>(
        coordinatorEventKeys.judgeAssignments(roundId),
        (current) => (current ?? []).filter((item) => item.id !== assignmentId),
      );
      enqueueSnackbar("Judge assignment removed.", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to remove judge assignment.", {
        variant: "error",
      });
    }
  };

  const handleGuestJudgeCreated = async (
    judge: GuestJudgeResponse,
    fullName: string,
  ) => {
    setGuestJudgeModalOpen(false);
    setActiveRole("JUDGE");

    const guestUser: AssignableUserResponse = {
      userId: judge.userId,
      judgeId: judge.judgeId,
      email: judge.email,
      fullName,
      role: "JUDGE",
      status: "ACTIVE",
      judgeType: judge.judgeType,
      guest: judge.guest,
      temporary: judge.temporary,
      expiresAt: judge.expiresAt,
    };

    setCreatedGuestJudges((current) => [
      guestUser,
      ...current.filter((user) => user.userId !== guestUser.userId),
    ]);

    await handleAssignJudge(guestUser);
  };

  const roleNeedsRound = activeRole === "JUDGE";
  const missingTarget =
    !selectedTrackId || (roleNeedsRound && !selectedRoundId);
  const isAssigning =
    activeRole === "MENTOR"
      ? assignMentorMutation.isPending
      : assignJudgeMutation.isPending;
  const activeAssigningUserId =
    activeRole === "MENTOR"
      ? assignMentorMutation.variables?.payload.mentorUserId
      : assignJudgeMutation.variables?.payload.judgeId;
  const isRefreshingUsers = usersQuery.isFetching && !usersQuery.isLoading;

  const theme = ROLE_THEME[activeRole];
  const RoleIcon = theme.icon;
  const trackDone = Boolean(selectedTrackId);
  const roundDone = Boolean(selectedRoundId);
  const targetReady = !missingTarget;
  const modeAssignmentsCount =
    activeRole === "MENTOR" ? mentorAssignments.length : judgeAssignments.length;

  return (
    <TabShell
      tab="ASSIGNMENTS"
      title="Mentors & Judges"
      description="Mentors are assigned to tracks. Judges are assigned to exact track-round pairs."
      headerActions={
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["MENTOR", "JUDGE"] as const).map((role) => {
            const roleTheme = ROLE_THEME[role];
            const SegIcon = roleTheme.icon;
            const active = activeRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                aria-pressed={active}
                className={[
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none",
                  roleTheme.segRing,
                  active
                    ? roleTheme.activeSeg
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
                ].join(" ")}
              >
                <SegIcon sx={{ fontSize: 16 }} />
                {roleTheme.label}
              </button>
            );
          })}
        </div>
      }
      bodyClassName="space-y-6 px-7 py-6"
    >
      {!canEdit && readonlyReason && (
        <Alert severity="warning" sx={{ borderRadius: "14px" }}>
          {readonlyReason}
        </Alert>
      )}

      {/* Keyed remount so switching Mentors <-> Judges plays the swap motion. */}
      <div key={activeRole} className="seal-assign-swap space-y-6">
        {/* ── Context builder — decide where assignments land ─────────── */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-800/30">
          <div className="mb-4 flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md ${theme.iconChip}`}
            >
              <RoleIcon sx={{ fontSize: 16 }} />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {activeRole === "MENTOR"
                  ? "Where does this mentor go?"
                  : "Where does this judge grade?"}
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                {activeRole === "MENTOR"
                  ? "Pick a track, then assign mentors from the roster below."
                  : "Pick a track and a round, then assign judges from the roster below."}
              </p>
            </div>
          </div>

          {tracks.length === 0 && (
            <Alert severity="warning" sx={{ borderRadius: "12px", mb: 2 }}>
              Create at least one track before assigning mentors or judges.
            </Alert>
          )}

          {activeRole === "JUDGE" && rounds.length === 0 && (
            <Alert severity="warning" sx={{ borderRadius: "12px", mb: 2 }}>
              Create at least one round before assigning judges.
            </Alert>
          )}

          <div
            className={
              activeRole === "JUDGE"
                ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px]"
                : ""
            }
          >
            {/* Step 1 — track */}
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-black text-white ${theme.iconChip} ${
                    !trackDone ? "seal-step-todo" : ""
                  }`}
                >
                  1
                </span>
                Track
                {trackDone && (
                  <CheckCircleOutlineOutlinedIcon
                    className={`seal-chip-pop ${theme.accentText}`}
                    sx={{ fontSize: 15 }}
                  />
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {tracks.map((track) => {
                  const active = selectedTrackId === getId(track);

                  return (
                    <button
                      key={getId(track)}
                      type="button"
                      onClick={() => setSelectedTrackId(getId(track))}
                      aria-pressed={active}
                      className={`${contextChipBase} ${theme.segRing} ${
                        active ? theme.chipActive : contextChipIdle
                      }`}
                    >
                      {getTrackName(track)}
                      {active && (
                        <CheckCircleOutlineOutlinedIcon
                          className="seal-chip-pop"
                          sx={{ fontSize: 15 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 — round (judges only) */}
            {activeRole === "JUDGE" && (
              <div>
                <p className="mb-2.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-black text-white ${theme.iconChip} ${
                      !roundDone ? "seal-step-todo" : ""
                    }`}
                  >
                    2
                  </span>
                  Round
                  {roundDone && (
                    <CheckCircleOutlineOutlinedIcon
                      className={`seal-chip-pop ${theme.accentText}`}
                      sx={{ fontSize: 15 }}
                    />
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {rounds.map((round) => {
                    const active = selectedRoundId === getId(round);

                    return (
                      <button
                        key={getId(round)}
                        type="button"
                        onClick={() => setSelectedRoundId(getId(round))}
                        aria-pressed={active}
                        className={`${contextChipBase} ${theme.segRing} ${
                          active ? theme.chipActive : contextChipIdle
                        }`}
                      >
                        {getRoundName(round)}
                        {active && (
                          <CheckCircleOutlineOutlinedIcon
                            className="seal-chip-pop"
                            sx={{ fontSize: 15 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scoring quota (judges only) */}
            {activeRole === "JUDGE" && (
              <div>
                <p className="mb-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Quota
                </p>
                <TextField
                  label="Submissions to score"
                  type="number"
                  value={totalToScore}
                  onChange={(event) => setTotalToScore(event.target.value)}
                  size="small"
                  fullWidth
                  sx={editFieldSx}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Roster + live assignment board ──────────────────────────── */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.15fr)]">
          {/* Left — people roster */}
          <section className="space-y-4">
            <TextField
              fullWidth
              size="small"
              placeholder={`Search ${activeRole.toLowerCase()} by name or email`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={editFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {activeRole === "JUDGE" && (
              <button
                type="button"
                onClick={() => setGuestJudgeModalOpen(true)}
                disabled={!canEdit}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-black text-blue-600 transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500/30 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/10"
              >
                <PersonAddOutlinedIcon sx={{ fontSize: 17 }} />
                Create guest judge
              </button>
            )}

            {usersQuery.isLoading && (
              <div className="flex justify-center py-8">
                <CircularProgress size={24} />
              </div>
            )}

            {isRefreshingUsers && (
              <p className="text-xs font-semibold text-slate-400">
                Refreshing list...
              </p>
            )}

            {usersQuery.isError && (
              <Alert severity="error" sx={{ borderRadius: "12px" }}>
                Failed to load assignable users.
              </Alert>
            )}

            <div className="max-h-150 overflow-y-auto rounded-2xl pr-1">
              {/* Sticky target banner: pinned to the top of the roster scroll
                  area so the context never scrolls out of view. */}
              <div
                className={`sticky top-0 z-10 mb-3 flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md ${
                  targetReady
                    ? theme.bannerReady
                    : "border-amber-300/80 bg-amber-50/95 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/80 dark:text-amber-200"
                }`}
              >
                {targetReady ? (
                  <>
                    <span
                      className={`seal-target-dot relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-current ${theme.dotText}`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                        Assigning {theme.noun}s to
                      </p>
                      <p className="truncate text-sm font-black">
                        {selectedTrack ? getTrackName(selectedTrack) : ""}
                        {activeRole === "JUDGE" && selectedRound
                          ? ` · ${getRoundName(selectedRound)}`
                          : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="seal-step-todo relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                    <p className="text-sm font-black">
                      {activeRole === "MENTOR"
                        ? "Select a track above to start assigning."
                        : "Select a track and round above to start assigning."}
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-3">
              {visibleUsers.map((user, index) => {
                const userJudgeId = getJudgeId(user);
                const targetUserId =
                  activeRole === "MENTOR" ? user.userId : userJudgeId;
                const alreadyAssigned =
                  activeRole === "MENTOR"
                    ? assignedMentorIdsForTarget.has(user.userId)
                    : Boolean(userJudgeId && assignedJudgeIdsForTarget.has(userJudgeId));
                const assigningThis =
                  isAssigning && activeAssigningUserId === targetUserId;
                const assignedLabel =
                  activeRole === "JUDGE" && user.guest ? "Invited" : "Assigned";

                const disabled =
                  !canEdit ||
                  missingTarget ||
                  alreadyAssigned ||
                  isAssigning ||
                  (activeRole === "JUDGE" && !userJudgeId);

                return (
                  <div
                    key={`${activeRole}-${user.userId}-${user.judgeId ?? ""}`}
                    style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                    className="seal-assign-card-in rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-sm font-black text-white shadow-sm ${theme.iconChip}`}
                        >
                          {(user.fullName || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-950 dark:text-white">
                            {user.fullName}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        {activeRole === "JUDGE" && user.guest && (
                          <Chip
                            label="Guest"
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                        {activeRole === "JUDGE" && user.temporary && (
                          <Chip
                            label="Temporary"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        activeRole === "MENTOR"
                          ? handleAssignMentor(user)
                          : handleAssignJudge(user)
                      }
                      disabled={disabled}
                      className={[
                        "mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100",
                        theme.segRing,
                        alreadyAssigned
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-600 disabled:opacity-90 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : `${theme.assignBtn} text-white disabled:opacity-50`,
                      ].join(" ")}
                    >
                      {assigningThis ? (
                        <CircularProgress size={15} color="inherit" />
                      ) : alreadyAssigned ? (
                        <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <AddOutlinedIcon sx={{ fontSize: 16 }} />
                      )}
                      {!canEdit
                        ? "Locked"
                        : assigningThis
                          ? "Assigning..."
                        : alreadyAssigned
                          ? assignedLabel
                          : missingTarget
                            ? "Select target first"
                            : activeRole === "MENTOR"
                              ? "Assign mentor"
                              : "Assign judge"}
                    </button>
                  </div>
                );
              })}

              {!usersQuery.isLoading &&
                !usersQuery.isError &&
                visibleUsers.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
                    No {activeRole.toLowerCase()} found.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right — assignments for the CURRENT mode only */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/40">
            <h3 className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md ${theme.iconChip}`}
              >
                <RoleIcon sx={{ fontSize: 16 }} />
              </span>
              {activeRole === "MENTOR" ? "Mentor assignments" : "Judge assignments"}
              <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {modeAssignmentsCount}
              </span>
            </h3>

            {activeRole === "MENTOR" ? (
              <div className="mt-4 space-y-4">
                {tracks.map((track, groupIndex) => {
                  const rows = mentorAssignments.filter(
                    ({ track: rowTrack }) => getId(rowTrack) === getId(track),
                  );
                  const isTarget = selectedTrackId === getId(track);

                  return (
                    <div
                      key={getId(track)}
                      style={{ animationDelay: `${groupIndex * 50}ms` }}
                      className={`seal-assign-card-in rounded-xl border p-4 ${
                        isTarget
                          ? theme.groupTarget
                          : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
                      }`}
                    >
                      <p className="flex items-center justify-between gap-2 text-sm font-black text-slate-900 dark:text-white">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                              isTarget
                                ? theme.groupDot
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          <span className="truncate">{getTrackName(track)}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {isTarget && (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme.targetChip}`}
                            >
                              Target
                            </span>
                          )}
                          <span className="text-xs font-black text-slate-400">
                            {rows.length}
                          </span>
                        </span>
                      </p>

                      <div className="mt-3 space-y-2">
                        {rows.map(({ assignment }) => {
                          const assignmentId = getAssignmentId(assignment);
                          const removingThis =
                            removeMentorMutation.isPending &&
                            removeMentorMutation.variables?.assignmentId ===
                              assignmentId;

                          return (
                            <div
                              key={`${getId(track)}-${assignmentId ?? getAssignmentUserName(assignment)}`}
                              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 dark:bg-slate-900/70"
                            >
                              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                                {getAssignmentUserName(assignment)}
                              </p>
                              {assignmentId && canEdit && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={removingThis}
                                  onClick={() =>
                                    handleRemoveMentor(getId(track), assignmentId)
                                  }
                                  aria-label="Remove mentor assignment"
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              )}
                            </div>
                          );
                        })}

                        {rows.length === 0 && (
                          <p className="text-xs font-semibold text-slate-400">
                            No mentors yet.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tracks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                    <Diversity3OutlinedIcon className="text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-400">
                      No mentors assigned yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {rounds.map((round, groupIndex) => {
                  const rows = judgeAssignments.filter(
                    ({ round: rowRound }) => getId(rowRound) === getId(round),
                  );
                  const isTargetRound = selectedRoundId === getId(round);

                  return (
                    <div
                      key={getId(round)}
                      style={{ animationDelay: `${groupIndex * 50}ms` }}
                      className={`seal-assign-card-in rounded-xl border p-4 ${
                        isTargetRound
                          ? theme.groupTarget
                          : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
                      }`}
                    >
                      <p className="flex items-center justify-between gap-2 text-sm font-black text-slate-900 dark:text-white">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                              isTargetRound
                                ? theme.groupDot
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          <span className="truncate">{getRoundName(round)}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {isTargetRound && (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme.targetChip}`}
                            >
                              Target
                            </span>
                          )}
                          <span className="text-xs font-black text-slate-400">
                            {rows.length}
                          </span>
                        </span>
                      </p>

                      <div className="mt-3 space-y-2">
                        {rows.map(({ assignment }) => {
                          const assignmentId = getAssignmentId(assignment);
                          const removingThis =
                            removeJudgeMutation.isPending &&
                            removeJudgeMutation.variables?.assignmentId ===
                              assignmentId;
                          const rowTrack = tracks.find(
                            (item) => getId(item) === assignment.trackId,
                          );
                          const isTargetPair =
                            isTargetRound &&
                            assignment.trackId === selectedTrackId;

                          return (
                            <div
                              key={`${getId(round)}-${assignmentId ?? getAssignmentUserName(assignment)}`}
                              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 dark:bg-slate-900/70"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                                  {getAssignmentUserName(assignment)}
                                </p>
                                <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${
                                    isTargetPair
                                      ? theme.targetChip
                                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  {rowTrack ? getTrackName(rowTrack) : "No track"}
                                </span>
                              </div>
                              {assignmentId && canEdit && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={removingThis}
                                  onClick={() =>
                                    handleRemoveJudge(getId(round), assignmentId)
                                  }
                                  aria-label="Remove judge assignment"
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              )}
                            </div>
                          );
                        })}

                        {rows.length === 0 && (
                          <p className="text-xs font-semibold text-slate-400">
                            No judges yet.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {rounds.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                    <GavelOutlinedIcon className="text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-400">
                      No judges assigned yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <CreateGuestJudgeModal
        open={guestJudgeModalOpen}
        onClose={() => setGuestJudgeModalOpen(false)}
        onSuccess={handleGuestJudgeCreated}
      />
    </TabShell>
  );
}
