import type { UUID } from "@/types/common.types";
import type { PageResponse } from "@/types/common.types";
import type {
  GetJudgeSubmissionsParams,
  JudgeAssignmentListItem,
  JudgeSubmissionAssignmentResponse,
  JudgeSubmissionDetailResponse,
} from "@/types/judge.types";

export const mockJudgeAssignments: JudgeAssignmentListItem[] = [
  {
    id: "assign-1111" as UUID,
    roundId: "round-1111" as UUID,
    judgeId: "judge-1111" as UUID,
    judgeName: "Dr. AI Master",
    trackId: "track-1111" as UUID,
    scoringProgress: 40,
    totalToScore: 10,
  },
];

export const mockJudgeSubmissions: JudgeSubmissionAssignmentResponse[] = [
  {
    submissionId: "sub-1111" as UUID,
    teamId: "team-1111" as UUID,
    teamName: "Code Warriors",
    projectTitle: "Smart Campus AI",
    trackId: "track-1111" as UUID,
    trackName: "AI Track",
    roundId: "round-1111" as UUID,
    roundName: "Preliminary Round",
    submissionStatus: "SUBMITTED",
    submissionNumber: 1,
    submittedAt: "2026-05-25T10:00:00",
    roundSubmissionLocked: false,
    confirmedScoreCount: 1,
    criteriaCount: 5,
    gradingStatus: "PENDING",
  },
  {
    submissionId: "sub-2222" as UUID,
    teamId: "team-2222" as UUID,
    teamName: "Byte Builders",
    projectTitle: "Student Management System",
    trackId: "track-2222" as UUID,
    trackName: "Software Engineering",
    roundId: "round-2222" as UUID,
    roundName: "Final Round",
    submissionStatus: "LATE",
    submissionNumber: 2,
    submittedAt: "2026-05-26T14:30:00",
    roundSubmissionLocked: true,
    confirmedScoreCount: 5,
    criteriaCount: 5,
    gradingStatus: "SCORED",
  },
];

export const mockJudgeSubmissionDetail: JudgeSubmissionDetailResponse = {
  id: "sub-1111" as UUID,
  eventId: "event-1111" as UUID,
  eventName: "SEAL Spring 2026",
  teamId: "team-1111" as UUID,
  teamName: "Code Warriors",
  leaderId: "user-1111" as UUID,
  leaderName: "Nguyen Van A",
  trackId: "track-1111" as UUID,
  trackName: "AI Track",
  roundId: "round-1111" as UUID,
  roundName: "Preliminary Round",
  note: "This is our latest AI model.",
  status: "SUBMITTED",
  submissionNumber: 1,
  submittedAt: "2026-05-25T10:00:00",
  roundSubmissionLocked: false,
  links: [
    {
      id: "link-1" as UUID,
      linkType: "VIDEO",
      url: "https://youtube.com/watch?v=123",
      label: "Demo Video",
      isPrimary: true,
    },
    {
      id: "link-2" as UUID,
      linkType: "GITHUB",
      url: "https://github.com/team/repo",
      label: "Source Code",
      isPrimary: false,
    }
  ],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ĐÂY LÀ ĐỐI TƯỢNG CẦN EXPORT ĐỂ FIX LỖI SYNTAX ERROR
export const mockJudgeService = {
  async getMyAssignments() {
    await delay(500);
    return mockJudgeAssignments;
  },

  async getMySubmissions(params?: GetJudgeSubmissionsParams) {
    await delay(500);
    return {
      content: mockJudgeSubmissions,
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    } as PageResponse<JudgeSubmissionAssignmentResponse>;
  },

  async getMyRoundSubmissions(roundId: UUID) {
    await delay(500);
    const filtered = mockJudgeSubmissions.filter((s) => s.roundId === roundId);
    return {
      content: filtered,
      page: 0,
      size: 10,
      totalElements: filtered.length,
      totalPages: 1,
    } as PageResponse<JudgeSubmissionAssignmentResponse>;
  },

  async getMySubmissionDetail(submissionId: UUID) {
    await delay(500);
    return { ...mockJudgeSubmissionDetail, gradingStatus: "PENDING" } as JudgeSubmissionDetailResponse & { gradingStatus?: string };
  },
};