import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import type { GradingSubmissionDetailResponse } from "@/types/grading.types";
import type { JudgeSubmissionAssignmentResponse } from "@/types/grading.types";

type Props = {
  submission: GradingSubmissionDetailResponse;
  isLocked: boolean;
  assignmentInfo?: JudgeSubmissionAssignmentResponse;
};

export const ScoreSheetHeader = ({
  submission,
  isLocked,
  assignmentInfo,
}: Props) => {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1">
        <Typography
          variant="h4"
          className="font-extrabold text-gray-900 dark:text-white"
        >
          {submission.projectTitle || submission.teamName}
        </Typography>
        <Typography
          variant="subtitle1"
          className="font-bold text-gray-500 dark:text-slate-400"
        >
          Team: {submission.teamName}
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
        <div>
          <Typography
            variant="caption"
            className="font-black uppercase tracking-wider text-gray-400"
          >
            Event
          </Typography>
          <Typography
            variant="body2"
            className="font-bold text-gray-900 dark:text-slate-200"
          >
            Hackathon Event
          </Typography>
        </div>
        <div>
          <Typography
            variant="caption"
            className="font-black uppercase tracking-wider text-gray-400"
          >
            Round
          </Typography>
          <Typography
            variant="body2"
            className="font-bold text-gray-900 dark:text-slate-200"
          >
            {assignmentInfo?.roundName || "Current Round"}
          </Typography>
        </div>
        <div>
          <Typography
            variant="caption"
            className="font-black uppercase tracking-wider text-gray-400"
          >
            Track
          </Typography>
          <Typography
            variant="body2"
            className="font-bold text-gray-900 dark:text-slate-200"
          >
            {assignmentInfo?.trackName || "General Track"}
          </Typography>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Typography variant="caption" className="font-bold text-gray-500">
            Submission:
          </Typography>
          <Chip
            label={assignmentInfo?.submissionStatus || "SUBMITTED"}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: "bold" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="caption" className="font-bold text-gray-500">
            Grading:
          </Typography>
          <Chip
            label={assignmentInfo?.gradingStatus || "PENDING"}
            size="small"
            color={
              assignmentInfo?.gradingStatus === "GRADED" ? "success" : "warning"
            }
            sx={{ fontWeight: "bold" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="caption" className="font-bold text-gray-500">
            Lock State:
          </Typography>
          <Chip
            label={isLocked ? "LOCKED" : "UNLOCKED"}
            size="small"
            color={isLocked ? "error" : "success"}
            variant="filled"
            sx={{ fontWeight: "bold" }}
          />
        </div>
      </div>
    </div>
  );
};
