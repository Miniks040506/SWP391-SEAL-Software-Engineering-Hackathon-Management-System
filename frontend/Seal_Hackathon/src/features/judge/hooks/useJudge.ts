import { useQuery } from "@tanstack/react-query";
import { judgeApi } from "@/api/judge.api";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

type JudgeSubmissionApiParams = GetJudgeSubmissionsParams;

export const judgeKeys = {
  all: ["judge"] as const,
  submissions: (params?: JudgeSubmissionApiParams) =>
    [...judgeKeys.all, "submissions", params] as const,
  submissionSummary: (roundId?: string) =>
    [...judgeKeys.all, "submissionSummary", roundId] as const,
  submissionDetail: (id: string) =>
    [...judgeKeys.all, "submissionDetail", id] as const,
};

export function useJudgeSubmissionsQuery(params?: JudgeSubmissionApiParams) {
  return useQuery({
    queryKey: judgeKeys.submissions(params),
    queryFn: () => judgeApi.getMySubmissions(params),
    placeholderData: (previous) => previous,
  });
}

export function useJudgeSubmissionSummaryQuery(roundId?: string) {
  return useQuery({
    queryKey: judgeKeys.submissionSummary(roundId),
    queryFn: () => judgeApi.getMySubmissionSummary(roundId),
  });
}

export function useJudgeSubmissionDetailQuery(submissionId?: string) {
  return useQuery({
    queryKey: judgeKeys.submissionDetail(submissionId || ""),
    queryFn: () => judgeApi.getMySubmissionDetail(submissionId!),
    enabled: Boolean(submissionId),
  });
}
