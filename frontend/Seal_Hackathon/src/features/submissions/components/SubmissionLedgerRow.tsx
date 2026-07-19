import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { SubmissionStatusBadge } from "@/features/submissions/components/SubmissionStatusBadge";
import {
  formatAbsolute,
  formatRelative,
  submissionTimestamp,
} from "@/features/submissions/utils/submissionHistoryFormat";
import type { SubmissionResponse } from "@/types/submission.types";

type Props = {
  submission: SubmissionResponse;
  now: number;
  onOpen: (submission: SubmissionResponse) => void;
};

/**
 * One filed deliverable, read as a ledger entry: what round, which attempt,
 * when it landed, and where it stands.
 */
export function SubmissionLedgerRow({ submission, now, onOpen }: Props) {
  const stamp = submissionTimestamp(submission);
  const relative = formatRelative(stamp, now);
  const absolute = formatAbsolute(stamp);
  const isDraft = submission.status === "DRAFT";

  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50">
      <div className="min-w-0 flex-1 basis-64">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
            {submission.roundName ?? "Unnamed round"}
          </p>
          {submission.roundSubmissionLocked && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-slate-800 dark:text-slate-300"
              title="This round no longer accepts changes"
            >
              <LockOutlinedIcon style={{ fontSize: 11 }} />
              Locked
            </span>
          )}
        </div>
        <p className="mt-1 text-xs font-medium tabular-nums text-gray-500 dark:text-slate-400">
          Attempt #{submission.submissionNumber}
        </p>
      </div>

      <div className="min-w-0 basis-48">
        <p className="text-sm text-gray-700 dark:text-slate-300">
          {relative ? (
            isDraft ? `Updated ${relative}` : `Submitted ${relative}`
          ) : (
            <span className="text-gray-400 dark:text-slate-500">
              Not submitted yet
            </span>
          )}
        </p>
        {absolute && (
          <p className="mt-1 text-xs tabular-nums text-gray-400 dark:text-slate-500">
            {absolute}
          </p>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <SubmissionStatusBadge status={submission.status} size="sm" />
        <button
          type="button"
          onClick={() => onOpen(submission)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition-colors duration-200 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900"
        >
          {isDraft ? "Continue" : "View"}
          <ArrowForwardIcon style={{ fontSize: 15 }} />
        </button>
      </div>
    </li>
  );
}
