import { useQuery } from "@tanstack/react-query";
import type { UUID } from "@/types/common.types";
import { trackApi } from "@/api/track.api";

export function useMentorTeams(
  trackId?: UUID | string,
  params?: { status?: string; search?: string; page?: number; size?: number },
) {
  const { data, isLoading } = useQuery({
    queryKey: ["mentor-track-teams", trackId, params],
    queryFn: () => trackApi.getTeamInAssignedTracks(trackId as UUID, params),
    enabled: Boolean(trackId),
    staleTime: 60_000,
  });

  return { data, isLoading };
}
