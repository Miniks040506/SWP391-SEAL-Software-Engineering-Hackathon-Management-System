import { format } from "date-fns";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
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
      <div className="flex justify-center p-12">
        <CircularProgress size={32} />
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
          You haven't written any feedback for this submission.
        </p>
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
            className="rounded-2xl border-gray-200 bg-white transition-shadow hover:shadow-sm dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <div className="flex flex-col p-5 md:flex-row md:items-start md:gap-6">
              {/* Nội dung Feedback */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Chip
                    label={fb.category || "GENERAL"}
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

                  <span className="text-sm font-medium text-gray-400 dark:text-slate-500">
                    {format(new Date(fb.createdAt), "MMM do, yyyy 'at' h:mm a")}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-gray-700 dark:text-slate-300">
                    {fb.content}
                  </p>
                </div>
              </div>

              {/* Khu vực nút bấm Action (Chỉ hiện khi là DRAFT) */}
              {isDraft && (
                <div className="mt-4 flex shrink-0 flex-row gap-2 md:mt-0 md:flex-col md:items-stretch">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SendOutlinedIcon fontSize="small" />}
                    onClick={() => onPublish(fb.id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      bgcolor: "#2563eb",
                      "&:hover": { bgcolor: "#1d4ed8" },
                      borderRadius: "8px",
                      px: 2,
                    }}
                  >
                    Publish
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditOutlinedIcon fontSize="small" />}
                    onClick={() => onEdit(fb)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => onDelete(fb.id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};