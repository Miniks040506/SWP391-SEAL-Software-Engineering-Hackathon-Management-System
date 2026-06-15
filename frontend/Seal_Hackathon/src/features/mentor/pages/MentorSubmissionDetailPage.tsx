import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

import { MentorSubmissionDetailCard } from "../components/submission/MentorSubmissionDetailCard";
import { MentorSubmissionLinksList } from "../components/submission/MentorSubmissionLinkList";
import { MentorFeedbackList } from "../components/feedback/MentorFeedbackList";
import { MentorFeedbackDialog } from "../components/feedback/MentorFeedbackDialog";

import { useMentorSubmissions } from "../hooks/useMentorSubmission";
import { useMentorFeedback } from "../hooks/useMentorFeedback";
import type { MentorFeedbackFormValues } from "../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

export const MentorSubmissionDetailPage = () => {
  const { submissionDetailQuery, goBackToHistory } = useMentorSubmissions();
  const { data: response, isLoading, isError } = submissionDetailQuery;
  const submission = response?.data;

  const {
    feedbackListQuery,
    createFeedback,
    updateFeedback,
    publishFeedback,
    deleteFeedback,
    isMutating,
  } = useMentorFeedback(submission?.teamId);

  const allFeedbacks = feedbackListQuery.data?.data || feedbackListQuery.data || [];
  
  const submissionFeedbacks = allFeedbacks.filter(
    (fb: MentorFeedbackResponse) => fb.submissionId === submission?.id
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<MentorFeedbackResponse | null>(null);

  const handleOpenCreate = () => {
    setEditingFeedback(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (fb: MentorFeedbackResponse) => {
    setEditingFeedback(fb);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: MentorFeedbackFormValues, publish: boolean) => {
    if (editingFeedback) {
      await updateFeedback({ id: editingFeedback.id, payload: { ...data, visibleToTeam: publish } });
      if (publish && editingFeedback.visibility === "DRAFT") {
        await publishFeedback(editingFeedback.id);
      }
    } else {
      await createFeedback({ 
        ...data, 
        publish,
        submissionId: submission?.id,
        roundId: submission?.roundId
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      await deleteFeedback(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center dark:border-slate-700 dark:bg-[#1e293b]">
        <p className="text-lg font-medium text-red-500 dark:text-red-400">Submission not found.</p>
        <Button variant="outlined" onClick={goBackToHistory} className="mt-6" sx={{ fontWeight: 800, textTransform: "none", borderRadius: "8px" }}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="text" startIcon={<ArrowBackIcon />} onClick={goBackToHistory} className="text-gray-600 dark:text-slate-400" sx={{ textTransform: "none", fontWeight: 700, marginLeft: "-8px" }}>
            Back to Track Submissions
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Submission Detail</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Review the deliverables and notes from the team.</p>
        </div>
        
        <div className="space-y-6">
          <MentorSubmissionDetailCard submission={submission} />
          <MentorSubmissionLinksList links={submission.links || []} />
        </div>

        <Divider className="my-8 border-gray-200 dark:border-slate-700" />

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900 dark:text-white">
                <RateReviewOutlinedIcon className="text-blue-500" />
                Submission Feedback
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Provide feedback directly addressing this submission's content.
              </p>
            </div>

            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpenCreate} sx={{ textTransform: "none", fontWeight: 800, borderRadius: "10px", bgcolor: "#2563eb", boxShadow: "none", "&:hover": { bgcolor: "#1d4ed8" } }}>
              Write Feedback
            </Button>
          </div>

          <MentorFeedbackList
            feedbacks={submissionFeedbacks}
            isLoading={feedbackListQuery.isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPublish={publishFeedback}
          />
        </div>

        <MentorFeedbackDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleSubmit}
          initialData={editingFeedback}
          isLoading={isMutating}
        />
      </div>
    </div>
  );
};