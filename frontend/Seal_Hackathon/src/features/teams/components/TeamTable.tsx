import { useNavigate } from "react-router-dom";
import type { CoordinatorTeamSummaryResponse } from "@/types/team.types";
import { getSubmissionStatusColor, getTeamStatusColor } from "../schemas/teams.schema";

type Props = {
  teams: CoordinatorTeamSummaryResponse[];
  loading: boolean;
  onViewTeam?: (teamId: string) => void;
};

export function TeamTable({ teams, loading, onViewTeam }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading teams...
        </p>
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">
          No teams found.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Leader
            </th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Track
            </th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Members
            </th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Team Status
            </th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Submissions
            </th>
            <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 bg-white dark:bg-slate-900/50">
          {teams.map((team) => (
            <tr
              key={team.teamId}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {team.teamName}
                </div>
                {team.projectTitle && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {team.projectTitle}
                  </div>
                )}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                <div>{team.leaderName || "Unassigned"}</div>
                {team.leaderEmail && (
                  <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {team.leaderEmail}
                  </div>
                )}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                {team.trackName || "No track"}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                {team.memberCount}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                {team.status ? (
                  <span
                    className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border ${getTeamStatusColor(team.status)}`}
                  >
                    {team.status}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Unknown</span>
                )}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {team.submittedSubmissionCount} of {team.submittedSubmissionCount + team.missingSubmissionCount} rounds submitted
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {team.latestSubmissionStatus ? (
                    <span
                      className={`px-2 py-0.5 inline-flex text-[11px] font-bold rounded-md border ${getSubmissionStatusColor(team.latestSubmissionStatus)}`}
                    >
                      {team.latestSubmissionStatus}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No submission</span>
                  )}
                  {team.missingSubmissionCount > 0 && (
                    <span className="text-xs text-amber-500 dark:text-amber-400">
                      {team.missingSubmissionCount} rounds pending
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() =>
                    onViewTeam
                      ? onViewTeam(team.teamId)
                      : navigate(`/coordinator/teams/${team.teamId}`)
                  }
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm px-4 py-2 rounded-lg transition-all"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
