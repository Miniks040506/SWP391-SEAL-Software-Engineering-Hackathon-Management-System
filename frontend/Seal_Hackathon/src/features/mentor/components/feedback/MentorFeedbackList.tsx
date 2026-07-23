import type { CSSProperties } from "react";

import { format } from "date-fns";
import Button from "@mui/material/Button";

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
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="mt-shimmer h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <RateReviewOutlinedIcon className="mt-pop mb-4 text-4xl text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
          No Feedback Yet
        </h3>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          You haven&apos;t written any feedback for this submission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((fb, index) => {
        const isDraft = fb.visibility === "DRAFT";

        return (
          <div
            key={fb.id}
            className={`mt-fade-up mt-lift rounded-2xl border p-5 ${
              isDraft
                ? "border-slate-200 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/50"
                : "border-emerald-200 bg-white dark:border-emerald-500/30 dark:bg-slate-900"
            }`}
            style={{ "--mt-stagger": index + 1 } as CSSProperties}
          >
            <div className="flex flex-col md:flex-row md:items-start md:gap-6">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {fb.category || "GENERAL"}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${
                      isDraft
                        ? "border-slate-300 bg-transparent text-slate-600 dark:border-slate-600 dark:text-slate-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                    }`}
                  >
                    {fb.visibility}
                  </span>
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    {format(new Date(fb.createdAt), "MMM do, yyyy 'at' h:mm a")}
                  </span>
                </div>

                <div className="rounded-xl border-l-4 border-l-blue-500 bg-white p-4 dark:bg-slate-800/70">
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                    {fb.content}
                  </p>
                </div>
              </div>

              {isDraft && (
                <div className="mt-4 flex shrink-0 flex-row gap-2 md:mt-0 md:flex-col md:items-stretch">
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<SendOutlinedIcon fontSize="small" />}
                    onClick={() => onPublish(fb.id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
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
                      borderRadius: "10px",
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
                      borderRadius: "10px",
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
