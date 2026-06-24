import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, CircularProgress, MenuItem, TextField } from "@mui/material";

import {
    CalibrationRoundForm,
    type CalibrationFormValues,
} from "@/features/calibration/components/CoordinatorCalibration/CalibrationRoundForm";

import {
    useCalibrationRoundQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import {
    useCreateCalibrationRoundMutation,
    useUpdateCalibrationRoundMutation,
} from "@/features/calibration/hooks/useCalibrationMutations";

import { useCoordinatorEventsQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";

import { criteriaApi } from "@/api/criteria.api";
import { roundApi } from "@/api/round.api";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";

export const CalibrationRoundFormPage = () => {
    const { eventId, calibrationId } = useParams<{ eventId?: string; calibrationId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    const isEditMode = !!calibrationId && location.pathname.endsWith("/edit");
    const isViewMode = !!calibrationId && !isEditMode;
    const isCreateMode = !calibrationId;

    const { data: existingRound, isLoading: isLoadingRound } = useCalibrationRoundQuery(calibrationId as UUID);
    const { data: eventsData, isLoading: isLoadingEvents } = useCoordinatorEventsQuery();
    const events = eventsData?.items || [];

    const [selectedEventId, setSelectedEventId] = useState<string>("");

    // Auto select event logic
    const autoSelectedEventId = events.length > 0 ? events[0].id : undefined;
    const effectiveEventId = eventId || existingRound?.eventId || selectedEventId || autoSelectedEventId;

    const createMutation = useCreateCalibrationRoundMutation();
    const updateMutation = useUpdateCalibrationRoundMutation();
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const [selectedRoundId, setSelectedRoundId] = useState<string>("");

    const { data: criteria = [], isLoading: isLoadingCriteria } = useQuery({
        queryKey: ["event", effectiveEventId, "criteria"],
        queryFn: () => criteriaApi.getEventCriteria(effectiveEventId as UUID),
        enabled: !!effectiveEventId,
    });

    const { data: rounds = [], isLoading: isLoadingRounds } = useQuery({
        queryKey: ["event", effectiveEventId, "rounds"],
        queryFn: () => roundApi.getRoundsByEvent(effectiveEventId as UUID),
        enabled: !!effectiveEventId,
    });

    const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ["round", selectedRoundId, "submissions"],
        queryFn: () => submissionApi.getRoundSubmissions(selectedRoundId as UUID),
        enabled: !!selectedRoundId,
    });

    const handleSubmit = (values: CalibrationFormValues) => {
        if (isCreateMode && effectiveEventId) {
            createMutation.mutate(
                {
                    eventId: effectiveEventId as UUID,
                    payload: {
                        sampleSubmissionId: values.sampleSubmissionId as UUID,
                        benchmarkScores: values.benchmarkScores,
                        description: values.description,
                        startAt: values.startAt ? new Date(values.startAt).toISOString() : undefined,
                        endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
                        mandatory: values.mandatory,
                    },
                },
                {
                    onSuccess: () => {
                        enqueueSnackbar("Calibration round created successfully", { variant: "success" });
                        navigate(`/coordinator/events/${effectiveEventId}/calibrations`);
                    },
                    onError: (error: any) => {
                        enqueueSnackbar(
                            error?.response?.data?.message || "Failed to create calibration round",
                            { variant: "error" }
                        );
                    },
                }
            );
        } else if (isEditMode && calibrationId) {
            if (existingRound?.distributionPublishedAt) {
                enqueueSnackbar("Cannot edit a calibration round after its distribution is published.", { variant: "error" });
                return;
            }

            updateMutation.mutate(
                {
                    calibrationId: calibrationId as UUID,
                    payload: {
                        sampleSubmissionId: values.sampleSubmissionId as UUID,
                        benchmarkScores: values.benchmarkScores,
                        description: values.description,
                        startAt: values.startAt ? new Date(values.startAt).toISOString() : undefined,
                        endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
                        mandatory: values.mandatory,
                    },
                },
                {
                    onSuccess: () => {
                        enqueueSnackbar("Calibration round updated successfully", { variant: "success" });
                        if (effectiveEventId) {
                            navigate(`/coordinator/events/${effectiveEventId}/calibrations`);
                        } else {
                            navigate(`/coordinator/calibrations/${calibrationId}`);
                        }
                    },
                    onError: (error: any) => {
                        if (error?.response?.status === 409) {
                            enqueueSnackbar("This calibration round cannot be edited after distribution is published.", { variant: "error" });
                        } else if (error?.response?.status === 403) {
                            enqueueSnackbar("You do not have permission to manage calibration rounds.", { variant: "error" });
                        } else {
                            enqueueSnackbar(
                                error?.response?.data?.message || "Failed to update calibration round",
                                { variant: "error" }
                            );
                        }
                    },
                }
            );
        }
    };

    const isLoadingData = isLoadingCriteria || isLoadingRounds || (!!calibrationId && isLoadingRound);

    if (calibrationId && !isLoadingRound && !existingRound) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2 className="mb-2 text-xl font-semibold">Not Found</h2>
                <p>Calibration round not found.</p>
                <Button
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => navigate(-1)}
                    variant="contained"
                    sx={{ mt: 4, borderRadius: "10px", textTransform: "none", fontWeight: 800 }}
                >
                    Go Back
                </Button>
            </div>
        );
    }

    const initialValues: Partial<CalibrationFormValues> = existingRound
        ? {
            description: existingRound.description || "",
            mandatory: existingRound.mandatory,
            sampleSubmissionId: existingRound.sampleSubmissionId,
            startAt: existingRound.startAt || "",
            endAt: existingRound.endAt || "",
            benchmarkScores: (existingRound as any).benchmarkScores || {},
        }
        : {};

    return (
        <div className="mx-auto max-w-4xl animate-in fade-in duration-500 space-y-7 pb-20">
            <header>
                <Button
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2, textTransform: "none", fontWeight: 800 }}
                >
                    Back
                </Button>
                <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                    {isCreateMode ? "Create Calibration Round" : isEditMode ? "Edit Calibration Round" : "View Calibration Round"}
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {isCreateMode && "Set up a new calibration benchmark."}
                    {isEditMode && "Modify existing calibration settings."}
                    {isViewMode && "Review calibration details."}
                </p>
            </header>

            {isLoadingData ? (
                <div className="flex justify-center py-20">
                    <CircularProgress />
                </div>
            ) : (
                <div className="space-y-6">
                    <CalibrationRoundForm
                        initialValues={initialValues}
                        criteria={criteria}
                        rounds={rounds}
                        submissions={submissions}
                        onRoundChange={setSelectedRoundId}
                        onSubmit={handleSubmit}
                        isLoading={isSaving}
                        isReadOnly={isViewMode}
                    />
                </div>
            )}
        </div>
    );
};