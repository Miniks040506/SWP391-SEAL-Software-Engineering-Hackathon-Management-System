import { useState, useEffect } from "react";
import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type { SubmissionDetailResponse } from "@/types/submission.types";

export type CoordinatorSubmissionListParams = {
  eventId?: string;
  trackId?: string;
  roundId?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
};

export type CoordinatorSubmissionSummary = {
  id: string;
  teamId: string;
  teamName?: string | null;
  trackId?: string | null;
  trackName?: string | null;
  roundId: string;
  roundName: string;
  status: string;
  submissionNumber: number;
  submittedAt?: string | null;
  updatedAt?: string | null;
  linkCount?: number;
};

export const useCoordinatorSubmissionsQuery = (params: CoordinatorSubmissionListParams) => {
  const [data, setData] = useState<PageResponse<CoordinatorSubmissionSummary> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        let url = "/submissions";
        if (params.eventId) {
          url = `/events/${params.eventId}/submissions`;
        } else if (params.roundId) {
          url = `/rounds/${params.roundId}/submissions`;
        } else if (params.trackId) {
          url = `/tracks/${params.trackId}/submissions`;
        }
        
        const res = await apiRequest.get<PageResponse<CoordinatorSubmissionSummary>>(url, { params });
        setData(res);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [params.eventId, params.roundId, params.trackId, params.status, params.search, params.page, params.size]);

  return { data, loading };
};

export const useSubmissionAdminDetailQuery = (submissionId?: UUID) => {
  const [detail, setDetail] = useState<SubmissionDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submissionId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get<SubmissionDetailResponse>(`/submissions/${submissionId}/admin-view`);
        setDetail(res);
      } catch (error) {
        console.error("Failed to fetch submission detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [submissionId]);

  return { detail, loading };
};