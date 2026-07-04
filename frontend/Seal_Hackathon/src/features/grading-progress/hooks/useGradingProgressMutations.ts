import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";
import { gradingProgressQueryKeys } from "./useGradingProgressQueries";
import type { UUID } from "@/types/common.types";

type ReopenScoreSheetVariables = {
    roundId: UUID;
    submissionId: UUID;
    judgeId: UUID;
    assignmentId: UUID;
};

export const useLockRoundGradingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roundId: UUID) => gradingApi.lockGrading(roundId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: gradingProgressQueryKeys.roundProgress(variables),
            });
            queryClient.invalidateQueries({
                queryKey: gradingProgressQueryKeys.events(),
            });
            queryClient.invalidateQueries({
                queryKey: gradingProgressQueryKeys.judgeAssignments(),
            });
        },
    });
};

export const useReopenScoreSheetMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roundId, submissionId, judgeId }: ReopenScoreSheetVariables) =>
            gradingApi.reopenScoreSheet(roundId, submissionId, judgeId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: gradingProgressQueryKeys.roundProgress(variables.roundId),
            });
            queryClient.invalidateQueries({
                queryKey: gradingProgressQueryKeys.judgeAssignmentProgress(variables.assignmentId),
            });
            queryClient.invalidateQueries({
                queryKey: gradingProgressQueryKeys.events(),
            });
        },
    });
};
