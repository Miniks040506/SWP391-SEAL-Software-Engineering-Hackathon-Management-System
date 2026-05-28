import IconButton from "@mui/material/IconButton";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import { SectionCard } from "../../components/SectionCard";
import { UserPill } from "../../components/UserPill";
import {
  availableJudges,
  availableMentors,
  availableScoreCriteria,
} from "../../mocks/coordinatorEditEvent.mock";
import type { EditEventData } from "../../types/coordinator.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TracksTabProps {
  event: EditEventData;
  expandedTracks: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onRemoveTrack: (id: string) => void;
  onRemoveRound: (trackId: string, roundId: string) => void;
  onRemoveUser: (trackId: string, userId: string, field: "judgeIds" | "mentorIds") => void;
  onOpenAddJudge: (trackId: string) => void;
  onOpenAddMentor: (trackId: string) => void;
  onOpenAddRound: (trackId: string) => void;
  onOpenEditCriteria: (trackId: string, roundId: string) => void;
  onOpenAddTrack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TracksTab = ({
  event,
  expandedTracks,
  onToggleExpand,
  onRemoveTrack,
  onRemoveRound,
  onRemoveUser,
  onOpenAddJudge,
  onOpenAddMentor,
  onOpenAddRound,
  onOpenEditCriteria,
  onOpenAddTrack,
}: TracksTabProps) => (
  <div className="space-y-6">
    {event.tracks.map((track) => (
      <SectionCard
        key={track.id}
        className="overflow-hidden border-slate-200 p-0 transition-all hover:shadow-md"
      >
        {/* Track header */}
        <div
          className="flex cursor-pointer items-center justify-between bg-slate-50/50 px-6 py-5"
          onClick={() => onToggleExpand(track.id)}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                expandedTracks[track.id]
                  ? "bg-blue-100 text-blue-600"
                  : "border border-slate-200 bg-white text-slate-400 shadow-sm"
              }`}
            >
              {expandedTracks[track.id] ? (
                <ExpandLessOutlinedIcon />
              ) : (
                <ExpandMoreOutlinedIcon />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{track.name}</h3>
              <p className="text-sm text-slate-500">{track.description}</p>
            </div>
          </div>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTrack(track.id);
            }}
            size="small"
            className="!text-slate-400 hover:!bg-red-50 hover:!text-red-500"
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Track body */}
        {expandedTracks[track.id] && (
          <div className="space-y-8 border-t border-slate-200 bg-white px-6 py-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Judges */}
              <div>
                <div className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
                  <GradingOutlinedIcon fontSize="small" className="text-indigo-500" />
                  Assigned Judges
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {track.judgeIds.map((jid) => {
                    const user = availableJudges.find((j) => j.id === jid);
                    return user ? (
                      <UserPill
                        key={jid}
                        name={user.name}
                        initials={user.avatar}
                        onRemove={() => onRemoveUser(track.id, jid, "judgeIds")}
                      />
                    ) : null;
                  })}
                  <AddUserButton
                    label="Add Judge"
                    colorClass="hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => onOpenAddJudge(track.id)}
                  />
                </div>
              </div>

              {/* Mentors */}
              <div>
                <div className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
                  <SchoolOutlinedIcon fontSize="small" className="text-teal-500" />
                  Assigned Mentors
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {track.mentorIds.map((mid) => {
                    const user = availableMentors.find((m) => m.id === mid);
                    return user ? (
                      <UserPill
                        key={mid}
                        name={user.name}
                        initials={user.avatar}
                        onRemove={() => onRemoveUser(track.id, mid, "mentorIds")}
                      />
                    ) : null;
                  })}
                  <AddUserButton
                    label="Add Mentor"
                    colorClass="hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600"
                    onClick={() => onOpenAddMentor(track.id)}
                  />
                </div>
              </div>
            </div>

            {/* Rounds */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-700">Track Rounds</h4>
                <button
                  type="button"
                  onClick={() => onOpenAddRound(track.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-colors hover:bg-blue-50"
                >
                  <AddOutlinedIcon fontSize="small" /> Add Round
                </button>
              </div>

              {track.rounds.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-10 text-slate-400">
                  <CalendarTodayOutlinedIcon className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">No rounds created yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {track.rounds.map((round) => (
                    <div
                      key={round.id}
                      className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-slate-800">{round.name}</h5>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {round.startDate}&nbsp;→&nbsp;{round.endDate}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {round.criteriaIds.map((cid) => {
                            const criterion = availableScoreCriteria.find((x) => x.id === cid);
                            return criterion ? (
                              <span
                                key={cid}
                                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                              >
                                {criterion.name}
                              </span>
                            ) : null;
                          })}
                          <button
                            type="button"
                            onClick={() => onOpenEditCriteria(track.id, round.id)}
                            className="rounded-md px-2 py-1 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            + Manage Criteria
                          </button>
                        </div>
                      </div>
                      <IconButton
                        onClick={() => onRemoveRound(track.id, round.id)}
                        className="!text-slate-300 hover:!bg-red-50 hover:!text-red-500 self-start sm:self-auto"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>
    ))}

    {/* Add Track button */}
    <button
      type="button"
      onClick={onOpenAddTrack}
      className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 text-slate-500 transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:bg-blue-100 group-hover:ring-blue-200">
        <AddOutlinedIcon fontSize="small" />
      </div>
      <span className="text-sm font-bold">Add New Track</span>
    </button>
  </div>
);

// ─── Local helpers ────────────────────────────────────────────────────────────

const AddUserButton = ({
  label,
  colorClass,
  onClick,
}: {
  label: string;
  colorClass: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-500 transition-colors ${colorClass}`}
  >
    <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
    {label}
  </button>
);