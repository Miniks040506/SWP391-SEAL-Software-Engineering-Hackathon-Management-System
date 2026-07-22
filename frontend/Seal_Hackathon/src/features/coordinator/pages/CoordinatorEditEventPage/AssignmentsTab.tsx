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

  return (
    <TabShell
      tab="ASSIGNMENTS"
      title="Mentors & Judges"
      description="Mentors are assigned to tracks. Judges are assigned to exact track-round pairs."
      headerActions={
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["MENTOR", "JUDGE"] as const).map((role) => {
            const RoleIcon =
              role === "MENTOR" ? SchoolOutlinedIcon : GavelOutlinedIcon;
            const active = activeRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={[
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 motion-reduce:transition-none",
                  active
                    ? "bg-linear-to-r from-cyan-500 to-blue-400 text-white shadow-md shadow-cyan-500/25"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
                ].join(" ")}
              >
                <RoleIcon sx={{ fontSize: 16 }} />
                {role === "MENTOR" ? "Mentors" : "Judges"}
              </button>
            );
          })}
        </div>
      }
      bodyClassName="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]"
    >
      {!canEdit && readonlyReason && (
        <div className="xl:col-span-2">
          <Alert severity="warning" sx={{ borderRadius: "14px" }}>
            {readonlyReason}
          </Alert>
        </div>
      )}

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/30">
        {tracks.length === 0 && (
          <Alert severity="warning" sx={{ borderRadius: "12px" }}>
            Create at least one track before assigning mentors or judges.
          </Alert>
        )}

        {activeRole === "JUDGE" && rounds.length === 0 && (
          <Alert severity="warning" sx={{ borderRadius: "12px" }}>
            Create at least one round before assigning judges.
          </Alert>
        )}

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-400 text-[10px] font-black text-white">
              1
            </span>
            Select track
          </p>
          <div className="space-y-2">
            {tracks.map((track) => (
              <button
                key={getId(track)}
                type="button"
                onClick={() => setSelectedTrackId(getId(track))}
                className={[
                  "flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                  selectedTrackId === getId(track)
                    ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <span>{getTrackName(track)}</span>
                {selectedTrackId === getId(track) && (
                  <CheckCircleOutlineOutlinedIcon fontSize="small" />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeRole === "JUDGE" && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-400 text-[10px] font-black text-white">
                2
              </span>
              Select round
            </p>
            <div className="space-y-2">
              {rounds.map((round) => (
                <button
                  key={getId(round)}
                  type="button"
                  onClick={() => setSelectedRoundId(getId(round))}
                  className={[
                    "flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                    selectedRoundId === getId(round)
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  <span>{getRoundName(round)}</span>
                  {selectedRoundId === getId(round) && (
                    <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeRole === "JUDGE" && (
          <TextField
            label="Total submissions to score"
            type="number"
            value={totalToScore}
            onChange={(event) => setTotalToScore(event.target.value)}
            size="small"
            fullWidth
            sx={editFieldSx}
          />
        )}

        <div className="rounded-xl border border-cyan-200/70 bg-cyan-50/60 p-3 text-sm font-semibold text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
          Current target:{" "}
          {selectedTrack ? getTrackName(selectedTrack) : "No track"}
          {activeRole === "JUDGE" &&
            ` / ${selectedRound ? getRoundName(selectedRound) : "No round"}`}
        </div>

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
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-white px-4 py-2.5 text-sm font-black text-cyan-600 transition-colors duration-200 hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-500/30 dark:bg-transparent dark:text-cyan-300 dark:hover:bg-cyan-500/10"
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

        <div className="max-h-110 space-y-3 overflow-y-auto pr-1">
          {visibleUsers.map((user) => {
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
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950 dark:text-white">
                      {user.fullName}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
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
                    "mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:cursor-not-allowed motion-reduce:transition-none",
                    alreadyAssigned
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-600 disabled:opacity-90 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-linear-to-r from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-600/25 hover:from-cyan-500 hover:to-blue-400 disabled:opacity-50",
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
      </aside>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h3 className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-400 text-white shadow-md shadow-cyan-500/25">
              <SchoolOutlinedIcon sx={{ fontSize: 16 }} />
            </span>
            Mentor assignments
            <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {mentorAssignments.length}
            </span>
          </h3>

          <div className="mt-4 space-y-3">
            {mentorAssignments.map(({ assignment, track }) => {
              const assignmentId = getAssignmentId(assignment);
              const removingThis =
                removeMentorMutation.isPending &&
                removeMentorMutation.variables?.assignmentId === assignmentId;

              return (
                <div
                  key={`${getId(track)}-${assignmentId ?? getAssignmentUserName(assignment)}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">
                      {getAssignmentUserName(assignment)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Track: {getTrackName(track)}
                    </p>
                  </div>

                  {assignmentId && canEdit && (
                    <IconButton
                      color="error"
                      disabled={removingThis}
                      onClick={() =>
                        handleRemoveMentor(getId(track), assignmentId)
                      }
                      aria-label="Remove mentor assignment"
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  )}
                </div>
              );
            })}

            {mentorAssignments.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                <Diversity3OutlinedIcon className="text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  No mentors assigned yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h3 className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-400 text-white shadow-md shadow-cyan-500/25">
              <GavelOutlinedIcon sx={{ fontSize: 16 }} />
            </span>
            Judge assignments
            <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {judgeAssignments.length}
            </span>
          </h3>

          <div className="mt-4 space-y-3">
            {judgeAssignments.map(({ assignment, round }) => {
              const assignmentId = getAssignmentId(assignment);
              const removingThis =
                removeJudgeMutation.isPending &&
                removeJudgeMutation.variables?.assignmentId === assignmentId;
              const track = tracks.find(
                (item) => getId(item) === assignment.trackId,
              );

              return (
                <div
                  key={`${getId(round)}-${assignmentId ?? getAssignmentUserName(assignment)}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">
                      {getAssignmentUserName(assignment)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Track: {track ? getTrackName(track) : "-"} / Round:{" "}
                      {getRoundName(round)}
                    </p>
                  </div>

                  {assignmentId && canEdit && (
                    <IconButton
                      color="error"
                      disabled={removingThis}
                      onClick={() =>
                        handleRemoveJudge(getId(round), assignmentId)
                      }
                      aria-label="Remove judge assignment"
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  )}
                </div>
              );
            })}

            {judgeAssignments.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                <GavelOutlinedIcon className="text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  No judges assigned yet.
                </p>
              </div>
            )}
          </div>
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
