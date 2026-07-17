import { useState } from "react";
import { useSnackbar } from "notistack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

import { MentorSubmissionDetailCard } from "../components/submission/MentorSubmissionDetailCard";
import { MentorSubmissionLinksList } from "../components/submission/MentorSubmissionLinkList";
import { MentorFeedbackList } from "../components/feedback/MentorFeedbackList";
import { MentorFeedbackDialog } from "../components/feedback/MentorFeedbackDialog";

import { useMentorSubmissions } from "../hooks/useMentorSubmission";
import {
  useMentorTeamFeedbackQuery,
  useCreateMentorFeedbackMutation,
  useUpdateMentorFeedbackMutation,
  usePublishMentorFeedbackMutation,
  useDeleteMentorFeedbackMutation,
} from "../hooks/useMentorFeedback";
import type { MentorFeedbackFormValues } from "../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";
import type { UUID } from "@/types/common.types";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

export const MentorSubmissionDetailPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { submissionDetailQuery, goBackToHistory } = useMentorSubmissions();
  const {
    data: subResponse,
    isLoading: isSubLoading,
    isError,
  } = submissionDetailQuery;
  const submission = subResponse;

  const { data: fbResponse, isLoading: isFbLoading } =
    useMentorTeamFeedbackQuery(submission?.teamId);
  const allFeedbacks = Array.isArray(fbResponse)
    ? fbResponse
    : fbResponse?.data ?? [];

  const submissionFeedbacks = allFeedbacks.filter(
    (fb: MentorFeedbackResponse) => fb.submissionId === submission?.id,
  );

  const createMutation = useCreateMentorFeedbackMutation();
  const updateMutation = useUpdateMentorFeedbackMutation();
  const publishMutation = usePublishMentorFeedbackMutation();
  const deleteMutation = useDeleteMentorFeedbackMutation();

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    deleteMutation.isPending;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] =
    useState<MentorFeedbackResponse | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingFeedback(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (fb: MentorFeedbackResponse) => {
    setEditingFeedback(fb);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: MentorFeedbackFormValues, publish: boolean) => {
    if (editingFeedback) {
      updateMutation.mutate(
        {
          id: editingFeedback.id,
          payload: { ...data, visibleToTeam: publish },
        },
        {
          onSuccess: () => {
            if (publish && editingFeedback.visibility === "DRAFT") {
              publishMutation.mutate(editingFeedback.id, {
                onSuccess: () =>
                  enqueueSnackbar("Feedback published!", {
                    variant: "success",
                  }),
              });
            } else {
              enqueueSnackbar("Feedback updated successfully!", {
                variant: "success",
              });
            }
            setIsDialogOpen(false);
          },
          onError: () =>
            enqueueSnackbar("Failed to update feedback", { variant: "error" }),
        },
      );
    } else {
      createMutation.mutate(
        {
          teamId: submission?.teamId as UUID,
          payload: {
            ...data,
            publish,
            submissionId: submission?.id as UUID,
            roundId: submission?.roundId as UUID,
          },
        },
        {
          onSuccess: (_, variables) => {
            const action = variables.payload.publish
              ? "published"
              : "saved as draft";
            enqueueSnackbar(`Feedback successfully ${action}!`, {
              variant: "success",
            });
            setIsDialogOpen(false);
          },
          onError: () =>
            enqueueSnackbar("Failed to create feedback", { variant: "error" }),
        },
      );
    }
  };

  const handleDelete = (id: string) => setFeedbackToDelete(id);

  const confirmDelete = () => {
    if (!feedbackToDelete) return;
    deleteMutation.mutate(feedbackToDelete as UUID, {
      onSuccess: () => {
        setFeedbackToDelete(null);
        enqueueSnackbar("Feedback deleted", { variant: "info" });
      },
      onError: () =>
        enqueueSnackbar("Failed to delete feedback", { variant: "error" }),
    });
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate(id as UUID, {
      onSuccess: () =>
        enqueueSnackbar("Feedback published!", { variant: "success" }),
      onError: () =>
        enqueueSnackbar("Failed to publish feedback", { variant: "error" }),
    });
  };

  if (isSubLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center dark:border-slate-700 dark:bg-[#1e293b]">
        <p className="text-lg font-medium text-red-500 dark:text-red-400">
          Submission not found.
        </p>
        <Button
          variant="outlined"
          onClick={goBackToHistory}
          className="mt-6"
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "8px" }}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={goBackToHistory}
            className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
            sx={{ textTransform: "none", fontWeight: 700, marginLeft: "-8px" }}
          >
            Back to Track Submissions
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Submission Detail
          </h1>
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
            </div>
            {!isDialogOpen && (
              <Button
                variant="outlined"
                onClick={handleOpenCreate}
                sx={{
                  borderStyle: "dashed",
                  textTransform: "none",
                  borderColor: "divider",
                  color: "primary.main",
                  borderRadius: "8px",
                  "&:hover": {
                    borderStyle: "dashed",
                    backgroundColor: "action.hover",
                  },
                }}
              >
                + Add Feedback
              </Button>
            )}
          </div>

          <MentorFeedbackDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleSubmit}
            initialData={editingFeedback}
            isLoading={isMutating}
          />

          {!(isDialogOpen && submissionFeedbacks.length === 0) && (
            <MentorFeedbackList
              feedbacks={submissionFeedbacks}
              isLoading={isFbLoading}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
            />
          )}
        </div>
        <ActionConfirmDialog
          open={feedbackToDelete !== null}
          title="Delete draft feedback?"
          description="This draft feedback will be permanently removed and cannot be published later."
          confirmLabel="Delete feedback"
          severity="error"
          onClose={() => setFeedbackToDelete(null)}
          onConfirm={confirmDelete}
          isPending={deleteMutation.isPending}
        />
      </div>
    </div>
  );
};
