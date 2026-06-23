import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";
import type { SaveScoreSheetRequest } from "@/types/grading.types";

export function useScoreMutations(submissionId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["grading", "scoreSheet", submissionId] });
  };

  const saveDraft = useMutation({
    mutationFn: (payload: SaveScoreSheetRequest) =>
      gradingApi.saveDraftScores(submissionId, payload),
    onSuccess: invalidate,
  });

  const finalSubmit = useMutation({
    mutationFn: (payload: SaveScoreSheetRequest) =>
      gradingApi.submitFinalScores(submissionId, payload),
    onSuccess: invalidate,
  });

  return {
    saveDraft: saveDraft.mutateAsync,
    finalSubmit: finalSubmit.mutateAsync,
    isSaving: saveDraft.isPending,
    isSubmitting: finalSubmit.isPending,
    // Add dummy lastSavedAt to maintain interface compatibility with UI draft bar
    lastSavedAt: new Date(),
  };
}
