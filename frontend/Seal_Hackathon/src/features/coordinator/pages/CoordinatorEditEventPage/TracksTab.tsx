import IconButton from "@mui/material/IconButton";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { SectionCard } from "../../components/SectionCard";
import { UserPill } from "../../components/UserPill";
import { availableJudges, availableMentors } from "../../mocks/coordinatorEditEvent.mock";
import type { EditEventData } from "../../mocks/coordinatorEditEvent.mock";

interface TracksTabProps {
  event: EditEventData;
  expandedTracks: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onRemoveTrack: (id: string) => void;
  onRemoveRound: (trackId: string, roundId: string) => void;
  onRemoveMentor: (trackId: string, userId: string) => void;
  onRemoveJudge: (trackId: string, roundId: string, userId: string) => void;
  onOpenAddJudge: (trackId: string, roundId: string) => void;
  onOpenAddMentor: (trackId: string) => void;
  onOpenAddRound: (trackId: string) => void;
  onOpenEditTrack: (trackId: string) => void;
  onOpenEditRound: (trackId: string, roundId: string) => void;
  onOpenAddTrack: () => void;
}

export const TracksTab = ({
  event,
  expandedTracks,
  onToggleExpand,
  onRemoveTrack,
  onRemoveRound,
  onRemoveMentor,
  onRemoveJudge,
  onOpenAddJudge,
  onOpenAddMentor,
  onOpenAddRound,
  onOpenEditTrack,
  onOpenEditRound,
  onOpenAddTrack,
}: TracksTabProps) => (
  <div className="space-y-6">
    {event.tracks.map((track) => (
      <SectionCard
        key={track.id}
        className="overflow-hidden border-slate-200 dark:border-slate-700/60 p-0 transition-all hover:shadow-md"
      >
        <div
          className="flex cursor-pointer items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-slate-50 dark:bg-[#1e293b] dark:hover:bg-slate-800/50"
          onClick={() => onToggleExpand(track.id)}
        >
          <div className="flex items-center gap-3">
            {expandedTracks[track.id] ? (
              <KeyboardArrowUpOutlinedIcon className="text-slate-400 dark:text-slate-500" />
            ) : (
              <KeyboardArrowDownOutlinedIcon className="text-slate-400 dark:text-slate-500" />
            )}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{track.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditTrack(track.id);
              }}
              size="small"
              className="bg-white! text-blue-600! shadow-sm hover:bg-blue-50! dark:bg-slate-800! dark:text-blue-400! dark:hover:bg-slate-700!"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTrack(track.id);
              }}
              size="small"
              className="bg-white! text-rose-600! shadow-sm hover:bg-rose-50! dark:bg-slate-800! dark:text-rose-400! dark:hover:bg-slate-700!"
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        {expandedTracks[track.id] && (
          <div className="space-y-8 border-t border-slate-200 bg-white px-6 py-6 dark:border-slate-700/60 dark:bg-[#1e293b]">
            <div className="mb-2">
              <div className="mb-3 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                <SchoolOutlinedIcon fontSize="small" className="text-teal-500 dark:text-teal-400" />
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
                      onRemove={() => onRemoveMentor(track.id, mid)}
                    />
                  ) : null;
                })}
                <AddUserButton
                  label="Add Mentor"
                  colorClass="hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600 dark:hover:border-teal-500/50 dark:hover:bg-teal-500/10 dark:hover:text-teal-400"
                  onClick={() => onOpenAddMentor(track.id)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Track Rounds</h4>
                <button
                  type="button"
                  onClick={() => onOpenAddRound(track.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-colors hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:ring-slate-700 dark:hover:bg-slate-700"
                >
                  <AddOutlinedIcon fontSize="small" /> Add Round
                </button>
              </div>

              {track.rounds.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-10 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  <CalendarTodayOutlinedIcon className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">No rounds created yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {track.rounds.map((round) => (
                    <div
                      key={round.id}
                      className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-[#1e293b]"
                    >
                      <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-700/50">
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200">{round.name}</h5>
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {round.startDate}&nbsp;→&nbsp;{round.endDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconButton
                            onClick={() => onOpenEditRound(track.id, round.id)}
                            className="text-slate-400! hover:bg-blue-50! hover:text-blue-600! dark:hover:bg-slate-800! dark:hover:text-blue-400!"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => onRemoveRound(track.id, round.id)}
                            className="text-slate-400! hover:bg-red-50! hover:text-red-500! dark:hover:bg-slate-800! dark:hover:text-rose-400!"
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </div>

                      {/* --- THÊM PHẦN JUDGES VÀO TRONG ROUND --- */}
                      <div className="pt-1">
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <GradingOutlinedIcon sx={{ fontSize: 14 }} className="text-indigo-500 dark:text-indigo-400" />
                          Assigned Judges
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {round.judgeIds.map((jid) => {
                            const user = availableJudges.find((j) => j.id === jid);
                            return user ? (
                              <UserPill
                                key={jid}
                                name={user.name}
                                initials={user.avatar}
                                onRemove={() => onRemoveJudge(track.id, round.id, jid)}
                              />
                            ) : null;
                          })}
                          <AddUserButton
                            label="Add Judge"
                            colorClass="hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                            onClick={() => onOpenAddJudge(track.id, round.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>
    ))}

    <button
      type="button"
      onClick={onOpenAddTrack}
      className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 text-slate-500 transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:bg-blue-100 group-hover:ring-blue-200 dark:bg-[#1e293b] dark:ring-slate-700 dark:group-hover:bg-slate-800 dark:group-hover:ring-slate-600">
        <AddOutlinedIcon fontSize="small" />
      </div>
      <span className="text-sm font-bold">Add New Track</span>
    </button>
  </div>
);

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
    className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 ${colorClass}`}
  >
    <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
    {label}
  </button>
);