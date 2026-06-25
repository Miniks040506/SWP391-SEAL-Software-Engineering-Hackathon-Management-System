import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
import { advancementApi } from "@/api/advancement.api";
import type {
  CreateAdvanceRuleRequest,
  UpdateAdvanceRuleRequest,
} from "@/types/round.types";
import type {
  ConfirmAdvancementRequest,
  AdvancementOverrideRequest,
} from "@/types/advancement.types";

export function useCreateAdvanceRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roundId,
      payload,
    }: {
      roundId: string;
      payload: CreateAdvanceRuleRequest;
    }) => roundApi.createAdvanceRule(roundId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advanceRules", variables.roundId],
      });
    },
  });
}

export function useUpdateAdvanceRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ruleId,
      payload,
    }: {
      ruleId: string;
      roundId: string;
      payload: UpdateAdvanceRuleRequest;
    }) => roundApi.updateAdvanceRule(ruleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advanceRules", variables.roundId],
      });
    },
  });
}

export function useDeleteAdvanceRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string; roundId: string }) =>
      roundApi.deleteAdvanceRule(ruleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advanceRules", variables.roundId],
      });
    },
  });
}

export function usePreviewAdvanceRulesMutation() {
  return useMutation({
    mutationFn: (roundId: string) => roundApi.previewAdvanceRules(roundId),
  });
}

export function useOverrideAdvancementMutation(roundId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdvancementOverrideRequest) =>
      advancementApi.overrideRoundAdvancement(roundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["advancementPreview", roundId],
      });
    },
  });
}

export function useConfirmAdvancementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roundId,
      payload,
    }: {
      roundId: string;
      payload: ConfirmAdvancementRequest;
    }) => advancementApi.confirmRoundAdvancement(roundId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advancementPreview", variables.roundId],
      });
      queryClient.invalidateQueries({ queryKey: ["teamAdvancementStatus"] });
      queryClient.invalidateQueries({ queryKey: ["teamCompetition"] });
      queryClient.invalidateQueries({ queryKey: ["eventCompetition"] });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
    },
  });
}
