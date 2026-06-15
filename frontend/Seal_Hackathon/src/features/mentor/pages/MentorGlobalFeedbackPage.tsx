import { useState } from "react";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import { MentorFeedbackList } from "../components/feedback/MentorFeedbackList";
import { MentorFeedbackDialog } from "../components/feedback/MentorFeedbackDialog";
import { useMentorGlobalFeedback } from "../hooks/useMentorFeedback"; // <-- Import Hook mới
import type { MentorFeedbackFormValues } from "../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

export const MentorGlobalFeedbackPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<MentorFeedbackResponse | null>(null);

  const {
    feedbackListQuery,
    updateFeedback,
    publishFeedback,
    deleteFeedback,
    isMutating,
  } = useMentorGlobalFeedback();

  const allFeedbacks = feedbackListQuery.data?.data || feedbackListQuery.data || [];

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
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      await deleteFeedback(id);
    }
  };

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            <RateReviewOutlinedIcon className="text-blue-600" />
            Global Feedback Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            A centralized hub to review, edit, and publish all your drafted feedback across all assigned teams.
          </p>
        </div>

        <MentorFeedbackList
          feedbacks={allFeedbacks}
          isLoading={feedbackListQuery.isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onPublish={publishFeedback}
        />

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