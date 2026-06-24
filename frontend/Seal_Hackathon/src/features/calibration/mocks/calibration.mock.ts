import type {
    CalibrationRoundDetailResponse,
    CalibrationDistributionResponse,
    CreateCalibrationRoundRequest,
    UpdateCalibrationRoundRequest
} from "@/types/calibration.types";
import type { UUID } from "@/types/common.types";

let mockCalibrationRounds: CalibrationRoundDetailResponse[] = [
    {
        id: "cal-1" as UUID,
        eventId: "seal-spring-2026" as UUID, // Giả định eventId hiện tại
        sampleSubmissionId: "sub-alpha-001" as UUID,
        description: "Phase 1: Preliminary Idea Calibration",
        startAt: "2026-05-01T08:00:00Z",
        endAt: "2026-05-10T23:59:00Z",
        mandatory: true,
        benchmarkScores: { "sc-1": 85, "sc-3": 90 },
    },
    {
        id: "cal-2" as UUID,
        eventId: "seal-spring-2026" as UUID,
        sampleSubmissionId: "sub-beta-002" as UUID,
        description: "Phase 2: Technical Depth Calibration",
        startAt: "2026-06-20T08:00:00Z",
        endAt: "2026-06-30T23:59:00Z",
        mandatory: true,
        benchmarkScores: { "sc-2": 95, "sc-7": 80 },
    }
];

const mockDistributions: Record<string, CalibrationDistributionResponse> = {};

