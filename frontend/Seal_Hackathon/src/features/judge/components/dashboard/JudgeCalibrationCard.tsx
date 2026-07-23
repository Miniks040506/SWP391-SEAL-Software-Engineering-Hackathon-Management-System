import type { CSSProperties } from "react";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import type { JudgeDashboardData } from "../../schemas/judgeDashboard.schema";

interface JudgeCalibrationCardProps {
  calibration: JudgeDashboardData["calibration"];
  onStartCalibration: () => void;
}

export const JudgeCalibrationCard = ({
  calibration,
  onStartCalibration,
}: JudgeCalibrationCardProps) => {
  const needsAction = calibration.required && !calibration.completed;

  return (
    <div
      className={`jd-fade-up jd-settle rounded-2xl border p-6 ${
        needsAction
          ? "border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/5"
          : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5"
      }`}
      style={{ "--jd-stagger": 6 } as CSSProperties}
    >
      <div className="flex items-center gap-2">
        <ScienceOutlinedIcon
          sx={{ fontSize: 20 }}
          className={needsAction ? "text-amber-600" : "text-emerald-600"}
        />
        <h2 className="text-base font-black text-slate-950 dark:text-white">Calibration</h2>
      </div>

      <div className="mt-4 flex items-start gap-3">
        {needsAction ? (
          <ErrorOutlineOutlinedIcon className="jd-pop mt-0.5 text-amber-600" sx={{ fontSize: 22 }} />
        ) : (
          <CheckCircleOutlinedIcon className="jd-pop mt-0.5 text-emerald-600" sx={{ fontSize: 22 }} />
        )}
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            {!calibration.required
              ? "Not required for this event"
              : calibration.completed
                ? "Calibration completed"
                : "Calibration required"}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            {needsAction
              ? "Finish the benchmark scoring to unlock official grading."
              : "You are cleared for official grading."}
          </p>
        </div>
      </div>

      {needsAction && (
        <button
          type="button"
          onClick={onStartCalibration}
          className="jd-press mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-amber-600"
        >
          Start Calibration
        </button>
      )}
    </div>
  );
};
