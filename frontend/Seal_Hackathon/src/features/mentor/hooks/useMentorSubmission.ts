import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";
import type { GetMentorSubmissionsParams } from "@/types/submission.types";

export function useMentorSubmissions(params?: GetMentorSubmissionsParams) {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const trackSubmissionsQuery = useQuery({
    queryKey: ["mentor-submissions", params],
    queryFn: () => submissionApi.getMentorSubmissions(params!),
    enabled: params !== undefined,
    staleTime: 30_000,
  });

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
