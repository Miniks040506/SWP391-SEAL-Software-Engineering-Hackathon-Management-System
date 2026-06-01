import Checkbox from "@mui/material/Checkbox";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import { SectionCard } from "../../components/SectionCard";
import { TeamStatusBadge } from "../../components/TeamStatusBadge";
import { avatarColor } from "@/utils/avatarColor";
import type { EditEventData, EventTeam } from "../../mocks/coordinatorEditEvent.mock";
import type { TeamStatus } from "../../hooks/useEditEventMutation";

interface TeamsTabProps {
  event: EditEventData;
  teams: EventTeam[];
  selectedTeamIds: string[];
  onUpdateTeamStatus: (teamId: string, status: TeamStatus) => void;
  onSelectAll: (teamIds: string[], checked: boolean) => void;
  onToggleSelect: (teamId: string) => void;
  onBulkUpdate: (teamIds: string[], status: TeamStatus) => void;
  onOpenTeamDetail: (team: EventTeam) => void;
}

const checkboxSx = {
  color: "#94a3b8",
  "&.Mui-checked": {
    color: "#3b82f6",
  },
};

export const TeamsTab = ({
  event,
  teams,
  selectedTeamIds,
  onUpdateTeamStatus,
  onSelectAll,
  onToggleSelect,
  onBulkUpdate,
  onOpenTeamDetail,
}: TeamsTabProps) => {
  const pendingTeams = teams.filter((t) => t.status === "PENDING");
  const approvedTeams = teams.filter((t) => t.status === "APPROVED");

  const renderTrackGroup = (track: typeof event.tracks[0], status: TeamStatus) => {
    const trackTeams = teams.filter((t) => t.trackId === track.id && t.status === status);
    if (trackTeams.length === 0) return null;

    const trackTeamIds = trackTeams.map((t) => t.id);
    const selectedInTrack = selectedTeamIds.filter((id) => trackTeamIds.includes(id));
    const isAllSelected = selectedInTrack.length > 0 && selectedInTrack.length === trackTeamIds.length;
    const isIndeterminate = selectedInTrack.length > 0 && selectedInTrack.length < trackTeamIds.length;

    return (
      <SectionCard key={`${track.id}-${status}`} className="overflow-hidden p-0 dark:bg-[#1e293b]">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => onSelectAll(trackTeamIds, e.target.checked)}
              sx={{ ...checkboxSx, "&.MuiCheckbox-indeterminate": { color: "#3b82f6" } }}
            />
            <GroupsOutlinedIcon className="text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {track.name}
            </h3>
            <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {trackTeams.length}
            </span>
          </div>

          {selectedInTrack.length > 0 && (
            <div className="animate-in fade-in zoom-in-95 flex items-center gap-2 px-2 duration-200">
              <span className="mr-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {selectedInTrack.length} selected
              </span>
              {status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => onBulkUpdate(trackTeamIds, "APPROVED")}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                  >
                    <DoneAllOutlinedIcon sx={{ fontSize: 14 }} /> Approve All
                  </button>
                  <button
                    type="button"
                    onClick={() => onBulkUpdate(trackTeamIds, "REJECTED")}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  >
                    <BlockOutlinedIcon sx={{ fontSize: 14 }} /> Reject All
                  </button>
                </>
              )}
              {status === "APPROVED" && (
                <button
                  type="button"
                  onClick={() => onBulkUpdate(trackTeamIds, "REJECTED")}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                >
                  <BlockOutlinedIcon sx={{ fontSize: 14 }} /> Reject All
                </button>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {trackTeams.map((team) => (
            <div
              key={team.id}
              className={`flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                selectedTeamIds.includes(team.id)
                  ? "bg-blue-50/30 dark:bg-blue-500/10"
                  : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTeamIds.includes(team.id)}
                  onChange={() => onToggleSelect(team.id)}
                  sx={checkboxSx}
                />
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 text-lg font-bold shadow-sm dark:border-slate-700/50 ${avatarColor(team.name[0])}`}
                >
                  {team.name[0]}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenTeamDetail(team)}
                    className="text-left text-base font-bold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                  >
                    {team.name}
                  </button>
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>{team.members.length} Members</span>
                    <span>•</span>
                    <span>Registered {team.registeredAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pl-12 sm:flex-row-reverse sm:pl-0">
                <div className="w-24 text-right">
                  {team.status !== "PENDING" && <TeamStatusBadge status={team.status} />}
                </div>
                <TeamActions
                  status={team.status}
                  onUpdate={(status) => onUpdateTeamStatus(team.id, status)}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  };

  if (pendingTeams.length === 0 && approvedTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-24 text-slate-400 dark:border-slate-700 dark:text-slate-500">
        <GroupsOutlinedIcon sx={{ fontSize: 48 }} className="mb-4 opacity-50" />
        <p className="text-sm font-bold">No active teams to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {pendingTeams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <AccessTimeOutlinedIcon className="text-amber-500 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Pending Approvals
              <span className="ml-2 text-sm font-medium text-slate-400">({pendingTeams.length})</span>
            </h2>
          </div>
          <div className="space-y-6">
            {event.tracks.map((track) => renderTrackGroup(track, "PENDING"))}
          </div>
        </div>
      )}

      {approvedTeams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <VerifiedOutlinedIcon className="text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Approved Teams
              <span className="ml-2 text-sm font-medium text-slate-400">({approvedTeams.length})</span>
            </h2>
          </div>
          <div className="space-y-6">
            {event.tracks.map((track) => renderTrackGroup(track, "APPROVED"))}
          </div>
        </div>
      )}
    </div>
  );
};

const TeamActions = ({
  status,
  onUpdate,
}: {
  status: TeamStatus;
  onUpdate: (status: TeamStatus) => void;
}) => {
  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdate("APPROVED")}
          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
        >
          <CheckOutlinedIcon sx={{ fontSize: 14 }} /> Approve
        </button>
        <button
          type="button"
          onClick={() => onUpdate("REJECTED")}
          className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
        >
          <CloseOutlinedIcon sx={{ fontSize: 14 }} /> Reject
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onUpdate("REJECTED")}
        className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-colors hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 dark:hover:ring-transparent"
      >
        <CloseOutlinedIcon sx={{ fontSize: 14 }} /> Reject Team
      </button>
      
      <button
        type="button"
        onClick={() => onUpdate("PENDING")}
        className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <ReplayOutlinedIcon sx={{ fontSize: 14 }} /> Reset to Pending
      </button>
    </div>
  );
};