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

let mockDistributions: Record<string, CalibrationDistributionResponse> = {};

// Giả lập network delay 500ms
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockCalibrationService = {
    getEventCalibrationRounds: async (eventId: UUID) => {
        await delay(500);
        return mockCalibrationRounds.filter(c => c.eventId === eventId);
    },

    getAllCalibrationRounds: async () => {
        await delay(500);
        return mockCalibrationRounds;
    },

    getCalibrationRoundAlias: async (calibrationId: UUID) => {
        await delay(500);
        return mockCalibrationRounds.find(c => c.id === calibrationId) as CalibrationRoundDetailResponse;
    },

    getDistributionAlias: async (calibrationId: UUID) => {
        await delay(500);
        return mockDistributions[calibrationId] || {
            calibrationRoundId: calibrationId,
            published: false,
            totalScoreRows: 0,
            distributions: []
        };
    },

    createEventCalibrationRound: async (eventId: UUID, payload: CreateCalibrationRoundRequest) => {
        await delay(500);
        const newCal: CalibrationRoundDetailResponse = {
            id: `cal-${Date.now()}` as UUID,
            eventId,
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

    updateCalibrationRoundAlias: async (calibrationId: UUID, payload: UpdateCalibrationRoundRequest) => {
        await delay(500);
        mockCalibrationRounds = mockCalibrationRounds.map((cal) =>
            cal.id === calibrationId ? { ...cal, ...payload } : cal
        );
        return mockCalibrationRounds.find(c => c.id === calibrationId) as CalibrationRoundDetailResponse;
    },

    publishDistributionAlias: async (calibrationId: UUID) => {
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

    getScoreSheetAlias: async (calibrationId: UUID) => {
        await delay(500);
        return {
            calibrationRoundId: calibrationId,
            sampleSubmissionId: "sub-alpha-001" as UUID,
            criteria: [], // mock criteria
        } as any;
    },

    submitCalibrationScoreAlias: async (calibrationId: UUID, payload: any) => {
        await delay(500);
        return [];
    },

    getMyScores: async (calibrationId: UUID) => {
        await delay(500);
        return [];
    }
};