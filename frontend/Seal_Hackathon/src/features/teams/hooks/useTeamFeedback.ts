import { useQuery } from "@tanstack/react-query";
import { mentorFeedbackApi } from "@/api/mentorFeedback.api";
import type { UUID } from "@/types/common.types";
import { mockTeamVisibleFeedbacks } from "../mocks/teamFeedback.mock";

const USE_MOCK = true;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useTeamFeedback(teamId?: UUID | string) {
  const teamFeedbackQuery = useQuery({
    queryKey: ["team-visible-feedback", teamId],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500); // Giả lập network
        return { data: mockTeamVisibleFeedbacks };
      }
      return mentorFeedbackApi.getTeamVisibleFeedback(teamId as UUID);
    },
    enabled: USE_MOCK || !!teamId,
    staleTime: 60_000,
  });

  return {
    teamFeedbackQuery,
  };
}