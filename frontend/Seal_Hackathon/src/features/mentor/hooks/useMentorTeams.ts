import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import type { UUID } from "@/types/common.types";
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
  const navigate = useNavigate();

  const trackTeamsQuery = useQuery({
    queryKey: ["mentor-track-teams", trackId],
    queryFn: () => activeMentorTeamService.getTeamsByTrack(trackId as UUID),
    enabled: Boolean(trackId),
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