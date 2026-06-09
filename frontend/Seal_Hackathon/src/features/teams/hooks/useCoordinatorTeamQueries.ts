import { useState, useEffect } from "react";
import { apiRequest } from "@/api/apiRequest";
import type { PageResponse } from "@/types/common.types";
import type { CoordinatorTeamListParams, CoordinatorTeamSummary } from "@/types/team.types";

export const useCoordinatorTeamsQuery = (params: CoordinatorTeamListParams) => {
  const [data, setData] = useState<PageResponse<CoordinatorTeamSummary> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        let url = "/teams";
        if (params.eventId) {
          url = `/events/${params.eventId}/teams`;
        } else if (params.trackId) {
          url = `/tracks/${params.trackId}/teams`;
        }

        const res = await apiRequest.get<PageResponse<CoordinatorTeamSummary>>(url, { params });
        setData(res);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [params.eventId, params.trackId, params.status, params.search, params.page, params.size]);

  return { data, loading };
};