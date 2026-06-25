import { useQuery } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
import { advancementApi } from "@/api/advancement.api";

export function useAdvanceRulesQuery(roundId: string) {
  return useQuery({
    queryKey: ["advanceRules", roundId],
    queryFn: () => roundApi.getAdvanceRules(roundId),
  });
}

export function useAdvancementPreviewQuery(roundId: string) {
  return useQuery({
    queryKey: ["advancementPreview", roundId],
    queryFn: () => advancementApi.previewRoundAdvancement(roundId),
    enabled: !!roundId,
  });
}

export function useTeamAdvancementStatusQuery(teamId: string) {
  return useQuery({
    queryKey: ["teamAdvancementStatus", teamId],
    queryFn: () => advancementApi.getTeamAdvancementStatus(teamId),
    enabled: !!teamId,
  });
}
