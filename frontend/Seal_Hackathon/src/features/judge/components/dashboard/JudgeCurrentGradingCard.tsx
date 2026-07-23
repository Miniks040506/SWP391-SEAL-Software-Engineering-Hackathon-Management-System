import type { CSSProperties } from "react";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import type { JudgeDashboardData } from "../../schemas/judgeDashboard.schema";

interface JudgeCurrentGradingCardProps {
  currentGrading: JudgeDashboardData["currentGrading"];
  totalScorecards: number;
  progressPercent: number;
  onStartGrading: () => void;
}

export const JudgeCurrentGradingCard = ({
  currentGrading,
  totalScorecards,
  progressPercent,
  onStartGrading,
}: JudgeCurrentGradingCardProps) => {
  const isComplete = progressPercent >= 100;

  return (
    <div
      className="jd-fade-up rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--jd-stagger": 5 } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Active assignment
          </p>
          <h2 className="mt-1 truncate text-xl font-black text-slate-950 dark:text-white">
            {currentGrading.eventName}
          </h2>
          <p className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {currentGrading.roundName} · {currentGrading.trackName}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartGrading}
          className="jd-press inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Open queue
          <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Pending", value: `${currentGrading.pendingSubmissions} submissions` },
          { label: "Completed", value: `${currentGrading.completedSubmissions} submissions` },
          { label: "Deadline", value: currentGrading.deadline },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Grading progress</span>
          <span className="tabular-nums text-slate-900 dark:text-white">
            {currentGrading.completedSubmissions}/{totalScorecards} scorecards
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`jd-bar-grow h-full rounded-full ${
              isComplete ? "bg-emerald-500" : "jd-sheen bg-blue-600 dark:bg-blue-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
