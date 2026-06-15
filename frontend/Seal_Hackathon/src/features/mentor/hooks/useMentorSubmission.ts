import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";

import { mockTrackSubmissions, mockSubmissionDetail } from "../mocks/mentorSubmission.mock";

// false: Gọi API thật từ Backend
const USE_MOCK = true; 

// Hàm tiện ích giả lập network delay 500ms cho giống thật
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMentorSubmissions(trackId?: UUID | string) {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const trackSubmissionsQuery = useQuery({
    queryKey: ["mentor-track-submissions", trackId],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500); // Giả lập loading
        return { data: mockTrackSubmissions }; // Bọc vào data để giống format axios
      }
      return submissionApi.getTrackSubmissions(trackId as UUID);
    },
    enabled: USE_MOCK || !!trackId,
    staleTime: 60_000,
  });

  const submissionDetailQuery = useQuery({
    queryKey: ["mentor-submission-detail", submissionId],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500); // Giả lập loading
        return { data: mockSubmissionDetail };
      }
      return submissionApi.getMentorSubmissionById(submissionId as UUID);
    },
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