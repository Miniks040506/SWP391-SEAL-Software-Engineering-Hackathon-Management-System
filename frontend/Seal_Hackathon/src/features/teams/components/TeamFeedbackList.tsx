import { format } from "date-fns";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type TeamFeedbackListProps = {
  feedbacks: MentorFeedbackResponse[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export const TeamFeedbackList = ({
  feedbacks,
  isLoading,
  isError,
  onRetry,
}: TeamFeedbackListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading mentor feedback">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            aria-hidden
          >
            <div className="h-4 w-44 rounded bg-slate-200 motion-safe:animate-pulse dark:bg-slate-800" />
            <div className="mt-4 h-3 w-full rounded bg-slate-100 motion-safe:animate-pulse dark:bg-slate-800/70" />
            <div className="mt-2 h-3 w-3/4 rounded bg-slate-100 motion-safe:animate-pulse dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-10 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
        <p className="font-semibold text-rose-900 dark:text-rose-200">
          Mentor feedback could not be loaded.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 active:scale-[0.98] dark:text-rose-300 dark:hover:bg-rose-500/10"
        >
          <RefreshRoundedIcon style={{ fontSize: 17 }} />
          Try again
        </button>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <span className="flex size-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
          <RateReviewOutlinedIcon />
        </span>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          No published feedback yet
        </h3>
        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          Feedback appears here after your mentor publishes it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedbacks.map((fb) => (
        <article
          key={fb.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {fb.category ?? "GENERAL"}
                </span>
                {fb.roundName && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {fb.roundName}
                  </span>
                )}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700 dark:text-slate-300">
                {fb.content}
              </p>
            </div>
            <div className="shrink-0 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:max-w-48 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {fb.mentorName ?? "Assigned mentor"}
              </p>
              <time className="mt-1 block tabular-nums">
                {format(
                  new Date(fb.publishedAt ?? fb.createdAt),
                  "MMM d, yyyy 'at' h:mm a",
                )}
              </time>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
