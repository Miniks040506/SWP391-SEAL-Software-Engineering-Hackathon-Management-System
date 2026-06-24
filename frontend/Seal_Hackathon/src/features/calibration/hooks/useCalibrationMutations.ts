import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calibrationApi } from "@/api/calibration.api";
import { calibrationQueryKeys } from "./useCalibrationQueries";
import type { UUID } from "@/types/common.types";


export const useCreateCalibrationRoundMutation = () => {
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: ({
            eventId,
            payload,
        }: {
            eventId: UUID;
            payload: Parameters<typeof calibrationApi.createEventCalibrationRound>[1];
        }) => calibrationApi.createEventCalibrationRound(eventId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.listByEvent(variables.eventId),
            });
        },
    });
};


export const useUpdateCalibrationRoundMutation = () => {
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: ({
            calibrationId,
            payload,
        }: {
            calibrationId: UUID;
            payload: Parameters<typeof calibrationApi.updateCalibrationRoundAlias>[1];
        }) => calibrationApi.updateCalibrationRoundAlias(calibrationId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.detail(variables.calibrationId),
            });
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.listByEvent(data.eventId),
            });
        },
    });
};


export const usePublishCalibrationDistributionMutation = () => {
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: (calibrationId: UUID) =>
            calibrationApi.publishDistributionAlias(calibrationId),
        onSuccess: (data, calibrationId) => {
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.detail(calibrationId),
            });
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.distribution(calibrationId),
            });
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.listByEvent(data.eventId),
            });
        },
    });
};



