import { useState, useEffect } from "react";
import { teamApi } from "@/api/team.api";
import type { PageResponse } from "@/types/common.types";
import type {
  CoordinatorTeamListParams,
  CoordinatorTeamSummaryResponse,
} from "@/types/team.types";

export const useCoordinatorTeamsQuery = (params: CoordinatorTeamListParams) => {
  const [data, setData] =
    useState<PageResponse<CoordinatorTeamSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!params.eventId) {
        setData(null);
        return;
      }

      setLoading(true);
      try {
        const res = await teamApi.getCoordinatorEventTeams(params.eventId, {
          trackId: params.trackId,
          status: params.status,
          search: params.search,
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
  }, [
    params.eventId,
    params.trackId,
    params.status,
    params.search,
    params.page,
    params.size,
  ]);

  return { data, loading };
};
