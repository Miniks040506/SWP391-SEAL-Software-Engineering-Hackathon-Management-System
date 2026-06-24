import { useQuery } from "@tanstack/react-query";
import { judgeApi } from "@/api/judge.api";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  GetJudgeSubmissionsParams,
  JudgeSubmissionAssignmentResponse,
} from "@/types/judge.types";

const mockJudgeSubmissions: JudgeSubmissionAssignmentResponse[] = [
  {
    submissionId: "sub-1",
    teamId: "team-1",
    teamName: "Team Alpha",
    projectTitle: "Alpha Project",
    trackId: "track-1",
    trackName: "Web Track",
    roundId: "round-1",
    roundName: "Final Round",
    submissionStatus: "SUBMITTED",
    submissionNumber: 1,
    submittedAt: new Date().toISOString(),
    roundSubmissionLocked: true,
    confirmedScoreCount: 0,
    criteriaCount: 5,
    gradingStatus: "PENDING",
  },
  {
    submissionId: "sub-2",
    teamId: "team-2",
    teamName: "Team Beta",
    projectTitle: "Beta Project",
    trackId: "track-1",
    trackName: "Web Track",
    roundId: "round-1",
    roundName: "Final Round",
    submissionStatus: "SUBMITTED",
    submissionNumber: 2,
    submittedAt: new Date().toISOString(),
    roundSubmissionLocked: true,
    confirmedScoreCount: 0,
    criteriaCount: 5,
    gradingStatus: "READY",
  },
  {
    submissionId: "sub-3",
    teamId: "team-3",
    teamName: "Team Gamma",
    projectTitle: "Gamma Project",
    trackId: "track-1",
    trackName: "Web Track",
    roundId: "round-1",
    roundName: "Final Round",
    submissionStatus: "SUBMITTED",
    submissionNumber: 3,
    submittedAt: new Date().toISOString(),
    roundSubmissionLocked: true,
    confirmedScoreCount: 5,
    criteriaCount: 5,
    gradingStatus: "GRADED",
  },
  {
    submissionId: "sub-4",
    teamId: "team-4",
    teamName: "Team Delta",
    projectTitle: "Delta Project",
    trackId: "track-1",
    trackName: "Web Track",
    roundId: "round-1",
    roundName: "Final Round",
    submissionStatus: "SUBMITTED",
    submissionNumber: 4,
    submittedAt: new Date().toISOString(),
    roundSubmissionLocked: false,
    confirmedScoreCount: 0,
    criteriaCount: 5,
    gradingStatus: "PENDING",
  },
];

const placeholderPageData: PageResponse<JudgeSubmissionAssignmentResponse> = {
  content: mockJudgeSubmissions,
  page: 0,
  size: 10,
  totalElements: 4,
  totalPages: 1,
  last: true,
};

export function useJudgeSubmissionsQuery(params?: GetJudgeSubmissionsParams) {
  return useQuery({
    queryKey: ["judge", "submissions", params],
    queryFn: () => judgeApi.getMySubmissions(params),
    placeholderData: placeholderPageData,
  });
}

export function useJudgeRoundSubmissionsQuery(
  roundId: UUID,
  params?: Omit<GetJudgeSubmissionsParams, "roundId">
) {
  return useQuery({
    queryKey: ["judge", "rounds", roundId, "submissions", params],
    queryFn: () => judgeApi.getMyRoundSubmissions(roundId, params),
    enabled: !!roundId,
    placeholderData: placeholderPageData,
  });
}
