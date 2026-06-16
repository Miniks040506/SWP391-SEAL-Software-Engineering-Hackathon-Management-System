import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { roundApi } from "@/api/round.api";
import type { UUID } from "@/types/common.types";

export function useRoundOperationStatusQuery(roundId?: UUID) {
  return useQuery({
    queryKey: ["round-operation-status", roundId],
    queryFn: () => roundApi.getOperationStatus(roundId!),
    enabled: Boolean(roundId),
    refetchInterval: (query) => {
      const status = query.state.data?.roundStatus;
      if (status === "ONGOING" || status === "CLOSED") return 30000;
      return false;
    },
  });
}

export function useRoundOperationMutations(roundId: UUID) {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["round-operation-status", roundId] });
    queryClient.invalidateQueries({ queryKey: ["coordinator-events"] });
  };

  const openMutation = useMutation({
    mutationFn: () => roundApi.openRound(roundId),
    onSuccess: () => {
      enqueueSnackbar("Round opened successfully.", { variant: "success" });
      onSuccess();
    },
    onError: () => {
      enqueueSnackbar("Failed to open round.", { variant: "error" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => roundApi.closeRound(roundId),
    onSuccess: () => {
      enqueueSnackbar("Round closed successfully.", { variant: "success" });
      onSuccess();
    },
    onError: () => {
      enqueueSnackbar("Failed to close round.", { variant: "error" });
    },
  });

  const lockMutation = useMutation({
    mutationFn: () => roundApi.lockSubmissions(roundId),
    onSuccess: () => {
      enqueueSnackbar("Submissions locked successfully.", { variant: "success" });
      onSuccess();
    },
    onError: () => {
      enqueueSnackbar("Failed to lock submissions.", { variant: "error" });
    },
  });

  return {
    openRound: openMutation.mutateAsync,
    closeRound: closeMutation.mutateAsync,
    lockSubmissions: lockMutation.mutateAsync,
    isPending: openMutation.isPending || closeMutation.isPending || lockMutation.isPending,
  };
}
