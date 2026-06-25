import type { UUID } from "@/types/common.types";
import type {
    EventGradingProgressResponse,
    RoundGradingProgressResponse,
    JudgeAssignmentProgressResponse,
    SubmissionGradingProgressResponse
} from "@/types/grading.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSubmissions: SubmissionGradingProgressResponse[] = [
    {
        submissionId: "sub-1",
        teamId: "team-1",
        teamName: "Code Warriors",
        gradingStatus: "SUBMITTED",
        gradingLocked: false,
        gradingLockedAt: null,
        draftScoreCount: 0,
        confirmedScoreCount: 10,
        criteriaCount: 10,
        completed: true
    },
    {
        submissionId: "sub-2",
        teamId: "team-2",
        teamName: "Neural Ninjas",
        gradingStatus: "DRAFT_SAVED",
        gradingLocked: false,
        gradingLockedAt: null,
        draftScoreCount: 10,
        confirmedScoreCount: 0,
        criteriaCount: 10,
        completed: false
    },
    {
        submissionId: "sub-3",
        teamId: "team-3",
        teamName: "Data Miners",
        gradingStatus: "PENDING",
        gradingLocked: false,
        gradingLockedAt: null,
        draftScoreCount: 0,
        confirmedScoreCount: 0,
        criteriaCount: 10,
        completed: false
    }
];

const mockJudgeAssignments: JudgeAssignmentProgressResponse[] = [
    {
        assignmentId: "assign-1",
        judgeId: "j-1",
        judgeName: "Nguyen Van A",
        judgeEmail: "nguyenvana@example.com",
        judgeType: "EXPERT",
        trackId: "track-1",
        trackName: "AI Track",
        totalAssignedSubmissions: 3,
        completedAssignedSubmissions: 1,
        pendingSubmissions: 1,
        draftSavedSubmissions: 1,
        submittedSubmissions: 1,
        lockedSubmissions: 0,
        criteriaCount: 10,
        draftScoreCount: 10,
        confirmedScoreCount: 10,
        expectedFinalScoreCount: 30,
        percent: 33,
        submissions: mockSubmissions
    },
    {
        assignmentId: "assign-2",
        judgeId: "j-2",
        judgeName: "Tran Thi B",
        judgeEmail: "tranthib@example.com",
        judgeType: "INDUSTRY",
        trackId: "track-1",
        trackName: "AI Track",
        totalAssignedSubmissions: 3,
        completedAssignedSubmissions: 3,
        pendingSubmissions: 0,
        draftSavedSubmissions: 0,
        submittedSubmissions: 3,
        lockedSubmissions: 0,
        criteriaCount: 10,
        draftScoreCount: 0,
        confirmedScoreCount: 30,
        expectedFinalScoreCount: 30,
        percent: 100,
        submissions: mockSubmissions.map(s => ({ ...s, gradingStatus: "SUBMITTED", completed: true, confirmedScoreCount: 10, draftScoreCount: 0 }))
    }
];

let mockRoundProgress: RoundGradingProgressResponse = {
    roundId: "round-1",
    eventId: "event-1",
    roundName: "Semi-Finals",
    roundStatus: "JUDGING",
    submissionLockedAt: "2026-06-25T10:00:00Z",
    gradingLockedAt: null,
    submissionLocked: true,
    gradingLocked: false,
    canLockGrading: false,
    lockWarning: "Some judges have not submitted their scores yet.",
    judgeAssignmentCount: 2,
    totalAssignedSubmissions: 6,
    completedAssignedSubmissions: 4,
    pendingSubmissions: 1,
    draftSavedSubmissions: 1,
    submittedSubmissions: 4,
    lockedSubmissions: 0,
    criteriaCount: 10,
    draftScoreCount: 10,
    confirmedScoreCount: 40,
    expectedFinalScoreCount: 60,
    percent: 66,
    judgeAssignments: mockJudgeAssignments
};

const mockEventProgress: EventGradingProgressResponse = {
    eventId: "event-1",
    eventName: "SEAL Hackathon 2026",
    eventStatus: "JUDGING",
    roundCount: 1,
    totalAssignedSubmissions: 6,
    completedAssignedSubmissions: 4,
    pendingSubmissions: 1,
    draftSavedSubmissions: 1,
    submittedSubmissions: 4,
    lockedSubmissions: 0,
    expectedFinalScoreCount: 60,
    confirmedScoreCount: 40,
    percent: 66,
    rounds: [mockRoundProgress]
};

export const mockGradingProgressService = {
    getEventGradingProgress: async (eventId: UUID): Promise<EventGradingProgressResponse> => {
        await delay(500);
        return {
            ...mockEventProgress,
            eventId
        };
    },

    getRoundGradingProgress: async (roundId: UUID): Promise<RoundGradingProgressResponse> => {
        await delay(500);
        return {
            ...mockRoundProgress,
            roundId
        };
    },

    getJudgeAssignmentProgress: async (assignmentId: UUID): Promise<JudgeAssignmentProgressResponse> => {
        await delay(500);
        const assign = mockJudgeAssignments.find(a => a.assignmentId === assignmentId) || mockJudgeAssignments[0];
        return {
            ...assign,
            assignmentId
        };
    },

    lockGrading: async (roundId: UUID) => {
        await delay(500);
        mockRoundProgress.gradingLockedAt = new Date().toISOString();
        mockRoundProgress.gradingLocked = true;
        mockRoundProgress.lockWarning = null;
        mockRoundProgress.canLockGrading = false;

        // Lock all submissions
        mockRoundProgress.lockedSubmissions = mockRoundProgress.submittedSubmissions;
        mockRoundProgress.submittedSubmissions = 0;

        mockEventProgress.rounds[0] = mockRoundProgress;

        return { success: true, roundId, gradingLockedAt: mockRoundProgress.gradingLockedAt };
    }
};