import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
import type {
  CreateAdvanceRuleRequest,
  UpdateAdvanceRuleRequest,
  ConfirmAdvancementRequest,
} from "@/types/round.types";

export function useCreateAdvanceRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: CreateAdvanceRuleRequest }) =>
      roundApi.createAdvanceRule(roundId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["advanceRules", variables.roundId] });
    },
  });
}

export function useUpdateAdvanceRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; roundId: string; payload: UpdateAdvanceRuleRequest }) =>
      roundApi.updateAdvanceRule(ruleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["advanceRules", variables.roundId] });
    },
  });
}

export function useDeleteAdvanceRuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string; roundId: string }) =>
      roundApi.deleteAdvanceRule(ruleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["advanceRules", variables.roundId] });
    },
  });
}

export function usePreviewAdvanceRulesMutation() {
  return useMutation({
    mutationFn: (roundId: string) => roundApi.previewAdvanceRules(roundId),
  });
}

export function useConfirmAdvancementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: ConfirmAdvancementRequest }) =>
      roundApi.confirmAdvancement(roundId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["advancementPreview", variables.roundId] });
    },
  });
}
