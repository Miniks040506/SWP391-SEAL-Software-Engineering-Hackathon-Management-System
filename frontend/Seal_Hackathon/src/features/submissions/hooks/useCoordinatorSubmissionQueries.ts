import { useState, useEffect } from "react";
import { submissionApi } from "@/api/submission.api";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CoordinatorSubmissionSummaryResponse,
  GetEventSubmissionsParams,
  SubmissionDetailResponse,
} from "@/types/submission.types";

export type CoordinatorSubmissionListParams = GetEventSubmissionsParams & {
  eventId?: UUID;
};
export type CoordinatorSubmissionSummary = CoordinatorSubmissionSummaryResponse;

const emptySubmissionPage = (
  page: number,
  size: number,
): PageResponse<CoordinatorSubmissionSummary> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 0,
  last: true,
});

export const useCoordinatorSubmissionsQuery = (params: CoordinatorSubmissionListParams) => {
  const [data, setData] = useState<PageResponse<CoordinatorSubmissionSummary> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        if (!params.eventId) {
          setData(emptySubmissionPage(params.page ?? 1, params.size ?? 20));
          return;
        }

        const apiPage = Math.max((params.page ?? 1) - 1, 0);
        const { eventId, ...queryParams } = params;
        const res = await submissionApi.getEventSubmissions(eventId, {
          ...queryParams,
          page: apiPage,
        });
        setData({ ...res, page: res.page + 1 });
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const res = await submissionApi.getSubmissionAdminView(submissionId);
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
