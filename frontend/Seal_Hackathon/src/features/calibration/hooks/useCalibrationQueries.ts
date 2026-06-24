import { useQuery } from "@tanstack/react-query";
import { calibrationApi } from "@/api/calibration.api";
import type { UUID } from "@/types/common.types";
import { mockCalibrationService } from "../mocks/calibration.mock"; // <-- Thêm import

const USE_MOCK = true;

export const calibrationQueryKeys = {
    all: ["calibrations"] as const,
    lists: () => [...calibrationQueryKeys.all, "list"] as const,
    listByEvent: (eventId: UUID) =>
        [...calibrationQueryKeys.lists(), { eventId }] as const,
    details: () => [...calibrationQueryKeys.all, "detail"] as const,
    detail: (id: UUID) => [...calibrationQueryKeys.details(), id] as const,
    distributions: () => [...calibrationQueryKeys.all, "distribution"] as const,
    distribution: (id: UUID) => [...calibrationQueryKeys.distributions(), id] as const,
};

export const useAllCalibrationRoundsQuery = () => {
    return useQuery({
        queryKey: calibrationQueryKeys.lists(),
        queryFn: () => USE_MOCK
            ? mockCalibrationService.getAllCalibrationRounds()
            : calibrationApi.getAllCalibrationRounds(),
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