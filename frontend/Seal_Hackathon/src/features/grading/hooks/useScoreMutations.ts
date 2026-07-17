import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useSnackbar } from "notistack";
import { gradingApi } from "@/api/grading.api";
import type { SaveScoreSheetRequest } from "@/types/grading.types";

const getMutationErrorMessage = (error: unknown) => {
  if (!isAxiosError<{ code?: string; message?: string }>(error)) {
    return "Could not save scores. Please try again.";
  }

  if (
    error.response?.data?.code === "SCORE_VERSION_CONFLICT" ||
    error.response?.data?.code === "OPTIMISTIC_LOCK_CONFLICT"
  ) {
    return "Scores changed in another session. Refresh the score sheet and try again.";
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  switch (error.response?.status) {
    case 400:
      return "One or more scores are invalid.";
    case 403:
      return "You are not assigned to this submission.";
    case 404:
      return "Submission or score sheet not found.";
    case 409:
      return "Scores cannot be changed because grading is locked or already submitted.";
    default:
      return "Could not save scores. Please try again.";
  }
};

export function useScoreMutations(submissionId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["grading", "scoreSheet", submissionId],
      }),
      queryClient.invalidateQueries({ queryKey: ["judge", "submissions"] }),
      queryClient.invalidateQueries({ queryKey: ["grading-progress"] }),
    ]);

  const saveDraft = useMutation({
    mutationFn: (payload: SaveScoreSheetRequest) =>
      gradingApi.saveDraftScores(submissionId, payload),
    onSuccess: async () => {
      setLastSavedAt(new Date());
      await invalidate();
      enqueueSnackbar("Draft scores saved.", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(getMutationErrorMessage(error), { variant: "error" });
    },
  });

  const finalSubmit = useMutation({
    mutationFn: (payload: SaveScoreSheetRequest) =>
      gradingApi.submitFinalScores(submissionId, payload),
    onSuccess: async () => {
      await invalidate();
      enqueueSnackbar("Scores submitted successfully.", { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar(getMutationErrorMessage(error), { variant: "error" });
    },
  });

  return {
    saveDraft: saveDraft.mutateAsync,
    finalSubmit: finalSubmit.mutateAsync,
    isSaving: saveDraft.isPending,
    isSubmitting: finalSubmit.isPending,
    lastSavedAt,
  };
}
