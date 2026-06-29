import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prizeApi } from "@/api/prize.api";
import { useSnackbar } from "notistack";
import { coordinatorPrizeKeys } from "./useCoordinatorPrizeQueries";
import type { UUID } from "@/types/common.types";
import type {
  AssignPrizesFromRankingRequest,
  AwardPrizeRequest,
  ClearPrizeAwardRequest,
  CreatePrizeRequest,
  UpdatePrizeRequest,
} from "@/types/prize.types";

export function useCoordinatorPrizeMutations(eventId?: UUID) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidateLists = () => {
    if (eventId) {
      queryClient.invalidateQueries({ queryKey: coordinatorPrizeKeys.list(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorPrizeKeys.awardList(eventId) });
    } else {
      queryClient.invalidateQueries({ queryKey: coordinatorPrizeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: coordinatorPrizeKeys.awards() });
    }
  };

  const createPrize = useMutation({
    mutationFn: (payload: CreatePrizeRequest) => prizeApi.createPrize(payload),
    onSuccess: () => {
      enqueueSnackbar("Prize created successfully", { variant: "success" });
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to create prize", { variant: "error" });
    },
  });

  const updatePrize = useMutation({
    mutationFn: ({ prizeId, payload }: { prizeId: UUID; payload: UpdatePrizeRequest }) =>
      prizeApi.updatePrize(prizeId, payload),
    onSuccess: (_, variables) => {
      enqueueSnackbar("Prize updated successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: coordinatorPrizeKeys.detail(variables.prizeId) });
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to update prize", { variant: "error" });
    },
  });

  const deletePrize = useMutation({
    mutationFn: (prizeId: UUID) => prizeApi.deletePrize(prizeId),
    onSuccess: () => {
      enqueueSnackbar("Prize deleted successfully", { variant: "success" });
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to delete prize", { variant: "error" });
    },
  });

  const assignFromRanking = useMutation({
    mutationFn: (payload: AssignPrizesFromRankingRequest) => {
      if (!eventId) throw new Error("Event ID is required");
      return prizeApi.assignFromRanking(eventId, payload);
    },
    onSuccess: (data) => {
      enqueueSnackbar(`Assigned ${data.assignedCount} prizes successfully.`, { variant: "success" });
      if (data.skippedCount > 0) {
        enqueueSnackbar(`Skipped ${data.skippedCount} prizes.`, { variant: "info" });
      }
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to assign prizes from ranking", { variant: "error" });
    },
  });

  const manualAward = useMutation({
    mutationFn: ({ prizeId, payload }: { prizeId: UUID; payload: AwardPrizeRequest }) =>
      prizeApi.awardPrize(prizeId, payload),
    onSuccess: () => {
      enqueueSnackbar("Prize awarded successfully", { variant: "success" });
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to award prize", { variant: "error" });
    },
  });

  const updatePrizeWinner = useMutation({
    mutationFn: ({ prizeId, payload }: { prizeId: UUID; payload: AwardPrizeRequest }) =>
      prizeApi.updatePrizeWinner(prizeId, payload),
    onSuccess: () => {
      enqueueSnackbar("Prize winner updated successfully", { variant: "success" });
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to update prize winner", { variant: "error" });
    },
  });

  const clearAward = useMutation({
    mutationFn: ({ prizeId, payload }: { prizeId: UUID; payload: ClearPrizeAwardRequest }) =>
      prizeApi.clearAward(prizeId, payload),
    onSuccess: () => {
      enqueueSnackbar("Prize award cleared successfully", { variant: "success" });
      invalidateLists();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || "Failed to clear prize award", { variant: "error" });
    },
  });

  return {
    createPrize,
    updatePrize,
    deletePrize,
    assignFromRanking,
    manualAward,
    updatePrizeWinner,
    clearAward,
  };
}
