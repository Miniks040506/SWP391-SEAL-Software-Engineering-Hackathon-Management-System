import { useState, useEffect } from "react";
import { trackApi } from "@/api/track.api";
import type { PageResponse } from "@/types/common.types";
import type { CoordinatorTeamListParams } from "@/types/team.types";
import type { TrackTeamProgressResponse } from "@/types/track.types";

export const useCoordinatorTeamsQuery = (params: CoordinatorTeamListParams) => {
  const [data, setData] = useState<PageResponse<TrackTeamProgressResponse> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!params.trackId) {
        setData(null);
        return;
      }
      
      setLoading(true);
      try {
        const res = await trackApi.getTrackTeams(params.trackId, {
          page: params.page ? params.page - 1 : 0,
          size: params.size,
        });
        setData(res);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [params.trackId, params.page, params.size]);

  return { data, loading };
};