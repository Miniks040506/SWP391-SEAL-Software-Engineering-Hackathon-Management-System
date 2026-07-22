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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const requestParams = {
          trackId: params.trackId,
          status: params.status,
          registrationStatus: params.registrationStatus,
          search: params.search,
          page: params.page ? params.page - 1 : 0,
          size: params.size,
        };
        const res = params.eventId
          ? await teamApi.getCoordinatorEventTeams(
              params.eventId,
              requestParams,
            )
          : await teamApi.getCoordinatorTeams(requestParams);
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
    params.registrationStatus,
    params.search,
    params.page,
    params.size,
    reloadKey,
  ]);

  return {
    data,
    loading,
    refetch: () => setReloadKey((value) => value + 1),
  };
};
