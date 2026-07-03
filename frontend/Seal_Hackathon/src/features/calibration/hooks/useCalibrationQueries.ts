import { useQuery } from "@tanstack/react-query";
import { calibrationApi } from "@/api/calibration.api";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";
import type {
    CalibrationDistributionResponse,
    CalibrationRoundDetailResponse,
    CalibrationRoundResponse,
    CalibrationScoreResponse,
    CalibrationScoreSheetResponse,
} from "@/types/calibration.types";

export const calibrationQueryKeys = {
    all: ["calibrations"] as const,
    lists: () => [...calibrationQueryKeys.all, "list"] as const,
    myList: () => [...calibrationQueryKeys.lists(), "mine"] as const,
    managedList: () => [...calibrationQueryKeys.lists(), "managed"] as const,
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

export const useJudgeCalibrationRoundsQuery = () => {
    return useQuery<CalibrationRoundResponse[]>({
        queryKey: calibrationQueryKeys.myList(),
        queryFn: () => calibrationApi.getMyCalibrationRounds(),
    });
};

export const useManagedCalibrationRoundsQuery = () => {
    return useQuery<CalibrationRoundResponse[]>({
        queryKey: calibrationQueryKeys.managedList(),
        queryFn: () => calibrationApi.getManagedCalibrationRounds(),
    });
};

export const useEventCalibrationRoundsQuery = (eventId?: UUID) => {
    return useQuery<CalibrationRoundResponse[]>({
        queryKey: calibrationQueryKeys.listByEvent(eventId!),
        queryFn: () => calibrationApi.getEventCalibrationRounds(eventId!),
        enabled: !!eventId,
    });
};

export const useCalibrationRoundQuery = (calibrationId?: UUID) => {
    return useQuery<CalibrationRoundDetailResponse>({
        queryKey: calibrationQueryKeys.detail(calibrationId!),
        queryFn: () => calibrationApi.getCalibrationRoundAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useCalibrationDistributionQuery = (calibrationId?: UUID) => {
    return useQuery<CalibrationDistributionResponse>({
        queryKey: calibrationQueryKeys.distribution(calibrationId!),
        queryFn: () => calibrationApi.getDistributionAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useCalibrationScoreSheetQuery = (calibrationId?: UUID) => {
    return useQuery<CalibrationScoreSheetResponse>({
        queryKey: calibrationQueryKeys.scoreSheet(calibrationId!),
        queryFn: () => calibrationApi.getScoreSheetAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useMyCalibrationScoresQuery = (calibrationId?: UUID) => {
    return useQuery<CalibrationScoreResponse[]>({
        queryKey: calibrationQueryKeys.myScores(calibrationId!),
        queryFn: () => calibrationApi.getMyScores(calibrationId!),
        enabled: !!calibrationId,
    });
};

export const useCalibrationSubmissionQuery = (submissionId?: UUID) => {
    return useQuery({
        queryKey: ["submission", submissionId],
        queryFn: () => submissionApi.getSubmissionById(submissionId!),
        enabled: !!submissionId,
    });
};
