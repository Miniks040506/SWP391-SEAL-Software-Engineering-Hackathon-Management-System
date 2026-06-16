import type { UUID } from "@/types/common.types";
import type { PageResponse } from "@/types/common.types";
import type {
  GetJudgeSubmissionsParams,
  JudgeAssignmentListItem,
  JudgeSubmissionAssignmentResponse,
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
    criteriaCount: 3,
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
    criteriaCount: 3,
    gradingStatus: "SCORED",
  },
];

// Mock tiêu chí dùng chung cho cả 2 bài nộp
const mockCriteria = [
  { id: "crit-1", name: "Technical Complexity", description: "Is the tech stack advanced and well-implemented?", maxScore: 40 },
  { id: "crit-2", name: "Innovation", description: "How unique and original is the idea?", maxScore: 30 },
  { id: "crit-3", name: "Presentation", description: "Quality of the pitch and demo.", maxScore: 30 },
];

export let mockPendingSubmissionDetail = {
  id: "sub-1111" as UUID,
  eventId: "event-1111" as UUID,
  eventName: "SEAL Spring 2026",
  teamId: "team-1111" as UUID,
  teamName: "Code Warriors",
  projectTitle: "Smart Campus AI",
  trackName: "AI Track",
  roundName: "Preliminary Round",
  status: "SUBMITTED",
  gradingStatus: "PENDING",
  description: "An AI system that predicts student dropout rates.",
  submittedAt: "2026-05-25T10:00:00",
  links: [
    { id: "link-1" as UUID, linkType: "VIDEO", url: "https://youtube.com", label: "Demo Video", isPrimary: true },
    { id: "link-2" as UUID, linkType: "GITHUB", url: "https://github.com", label: "Source Code", isPrimary: false },
  ],
  criteria: mockCriteria,
  scoredData: null as any, 
};

export const mockScoredSubmissionDetail = {
  id: "sub-2222" as UUID,
  eventId: "event-1111" as UUID,
  eventName: "SEAL Spring 2026",
  teamId: "team-2222" as UUID,
  teamName: "Byte Builders",
  projectTitle: "Student Management System",
  trackName: "Software Engineering",
  roundName: "Final Round",
  status: "LATE",
  gradingStatus: "SCORED",
  description: "A comprehensive management system for university students.",
  submittedAt: "2026-05-26T14:30:00",
  links: [
    { id: "link-3" as UUID, linkType: "REPORT", url: "https://docs.google.com", label: "Final Report", isPrimary: true },
  ],
  criteria: mockCriteria,
  scoredData: {
    scores: {
      "crit-1": 35, // Technical: 35/40
      "crit-2": 20, // Innovation: 20/30
      "crit-3": 28, // Presentation: 28/30
    },
    comment: "Solid technical implementation, but the idea is quite common. Great presentation though!",
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    if (submissionId === "sub-2222") {
      return mockScoredSubmissionDetail;
    }
    return mockPendingSubmissionDetail;
  },

  async submitScore(submissionId: UUID, payload: any) {
    await delay(600);
    if (submissionId === "sub-1111") {
      mockPendingSubmissionDetail.gradingStatus = "SCORED";
      mockPendingSubmissionDetail.scoredData = payload; 
      
      const targetSub = mockJudgeSubmissions.find(s => s.submissionId === "sub-1111");
      if (targetSub) targetSub.gradingStatus = "SCORED";
    }
    return { success: true };
  }
};