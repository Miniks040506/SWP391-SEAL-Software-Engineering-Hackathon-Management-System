import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: ["coordinator-submissions", params],
    queryFn: () => {
      const apiPage = Math.max((params.page ?? 1) - 1, 0);
      return submissionApi.getEventSubmissions({
        ...params,
        page: apiPage,
      });
    },
    select: (response): PageResponse<CoordinatorSubmissionSummary> => ({
      ...response,
      page: response.page + 1,
    }),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useSubmissionAdminDetailQuery = (submissionId?: UUID) => {
  const query = useQuery<SubmissionDetailResponse>({
    queryKey: ["coordinator-submission-detail", submissionId],
    queryFn: () => submissionApi.getSubmissionAdminView(submissionId!),
    enabled: Boolean(submissionId),
  });

  return {
    detail: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
