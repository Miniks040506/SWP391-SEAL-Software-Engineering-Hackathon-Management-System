import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";
import { gradingProgressQueryKeys } from "./useGradingProgressQueries";
import type { UUID } from "@/types/common.types";
import { mockGradingProgressService } from "../mocks/gradingProgress.mock"; // <-- Import mock service

const USE_MOCK = false;

export const useLockRoundGradingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roundId: UUID) => USE_MOCK
            ? mockGradingProgressService.lockGrading(roundId)
            : gradingApi.lockGrading(roundId),
        onSuccess: (data, variables) => {
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