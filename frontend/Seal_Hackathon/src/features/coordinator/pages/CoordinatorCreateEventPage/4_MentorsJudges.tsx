import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import {
  assignableUserApi,
  type AssignableUserRole,
} from "@/api/assignableUser.api";
import { useAuthStore } from "@/stores/authStore";
import {
  createJudgeTrackRoundAssignment,
  createMentorJudgeAssignment,
  type CreateEventFormValues,
  type JudgeTrackRoundAssignmentFormValues,
  type RoundFormValues,
  type TrackFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

type MentorsJudgesStepProps = {
  tracks: TrackFormValues[];
  rounds: RoundFormValues[];
  onBack: () => void;
  onNext: () => void;
};

function getApiErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "";

  const maybeError = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  const status = maybeError.response?.status;
  const message = maybeError.response?.data?.message ?? maybeError.message;

  if (status) return `${status}: ${message || "Request failed"}`;

  return message || "Request failed";
}

function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "";

  const maybeError = error as {
    message?: string;
    root?: {
      message?: string;
    };
  };

  return maybeError.message ?? maybeError.root?.message ?? "";
}

function findJudgePairIndex(
  pairs: JudgeTrackRoundAssignmentFormValues[],
  trackId: string,
  roundId: string,
) {
  return pairs.findIndex(
    (pair) => pair.trackId === trackId && pair.roundId === roundId,
  );
}

