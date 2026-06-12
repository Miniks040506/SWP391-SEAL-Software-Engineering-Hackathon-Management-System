import { format } from "date-fns";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import type { SubmissionDetailResponse } from "@/types/submission.types";

type MentorSubmissionDetailCardProps = {
  submission: SubmissionDetailResponse;
};

export const MentorSubmissionDetailCard = ({ submission }: MentorSubmissionDetailCardProps) => {
  return (
    <Card variant="outlined" className="mb-6 dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h5" className="font-bold text-gray-900 dark:text-white">
              {submission.roundName || "Unknown Round"}
            </Typography>
            <Typography variant="body2" className="text-gray-500 dark:text-slate-400">
              Team: {submission.teamName} | Track: {submission.trackName}
            </Typography>
          </div>
          <Chip
            label={submission.status}
            color={submission.status === "SUBMITTED" ? "success" : "default"}
            className="font-semibold uppercase"
          />
        </div>

        <Divider className="dark:border-slate-700" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Typography variant="caption" className="text-gray-500 dark:text-slate-400">
              Submission Number
            </Typography>
            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
              #{submission.submissionNumber}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-gray-500 dark:text-slate-400">
              Submitted At
            </Typography>
            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
              {submission.submittedAt ? format(new Date(submission.submittedAt), "PPP p") : "Not submitted"}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="text-gray-500 dark:text-slate-400">
              Last Updated
            </Typography>
            <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
              {submission.updatedAt ? format(new Date(submission.updatedAt), "PPP p") : "-"}
            </Typography>
          </div>
        </div>

        {submission.note && (
          <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-slate-800/50">
            <Typography variant="caption" className="font-semibold text-gray-700 dark:text-slate-300">
              Team Note
            </Typography>
            <Typography variant="body2" className="mt-1 text-gray-600 dark:text-slate-400">
              {submission.note}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};