import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button, CircularProgress } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

import type { UUID } from "@/types/common.types";
import {
    useEventCalibrationRoundsQuery,
    useManagedCalibrationRoundsQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import {
    usePublishCalibrationDistributionMutation,
} from "@/features/calibration/hooks/useCalibrationMutations";
import { CalibrationRoundTable } from "@/features/calibration/components/CoordinatorCalibration/CalibrationRoundTable";

export const CoordinatorCalibrationPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const eventQuery = useEventCalibrationRoundsQuery(eventId as UUID);
    const allQuery = useManagedCalibrationRoundsQuery();

    const {
        data: calibrationRounds,
        isLoading,
        isError,
    } = eventId ? eventQuery : allQuery;

    const publishMutation = usePublishCalibrationDistributionMutation();
    const [publishingId, setPublishingId] = useState<string | null>(null);

    const handlePublish = async (id: string) => {
        if (!window.confirm("Are you sure you want to publish the distribution? This action cannot be undone and will prevent further edits.")) {
            return;
        }

        setPublishingId(id);
        publishMutation.mutate(id as UUID, {
            onSuccess: () => {
                enqueueSnackbar("Distribution published successfully", { variant: "success" });
            },
            onError: (error: any) => {
                enqueueSnackbar(
                    error?.response?.data?.message || "Failed to publish distribution",
                    { variant: "error" }
                );
            },
            onSettled: () => {
                setPublishingId(null);
            },
        });
    };

    const totalRounds = calibrationRounds?.length || 0;
    const openRounds = calibrationRounds?.filter((r) => !r.distributionPublishedAt).length || 0;
    const publishedDistributions = calibrationRounds?.filter((r) => r.distributionPublishedAt).length || 0;
    const pendingJudgeSubmissions = calibrationRounds?.reduce(
        (total, round) => total + round.pendingJudgeCount,
        0,
    ) || 0;

    return (
        <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-7">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    {eventId && (
                        <Button
                            startIcon={<ArrowBackOutlinedIcon />}
                            onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
                            sx={{ mb: 1, textTransform: "none", fontWeight: 800 }}
                        >
                            Back to Event
                        </Button>
                    )}
                    <h1 className="flex items-center gap-3 text-3xl font-black text-slate-950 dark:text-white">
                        Calibration Rounds
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                        Setup benchmark scoring before real judging.
                    </p>
                </div>
                {eventId ? (
                    <div className="flex gap-2">
                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => navigate(`/coordinator/events/${eventId}/calibrations/create`)}
                            sx={{
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 900,
                                bgcolor: "#059669",
                                "&:hover": { bgcolor: "#047857" },
                                height: 48,
                            }}
                        >
                            Create Calibration Round
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => navigate(`/coordinator/calibrations/create`)}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 900,
                            bgcolor: "#059669",
                            "&:hover": { bgcolor: "#047857" },
                            height: 48,
                        }}
                    >
                        Create Calibration Round
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Rounds</p>
                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalRounds}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Open</p>
                    <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">{openRounds}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Published</p>
                    <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{publishedDistributions}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Pending Submissions</p>
                    <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingJudgeSubmissions}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
                    All Calibration Rounds
                </h2>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <CircularProgress />
                    </div>
                ) : isError ? (
                    <div className="py-12 text-center font-medium text-rose-500">
                        Failed to load calibration rounds. Please try again.
                    </div>
                ) : (
                    <CalibrationRoundTable
                        rounds={calibrationRounds || []}
                        onPublish={handlePublish}
                        isPublishing={publishingId}
                    />
                )}
            </div>
        </div>
    );
};
