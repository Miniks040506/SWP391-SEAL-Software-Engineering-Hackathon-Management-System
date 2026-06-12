import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";

export function useMentorSubmission(trackId?: UUID) {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const trackSubmissionQuery = useQuery({
    queryKey: ["memtor-track-submission", trackId],
    queryFn: () => submissionApi.getMentorTeamSubmissions(trackId as UUID),
    enabled: !!trackId,
    staleTime: 60_000,
  });

  const submissionDetailQuery = useQuery({
    queryKey: ["mentor-submission-detail", submissionId],
    queryFn: () => submissionApi.getMentorSubmissionById(submissionId as UUID),
    enabled: !!submissionId,
    staleTime: 60_000,
  });

  const goToSubmissionDetail = (id: string) => {
    navigate(`mentor/submission/${id}`);
  };

  const goBackToHistory = () => {
    navigate(`mentor/submissions`);
  };

  return {
    submissionId,
    trackSubmissionQuery,
    submissionDetailQuery,
    goToSubmissionDetail,
    goBackToHistory,
  };
}
