import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";
import { gradingProgressQueryKeys } from "./useGradingProgressQueries";
import type { UUID } from "@/types/common.types";

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
