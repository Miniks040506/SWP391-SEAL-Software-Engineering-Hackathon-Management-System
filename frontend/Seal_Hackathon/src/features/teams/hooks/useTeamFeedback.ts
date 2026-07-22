import { useQuery } from "@tanstack/react-query";
import { mentorFeedbackApi } from "@/api/mentorFeedback.api";
import type { UUID } from "@/types/common.types";

export function useTeamFeedback(teamId?: UUID | string) {
  return useQuery({
    queryKey: ["team-visible-feedback", teamId],
    queryFn: () => mentorFeedbackApi.getTeamVisibleFeedback(teamId as UUID),
    enabled: Boolean(teamId),
    staleTime: 60_000,
  });
}
