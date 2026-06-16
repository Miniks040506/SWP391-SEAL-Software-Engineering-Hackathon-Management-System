import { useQuery } from "@tanstack/react-query";
import type { UUID } from "@/types/common.types";
import { trackApi } from "@/api/track.api";
import { apiRequest } from "@/api/apiRequest"; 
import { mockMentorTeamService, type MentorTeamSummary } from "../mocks/mentorTeams.mock";

const USE_MOCK_TEAMS = false;

const apiMentorTeamService = {
  getTeamsByTrack(trackId: UUID) {
    return apiRequest.get<MentorTeamSummary[]>(`/mentor/tracks/${trackId}/teams`);
  },
};

const activeMentorTeamService = USE_MOCK_TEAMS ? mockMentorTeamService : apiMentorTeamService;

export function useMentorTeams(trackId?: UUID | string) {
  const trackTeamsQuery = useQuery({
    queryKey: ["mentor-track-teams", trackId],
    queryFn: () => activeMentorTeamService.getTeamsByTrack(trackId as UUID),
    enabled: USE_MOCK_TEAMS || Boolean(trackId),
    staleTime: 60_000,
  });

  return {
    trackTeamsQuery,
  };
}