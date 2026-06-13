import { format } from "date-fns";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type TeamFeedbackListProps = {
  feedbacks: MentorFeedbackResponse[];
  isLoading: boolean;
};

export const TeamFeedbackList = ({ feedbacks, isLoading }: TeamFeedbackListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
          Loading mentor feedback...
        </p>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <RateReviewOutlinedIcon className="mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          No Feedback Yet
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          Your mentor hasn't published any feedback yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedbacks.map((fb) => (
        <Card
          key={fb.id}
          variant="outlined"
          className="rounded-2xl border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]"
        >
          <div className="flex flex-col space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Chip
                label={fb.category}
                size="small"
                className="bg-blue-50 font-extrabold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              />
              <Typography variant="caption" className="font-medium text-gray-500">
                {fb.publishedAt
                  ? format(new Date(fb.publishedAt), "MMMM do, yyyy h:mm a")
                  : format(new Date(fb.createdAt), "MMMM do, yyyy h:mm a")}
              </Typography>
              {fb.mentorName && (
                <Typography variant="caption" className="font-semibold text-gray-400">
                  • By {fb.mentorName}
                </Typography>
              )}
            </div>
            
            <Typography
              variant="body1"
              className="whitespace-pre-wrap font-medium text-gray-700 dark:text-slate-300"
            >
              {fb.content}
            </Typography>
          </div>
        </Card>
      ))}
    </div>
  );
};