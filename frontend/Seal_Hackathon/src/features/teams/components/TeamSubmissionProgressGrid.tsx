import type { UUID } from "@/types/common.types";
import type { CoordinatorTeamSubmissionProgressResponse } from "@/types/team.types";
import { getSubmissionStatusColor } from "../schemas/teams.schema";

type Props = {
  submissions: CoordinatorTeamSubmissionProgressResponse[];
  onSelectSubmission?: (submissionId: UUID) => void;
};

export function TeamSubmissionProgressGrid({ submissions, onSelectSubmission }: Props) {
  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
        No submissions recorded for this team.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {submissions.map((sub) => (
        <div
          key={sub.submissionId ?? sub.roundId}
          className="flex flex-col p-5 border border-slate-200 dark:border-slate-700/50 rounded-xl bg-slate-50 dark:bg-slate-800/50"
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
              {sub.roundName || "Round"}
            </span>
            {sub.submissionStatus ? (
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md border shrink-0 ${getSubmissionStatusColor(sub.submissionStatus)}`}>
                {sub.submissionStatus}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">No submission</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Attempt Number
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {sub.submissionNumber}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Submitted At
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {sub.submittedAt
                  ? new Date(sub.submittedAt).toLocaleString()
                  : "Not submitted yet"}
              </p>
            </div>
          </div>
          {onSelectSubmission && sub.submissionId && (
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => onSelectSubmission(sub.submissionId as UUID)}
                className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 font-semibold rounded-lg transition-colors text-sm"
              >
                View Submission Details →
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
