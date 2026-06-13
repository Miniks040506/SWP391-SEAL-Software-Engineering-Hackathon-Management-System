import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { UUID } from "@/types/common.types";
import { mockMentorTeams } from "../mocks/mentorTeams.mock";

const USE_MOCK = true;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMentorTeams(trackId?: UUID | string) {
  const navigate = useNavigate();

  const trackTeamsQuery = useQuery({
    queryKey: ["mentor-track-teams", trackId],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: mockMentorTeams };
      }
      // Khi có BE, bạn có thể gọi: return teamApi.getTeamsByTrack(trackId);
      return { data: [] }; 
    },
    enabled: USE_MOCK || !!trackId,
    staleTime: 60_000,
  });

  const goToFeedback = (teamId: string) => {
    navigate(`/mentor/teams/${teamId}/feedback`);
  };

  return {
    trackTeamsQuery,
    goToFeedback,
  };
}