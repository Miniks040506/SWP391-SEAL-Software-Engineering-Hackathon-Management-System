import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import type { JudgeSubmissionAssignmentResponse } from "@/types/grading.types";
import { GradingStatusBadge } from "../GradingStatusBadge";

interface JudgeSubmissionRowCardProps {
  submission: JudgeSubmissionAssignmentResponse;
  stagger: number;
}

const resolveAction = (sub: JudgeSubmissionAssignmentResponse) => {
  if (sub.gradingLocked) {
    return { label: "View score", dest: `/judge/submissions/${sub.submissionId}` };
  }
  if (sub.gradingStatus === "PENDING") {
    return { label: "Start scoring", dest: `/judge/submissions/${sub.submissionId}/score` };
  }
  if (sub.gradingStatus === "DRAFT_SAVED") {
    return { label: "Continue scoring", dest: `/judge/submissions/${sub.submissionId}/score` };
  }
  return { label: "View score", dest: `/judge/submissions/${sub.submissionId}` };
};

export const JudgeSubmissionRowCard = ({ submission, stagger }: JudgeSubmissionRowCardProps) => {
  const navigate = useNavigate();
  const action = resolveAction(submission);
  const isPending = !submission.gradingLocked && submission.gradingStatus === "PENDING";
  const progressPct =
    submission.criteriaCount > 0
      ? (submission.confirmedScoreCount / submission.criteriaCount) * 100
      : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/judge/submissions/${submission.submissionId}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/judge/submissions/${submission.submissionId}`);
        }
      }}
      className={`jd-fade-up jd-lift jd-press cursor-pointer rounded-2xl border bg-white p-5 focus-visible:outline-2 focus-visible:outline-blue-600 dark:bg-slate-900 ${
        isPending
          ? "jd-glow-amber border-amber-200 dark:border-amber-500/30"
          : "border-slate-200 dark:border-slate-700/80"
      }`}
      style={{ "--jd-stagger": stagger } as CSSProperties}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-black text-slate-950 dark:text-white">
              {submission.projectTitle || "Untitled project"}
            </h3>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {submission.submissionStatus || "UNKNOWN"}
            </span>
            {submission.gradingLocked && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <LockOutlinedIcon sx={{ fontSize: 12 }} /> Locked
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {submission.teamName || "N/A"} · {submission.trackName || "N/A"} ·{" "}
            {submission.roundName || "N/A"}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="jd-bar-grow h-full rounded-full bg-blue-600 dark:bg-blue-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
              {submission.confirmedScoreCount}/{submission.criteriaCount} criteria
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <GradingStatusBadge status={submission.gradingStatus} />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              navigate(action.dest);
            }}
            className="jd-press min-h-11 cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-blue-700"
          >
            {action.label}
          </button>
        </div>
      </div>
    </div>
  );
};
