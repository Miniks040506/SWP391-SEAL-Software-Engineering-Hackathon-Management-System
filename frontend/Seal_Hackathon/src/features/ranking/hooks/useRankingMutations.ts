import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingApi } from "@/api/ranking.api";
import { rankingQueryKeys } from "./useRankingQueries";
import type { UUID } from "@/types/common.types";
import type { RankingCalculationParams } from "@/types/ranking.types";

export const useCalculateRoundRankingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roundId, params }: { roundId: UUID; params?: RankingCalculationParams }) =>
            rankingApi.calculateRoundRankings(roundId, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: rankingQueryKeys.all,
            });
        },
    });
};
