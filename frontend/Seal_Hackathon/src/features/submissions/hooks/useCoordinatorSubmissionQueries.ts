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

export type CoordinatorSubmissionProgressSummary = {
  draft: number;
  submitted: number;
  late: number;
  disqualified: number;
  locked: number;
  total: number;
};

const SUMMARY_PAGE_SIZE = 100;

function summarizeSubmissions(
  submissions: CoordinatorSubmissionSummary[],
  total: number,
): CoordinatorSubmissionProgressSummary {
  const summary: CoordinatorSubmissionProgressSummary = {
    draft: 0,
    submitted: 0,
    late: 0,
    disqualified: 0,
    locked: 0,
    total,
  };

  submissions.forEach((submission) => {
    if (submission.roundSubmissionLocked) summary.locked += 1;
    if (submission.status === "DRAFT") summary.draft += 1;
    if (submission.status === "SUBMITTED") summary.submitted += 1;
    if (submission.status === "LATE") summary.late += 1;
    if (submission.status === "DISQUALIFIED") summary.disqualified += 1;
  });

  return summary;
}

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

  const summaryParams: CoordinatorSubmissionListParams = {
    eventId: params.eventId,
    roundId: params.roundId,
    trackId: params.trackId,
    status: params.status,
    search: params.search,
  };
  const summaryQuery = useQuery({
    queryKey: ["coordinator-submissions-summary", summaryParams],
    queryFn: async () => {
      const firstPage = await submissionApi.getEventSubmissions({
        ...summaryParams,
        page: 0,
        size: SUMMARY_PAGE_SIZE,
      });

      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(firstPage.totalPages - 1, 0) },
          (_, index) =>
            submissionApi.getEventSubmissions({
              ...summaryParams,
              page: index + 1,
              size: SUMMARY_PAGE_SIZE,
            }),
        ),
      );
      const submissions = [firstPage, ...remainingPages].flatMap(
        (page) => page.content,
      );

      return summarizeSubmissions(submissions, firstPage.totalElements);
    },
  });

  return {
    data: query.data ?? null,
    summary: summaryQuery.data ?? null,
    loading: query.isLoading,
    summaryLoading: summaryQuery.isLoading,
    error: query.error,
    refetch: async () => {
      await Promise.all([query.refetch(), summaryQuery.refetch()]);
    },
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
