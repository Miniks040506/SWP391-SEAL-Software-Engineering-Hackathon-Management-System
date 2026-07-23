import type { CSSProperties } from "react";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import type { JudgeSubmissionQueueSummaryResponse } from "@/types/grading.types";
import { useCountUp } from "../../hooks/useCountUp";

interface JudgeQueueProgressBandProps {
  summary: JudgeSubmissionQueueSummaryResponse;
}

/**
 * Cumulative-fill progress band: completed (submitted+locked) fills first,
 * then draft-saved, remainder stays empty. Counts render as icon+label
 * chips so status is never conveyed by color alone.
 */
export const JudgeQueueProgressBand = ({ summary }: JudgeQueueProgressBandProps) => {
  const total = Math.max(summary.totalAssigned, 1);
  const completed = summary.submitted + summary.locked;
  const completedPct = (completed / total) * 100;
  const draftPct = (summary.draftSaved / total) * 100;
  const animatedCompleted = useCountUp(completed);

  const chips = [
    {
      label: "pending",
      value: summary.pending,
      icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} />,
      className: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "draft saved",
      value: summary.draftSaved,
      icon: <EditNoteOutlinedIcon sx={{ fontSize: 14 }} />,
      className: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "submitted",
      value: summary.submitted,
      icon: <TaskAltOutlinedIcon sx={{ fontSize: 14 }} />,
      className: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "locked",
      value: summary.locked,
      icon: <LockOutlinedIcon sx={{ fontSize: 14 }} />,
      className: "text-slate-600 dark:text-slate-300",
    },
  ];

  return (
    <div
      className="jd-fade-up rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--jd-stagger": 1 } as CSSProperties}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Completed{" "}
          <span className="ml-1 text-xl font-black tabular-nums text-slate-950 dark:text-white">
            {Math.round(animatedCompleted)} / {summary.totalAssigned}
          </span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
          {chips.map((chip) => (
            <span key={chip.label} className={`inline-flex items-center gap-1 ${chip.className}`}>
              {chip.icon}
              <span className="tabular-nums">{chip.value}</span> {chip.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="jd-bar-grow h-full bg-emerald-500"
          style={{ width: `${completedPct}%` }}
        />
        <div
          className="jd-bar-grow h-full bg-blue-500"
          style={{ width: `${draftPct}%`, animationDelay: "260ms" }}
        />
      </div>
    </div>
  );
};
