import { useQueries, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";

export function useMentorSubmissions(teamIds?: string[]) {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const teamSubmissionQueries = useQueries({
    queries: (teamIds || []).map((teamId) => ({
      queryKey: ["mentor-team-submissions", teamId],
      queryFn: () => submissionApi.getMentorTeamSubmissions(teamId as UUID),
      enabled: !!teamId,
      staleTime: 60_000,
    })),
  });

  const isLoading = teamSubmissionQueries.some((q) => q.isLoading);
  const allSubmissions = teamSubmissionQueries.flatMap((q) => {
    const data = q.data as any;
    return data?.data || data || [];
  });

  const trackSubmissionsQuery = {
    data: allSubmissions,
    isLoading,
  };

  const submissionDetailQuery = useQuery({
    queryKey: ["mentor-submission-detail", submissionId],
    queryFn: () => submissionApi.getMentorSubmissionById(submissionId as UUID),
    enabled: !!submissionId,
    staleTime: 60_000,
  });

  const goToSubmissionDetail = (id: string) => {
    navigate(`/mentor/submissions/${id}`);
  };

  const goBackToHistory = () => {
    navigate(`/mentor/submissions`);
  };

  return {
    submissionId,
    trackSubmissionsQuery,
    submissionDetailQuery,
    goToSubmissionDetail,
    goBackToHistory,
  };
}