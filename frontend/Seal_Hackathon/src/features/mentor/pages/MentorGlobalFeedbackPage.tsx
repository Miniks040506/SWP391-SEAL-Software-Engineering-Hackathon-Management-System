import { useState } from "react";
import { useSnackbar } from "notistack";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import { MentorFeedbackList } from "../components/feedback/MentorFeedbackList";
import { MentorFeedbackDialog } from "../components/feedback/MentorFeedbackDialog";
import { 
  useMentorGlobalFeedbackQuery,
  useUpdateMentorFeedbackMutation,
  usePublishMentorFeedbackMutation,
  useDeleteMentorFeedbackMutation
} from "../hooks/useMentorFeedback";
import type { MentorFeedbackFormValues } from "../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";
import type { UUID } from "@/types/common.types";

export const MentorGlobalFeedbackPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<MentorFeedbackResponse | null>(null);

  const { data: response, isLoading } = useMentorGlobalFeedbackQuery();
  const allFeedbacks = response?.data || [];

  const updateMutation = useUpdateMentorFeedbackMutation();
  const publishMutation = usePublishMentorFeedbackMutation();
  const deleteMutation = useDeleteMentorFeedbackMutation();

  const isMutating = updateMutation.isPending || publishMutation.isPending || deleteMutation.isPending;

  const handleOpenEdit = (fb: MentorFeedbackResponse) => {
    setEditingFeedback(fb);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: MentorFeedbackFormValues, publish: boolean) => {
    if (editingFeedback) {
      updateMutation.mutate(
        { id: editingFeedback.id, payload: { ...data, visibleToTeam: publish } },
        {
          onSuccess: () => {
            if (publish && editingFeedback.visibility === "DRAFT") {
              publishMutation.mutate(editingFeedback.id, {
                onSuccess: () => enqueueSnackbar("Feedback published!", { variant: "success" })
              });
            } else {
              enqueueSnackbar("Feedback updated successfully!", { variant: "success" });
            }
            setIsDialogOpen(false);
          },
          onError: () => enqueueSnackbar("Failed to update feedback", { variant: "error" })
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      deleteMutation.mutate(id as UUID, {
        onSuccess: () => enqueueSnackbar("Feedback deleted", { variant: "info" }),
        onError: () => enqueueSnackbar("Failed to delete feedback", { variant: "error" })
      });
    }
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate(id as UUID, {
      onSuccess: () => enqueueSnackbar("Feedback published! Team has been notified.", { variant: "success" }),
      onError: () => enqueueSnackbar("Failed to publish feedback", { variant: "error" })
    });
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
            A centralized hub to review, edit, and publish all your drafted feedback across all submissions.
          </p>
        </div>

        <MentorFeedbackList
          feedbacks={allFeedbacks}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
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