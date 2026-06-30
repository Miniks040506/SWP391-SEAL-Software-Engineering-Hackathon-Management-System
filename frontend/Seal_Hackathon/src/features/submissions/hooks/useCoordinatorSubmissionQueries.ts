import { useState, useEffect } from "react";
import { submissionApi } from "@/api/submission.api";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CoordinatorSubmissionSummaryResponse,
  GetEventSubmissionsParams,
  SubmissionDetailResponse,
} from "@/types/submission.types";

export type CoordinatorSubmissionListParams = GetEventSubmissionsParams;
export type CoordinatorSubmissionSummary = CoordinatorSubmissionSummaryResponse;

export const useCoordinatorSubmissionsQuery = (params: CoordinatorSubmissionListParams) => {
  const [data, setData] = useState<PageResponse<CoordinatorSubmissionSummary> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const apiPage = Math.max((params.page ?? 1) - 1, 0);
      const res = await submissionApi.getEventSubmissions({
        ...params,
        page: apiPage,
      });
      setData({ ...res, page: res.page + 1 });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.eventId, params.roundId, params.trackId, params.status, params.search, params.page, params.size]);

  return { data, loading, refetch: fetchSubmissions };
};

export const useSubmissionAdminDetailQuery = (submissionId?: UUID) => {
  const [detail, setDetail] = useState<SubmissionDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const res = await submissionApi.getSubmissionAdminView(submissionId);
      setDetail(res);
    } catch (error) {
      console.error("Failed to fetch submission detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [submissionId]);

  return { detail, loading, refetch: fetchDetail };
};
