import { useQuery } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";

export function useScoreSheet(submissionId: string) {
  const submissionQuery = useQuery({
    queryKey: ["grading", "submission", submissionId],
    queryFn: () => gradingApi.getSubmissionForGrading(submissionId),
    enabled: !!submissionId,
  });

  const scoreSheetQuery = useQuery({
    queryKey: ["grading", "scoreSheet", submissionId],
    queryFn: () => gradingApi.getScoreSheet(submissionId),
    enabled: !!submissionId,
  });

  return {
    submission: submissionQuery.data,
    scoreSheet: scoreSheetQuery.data,
    isLoading: submissionQuery.isLoading || scoreSheetQuery.isLoading,
    isError: submissionQuery.isError || scoreSheetQuery.isError,
  };
}