export function MentorsJudgesStep({
  tracks,
  rounds,
  onBack,
  onNext,
}: MentorsJudgesStepProps) {
  const navigate = useNavigate();

  const accessToken = useAuthStore((state) => state.accessToken);
  const canLoadUsers = Boolean(accessToken && accessToken !== "dev-token");

  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const [activeRole, setActiveRole] = useState<AssignableUserRole>("MENTOR");
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({
    queryKey: ["assignable-users", activeRole, search],
    queryFn: () => assignableUserApi.getAssignableUsers(activeRole, search),
    enabled: canLoadUsers,
    staleTime: 30_000,
    retry: false,
  });

  const assignments =
    useWatch({
      control,
      name: "mentorJudgeAssignments",
    }) ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "mentorJudgeAssignments",
    keyName: "fieldId",
  });

  const selectedUserIds = new Set(
    assignments
      .filter((assignment) => assignment.role === activeRole)
      .map((assignment) => assignment.userId),
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Step 5: Mentors & Judges
            </h2>

            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
              Mentors are assigned to tracks. Judges are assigned to specific
              rounds inside specific tracks.
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

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-black text-slate-900 dark:text-white">
            Available {activeRole === "MENTOR" ? "Mentors" : "Judges"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Search by name or email, then invite to this event.
          </p>

          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${activeRole.toLowerCase()} by name or email`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={!canLoadUsers}
            sx={{ mt: 3, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />

          <div className="mt-4 max-h-105 space-y-3 overflow-y-auto">
            {!canLoadUsers && (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                }
              >
                Sign in with a real coordinator/admin account to load mentors
                and judges. Dev token will not call this API.
              </Alert>
            )}

            {canLoadUsers && usersQuery.isLoading && (
              <div className="flex justify-center py-6">
                <CircularProgress size={24} />
              </div>
            )}

            {canLoadUsers && usersQuery.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                Failed to load user list.
                <br />
                {getApiErrorMessage(usersQuery.error)}
              </div>
            )}

            {canLoadUsers &&
              !usersQuery.isLoading &&
              !usersQuery.isError &&
              (usersQuery.data ?? []).length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400 dark:border-slate-700">
                  No active {activeRole.toLowerCase()} found.
                </div>
              )}

            {canLoadUsers &&
              (usersQuery.data ?? []).map((user) => {
                const invited = selectedUserIds.has(user.userId);

                return (
                  <div
                    key={`${activeRole}-${user.userId}`}
                    className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <p className="font-black text-slate-900 dark:text-white">
                      {user.fullName}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user.email}
                    </p>

                    <Button
                      fullWidth
                      size="small"
                      variant={invited ? "outlined" : "contained"}
                      disabled={invited}
                      startIcon={<AddOutlinedIcon />}
                      onClick={() =>
                        append(
                          createMentorJudgeAssignment({
                            userId: user.userId,
                            judgeId: activeRole === "JUDGE" ? user.judgeId || user.userId : "",
                            email: user.email,
                            fullName: user.fullName,
                            role: activeRole,
                          }),
                        )
                      }
                      sx={{
                        mt: 2,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 900,
                      }}
                    >
                      {invited ? "Invited" : "Invite"}
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
          {fields.length === 0 && (
            <div className="flex min-h-55 flex-col items-center justify-center text-center">
              <p className="font-bold text-slate-500">
                No mentors or judges invited yet.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Search and invite users from the list.
              </p>
            </div>
          )}

          {fields.map((field, index) => {
            const assignment = assignments[index];
            if (!assignment) return null;

            const assignmentErrors = errors.mentorJudgeAssignments?.[index];

            const assignedTrackError = getFieldErrorMessage(
              assignmentErrors?.assignedTrackIds,
            );
            const judgePairsError = getFieldErrorMessage(
              assignmentErrors?.judgeRoundAssignments,
            );
            const hasAssignmentError = Boolean(
              assignedTrackError || judgePairsError,
            );

            const isMentor = assignment.role === "MENTOR";
            const isJudge = assignment.role === "JUDGE";
            const judgePairs = assignment.judgeRoundAssignments ?? [];

            return (
              <div
                key={field.fieldId}
                className={[
                  "rounded-2xl border bg-white p-5 dark:bg-slate-900/30",
                  hasAssignmentError
                    ? "border-rose-300 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-700",
                ].join(" ")}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">
                      {assignment.fullName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.email}
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      {assignment.role}
                    </span>


                  </div>

                  <IconButton color="error" onClick={() => remove(index)}>
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </div>

                {isMentor && (
                  <>
                    <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                      Assign mentor to tracks
                    </p>

                    <div className="mb-2 flex flex-wrap gap-3">
                      {tracks.map((track) => {
                        const checked = assignment.assignedTrackIds.includes(track.id);

                        return (
                          <FormControlLabel
                            key={track.id}
                            label={track.trackName || "Unnamed track"}
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={(_, nextChecked) => {
                                  const next = nextChecked
                                    ? [...assignment.assignedTrackIds, track.id]
                                    : assignment.assignedTrackIds.filter(
                                        (id) => id !== track.id,
                                      );

                                  setValue(
                                    `mentorJudgeAssignments.${index}.assignedTrackIds`,
                                    next,
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                                }}
                              />
                            }
                          />
                        );
                      })}
                    </div>

                    {assignedTrackError && (
                      <p className="mb-4 text-sm font-bold text-rose-500">
                        {assignedTrackError}
                      </p>
                    )}
                  </>
                )}

                {isJudge && (
                  <>
                    <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">
                      Assign judge to track rounds
                    </p>

                    {tracks.length === 0 || rounds.length === 0 ? (
                      <Alert severity="warning">
                        Please create at least one track and one round before
                        assigning judges.
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {tracks.map((track) => (
                          <div
                            key={track.id}
                            className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                          >
                            <p className="mb-2 font-black text-slate-900 dark:text-white">
                              Track: {track.trackName || "Unnamed track"}
                            </p>

                            <div className="space-y-3">
                              {rounds.map((round) => {
                                const pairIndex = findJudgePairIndex(
                                  judgePairs,
                                  track.id,
                                  round.id,
                                );
                                const checked = pairIndex >= 0;
                                const selectedPair = checked
                                  ? judgePairs[pairIndex]
                                  : null;

                                return (
                                  <div
                                    key={`${track.id}-${round.id}`}
                                    className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                                  >
                                    <FormControlLabel
                                      label={round.roundName || "Unnamed round"}
                                      control={
                                        <Checkbox
                                          checked={checked}
                                          onChange={(_, nextChecked) => {
                                            const nextPairs = nextChecked
                                              ? [
                                                  ...judgePairs,
                                                  createJudgeTrackRoundAssignment(
                                                    track.id,
                                                    round.id,
                                                  ),
                                                ]
                                              : judgePairs.filter(
                                                  (pair) =>
                                                    !(
                                                      pair.trackId === track.id &&
                                                      pair.roundId === round.id
                                                    ),
                                                );

                                            setValue(
                                              `mentorJudgeAssignments.${index}.judgeRoundAssignments`,
                                              nextPairs,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            );
                                          }}
                                        />
                                      }
                                    />

                                    {checked && selectedPair && (
                                      <TextField
                                        label="Total submissions to score"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        sx={{
                                          mt: 1,
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                          },
                                        }}
                                        {...register(
                                          `mentorJudgeAssignments.${index}.judgeRoundAssignments.${pairIndex}.totalToScore`,
                                        )}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {judgePairsError && (
                      <p className="mt-3 text-sm font-bold text-rose-500">
                        {judgePairsError}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5 dark:border-slate-700">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
        >
          {fields.length === 0 ? "Skip Step" : "Next Step"}
        </Button>
      </div>
    </section>
  );
}
