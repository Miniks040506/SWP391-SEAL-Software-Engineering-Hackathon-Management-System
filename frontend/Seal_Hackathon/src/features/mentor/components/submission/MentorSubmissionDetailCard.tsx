import type { CSSProperties } from "react";

import { format } from "date-fns";

import type { SubmissionDetailResponse } from "@/types/submission.types";

type MentorSubmissionDetailCardProps = {
  submission: SubmissionDetailResponse;
};

const MetaTile = ({
  label,
  value,
  stagger,
  tabular = false,
}: {
  label: string;
  value: string;
  stagger: number;
  tabular?: boolean;
}) => (
  <div
    className="mt-fade-up rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"
    style={{ "--mt-stagger": stagger } as CSSProperties}
  >
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-bold text-slate-950 dark:text-white ${
        tabular ? "tabular-nums text-lg" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

/**
 * Slim meta band under the hero: submission number, timestamps and the
 * team note as a quote block. Team/track/round/status live in the hero.
 */
export const MentorSubmissionDetailCard = ({
  submission,
}: MentorSubmissionDetailCardProps) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetaTile
          label="Submission #"
          value={`${submission.submissionNumber}`}
          stagger={1}
          tabular
        />
        <MetaTile
          label="Submitted At"
          value={
            submission.submittedAt
              ? format(new Date(submission.submittedAt), "MMM dd, yyyy HH:mm")
              : "Not submitted"
          }
          stagger={2}
        />
        <MetaTile
          label="Last Updated"
          value={
            submission.updatedAt
              ? format(new Date(submission.updatedAt), "MMM dd, yyyy HH:mm")
              : "-"
          }
          stagger={3}
        />
      </div>

      {submission.note && (
        <div
          className="mt-fade-up mt-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 bg-slate-50 p-5 dark:border-slate-700 dark:border-l-blue-500 dark:bg-slate-800/50"
          style={{ "--mt-stagger": 4 } as CSSProperties}
        >
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
            Team Note
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-600 dark:text-slate-400">
            {submission.note}
          </p>
        </div>
      )}
    </section>
  );
};
