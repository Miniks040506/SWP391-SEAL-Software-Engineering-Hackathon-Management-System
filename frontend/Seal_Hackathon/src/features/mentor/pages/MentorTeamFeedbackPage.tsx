import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Button from "@mui/material/Button";

import { MentorFeedbackList } from "../components/feedback/MentorFeedbackList";
import { MentorFeedbackDialog } from "../components/feedback/MentorFeedbackDialog";
import { useMentorFeedback } from "../hooks/useMentorFeedback";
import type { MentorFeedbackFormValues } from "../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

export const MentorTeamFeedbackPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<MentorFeedbackResponse | null>(null);

  const {
    feedbackListQuery,
    createFeedback,
    updateFeedback,
    publishFeedback,
    deleteFeedback,
    isMutating,
  } = useMentorFeedback(teamId);

  const allFeedbacks = feedbackListQuery.data?.data || feedbackListQuery.data || [];

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
        submissionId: null,
        roundId: null
      });
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
          <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate("/mentor/teams")} className="text-gray-600 dark:text-slate-400" sx={{ textTransform: "none", fontWeight: 700, marginLeft: "-8px" }}>
            Back to Team List
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Team Feedback Hub</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              View all feedback for this team, or provide general guidance not tied to a specific submission.
            </p>
          </div>
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpenCreate} sx={{ textTransform: "none", fontWeight: 800, borderRadius: "8px", bgcolor: "#2563eb", boxShadow: "none", "&:hover": { bgcolor: "#1d4ed8" } }}>
            Write General Feedback
          </Button>
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