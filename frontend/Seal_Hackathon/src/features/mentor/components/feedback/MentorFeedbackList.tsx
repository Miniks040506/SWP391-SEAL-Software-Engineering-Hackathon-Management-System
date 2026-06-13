import { format } from "date-fns";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type MentorFeedbackListProps = {
  feedbacks: MentorFeedbackResponse[];
  onEdit: (feedback: MentorFeedbackResponse) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  isLoading: boolean;
};

export const MentorFeedbackList = ({
  feedbacks,
  onEdit,
  onDelete,
  onPublish,
  isLoading,
}: MentorFeedbackListProps) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading feedbacks...</div>
    );
  }

  if (!feedbacks.length) {
    return (
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <RateReviewOutlinedIcon className="mb-4 text-4xl text-gray-400" />
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            No Feedback Yet
          </h3>
          <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
            You haven't provided any feedback for this team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((fb) => {
        const isDraft = fb.visibility === "DRAFT";

        return (
          <Card
            key={fb.id}
            variant="outlined"
            className="rounded-2xl border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <div className="flex flex-col p-5 md:flex-row md:items-start md:justify-between gap-7">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Chip
                    label={fb.category}
                    size="small"
                    className="font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  />
                  <Chip
                    label={fb.visibility}
                    size="small"
                    color={isDraft ? "warning" : "success"}
                    variant={isDraft ? "outlined" : "filled"}
                    sx={{ fontWeight: 800 }}
                  />
                  <Typography variant="caption" className="text-gray-500">
                    {format(new Date(fb.createdAt), "PPP p")}
                  </Typography>
                </div>
                <Typography
                  variant="body1"
                  className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap"
                >
                  {fb.content}
                </Typography>
              </div>

              {isDraft && (
                <div className="mt-4 flex items-center gap-2 md:mt-0 md:flex-col md:items-end">
                  <Button
                    size="small"
                    startIcon={<SendOutlinedIcon />}
                    onClick={() => onPublish(fb.id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#2563eb",
                    }}
                  >
                    Publish
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => onEdit(fb)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={() => onDelete(fb.id)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Delete
                  </Button>
                </div>
              )}

              {!isDraft && (
                <div className="mt-4 flex items-center gap-2 md:mt-0 md:flex-col md:items-end">
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
