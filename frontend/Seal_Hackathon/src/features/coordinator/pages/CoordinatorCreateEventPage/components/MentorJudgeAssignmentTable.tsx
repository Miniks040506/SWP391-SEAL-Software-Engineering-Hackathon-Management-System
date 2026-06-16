import { Controller, useFormContext } from "react-hook-form";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type {
  CreateEventFormValues,
  JudgeTrackRoundAssignmentFormValues,
  MentorJudgeFormValues,
  RoundFormValues,
  TrackFormValues,
} from "../../../schemas/createEvent.schema";
import { createJudgeTrackRoundAssignment } from "../../../schemas/createEvent.schema";

type MentorJudgeAssignmentTableProps = {
  assignments: MentorJudgeFormValues[];
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

export const MentorJudgeAssignmentTable = ({
  assignments,
  tracks,
  rounds,
  onRemove,
}: MentorJudgeAssignmentTableProps) => {
  const { control } = useFormContext<CreateEventFormValues>();
  const canAddJudgePair = tracks.length > 0 && rounds.length > 0;

  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-gray-500">
          No mentors or judges invited yet.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Search and invite mentors or judges from the user list.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1.1fr_96px_minmax(320px,1.6fr)_80px] bg-blue-500 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white">
        <div>Person</div>
        <div>Role</div>
        <div>Assignment scope</div>
        <div className="text-right">Action</div>
      </div>

      {assignments.map((assignment, index) => {
        const conflict = hasSameTrackRoleConflict(assignment, assignments);

        return (
          <div
            key={assignment.id}
            className="grid grid-cols-[1.1fr_96px_minmax(320px,1.6fr)_80px] items-start gap-4 border-t border-gray-100 px-6 py-5"
          >
            <div>
              <p className="font-extrabold text-gray-900">
                {assignment.fullName}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {assignment.email}
              </p>

              {conflict && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This person is already assigned as another role in the same
                  track.
                </Alert>
              )}
            </div>

            <div>
              <Chip
                label={assignment.role}
                color={assignment.role === "JUDGE" ? "primary" : "success"}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </div>

            <div className="space-y-3">
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

                  <p className="text-xs text-gray-400">
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
                            className="grid grid-cols-[1fr_1fr_110px_40px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <TextField
                              select
                              size="small"
                              label="Track"
                              value={pair.trackId}
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
                              onChange={(event) =>
                                updatePair(pairIndex, {
                                  totalToScore: event.target.value,
                                })
                              }
                            />

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removePair(pairIndex)}
                              aria-label="Remove judge assignment pair"
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </div>
                        ))}

                        {pairs.length === 0 && (
                          <Alert severity="warning" sx={{ py: 0.5 }}>
                            Add at least one track-round pair for this judge.
                          </Alert>
                        )}

                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          startIcon={<AddOutlinedIcon />}
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
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Add track-round
                        </Button>
                      </div>
                    );
                  }}
                />
              )}
            </div>

            <div className="text-right">
              <IconButton color="error" onClick={() => onRemove(index)}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};
