import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress, Button, Chip } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import {
    useCalibrationScoreSheetQuery,
    useMyCalibrationScoresQuery,
    useCalibrationRoundQuery,
    useCalibrationSubmissionQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import { useSubmitCalibrationScoresMutation } from "@/features/calibration/hooks/useCalibrationMutations";

import { CalibrationSubmissionPreview } from "../components/CalibrationSubmissionPreview";
import { CalibrationScoreSheet } from "../components/CalibrationScoreSheet";
import { CalibrationSubmitBar, type CalibrationStatusType } from "../components/CalibrationSubmitBar";
import type { UUID } from "@/types/common.types";

type ScoreFormValues = {
    scores: Record<string, {
        score: number | "";
        comment: string;
    }>;
};

export const JudgeCalibrationScorePage = () => {
    const { calibrationId } = useParams<{ calibrationId: string }>();
    const navigate = useNavigate();

    // Queries
    const { data: scoreSheet, isLoading: isLoadingScoreSheet } = useCalibrationScoreSheetQuery(calibrationId as UUID);
    const { data: myScores = [], isLoading: isLoadingMyScores } = useMyCalibrationScoresQuery(calibrationId as UUID);
    const { data: round, isLoading: isLoadingRound } = useCalibrationRoundQuery(calibrationId as UUID);

    const submissionId = scoreSheet?.sampleSubmissionId;
    const { data: submission, isLoading: isLoadingSubmission } = useCalibrationSubmissionQuery(submissionId as UUID);

    const submitMutation = useSubmitCalibrationScoresMutation();

    // Determine status
    const now = new Date();
    const start = round?.startAt ? new Date(round.startAt) : null;
    const end = round?.endAt ? new Date(round.endAt) : null;
    const isSubmitted = myScores.length > 0;
    const isPublished = !!round?.distributionPublishedAt;

    let status: CalibrationStatusType = "OPEN";
    if (isPublished) {
        status = "DISTRIBUTION_PUBLISHED";
    } else if (isSubmitted) {
        status = "SUBMITTED";
    } else if (start && now < start) {
        status = "UPCOMING";
    } else if (end && now > end) {
        status = "CLOSED";
    }

    const isReadOnly = status !== "OPEN";

    // Form setup
    const defaultValues = useMemo(() => {
        const initialScores: Record<string, any> = {};
        if (scoreSheet?.criteria) {
            scoreSheet.criteria.forEach((c: any) => {
                const existing = myScores.find((s) => s.eventCriteriaId === c.id);
                initialScores[c.id] = {
                    score: existing ? existing.value : "",
                    comment: (existing as any)?.comment || "",
                };
            });
        }
        return { scores: initialScores };
    }, [scoreSheet?.criteria, myScores]);

    const methods = useForm<ScoreFormValues>({
        defaultValues,
        mode: "onBlur",
    });

    // Reset form when myScores load (if there's existing data)
    useEffect(() => {
        if (myScores.length > 0 && scoreSheet?.criteria) {
            methods.reset(defaultValues);
        }
    }, [myScores, scoreSheet?.criteria, methods, defaultValues]);

    const onSubmit = (values: ScoreFormValues) => {
        // Validation: ensure all scores are filled
        const scoresArray = Object.entries(values.scores).map(([criteriaId, data]) => ({
            eventCriteriaId: criteriaId as UUID,
            value: Number(data.score),
            comment: data.comment,
        }));

        submitMutation.mutate({
            calibrationId: calibrationId as UUID,
            payload: { scores: scoresArray },
        });
    };

    const handleViewDistribution = () => {
        navigate(`/judge/calibrations/${calibrationId}/distribution`);
    };

    const isLoadingData = isLoadingScoreSheet || isLoadingMyScores || isLoadingRound;

    if (isLoadingData) {
        return (
            <div className="flex justify-center py-20">
                <CircularProgress />
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-7 pb-10 pt-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Button
                            startIcon={<ArrowBackOutlinedIcon />}
                            onClick={() => navigate("/judge/calibrations")}
                            sx={{ mb: 2, textTransform: "none", fontWeight: 800 }}
                        >
                            Back to Tasks
                        </Button>
                        <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                            Calibration Scoring
                        </h1>
                        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {round?.description || "Evaluate the sample submission to calibrate your scoring baseline."}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {round?.mandatory && (
                            <Chip
                                label="Mandatory Task"
                                color="error"
                                size="small"
                                sx={{ fontWeight: 800, borderRadius: "6px" }}
                            />
                        )}
                        {status === "OPEN" && end && (
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                Closes in {formatDistanceToNow(end)}
                            </span>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    {/* Left Column: Submission Preview */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-6">
                            <CalibrationSubmissionPreview
                                submission={submission}
                                isLoading={isLoadingSubmission}
                            />
                        </div>
                    </div>

                    {/* Right Column: Scoring Area */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <CalibrationScoreSheet
                            criteria={scoreSheet?.criteria || []}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>
            </div>

            <CalibrationSubmitBar
                status={status}
                isSubmitting={submitMutation.isPending}
                onSubmit={methods.handleSubmit(onSubmit)}
                onViewDistribution={handleViewDistribution}
            />
        </FormProvider>
    );
};
