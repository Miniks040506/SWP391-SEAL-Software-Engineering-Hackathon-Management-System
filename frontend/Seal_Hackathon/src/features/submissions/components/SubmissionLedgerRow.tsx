import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { SubmissionStatusBadge } from "@/features/submissions/components/SubmissionStatusBadge";
import { MentorFeedbackCard } from "@/features/teams/components/MentorFeedbackCard";
import {
  formatAbsolute,
  formatRelative,
  submissionTimestamp,
} from "@/features/submissions/utils/submissionHistoryFormat";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";
import type { SubmissionResponse } from "@/types/submission.types";

type Props = {
  submission: SubmissionResponse;
  feedbacks: MentorFeedbackResponse[];
  feedbackLoading: boolean;
  feedbackError: boolean;
  now: number;
  onOpen: (submission: SubmissionResponse) => void;
};

export function SubmissionLedgerRow({
  submission,
  feedbacks,
  feedbackLoading,
  feedbackError,
  now,
  onOpen,
}: Props) {
  const stamp = submissionTimestamp(submission);
  const relative = formatRelative(stamp, now);
  const absolute = formatAbsolute(stamp);
  const isDraft = submission.status === "DRAFT";
  const feedbackCountLabel = `${feedbacks.length} ${feedbacks.length === 1 ? "note" : "notes"}`;

  return (
    <li>
      <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.6)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-40px_rgba(30,64,175,0.55)] dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-blue-500">
            <span className="text-[10px] font-semibold leading-none text-slate-300 dark:text-blue-100">
              Attempt
            </span>
            <span className="mt-1 text-lg font-bold leading-none tabular-nums">
              {submission.submissionNumber}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-950 dark:text-white">
                {submission.roundName ?? "Unnamed round"}
              </h2>
              <SubmissionStatusBadge status={submission.status} size="sm" />
              {submission.roundSubmissionLocked && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  title="This round no longer accepts changes"
                >
                  <LockOutlinedIcon style={{ fontSize: 12 }} />
                  Locked
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span>
                {relative
                  ? isDraft
                    ? `Updated ${relative}`
                    : `Submitted ${relative}`
                  : "Not submitted yet"}
              </span>
              {absolute && <time className="tabular-nums">{absolute}</time>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpen(submission)}
            className="group inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-400 dark:hover:text-slate-950"
          >
            {isDraft ? "Continue" : "View submission"}
            <ArrowForwardIcon
              className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
              style={{ fontSize: 16 }}
            />
          </button>
        </div>

        <section
          className="border-t border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/35 sm:p-6"
          aria-label={`Mentor feedback for ${submission.roundName ?? "submission"}, attempt ${submission.submissionNumber}`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RateReviewOutlinedIcon
                className="text-blue-600 dark:text-blue-300"
                style={{ fontSize: 18 }}
              />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Mentor feedback
              </h3>
            </div>
            {!feedbackLoading && !feedbackError && (
              <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                {feedbackCountLabel}
              </span>
            )}
          </div>

          {feedbackLoading ? (
            <div className="space-y-2" aria-label="Loading mentor feedback">
              <div className="h-3 w-full rounded bg-slate-200 motion-safe:animate-pulse dark:bg-slate-800" />
              <div className="h-3 w-2/3 rounded bg-slate-200 motion-safe:animate-pulse dark:bg-slate-800" />
            </div>
          ) : feedbackError ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Feedback is temporarily unavailable. Use Retry above to load it.
            </p>
          ) : feedbacks.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No published mentor feedback for this submission.
            </p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <MentorFeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </section>
      </article>
    </li>
  );
}
