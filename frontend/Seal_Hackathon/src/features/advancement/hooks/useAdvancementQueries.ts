import { useQuery } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";

export function useAdvanceRulesQuery(roundId: string) {
  return useQuery({
    queryKey: ["advanceRules", roundId],
    queryFn: () => roundApi.getAdvanceRules(roundId),
  });
}


