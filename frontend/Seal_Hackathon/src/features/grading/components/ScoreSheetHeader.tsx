import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import type {
  GradingSubmissionDetailResponse,
  ScoreSheetResponse,
} from "@/types/grading.types";

type Props = {
  submission: GradingSubmissionDetailResponse;
  scoreSheet: ScoreSheetResponse;
  isLocked: boolean;
  gradingStatus: string;
};

const getGradingStatusColor = (status: string): string => {
  switch (status) {
    case "SUBMITTED":
      return "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-200 dark:border-violet-500/20";
    case "DRAFT_SAVED":
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
    case "LOCKED":
      return "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/20";
    case "PENDING":
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
  }
};

const getGradingStatusLabel = (status: string): string => {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";
    case "DRAFT_SAVED":
      return "Draft Saved";
    case "LOCKED":
      return "Locked";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
};

export const ScoreSheetHeader = ({
  submission,
  scoreSheet,
  isLocked,
  gradingStatus,
}: Props) => {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Typography
            variant="h4"
            className="font-extrabold text-gray-900 dark:text-white"
          >
            {submission.projectTitle || submission.teamName}
          </Typography>
          {scoreSheet.confirmed && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label="Final Submitted"
              size="small"
              color="success"
              variant="filled"
              sx={{ fontWeight: 800, borderRadius: "8px" }}
            />
          )}
        </div>
        <Typography
          variant="subtitle1"
          className="font-bold text-gray-500 dark:text-slate-400"
        >
          Team: {submission.teamName}
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 dark:bg-slate-950">
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
            {submission.eventName || "Not available"}
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
            {submission.roundName || "Not available"}
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
            {submission.trackName || "Not available"}
          </Typography>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Typography variant="caption" className="font-bold text-gray-500">
            Submission:
          </Typography>
          <Chip
            label={submission.submissionStatus || "Not available"}
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
          <span
            className={`px-3 py-0.5 rounded-full border text-xs font-bold ${getGradingStatusColor(gradingStatus)}`}
          >
            {getGradingStatusLabel(gradingStatus)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="caption" className="font-bold text-gray-500">
            Lock State:
          </Typography>
          <Chip
            icon={
              isLocked ? (
                <LockIcon sx={{ fontSize: 14 }} />
              ) : (
                <LockOpenIcon sx={{ fontSize: 14 }} />
              )
            }
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
