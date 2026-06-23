import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import type { GradingSubmissionDetailResponse } from "@/types/grading.types";

type Props = {
  submission: GradingSubmissionDetailResponse;
  isLocked: boolean;
};

export const ScoreSheetHeader = ({ submission, isLocked }: Props) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <Typography variant="h4" className="font-extrabold text-gray-900 dark:text-white">
          {submission.projectTitle || "Untitled Submission"}
        </Typography>
        <Typography variant="subtitle1" className="mt-1 font-medium text-gray-500 dark:text-slate-400">
          Team: {submission.teamName}
        </Typography>
      </div>

      {isLocked && (
        <div className="flex flex-wrap items-center gap-2">
          <Chip label="Locked" size="small" color="error" sx={{ fontWeight: "bold" }} />
        </div>
      )}
    </div>
  );
};
