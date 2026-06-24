import { useQuery } from "@tanstack/react-query";
import { calibrationApi } from "@/api/calibration.api";
import type { UUID } from "@/types/common.types";


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


export const useEventCalibrationRoundsQuery = (eventId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.listByEvent(eventId!),
        queryFn: () => calibrationApi.getEventCalibrationRounds(eventId!),
        enabled: !!eventId,
    });
};


export const useCalibrationRoundQuery = (calibrationId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.detail(calibrationId!),
        queryFn: () => calibrationApi.getCalibrationRoundAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};


export const useCalibrationDistributionQuery = (calibrationId?: UUID) => {
    return useQuery({
        queryKey: calibrationQueryKeys.distribution(calibrationId!),
        queryFn: () => calibrationApi.getDistributionAlias(calibrationId!),
        enabled: !!calibrationId,
    });
};



