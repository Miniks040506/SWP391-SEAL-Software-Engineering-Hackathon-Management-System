import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingApi } from "@/api/ranking.api";
import { rankingQueryKeys } from "./useRankingQueries";
import type { UUID } from "@/types/common.types";
import type { RankingCalculationParams } from "@/types/ranking.types";
import { mockRankingService } from "../mocks/ranking.mock";

const USE_MOCK = false;

export const useCalculateRoundRankingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roundId, params }: { roundId: UUID; params?: RankingCalculationParams }) =>
            USE_MOCK
                ? mockRankingService.calculateRoundRankings(roundId, params)
                : rankingApi.calculateRoundRankings(roundId, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: rankingQueryKeys.all,
            });
        },
    });
};