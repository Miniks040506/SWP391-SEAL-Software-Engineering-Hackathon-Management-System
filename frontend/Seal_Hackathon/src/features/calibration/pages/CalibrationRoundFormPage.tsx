import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";


import {
    CalibrationRoundForm,
    type CalibrationFormValues,
} from "@/features/calibration/components/CalibrationRoundForm";


import {
    useCalibrationRoundQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import {
    useCreateCalibrationRoundMutation,
    useUpdateCalibrationRoundMutation,
} from "@/features/calibration/hooks/useCalibrationMutations";


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


    // For edit/view modes, we might need eventId if it's not in the URL
    // but if it's not in URL, we can get it from the fetched calibration round.
    const { data: existingRound, isLoading: isLoadingRound } = useCalibrationRoundQuery(calibrationId);
    const effectiveEventId = eventId || existingRound?.eventId;


    const createMutation = useCreateCalibrationRoundMutation();
    const updateMutation = useUpdateCalibrationRoundMutation();
    const isSaving = createMutation.isPending || updateMutation.isPending;


    const [selectedRoundId, setSelectedRoundId] = useState<string>("");


    useEffect(() => {
        if (existingRound) {
        }
    }, [existingRound]);


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
                    eventId: effectiveEventId,
                    payload: {
                        sampleSubmissionId: values.sampleSubmissionId,
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
                    calibrationId,
                    payload: {
                        sampleSubmissionId: values.sampleSubmissionId,
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
                <h2 className="text-xl font-semibold mb-2">Not Found</h2>
                <p>Calibration round not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go Back
                </button>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {isCreateMode ? "Create Calibration Round" : isEditMode ? "Edit Calibration Round" : "View Calibration Round"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isCreateMode && "Set up a new calibration benchmark."}
                        {isEditMode && "Modify existing calibration settings."}
                        {isViewMode && "Review calibration details."}
                    </p>
                </div>
                {effectiveEventId && (
                    <button
                        onClick={() => navigate(`/coordinator/events/${effectiveEventId}/calibrations`)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Back to List
                    </button>
                )}
            </div>


            {isLoadingData ? (
                <div className="py-12 flex justify-center items-center">
                    <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></span>
                </div>
            ) : (
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
            )}
        </div>
    );
};



