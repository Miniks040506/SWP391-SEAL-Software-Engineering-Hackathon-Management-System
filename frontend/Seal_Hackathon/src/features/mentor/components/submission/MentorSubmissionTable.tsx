import type { CSSProperties } from "react";

import { format } from "date-fns";

import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";

import type {
  MentorSubmissionEmptyReason,
  MentorSubmissionSummaryResponse,
} from "@/types/submission.types";

type MentorSubmissionsTableProps = {
  submissions: MentorSubmissionSummaryResponse[];
  isLoading: boolean;
  emptyReason?: MentorSubmissionEmptyReason;
  onRowClick: (submissionId: string) => void;
};

const EMPTY_MESSAGES: Record<
  Exclude<MentorSubmissionEmptyReason, "NONE">,
  { title: string; body: string }
> = {
  NO_ASSIGNED_TEAMS: {
    title: "No Assigned Teams",
    body: "You do not currently have teams in your assigned tracks.",
  },
  NO_SUBMISSIONS: {
    title: "Teams Have Not Submitted",
    body: "Assigned teams exist, but none has submitted eligible deliverables yet.",
  },
  NO_FILTER_MATCHES: {
    title: "No Matching Submissions",
    body: "No submitted deliverables match the current filters.",
  },
};

/** Local status pill mapping — SUBMITTED is emerald, everything else slate. */
function getStatusPillClasses(status: string): string {
  if (status === "SUBMITTED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
  }
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

const isRecent = (submittedAt: string | null | undefined) =>
  Boolean(submittedAt) &&
  Date.now() - new Date(submittedAt as string).getTime() < 86_400_000;

const GRID_COLS =
  "grid grid-cols-[1.8fr_1.4fr_1.4fr_0.7fr_1fr_1.4fr_0.7fr_auto] items-center gap-3";

export const MentorSubmissionTable = ({
  submissions,
  isLoading,
  emptyReason = "NO_SUBMISSIONS",
  onRowClick,
}: MentorSubmissionsTableProps) => {
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

  if (!submissions || submissions.length === 0) {
    const message = emptyReason === "NONE"
      ? EMPTY_MESSAGES.NO_FILTER_MATCHES
      : EMPTY_MESSAGES[emptyReason];
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <FolderOffOutlinedIcon className="mt-pop mb-4 text-4xl text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
          {message.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {message.body}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`${GRID_COLS} px-4`}>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Track</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Round</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">#</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted At</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Links</span>
        <span aria-hidden className="w-6" />
      </div>

      {submissions.map((row, index) => {
        const isFinalRound = (row.roundName ?? "").includes("Final");

        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onRowClick(row.id)}
            aria-label={`View detail of submission #${row.submissionNumber} by ${row.teamName || "Unknown Team"}`}
            className={`mt-fade-up mt-lift mt-press group w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-slate-700/80 dark:bg-slate-900 dark:hover:border-blue-500/50 ${GRID_COLS}`}
            style={{ "--mt-stagger": index + 2 } as CSSProperties}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-extrabold text-slate-950 dark:text-white">
                {row.teamName || "Unknown Team"}
              </span>
              {isRecent(row.submittedAt) && (
                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                  New
                </span>
              )}
            </span>

            <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300">
              {row.trackName || "Unknown Track"}
            </span>

            <span
              className={`truncate text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                isFinalRound ? "border-l-2 border-blue-500 pl-2" : ""
              }`}
            >
              {row.roundName}
            </span>

            <span className="text-sm font-medium tabular-nums text-slate-600 dark:text-slate-400">
              #{row.submissionNumber}
            </span>

            <span>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusPillClasses(row.status)}`}
              >
                {row.status}
              </span>
            </span>

            <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
              {row.submittedAt
                ? format(new Date(row.submittedAt), "MMM dd, yyyy HH:mm")
                : "-"}
            </span>

            <span className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <LinkOutlinedIcon sx={{ fontSize: 16 }} />
              {row.linkCount || 0}
            </span>

            <ChevronRightOutlinedIcon className="justify-self-end text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </button>
        );
      })}
    </div>
  );
};
