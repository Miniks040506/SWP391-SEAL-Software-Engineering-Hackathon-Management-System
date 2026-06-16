import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";

import {
  assignableUserApi,
  type AssignableUserResponse,
  type AssignableUserRole,
} from "@/api/assignableUser.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import type { UUID } from "@/types/common.types";

import type {
  JudgeAssignmentResponse,
  RoundResponse,
} from "@/types/round.types";
import type {
  MentorAssignmentResponse,
  TrackResponse,
} from "@/types/track.types";
import { CreateGuestJudgeModal } from "../CoordinatorCreateEventPage/components/CreateGuestJugdeModal";

type AssignmentsTabProps = {
  tracks: TrackResponse[];
  rounds: RoundResponse[];
  onChanged: () => void | Promise<void>;
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

export function AssignmentsTab({
  tracks,
  rounds,
  onChanged,
  canEdit,
  readonlyReason,
}: AssignmentsTabProps) {
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<AssignableUserRole>("MENTOR");
  const [search, setSearch] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<UUID | "">(
    tracks[0]?.id ?? "",
  );
  const [selectedRoundId, setSelectedRoundId] = useState<UUID | "">(
    rounds[0]?.id ?? "",
  );
  const [totalToScore, setTotalToScore] = useState("10");
  const [guestJudgeModalOpen, setGuestJudgeModalOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["edit-assignable-users", activeRole, search],
    queryFn: () => assignableUserApi.getAssignableUsers(activeRole, search),
    staleTime: 30_000,
    retry: false,
  });

  const mentorAssignmentQueries = useQueries({
    queries: tracks.map((track) => ({
      queryKey: ["edit-track-mentor-assignments", getId(track)],
      queryFn: () => trackApi.getMentorAssignments(getId(track)),
      retry: false,
    })),
  });

  const judgeAssignmentQueries = useQueries({
    queries: rounds.map((round) => ({
      queryKey: ["edit-round-judge-assignments", getId(round)],
      queryFn: () => roundApi.getJudgeAssignments(getId(round)),
      retry: false,
    })),
  });

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

  const refreshAssignments = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["edit-track-mentor-assignments"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["edit-round-judge-assignments"],
      }),
      onChanged(),
    ]);
  };

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
      await trackApi.assignMentor(selectedTrackId, { mentorUserId });
      enqueueSnackbar("Mentor assigned.", { variant: "success" });
      await refreshAssignments();
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
      await roundApi.assignJudge(selectedRoundId, {
        judgeId,
        trackId: selectedTrackId,
        totalToScore: totalToScore ? Number(totalToScore) : undefined,
      });

      enqueueSnackbar("Judge assigned.", { variant: "success" });
      await refreshAssignments();
    } catch {
      enqueueSnackbar("Failed to assign judge.", { variant: "error" });
    }
  };

  const handleRemoveMentor = async (trackId: UUID, assignmentId: UUID) => {
    if (!canEdit) return;

    try {
      await trackApi.removeMentorAssignment(trackId, assignmentId);
      enqueueSnackbar("Mentor assignment removed.", { variant: "success" });
      await refreshAssignments();
    } catch {
      enqueueSnackbar("Failed to remove mentor assignment.", {
        variant: "error",
      });
    }
  };

  const handleRemoveJudge = async (roundId: UUID, assignmentId: UUID) => {
    if (!canEdit) return;

    try {
      await roundApi.removeJudgeAssignment(roundId, assignmentId);
      enqueueSnackbar("Judge assignment removed.", { variant: "success" });
      await refreshAssignments();
    } catch {
      enqueueSnackbar("Failed to remove judge assignment.", {
        variant: "error",
      });
    }
  };

  const handleGuestJudgeCreated = async () => {
    setGuestJudgeModalOpen(false);
    setActiveRole("JUDGE");
    await queryClient.invalidateQueries({
      queryKey: ["edit-assignable-users", "JUDGE"],
    });
  };

  const roleNeedsRound = activeRole === "JUDGE";
  const missingTarget =
    !selectedTrackId || (roleNeedsRound && !selectedRoundId);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-7 py-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
              Mentors & Judges
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Mentors are assigned to tracks. Judges are assigned to exact
              track-round pairs.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["MENTOR", "JUDGE"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-black transition",
                  activeRole === role
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                    : "text-slate-500 dark:text-slate-400",
                ].join(" ")}
              >
                {role === "MENTOR" ? "Mentors" : "Judges"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]">
        {!canEdit && readonlyReason && (
          <div className="xl:col-span-2">
            <Alert severity="warning">{readonlyReason}</Alert>
          </div>
        )}

        <aside className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          {tracks.length === 0 && (
            <Alert severity="warning">
              Create at least one track before assigning mentors or judges.
            </Alert>
          )}

          {activeRole === "JUDGE" && rounds.length === 0 && (
            <Alert severity="warning">
              Create at least one round before assigning judges.
            </Alert>
          )}

          <div>
            <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
              1. Select track
            </p>
            <div className="space-y-2">
              {tracks.map((track) => (
                <button
                  key={getId(track)}
                  type="button"
                  onClick={() => setSelectedTrackId(getId(track))}
                  className={[
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition",
                    selectedTrackId === getId(track)
                      ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
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
              <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                2. Select round
              </p>
              <div className="space-y-2">
                {rounds.map((round) => (
                  <button
                    key={getId(round)}
                    type="button"
                    onClick={() => setSelectedRoundId(getId(round))}
                    className={[
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition",
                      selectedRoundId === getId(round)
                        ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
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
            />
          )}

          <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-500 dark:bg-slate-800/50">
            Current target:{" "}
            {selectedTrack ? getTrackName(selectedTrack) : "No track"}
            {activeRole === "JUDGE" &&
              ` · ${selectedRound ? getRoundName(selectedRound) : "No round"}`}
          </div>

          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${activeRole.toLowerCase()} by name or email`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={() => setGuestJudgeModalOpen(true)}
              disabled={!canEdit}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 900,
              }}
            >
              Create guest judge
            </Button>
          )}

          {usersQuery.isLoading && (
            <div className="flex justify-center py-8">
              <CircularProgress size={24} />
            </div>
          )}

          {usersQuery.isError && (
            <Alert severity="error">Failed to load assignable users.</Alert>
          )}

          <div className="max-h-110 space-y-3 overflow-y-auto pr-1">
            {(usersQuery.data ?? []).map((user) => {
              const alreadyAssigned =
                activeRole === "MENTOR"
                  ? assignedMentorIdsForTarget.has(user.userId)
                  : assignedJudgeIdsForTarget.has(getJudgeId(user));

              const disabled =
                !canEdit ||
                missingTarget ||
                alreadyAssigned ||
                (activeRole === "JUDGE" && !getJudgeId(user));

              return (
                <div
                  key={`${activeRole}-${user.userId}-${user.judgeId ?? ""}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
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

                  <Button
                    fullWidth
                    variant={alreadyAssigned ? "outlined" : "contained"}
                    startIcon={
                      alreadyAssigned ? (
                        <CheckCircleOutlineOutlinedIcon />
                      ) : (
                        <AddOutlinedIcon />
                      )
                    }
                    onClick={() =>
                      activeRole === "MENTOR"
                        ? handleAssignMentor(user)
                        : handleAssignJudge(user)
                    }
                    disabled={disabled}
                    sx={{
                      mt: 2,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 900,
                    }}
                  >
                    {!canEdit
                      ? "Locked"
                      : alreadyAssigned
                        ? "Assigned"
                        : missingTarget
                          ? "Select target first"
                          : "Assign"}
                  </Button>
                </div>
              );
            })}

            {!usersQuery.isLoading &&
              !usersQuery.isError &&
              (usersQuery.data ?? []).length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400">
                  No {activeRole.toLowerCase()} found.
                </div>
              )}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
            <h3 className="font-black text-slate-950 dark:text-white">
              Mentor assignments
            </h3>

            <div className="mt-4 space-y-3">
              {mentorAssignments.map(({ assignment, track }) => {
                const assignmentId = getAssignmentId(assignment);

                return (
                  <div
                    key={`${getId(track)}-${assignmentId ?? getAssignmentUserName(assignment)}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
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
                        onClick={() =>
                          handleRemoveMentor(getId(track), assignmentId)
                        }
                      >
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    )}
                  </div>
                );
              })}

              {mentorAssignments.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400">
                  No mentors assigned yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
            <h3 className="font-black text-slate-950 dark:text-white">
              Judge assignments
            </h3>

            <div className="mt-4 space-y-3">
              {judgeAssignments.map(({ assignment, round }) => {
                const assignmentId = getAssignmentId(assignment);
                const track = tracks.find(
                  (item) => getId(item) === assignment.trackId,
                );

                return (
                  <div
                    key={`${getId(round)}-${assignmentId ?? getAssignmentUserName(assignment)}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                  >
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">
                        {getAssignmentUserName(assignment)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Track: {track ? getTrackName(track) : "—"} · Round:{" "}
                        {getRoundName(round)}
                      </p>
                    </div>

                    {assignmentId && canEdit && (
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleRemoveJudge(getId(round), assignmentId)
                        }
                      >
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    )}
                  </div>
                );
              })}

              {judgeAssignments.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400">
                  No judges assigned yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateGuestJudgeModal
        open={guestJudgeModalOpen}
        onClose={() => setGuestJudgeModalOpen(false)}
        onSuccess={handleGuestJudgeCreated}
      />
    </section>
  );
}
