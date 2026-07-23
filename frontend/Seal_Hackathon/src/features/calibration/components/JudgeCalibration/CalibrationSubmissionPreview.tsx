import type { CSSProperties } from "react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import type { CalibrationScoreSheetResponse } from "@/types/calibration.types";

interface CalibrationSubmissionPreviewProps {
  scoreSheet?: CalibrationScoreSheetResponse;
  stagger?: number;
}

export const CalibrationSubmissionPreview = ({
  scoreSheet,
  stagger = 1,
}: CalibrationSubmissionPreviewProps) => {
  if (!scoreSheet) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        Sample submission not available.
      </div>
    );
  }

  return (
    <div
      className="jd-fade-up flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      style={{ "--jd-stagger": stagger } as CSSProperties}
    >
      {/* Header / Basic Info */}
      <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
        <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
          Sample Submission Preview
        </h2>
        <div className="grid grid-cols-1 gap-y-3 text-sm">
          <div>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Team:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {scoreSheet.sampleTeamName || "Not available"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Event:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {scoreSheet.eventName}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Track:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {scoreSheet.sampleTrackName || "Not available"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Round:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {scoreSheet.sampleRoundName || "Not available"}
            </span>
          </div>
        </div>
      </div>

      {/* Note / Description */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <DescriptionOutlinedIcon
            fontSize="small"
            className="text-slate-500"
          />
          Notes & Description
        </h3>
        {scoreSheet.sampleNote ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            {scoreSheet.sampleNote}
          </div>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            No description provided.
          </p>
        )}
      </div>

      {/* Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Deliverable links
        </h3>
        {scoreSheet.links.length > 0 ? (
          <SubmissionLinksPreview links={scoreSheet.links} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No links available.
          </div>
        )}
      </div>
    </div>
  );
};
