import { useQuery } from "@tanstack/react-query";
import { judgeApi } from "@/api/judge.api";
import type { UUID } from "@/types/common.types";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

export function useJudgeSubmissionsQuery(params?: GetJudgeSubmissionsParams) {
  return useQuery({
    queryKey: ["judge", "submissions", params],
    queryFn: () => judgeApi.getMySubmissions(params),
    placeholderData: (previous) => previous,
  });
}

export function useJudgeRoundSubmissionsQuery(
  roundId: UUID,
  params?: Omit<GetJudgeSubmissionsParams, "roundId">,
) {
  return useQuery({
    queryKey: ["judge", "rounds", roundId, "submissions", params],
    queryFn: () => judgeApi.getMyRoundSubmissions(roundId, params),
    enabled: !!roundId,
    placeholderData: (previous) => previous,
  });
}

export function useJudgeSubmissionSummaryQuery(roundId?: UUID) {
  return useQuery({
    queryKey: ["judge", "submissions", "summary", roundId],
    queryFn: () => judgeApi.getMySubmissionSummary(roundId),
  });
}
