import { format } from "date-fns";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type MentorFeedbackCardProps = {
  feedback: MentorFeedbackResponse;
  showSubmissionContext?: boolean;
};

export function MentorFeedbackCard({
  feedback,
  showSubmissionContext = false,
}: MentorFeedbackCardProps) {
  const category = (feedback.category ?? "General")
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());

  return (
    <article className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-26px_rgba(30,64,175,0.65)] dark:bg-slate-900 dark:ring-slate-700/80">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          <RateReviewOutlinedIcon style={{ fontSize: 14 }} />
          {category}
        </span>
        {showSubmissionContext && feedback.roundName && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {feedback.roundName}
          </span>
        )}
        {showSubmissionContext && feedback.submissionNumber != null && (
          <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
            Attempt #{feedback.submissionNumber}
          </span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
        {feedback.content}
      </p>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {feedback.mentorName ?? "Assigned mentor"}
        </span>
        <time className="tabular-nums">
          {format(
            new Date(feedback.publishedAt ?? feedback.createdAt),
            "MMM d, yyyy 'at' h:mm a",
          )}
        </time>
      </footer>
    </article>
  );
}
