import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import type { CoordinatorTeamSummaryResponse } from "@/types/team.types";
import { avatarColor } from "@/utils/avatarColor";
import {
  formatTeamStatusLabel,
  getTeamRegistrationStatusColor,
  getTeamStatusColor,
} from "../schemas/teams.schema";

type Props = {
  teams: CoordinatorTeamSummaryResponse[];
  loading: boolean;
  onViewTeam?: (teamId: string) => void;
};

const HEAD =
  "px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="tl-skeleton h-9 w-9 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <div className="tl-skeleton h-3 w-28 rounded" />
                <div className="tl-skeleton h-2.5 w-20 rounded" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="tl-skeleton h-3 w-24 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="tl-skeleton h-3 w-20 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="tl-skeleton h-3 w-8 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="tl-skeleton h-6 w-20 rounded-lg" />
          </td>
          <td className="px-4 py-4">
            <div className="tl-skeleton h-6 w-24 rounded-lg" />
          </td>
          <td className="px-4 py-4" />
        </tr>
      ))}
    </>
  );
}

export function TeamTable({ teams, loading, onViewTeam }: Props) {
  const navigate = useNavigate();

  const open = (teamId: string) =>
    onViewTeam ? onViewTeam(teamId) : navigate(`/coordinator/teams/${teamId}`);

  if (!loading && !teams.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <PeopleAltOutlinedIcon />
        </span>
        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
          No teams found
        </p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
            <th className={HEAD}>Team</th>
            <th className={HEAD}>Leader</th>
            <th className={HEAD}>Track</th>
            <th className={`${HEAD} whitespace-nowrap`}>Members</th>
            <th className={HEAD}>Status</th>
            <th className={HEAD}>Registration</th>
            <th className={`${HEAD} text-right`}>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white dark:divide-slate-800/50 dark:bg-transparent">
          {loading ? (
            <SkeletonRows />
          ) : (
            teams.map((team, i) => {
              const initial = (team.teamName || "?").charAt(0);
              return (
                <tr
                  key={team.teamId}
                  role="button"
                  tabIndex={0}
                  onClick={() => open(team.teamId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      open(team.teamId);
                    }
                  }}
                  className="tl-row tl-row-hover group cursor-pointer outline-none hover:bg-blue-50/50 focus-visible:bg-blue-50/60 dark:hover:bg-slate-800/50 dark:focus-visible:bg-slate-800/60"
                  style={{ animationDelay: `${Math.min(i * 35, 400)}ms` }}
                >
                  {/* Team */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(initial)}`}
                      >
                        {initial.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {team.teamName}
                        </div>
                        {team.projectTitle && (
                          <div className="truncate text-xs text-slate-400 dark:text-slate-500">
                            {team.projectTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Leader */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {team.leaderName || "Unassigned"}
                    </div>
                    {team.leaderEmail && (
                      <div className="truncate text-xs text-slate-400 dark:text-slate-500">
                        {team.leaderEmail}
                      </div>
                    )}
                  </td>

                  {/* Track */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {team.trackName || (
                        <span className="italic text-slate-400">No track</span>
                      )}
                    </span>
                  </td>

                  {/* Members */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      <GroupsOutlinedIcon sx={{ fontSize: 15 }} />
                      {team.memberCount}
                    </span>
                  </td>

                  {/* Team status */}
                  <td className="px-4 py-4">
                    {team.status ? (
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${getTeamStatusColor(team.status)}`}
                      >
                        {formatTeamStatusLabel(team.status)}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        Unknown
                      </span>
                    )}
                  </td>

                  {/* Registration */}
                  <td className="px-4 py-4">
                    {team.registrationStatus ? (
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${getTeamRegistrationStatusColor(team.registrationStatus)}`}
                      >
                        {formatTeamStatusLabel(team.registrationStatus)}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        Unknown
                      </span>
                    )}
                  </td>

                  {/* Open affordance */}
                  <td className="px-4 py-4 text-right">
                    <span className="tl-chevron inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm dark:text-slate-500 dark:group-hover:bg-slate-700 dark:group-hover:text-blue-400">
                      <ChevronRightIcon fontSize="small" />
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