// Giả lập network delay 500ms
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockCalibrationService = {
    async getEventCalibrationRounds(eventId: UUID) {
        await delay(500);
        return mockCalibrationRounds.filter(c => c.eventId === eventId);
    },

    async getAllCalibrationRounds() {
        await delay(500);
        return mockCalibrationRounds;
    },

    async getCalibrationRoundAlias(calibrationId: UUID) {
        await delay(500);
        return mockCalibrationRounds.find(c => c.id === calibrationId) as CalibrationRoundDetailResponse;
    },

    async getDistributionAlias(calibrationId: UUID) {
        await delay(500);
        const round = mockCalibrationRounds.find(c => c.id === calibrationId);
        const isPublished = !!round?.distributionPublishedAt;
        
        return {
            calibrationRoundId: calibrationId,
            published: isPublished,
            publishedAt: round?.distributionPublishedAt || null,
            judgeCount: 5,
            criteriaDistributions: [
                {
                    eventCriteriaId: "sc-1" as UUID,
                    criteriaName: "Innovation and Creativity",
                    benchmarkScore: 85,
                    judgeCount: 5,
                    mean: 82.5,
                    min: 70,
                    max: 95,
                    standardDeviation: 0.8, // Low
                },
                {
                    eventCriteriaId: "sc-2" as UUID,
                    criteriaName: "Technical Implementation",
                    benchmarkScore: 90,
                    judgeCount: 5,
                    mean: 88,
                    min: 60,
                    max: 95,
                    standardDeviation: 1.5, // Medium
                },
                {
                    eventCriteriaId: "sc-3" as UUID,
                    criteriaName: "User Experience",
                    benchmarkScore: 75,
                    judgeCount: 5,
                    mean: 80,
                    min: 50,
                    max: 95,
                    standardDeviation: 2.3, // High
                }
            ]
        } as any;
    },

    async createCalibrationRoundAlias(payload: CreateCalibrationRoundRequest) {
        await delay(500);
        const newCal: CalibrationRoundDetailResponse = {
            id: `cal-${Date.now()}` as UUID,
            eventId: payload.eventId,
            sampleSubmissionId: payload.sampleSubmissionId as UUID,
            description: payload.description,
            startAt: payload.startAt,
            endAt: payload.endAt,
            mandatory: payload.mandatory ?? false,
            benchmarkScores: payload.benchmarkScores,
        };
        mockCalibrationRounds.push(newCal);
        return newCal;
    },

    async updateCalibrationRoundAlias(calibrationId: UUID, payload: UpdateCalibrationRoundRequest) {
        await delay(500);
        mockCalibrationRounds = mockCalibrationRounds.map((cal) =>
            cal.id === calibrationId ? { ...cal, ...payload } : cal
        );
        return mockCalibrationRounds.find(c => c.id === calibrationId) as CalibrationRoundDetailResponse;
    },

    async publishDistributionAlias(calibrationId: UUID) {
        await delay(500);
        mockCalibrationRounds = mockCalibrationRounds.map((cal) =>
            cal.id === calibrationId ? { ...cal, distributionPublishedAt: new Date().toISOString() } : cal
        );

        // Tạo phân bổ giả
        mockDistributions[calibrationId] = {
            calibrationRoundId: calibrationId,
            published: true,
            distributionPublishedAt: new Date().toISOString(),
            totalScoreRows: 5,
            distributions: []
        };

        return mockCalibrationRounds.find(c => c.id === calibrationId) as CalibrationRoundDetailResponse;
    },

    async getScoreSheetAlias(calibrationId: UUID) {
        await delay(500);
        return {
            calibrationRoundId: calibrationId,
            eventId: "seal-spring-2026" as UUID,
            sampleSubmissionId: "sub-alpha-001" as UUID,
            criteria: [
                {
                    id: "sc-1" as UUID,
                    effectiveName: "Innovation and Creativity",
                    effectiveDescription: "How innovative is the idea? Does it solve a real problem in a unique way?",
                    templateCategory: "IDEA",
                    effectiveWeight: 2,
                    effectiveMaxScore: 100,
                },
                {
                    id: "sc-2" as UUID,
                    effectiveName: "Technical Implementation",
                    effectiveDescription: "Code quality, architecture, and technology stack choices.",
                    templateCategory: "TECH",
                    effectiveWeight: 3,
                    effectiveMaxScore: 100,
                },
                {
                    id: "sc-3" as UUID,
                    effectiveName: "User Experience",
                    effectiveDescription: "Is the UI/UX intuitive and well designed?",
                    templateCategory: "UI/UX",
                    effectiveWeight: 1,
                    effectiveMaxScore: 100,
                }
            ],
        } as any;
    },

    submitCalibrationScoreAlias: async (calibrationId: UUID, payload: any) => {
        await delay(500);
        // Save the submitted scores
        mockDistributions[calibrationId] = {
            ...mockDistributions[calibrationId],
            myScores: payload.scores.map((s: any) => ({
                id: `score-${Date.now()}-${s.eventCriteriaId}` as UUID,
                calibrationRoundId: calibrationId,
                judgeId: "judge-1" as UUID,
                eventCriteriaId: s.eventCriteriaId,
                value: s.value,
                comment: s.comment,
            })),
        } as any;
        return [];
    },

    getMyScores: async (calibrationId: UUID) => {
        await delay(500);
        return (mockDistributions[calibrationId] as any)?.myScores || [];
    },

    getSubmissionAlias: async (submissionId: UUID) => {
        await delay(500);
        return {
            id: submissionId,
            teamName: "Alpha Geeks",
            eventName: "SEAL Spring 2026",
            trackName: "Web Application",
            roundName: "Final Pitch",
            note: "Here is our project for the calibration phase. We focused on AI integration and performance.",
            status: "SUBMITTED",
            submissionNumber: 1,
            links: [
                {
                    id: "link-1" as UUID,
                    linkType: "REPOSITORY",
                    url: "https://github.com/alpha-geeks/project",
                    label: "GitHub Source",
                },
                {
                    id: "link-2" as UUID,
                    linkType: "DEMO",
                    url: "https://demo.alphageeks.com",
                    label: "Live Demo",
                },
                {
                    id: "link-3" as UUID,
                    linkType: "SLIDE",
                    url: "https://docs.google.com/presentation/d/123",
                    label: "Pitch Deck",
                }
            ]
        } as any;
    },

    getDistributionAlias: async (calibrationId: UUID) => {
        await delay(500);
        const round = mockCalibrationRounds.find(c => c.id === calibrationId);
        const isPublished = !!round?.distributionPublishedAt;
        
        return {
            calibrationRoundId: calibrationId,
            published: isPublished,
            publishedAt: round?.distributionPublishedAt || null,
            judgeCount: 5,
            criteriaDistributions: [
                {
                    eventCriteriaId: "sc-1" as UUID,
                    criteriaName: "Innovation and Creativity",
                    benchmarkScore: 85,
                    judgeCount: 5,
                    mean: 82.5,
                    min: 70,
                    max: 95,
                    standardDeviation: 0.8, // Low
                },
                {
                    eventCriteriaId: "sc-2" as UUID,
                    criteriaName: "Technical Implementation",
                    benchmarkScore: 90,
                    judgeCount: 5,
                    mean: 88,
                    min: 60,
                    max: 95,
                    standardDeviation: 1.5, // Medium
                },
                {
                    eventCriteriaId: "sc-3" as UUID,
                    criteriaName: "User Experience",
                    benchmarkScore: 75,
                    judgeCount: 5,
                    mean: 80,
                    min: 50,
                    max: 95,
                    standardDeviation: 2.3, // High
                }
            ]
        } as any;
    },

    publishDistributionAlias: async (calibrationId: UUID) => {
        await delay(500);
        const round = mockCalibrationRounds.find(c => c.id === calibrationId);
        if (round) {
            round.distributionPublishedAt = new Date().toISOString();
        }
        return round as any;
    }
};