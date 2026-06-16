import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { judgeApi } from "@/api/judge.api";
import { mockJudgeService } from "../mocks/judge.mock";
import type { UUID } from "@/types/common.types";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

const USE_MOCK = false;
const activeService = (USE_MOCK ? mockJudgeService : judgeApi) as typeof judgeApi;
type JudgeSubmissionApiParams = Omit<GetJudgeSubmissionsParams, "search">;
type JudgeRoundSubmissionParams = Omit<JudgeSubmissionApiParams, "roundId">;

export const judgeKeys = {
  all: ["judge"] as const,
  assignments: () => [...judgeKeys.all, "assignments"] as const,
  submissions: (params?: JudgeSubmissionApiParams) =>
    [...judgeKeys.all, "submissions", params] as const,
  roundSubmissions: (roundId?: string, params?: JudgeRoundSubmissionParams) =>
    [...judgeKeys.all, "roundSubmissions", roundId, params] as const,
  submissionDetail: (id: string) => [...judgeKeys.all, "submissionDetail", id] as const,
};

export function useJudgeAssignmentsQuery() {
  return useQuery({
    queryKey: judgeKeys.assignments(),
    queryFn: () => activeService.getMyAssignments(),
  });
}

export function useJudgeSubmissionsQuery(params?: JudgeSubmissionApiParams) {
  return useQuery({
    queryKey: judgeKeys.submissions(params),
    queryFn: () => activeService.getMySubmissions(params),
    placeholderData: (previous) => previous,
  });
}

export function useJudgeRoundSubmissionsQuery(
  roundId?: string,
  params?: JudgeRoundSubmissionParams,
) {
  return useQuery({
    queryKey: judgeKeys.roundSubmissions(roundId, params),
    queryFn: () => activeService.getMyRoundSubmissions(roundId as UUID, params),
    enabled: Boolean(roundId),
    placeholderData: (previous) => previous,
  });
}

export function useJudgeSubmissionDetailQuery(submissionId?: string) {
  return useQuery({
    queryKey: judgeKeys.submissionDetail(submissionId || ""),
    queryFn: () => activeService.getMySubmissionDetail(submissionId as UUID),
    enabled: Boolean(submissionId),
  });
}

export function useSubmitJudgeScoreMutation(submissionId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: { scores: Record<string, number>; comment?: string }) => {
      const scoringService = activeService as typeof activeService & {
        submitScore?: (
          submissionId: UUID,
          payload: { scores: Record<string, number>; comment?: string },
        ) => Promise<unknown>;
      };

      if (!scoringService.submitScore) {
        throw new Error("Score submission endpoint is not available.");
      }

      return scoringService.submitScore(submissionId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: judgeKeys.submissionDetail(submissionId) });
      await queryClient.invalidateQueries({ queryKey: judgeKeys.submissions() });
      enqueueSnackbar("Scores submitted successfully!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to submit scores. Please try again.", { variant: "error" });
    },
  });
}
