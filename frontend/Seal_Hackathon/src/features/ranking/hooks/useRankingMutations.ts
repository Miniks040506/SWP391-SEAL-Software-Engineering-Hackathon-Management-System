import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { rankingApi } from "@/api/ranking.api";
import { rankingQueryKeys } from "./useRankingQueries";
import { NOTIFICATION_QUERY_KEY } from "@/features/notification/hooks/useNotificationQueries";
import type { UUID } from "@/types/common.types";
import type { PublishResultsRequest, RankingCalculationParams } from "@/types/ranking.types";

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

export const usePublishEventResultsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, payload }: { eventId: UUID; payload: PublishResultsRequest }) =>
            rankingApi.publishEventResults(eventId, payload),
        onSuccess: (response) => {
            enqueueSnackbar(
                `Results published. ${response.notifiedCount ?? 0} team notifications processed.`,
                { variant: "success" },
            );
            queryClient.invalidateQueries({ queryKey: rankingQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ["teamPublishedScore"] });
            queryClient.invalidateQueries({ queryKey: ["teamPublishedScores"] });
        },
        onError: (error: any) => {
            enqueueSnackbar(
                error?.response?.data?.message || error?.message || "Failed to publish results.",
                { variant: "error" },
            );
        },
    });
};

export const usePublishRoundResultsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roundId, payload }: { roundId: UUID; payload: PublishResultsRequest }) =>
            rankingApi.publishRoundResults(roundId, payload),
        onSuccess: (response) => {
            enqueueSnackbar(
                `Round results published. ${response.notifiedCount ?? 0} team notifications processed.`,
                { variant: "success" },
            );
            queryClient.invalidateQueries({ queryKey: rankingQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ["teamPublishedScore"] });
            queryClient.invalidateQueries({ queryKey: ["teamPublishedScores"] });
        },
        onError: (error: any) => {
            enqueueSnackbar(
                error?.response?.data?.message || error?.message || "Failed to publish round results.",
                { variant: "error" },
            );
        },
    });
};
