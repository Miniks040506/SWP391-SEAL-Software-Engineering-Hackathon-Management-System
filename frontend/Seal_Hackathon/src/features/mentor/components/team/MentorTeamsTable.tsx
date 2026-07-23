import type { CSSProperties } from "react";

import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useNavigate } from "react-router-dom";

import type { MentorTeamProgressResponse } from "@/types/team.types";

type MentorTeamsTableProps = {
  teams: MentorTeamProgressResponse[];
  isLoading: boolean;
};

/** Local status pill mapping — do not import cross-feature schema helpers. */
function getStatusPillClasses(status: string): string {
  switch (status) {
    case "SUBMITTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "DRAFT":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

const GRID_COLS = "grid grid-cols-[2fr_2fr_1fr_1.5fr_auto] items-center gap-4";

export const MentorTeamsTable = ({
  teams,
  isLoading,
}: MentorTeamsTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="mt-shimmer h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <GroupsOutlinedIcon className="mt-pop mb-4 text-4xl text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
          No Teams Assigned
        </h3>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          There are currently no teams registered in your track.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`${GRID_COLS} px-4`}>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Name</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Members</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Activity</span>
        <span aria-hidden className="w-6" />
      </div>

      {teams.map((row, index) => (
        <button
          key={row.teamId}
          type="button"
          onClick={() => navigate(`/mentor/teams/${row.teamId}`)}
          aria-label={`View detail of ${row.teamName}`}
          className={`mt-fade-up mt-lift mt-press group w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-slate-700/80 dark:bg-slate-900 dark:hover:border-blue-500/50 ${GRID_COLS}`}
          style={{ "--mt-stagger": index + 2 } as CSSProperties}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {(row.teamName || "?").charAt(0).toUpperCase()}
            </span>
            <span className="truncate font-extrabold text-slate-950 dark:text-white">
              {row.teamName}
            </span>
          </span>

          <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300">
            {row.projectTitle || "-"}
          </span>

          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <GroupsOutlinedIcon sx={{ fontSize: 18 }} />
            {row.memberCount}
          </span>

          <span>
            {row.latestSubmissionStatus ? (
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusPillClasses(row.latestSubmissionStatus)}`}
              >
                {row.latestSubmissionStatus}
              </span>
            ) : (
              <span className="text-sm italic text-slate-400 dark:text-slate-500">
                No submissions yet
              </span>
            )}
          </span>

          <ChevronRightOutlinedIcon
            className="justify-self-end text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          />
        </button>
      ))}
    </div>
  );
};
