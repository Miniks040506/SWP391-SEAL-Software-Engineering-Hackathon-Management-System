import { Controller, useFormContext } from "react-hook-form";

import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type {
  CreateEventFormValues,
  MentorJudgeFormValues,
  TrackFormValues,
} from "../../../schemas/createEvent.schema";

type MentorJudgeAssignmentTableProps = {
  assignments: MentorJudgeFormValues[];
  tracks: TrackFormValues[];
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
  onRemove,
}: MentorJudgeAssignmentTableProps) => {
  const { control } = useFormContext<CreateEventFormValues>();

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
      <div className="grid grid-cols-[1.4fr_100px_1.4fr_120px] bg-blue-500 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white">
        <div>Person</div>
        <div>Role</div>
        <div>Assigned Tracks</div>
        <div className="text-right">Action</div>
      </div>

      {assignments.map((assignment, index) => {
        const conflict = hasSameTrackRoleConflict(assignment, assignments);

        return (
          <div
            key={assignment.id}
            className="grid grid-cols-[1.4fr_100px_1.4fr_120px] items-start border-t border-gray-100 px-6 py-5"
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
                color={assignment.role === "Judge" ? "primary" : "success"}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </div>

            <div>
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

              <p className="mt-1 text-xs text-gray-400">
                Multiple people can be assigned to the same track.
              </p>
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