import type { SubmissionSummaryResponse } from "@/types/submission.types";
import { getSubmissionStatusColor } from "@/features/submissions/schemas/submissions.schema";

type Props = {
  submissions: SubmissionSummaryResponse[];
};

export function TeamSubmissionProgressGrid({ submissions }: Props) {
  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
        No submissions recorded for this team.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="flex flex-col p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
              {sub.roundName}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border shrink-0 ${getSubmissionStatusColor(sub.status)}`}>
              {sub.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Attempt #{sub.submissionNumber}</span>
            <span>
              {sub.submittedAt
                ? new Date(sub.submittedAt).toLocaleString()
                : "Not submitted"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}