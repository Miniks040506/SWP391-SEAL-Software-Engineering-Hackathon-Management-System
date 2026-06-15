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

export const MentorFeedbackList = ({ feedbacks, onEdit, onDelete, onPublish, isLoading }: MentorFeedbackListProps) => {
  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading feedbacks...</div>;

  if (!feedbacks.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <RateReviewOutlinedIcon className="mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">No Feedback Yet</h3>
        <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          There is no feedback to display here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedbacks.map((fb) => {
        const isDraft = fb.visibility === "DRAFT";

        return (
          <Card key={fb.id} variant="outlined" className="rounded-2xl border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]">
            <div className="flex flex-col p-6 sm:flex-row sm:gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  
                  {fb.teamName && (
                    <Chip label={`Team: ${fb.teamName}`} size="small" sx={{ fontWeight: 800, bgcolor: "#f1f5f9", color: "#334155" }} />
                  )}

                  <Chip label={fb.category} size="small" className="font-extrabold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" />
                  
                  {fb.roundName && (
                    <Chip label={`Submission: ${fb.roundName}`} size="small" variant="outlined" sx={{ fontWeight: 700, color: "#64748b", borderColor: "#cbd5e1" }} />
                  )}

                  <Chip label={fb.visibility} size="small" color={isDraft ? "warning" : "success"} variant={isDraft ? "outlined" : "filled"} sx={{ fontWeight: 800 }} />
                  
                  <Typography variant="caption" className="font-medium text-gray-500">
                    {format(new Date(fb.createdAt), "MMM do, yyyy h:mm a")}
                  </Typography>
                </div>
                <Typography variant="body1" className="font-medium whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                  {fb.content}
                </Typography>
              </div>

              <div className="mt-4 flex w-[110px] shrink-0 flex-col items-start sm:mt-0 sm:items-end">
                {isDraft ? (
                  <div className="flex w-full flex-col gap-1">
                    <Button size="small" startIcon={<SendOutlinedIcon fontSize="small" />} onClick={() => onPublish(fb.id)} sx={{ textTransform: "none", fontWeight: 800, color: "#2563eb", justifyContent: "flex-start", paddingX: "12px" }}>Publish</Button>
                    <Button size="small" color="inherit" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={() => onEdit(fb)} className="text-gray-700 dark:text-slate-300" sx={{ textTransform: "none", fontWeight: 800, justifyContent: "flex-start", paddingX: "12px" }}>Edit</Button>
                    <Button size="small" color="error" startIcon={<DeleteOutlinedIcon fontSize="small" />} onClick={() => onDelete(fb.id)} sx={{ textTransform: "none", fontWeight: 800, justifyContent: "flex-start", paddingX: "12px" }}>Delete</Button>
                  </div>
                ) : (
                  <div className="h-[100px] w-full"></div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};