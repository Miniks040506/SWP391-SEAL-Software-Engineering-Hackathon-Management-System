import { useQuery } from "@tanstack/react-query";
import { calibrationApi } from "@/api/calibration.api";
import type { UUID } from "@/types/common.types";
import { mockCalibrationService } from "../mocks/calibration.mock"; // <-- Thêm import

const USE_MOCK = false;

export const calibrationQueryKeys = {
    all: ["calibrations"] as const,
    lists: () => [...calibrationQueryKeys.all, "list"] as const,
    myList: () => [...calibrationQueryKeys.lists(), "mine"] as const,
    listByEvent: (eventId: UUID) =>
        [...calibrationQueryKeys.lists(), { eventId }] as const,
    details: () => [...calibrationQueryKeys.all, "detail"] as const,
    detail: (id: UUID) => [...calibrationQueryKeys.details(), id] as const,
    distributions: () => [...calibrationQueryKeys.all, "distribution"] as const,
    distribution: (id: UUID) => [...calibrationQueryKeys.distributions(), id] as const,
    scoreSheets: () => [...calibrationQueryKeys.all, "scoreSheet"] as const,
    scoreSheet: (id: UUID) => [...calibrationQueryKeys.scoreSheets(), id] as const,
    myScores: (id: UUID) => [...calibrationQueryKeys.all, "myScores", id] as const,
};

export const useAllCalibrationRoundsQuery = () => {
    return useQuery({
        queryKey: calibrationQueryKeys.myList(),
        queryFn: () => calibrationApi.getMyCalibrationRounds(),
    });
};

export const useEventCalibrationRoundsQuery = (eventId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.listByEvent(eventId!),
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getEventCalibrationRounds(eventId!)
            : calibrationApi.getEventCalibrationRounds(eventId!),
        enabled: !!eventId,
    });
};

export const useCalibrationRoundQuery = (calibrationId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.detail(calibrationId!),
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getCalibrationRoundAlias(calibrationId!)
            : calibrationApi.getCalibrationRoundAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useCalibrationDistributionQuery = (calibrationId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.distribution(calibrationId!),
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getDistributionAlias(calibrationId!)
            : calibrationApi.getDistributionAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useCalibrationScoreSheetQuery = (calibrationId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.scoreSheet(calibrationId!),
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getScoreSheetAlias(calibrationId!)
            : calibrationApi.getScoreSheetAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useMyCalibrationScoresQuery = (calibrationId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.myScores(calibrationId!),
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getMyScores(calibrationId!)
            : calibrationApi.getMyScores(calibrationId!),
        enabled: !!calibrationId,
    });
};

import { submissionApi } from "@/api/submission.api";

export const useCalibrationSubmissionQuery = (submissionId?: UUID) => {
    return useQuery({
        queryKey: ["submission", submissionId],
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getSubmissionAlias(submissionId!)
            : submissionApi.getSubmissionById(submissionId!),
        enabled: !!submissionId,
    });
};
