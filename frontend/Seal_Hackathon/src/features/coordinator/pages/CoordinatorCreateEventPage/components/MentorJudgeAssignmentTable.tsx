import { Controller, useFormContext } from "react-hook-form";

import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import type {
  CreateEventFormValues,
  JudgeTrackRoundAssignmentFormValues,
  MentorJudgeFormValues,
  RoundFormValues,
  TrackFormValues,
} from "../../../schemas/createEvent.schema";
import { createJudgeTrackRoundAssignment } from "../../../schemas/createEvent.schema";
import { wizardFieldSx } from "./wizardUi";

type MentorJudgeAssignmentTableProps = {
  assignments: MentorJudgeFormValues[];
  rowKeys: string[];
  tracks: TrackFormValues[];
  rounds: RoundFormValues[];
  onRemove: (index: number) => void;
};

function getTrackNames(trackIds: string[], tracks: TrackFormValues[]) {
  const names = trackIds
    .map((trackId) => tracks.find((track) => track.id === trackId)?.trackName)
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(", ") : "Event-level assignment";
}

function hasSameTrackRoleConflict(
  assignment: MentorJudgeFormValues,
  assignments: MentorJudgeFormValues[],
) {
  return assignments.some((other) => {
    if (other.id === assignment.id) return false;
    if (other.userId !== assignment.userId) return false;
    if (other.role === assignment.role) return false;

    const currentTrackIds = assignment.assignedTrackIds ?? [];
    const otherTrackIds = other.assignedTrackIds ?? [];

    return currentTrackIds.some((trackId) => otherTrackIds.includes(trackId));
  });
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const MentorJudgeAssignmentTable = ({
  assignments,
  rowKeys,
  tracks,
  rounds,
  onRemove,
}: MentorJudgeAssignmentTableProps) => {
  const { control } = useFormContext<CreateEventFormValues>();
  const canAddJudgePair = tracks.length > 0 && rounds.length > 0;

  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 px-8 py-16 text-center dark:border-slate-700">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400">
          <GroupsOutlinedIcon sx={{ fontSize: 28 }} />
        </span>

        <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
          No mentors or judges invited yet
        </h3>

        <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
          Search and invite mentors or judges from the user list on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => {
        const conflict = hasSameTrackRoleConflict(assignment, assignments);
        const isJudge = assignment.role === "JUDGE";

        return (
          <div
            key={rowKeys[index] ?? assignment.id}
            className={[
              "relative overflow-hidden rounded-2xl border bg-white transition-colors duration-200 dark:bg-slate-900",
              isJudge
                ? "border-slate-200 hover:border-blue-300/70 dark:border-slate-700 dark:hover:border-blue-500/40"
                : "border-slate-200 hover:border-emerald-300/70 dark:border-slate-700 dark:hover:border-emerald-500/40",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${
                isJudge
                  ? "from-blue-500 to-indigo-400"
                  : "from-emerald-500 to-teal-400"
              }`}
            />

            <div className="p-5 pl-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-sm font-black text-white shadow-md ${
                      isJudge
                        ? "from-blue-500 to-indigo-400 shadow-blue-500/25"
                        : "from-emerald-500 to-teal-400 shadow-emerald-500/25"
                    }`}
                  >
                    {getInitials(assignment.fullName)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-extrabold text-slate-900 dark:text-white">
                        {assignment.fullName}
                      </p>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          isJudge
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                        }`}
                      >
                        {isJudge ? (
                          <GavelOutlinedIcon sx={{ fontSize: 11 }} />
                        ) : (
                          <SchoolOutlinedIcon sx={{ fontSize: 11 }} />
                        )}
                        {assignment.role}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                      {assignment.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${assignment.fullName} assignment`}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 dark:hover:bg-rose-500/10"
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              {conflict && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: "12px" }}>
                  This person is already assigned as another role in the same
                  track.
                </Alert>
              )}

              <div className="mt-4 space-y-3">
                {assignment.role === "MENTOR" && (
                  <>
                    <Controller
                      name={`mentorJudgeAssignments.${index}.assignedTrackIds`}
                      control={control}
                      render={({ field }) => {
                        const selectedTrackIds = Array.isArray(field.value)
                          ? field.value
                          : [];

                        return (
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Tracks"
                            value={selectedTrackIds}
                            sx={wizardFieldSx}
                            onChange={(event) => {
                              const value = event.target.value;

                              const nextValue =
                                typeof value === "string"
                                  ? value.split(",")
                                  : value;

                              field.onChange(nextValue);
                            }}
                            slotProps={{
                              select: {
                                multiple: true,
                                renderValue: (selected) =>
                                  getTrackNames(selected as string[], tracks),
                              },
                            }}
                          >
                            {tracks.length === 0 && (
                              <MenuItem disabled value="">
                                No tracks created yet
                              </MenuItem>
                            )}

                            {tracks.map((track) => (
                              <MenuItem key={track.id} value={track.id}>
                                <Checkbox
                                  size="small"
                                  checked={selectedTrackIds.includes(track.id)}
                                />
                                {track.trackName}
                              </MenuItem>
                            ))}
                          </TextField>
                        );
                      }}
                    />

                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Multiple mentors can be assigned to the same track.
                    </p>
                  </>
                )}

                {assignment.role === "JUDGE" && (
                  <Controller
                    name={`mentorJudgeAssignments.${index}.judgeRoundAssignments`}
                    control={control}
                    render={({ field }) => {
                      const pairs = Array.isArray(field.value)
                        ? (field.value as JudgeTrackRoundAssignmentFormValues[])
                        : [];

                      const updatePair = (
                        pairIndex: number,
                        patch: Partial<JudgeTrackRoundAssignmentFormValues>,
                      ) => {
                        field.onChange(
                          pairs.map((pair, currentIndex) =>
                            currentIndex === pairIndex
                              ? { ...pair, ...patch }
                              : pair,
                          ),
                        );
                      };

                      const removePair = (pairIndex: number) => {
                        field.onChange(
                          pairs.filter((_, currentIndex) => currentIndex !== pairIndex),
                        );
                      };

                      return (
                        <div className="space-y-3">
                          {pairs.map((pair, pairIndex) => (
                            <div
                              key={pair.id}
                              className="grid grid-cols-[1fr_1fr_110px_40px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                            >
                              <TextField
                                select
                                size="small"
                                label="Track"
                                value={pair.trackId}
                                sx={wizardFieldSx}
                                onChange={(event) =>
                                  updatePair(pairIndex, {
                                    trackId: event.target.value,
                                  })
                                }
                              >
                                {tracks.map((track) => (
                                  <MenuItem key={track.id} value={track.id}>
                                    {track.trackName}
                                  </MenuItem>
                                ))}
                              </TextField>

                              <TextField
                                select
                                size="small"
                                label="Round"
                                value={pair.roundId}
                                sx={wizardFieldSx}
                                onChange={(event) =>
                                  updatePair(pairIndex, {
                                    roundId: event.target.value,
                                  })
                                }
                              >
                                {rounds.map((round) => (
                                  <MenuItem key={round.id} value={round.id}>
                                    {round.roundName}
                                  </MenuItem>
                                ))}
                              </TextField>

                              <TextField
                                size="small"
                                type="number"
                                label="To score"
                                value={pair.totalToScore ?? ""}
                                sx={wizardFieldSx}
                                onChange={(event) =>
                                  updatePair(pairIndex, {
                                    totalToScore:
                                      event.target.value === ""
                                        ? ""
                                        : Number(event.target.value),
                                  })
                                }
                              />

                              <button
                                type="button"
                                onClick={() => removePair(pairIndex)}
                                aria-label="Remove judge assignment pair"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 dark:hover:bg-rose-500/10"
                              >
                                <DeleteOutlineOutlinedIcon
                                  sx={{ fontSize: 17 }}
                                />
                              </button>
                            </div>
                          ))}

                          {pairs.length === 0 && (
                            <Alert severity="warning" sx={{ py: 0.5, borderRadius: "12px" }}>
                              Add at least one track-round pair for this judge.
                            </Alert>
                          )}

                          <button
                            type="button"
                            disabled={!canAddJudgePair}
                            onClick={() =>
                              field.onChange([
                                ...pairs,
                                createJudgeTrackRoundAssignment(
                                  tracks[0]?.id ?? "",
                                  rounds[0]?.id ?? "",
                                ),
                              ])
                            }
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-300/70 bg-white px-3 py-1.5 text-xs font-black text-blue-600 transition-colors duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500/30 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-500/10"
                          >
                            <AddOutlinedIcon sx={{ fontSize: 15 }} />
                            Add track-round
                          </button>
                        </div>
                      );
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
