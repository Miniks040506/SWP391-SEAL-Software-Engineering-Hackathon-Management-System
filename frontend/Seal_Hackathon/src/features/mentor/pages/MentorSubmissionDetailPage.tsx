import { useState } from "react";
import type { CSSProperties } from "react";
import { useSnackbar } from "notistack";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import Button from "@mui/material/Button";

import { MentorSubmissionDetailCard } from "../components/submission/MentorSubmissionDetailCard";
import { MentorSubmissionLinksList } from "../components/submission/MentorSubmissionLinkList";
import { MentorFeedbackList } from "../components/feedback/MentorFeedbackList";
import { MentorFeedbackDialog } from "../components/feedback/MentorFeedbackDialog";
import { MentorPageHero } from "../components/common/MentorPageHero";

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

import "../styles/mentor.css";

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
      <div className="space-y-6">
        <div className="mt-shimmer h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="mt-shimmer h-40 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="mt-shimmer h-56 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="mt-shimmer h-72 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <ReportProblemOutlinedIcon className="mt-pop mb-4 text-4xl text-slate-400 dark:text-slate-500" />
        <p className="text-lg font-medium text-rose-500 dark:text-rose-400">
          Submission not found.
        </p>
        <Button
          variant="outlined"
          onClick={goBackToHistory}
          sx={{ mt: 3, fontWeight: 700, textTransform: "none", borderRadius: "10px" }}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MentorPageHero
        backTo={{ label: "Back to Track Submissions", onClick: goBackToHistory }}
        eyebrow={`${submission.teamName} · ${submission.trackName}`}
        title={submission.roundName || "Submission Detail"}
        chips={
          <>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                submission.status === "SUBMITTED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {submission.status}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-bold tabular-nums text-slate-600 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
              Attempt #{submission.submissionNumber}
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <MentorSubmissionDetailCard submission={submission} />
          <MentorSubmissionLinksList links={submission.links || []} />
        </div>

        <aside
          className="mt-fade-up self-start rounded-3xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24 dark:border-slate-700/80 dark:bg-slate-900"
          style={{ "--mt-stagger": 2 } as CSSProperties}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <RateReviewOutlinedIcon
                sx={{ fontSize: 18 }}
                className="text-blue-600 dark:text-blue-400"
              />
              Submission Feedback
            </h2>
            {!isDialogOpen && (
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenCreate}
                sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
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
        </aside>
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
  );
};
