import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Button, MenuItem, TextField } from "@mui/material";
import { isAxiosError } from "axios";

import {
    CalibrationRoundForm,
    type CalibrationFormValues,
} from "@/features/calibration/components/CoordinatorCalibration/CalibrationRoundForm";
import { CalibrationRoundOverview } from "@/features/calibration/components/CoordinatorCalibration/CalibrationRoundOverview";

import {
    useCalibrationRoundQuery,
    useManagedCalibrationRoundsQuery,
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
import type { EventSummaryResponse } from "@/types/event.types";
import { CALIB } from "@/features/calibration/constants/calibrationUi";
import "@/features/calibration/components/calibration.css";

export const CalibrationRoundFormPage = () => {
    const { eventId, calibrationId } = useParams<{ eventId?: string; calibrationId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    const isEditMode = !!calibrationId && location.pathname.endsWith("/edit");
    const isViewMode = !!calibrationId && !isEditMode;
    const isCreateMode = !calibrationId;

    const { data: existingRound, isLoading: isLoadingRound } = useCalibrationRoundQuery(calibrationId as UUID);
    const { data: managedRounds } = useManagedCalibrationRoundsQuery();
    const { data: eventsData } = useCoordinatorEventsQuery();
    const events: EventSummaryResponse[] = eventsData?.content || [];

    // Create mode from the global route: the event choice is explicit, defaulting to
    // the first managed event but always visible to the user.
    const [chosenEventId, setChosenEventId] = useState<string>("");
    const effectiveEventId =
        eventId
        || existingRound?.eventId
        || chosenEventId
        || (events.length > 0 ? events[0].id : undefined);
    const showEventSelector = isCreateMode && !eventId && events.length > 0;

    const isPublishLocked = isEditMode && !!existingRound?.distributionPublishedAt;

    const createMutation = useCreateCalibrationRoundMutation();
    const updateMutation = useUpdateCalibrationRoundMutation();
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const [selectedRoundId, setSelectedRoundId] = useState<string>("");
    const submissionsRoundId = isViewMode
        ? (existingRound?.sampleRoundId as string | undefined)
        : selectedRoundId || undefined;

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

    const { data: submissions = [] } = useQuery({
        queryKey: ["round", submissionsRoundId, "submissions"],
        queryFn: () => submissionApi.getRoundSubmissions(submissionsRoundId as UUID),
        enabled: !!submissionsRoundId && !isViewMode,
    });

    const overviewRoundId = existingRound?.sampleRoundId as string | undefined;

    const applicableCriteria = useMemo(
        () => selectedRoundId
            ? criteria.filter(
                (criterion) => criterion.isActive
                    && (!criterion.appliesToRoundIds?.length
                        || criterion.appliesToRoundIds.includes(selectedRoundId as UUID))
            )
            : [],
        [criteria, selectedRoundId]
    );

    const overviewCriteria = useMemo(
        () => overviewRoundId
            ? criteria.filter(
                (criterion) => criterion.isActive
                    && (!criterion.appliesToRoundIds?.length
                        || criterion.appliesToRoundIds.includes(overviewRoundId as UUID))
            )
            : [],
        [criteria, overviewRoundId]
    );

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
                    onError: (error: unknown) => {
                        const message = isAxiosError<{ message?: string }>(error)
                            ? error.response?.data?.message
                            : undefined;
                        enqueueSnackbar(
                            message || "Failed to create calibration round",
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
                    onError: (error: unknown) => {
                        const status = isAxiosError(error) ? error.response?.status : undefined;
                        if (status === 409) {
                            enqueueSnackbar("This calibration round cannot be edited after distribution is published.", { variant: "error" });
                        } else if (status === 403) {
                            enqueueSnackbar("You do not have permission to manage calibration rounds.", { variant: "error" });
                        } else {
                            const message = isAxiosError<{ message?: string }>(error)
                                ? error.response?.data?.message
                                : undefined;
                            enqueueSnackbar(
                                message || "Failed to update calibration round",
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
            roundId: existingRound.sampleRoundId,
            description: existingRound.description || "",
            mandatory: existingRound.mandatory,
            sampleSubmissionId: existingRound.sampleSubmissionId,
            startAt: existingRound.startAt || "",
            endAt: existingRound.endAt || "",
            benchmarkScores: (existingRound.benchmarkScores as Record<string, number>) || {},
        }
        : {};

    const heroTitle = isCreateMode
        ? "Create Calibration Round"
        : isEditMode
            ? "Edit Calibration Round"
            : existingRound?.description || "Calibration Overview";
    const heroSubtitle = isCreateMode
        ? "Set up the benchmark sample judges will align on."
        : isEditMode
            ? "Adjust the sample, schedule, or benchmark scores."
            : "Everything about this calibration round at a glance.";

    return (
        <div className="mx-auto max-w-4xl space-y-7 pb-10">
            <header className="calib-fade-up" style={{ "--calib-stagger": 0 } as React.CSSProperties}>
                <Button
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 1.5, textTransform: "none", fontWeight: 800 }}
                >
                    Back
                </Button>
                <p className={CALIB.eyebrow}>Calibration</p>
                <div className="mt-1.5 flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${CALIB.gradient} ${CALIB.glow}`}>
                        <TuneOutlinedIcon sx={{ fontSize: 22 }} />
                    </span>
                    <h1 className="text-3xl font-black text-slate-950 dark:text-white">{heroTitle}</h1>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{heroSubtitle}</p>
            </header>

            {isPublishLocked && (
                <div
                    className="calib-fade-up flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    style={{ "--calib-stagger": 1 } as React.CSSProperties}
                >
                    <LockOutlinedIcon sx={{ fontSize: 20, marginTop: "1px" }} />
                    <div>
                        <p className="text-sm font-black">This round is locked</p>
                        <p className="mt-0.5 text-sm font-semibold">
                            Its distribution has been published, so the calibration can no longer be edited.
                        </p>
                    </div>
                </div>
            )}

            {isLoadingData ? (
                <div className="space-y-6">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="calib-shimmer h-40 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                    ))}
                </div>
            ) : isViewMode && existingRound ? (
                <CalibrationRoundOverview
                    round={existingRound}
                    listRound={managedRounds?.find((r) => r.id === existingRound.id)}
                    criteria={overviewCriteria}
                    rounds={rounds}
                />
            ) : (
                <div className="space-y-6">
                    {showEventSelector && (
                        <section
                            className="calib-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                            style={{ "--calib-stagger": 1 } as React.CSSProperties}
                        >
                            <TextField
                                select
                                label="Event"
                                fullWidth
                                value={effectiveEventId || ""}
                                onChange={(e) => {
                                    setChosenEventId(e.target.value);
                                    setSelectedRoundId("");
                                }}
                                helperText="The hackathon event this calibration round belongs to."
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            >
                                {events.map((event) => (
                                    <MenuItem key={event.id} value={event.id}>
                                        {event.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </section>
                    )}
                    <CalibrationRoundForm
                        key={`${effectiveEventId}-${existingRound?.id ?? "new"}`}
                        initialValues={initialValues}
                        criteria={applicableCriteria}
                        rounds={rounds}
                        submissions={submissions}
                        onRoundChange={setSelectedRoundId}
                        onSubmit={handleSubmit}
                        isLoading={isSaving}
                        isReadOnly={isPublishLocked}
                    />
                </div>
            )}
        </div>
    );
};
