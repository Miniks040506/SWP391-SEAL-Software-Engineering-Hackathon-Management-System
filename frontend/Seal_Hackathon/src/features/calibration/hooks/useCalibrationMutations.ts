import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calibrationApi } from "@/api/calibration.api";
import { calibrationQueryKeys } from "./useCalibrationQueries";
import type { UUID } from "@/types/common.types";
import type { SubmitCalibrationScoreRequest } from "@/types/calibration.types";
import { useSnackbar } from "notistack";

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
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (calibrationId: UUID) =>
            calibrationApi.publishDistributionAlias(calibrationId),
        onSuccess: (_, calibrationId) => {
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.detail(calibrationId),
            });
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.distribution(calibrationId),
            });
            queryClient.invalidateQueries({
                queryKey: calibrationQueryKeys.lists(),
            });
            enqueueSnackbar("Distribution published successfully", { variant: "success" });
        },
        onError: (error: any) => {
            console.error("Failed to publish distribution:", error);
            enqueueSnackbar(
                error?.response?.data?.message || "Failed to publish distribution",
                { variant: "error" }
            );
        },
    });
};

export const useSubmitCalibrationScoresMutation = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: ({ calibrationId, payload }: { calibrationId: UUID; payload: SubmitCalibrationScoreRequest }) =>
            calibrationApi.submitCalibrationScoreAlias(calibrationId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: calibrationQueryKeys.detail(variables.calibrationId) });
            queryClient.invalidateQueries({ queryKey: calibrationQueryKeys.scoreSheet(variables.calibrationId) });
            queryClient.invalidateQueries({ queryKey: calibrationQueryKeys.myScores(variables.calibrationId) });
            queryClient.invalidateQueries({ queryKey: calibrationQueryKeys.myList() });
            enqueueSnackbar("Scores submitted successfully", { variant: "success" });
        },
        onError: (error: any) => {
            console.error("Failed to submit calibration scores:", error);
            enqueueSnackbar(
                error?.response?.data?.message || "Failed to submit calibration scores",
                { variant: "error" }
            );
        },
    });
};
