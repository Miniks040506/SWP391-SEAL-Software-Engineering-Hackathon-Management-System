import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Alert, CircularProgress, Button, Chip } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";

import { useCalibrationDistributionQuery } from "@/features/calibration/hooks/useCalibrationQueries";
import { usePublishCalibrationDistributionMutation } from "@/features/calibration/hooks/useCalibrationMutations";
import { CalibrationDistributionChart } from "../components/CalibrationChart/CalibrationDistributionChart";
import { CalibrationDistributionTable } from "../components/CalibrationChart/CalibrationDistributionTable";
import { CriterionVarianceCard } from "../components/CalibrationChart/CriterionVarianceCard";
import { PublishDistributionDialog } from "../components/CoordinatorCalibration/PublishDistributionDialog";
import type { UUID } from "@/types/common.types";
import type { CriterionDistributionResponse } from "@/types/calibration.types";

export const CalibrationDistributionPage = () => {
    const { calibrationId } = useParams<{ calibrationId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isCoordinator = location.pathname.startsWith("/coordinator");
    const backPath = isCoordinator ? `/coordinator/calibrations` : `/judge/calibrations`;

    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    const { data: distribution, isLoading, isError } = useCalibrationDistributionQuery(calibrationId as UUID);
    const publishMutation = usePublishCalibrationDistributionMutation();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <CircularProgress />
            </div>
        );
    }

    const isPublished = distribution?.published;

    if (isCoordinator && isError) {
        return (
            <div className="mx-auto max-w-4xl py-20 px-6">
                <Button
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => navigate(backPath)}
                    sx={{ mb: 4, textTransform: "none", fontWeight: 800 }}
                >
                    Back
                </Button>
                <Alert severity="error">
                    Failed to load calibration distribution. Please try again.
                </Alert>
            </div>
        );
    }

    // If Judge and not published, show locked state
    if (!isCoordinator && !isPublished) {
        return (
            <div className="mx-auto max-w-4xl animate-in fade-in duration-500 py-20 px-6">
                <Button
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => navigate(backPath)}
                    sx={{ mb: 4, textTransform: "none", fontWeight: 800 }}
                >
                    Back to Tasks
                </Button>
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        <LockOutlinedIcon fontSize="large" />
                    </div>
                    <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                        Distribution Locked
                    </h2>
                    <p className="max-w-md text-base font-medium text-slate-500 dark:text-slate-400">
                        Distribution will be available after coordinator publishes it.
                    </p>
                </div>
            </div>
        );
    }

    const criteriaData: CriterionDistributionResponse[] = distribution?.distributions ?? [];
    const judgeCount = criteriaData.reduce(
        (maximum: number, criterion: CriterionDistributionResponse) =>
            Math.max(maximum, criterion.judgeCount),
        0,
    );
    const criteriaCount = criteriaData.length;
    const distributionGroups = [
        {
            title: "Technical criteria",
            data: criteriaData.filter(
                (criterion: CriterionDistributionResponse) => criterion.technical === true,
            ),
        },
        {
            title: "Soft-skill criteria",
            data: criteriaData.filter(
                (criterion: CriterionDistributionResponse) => criterion.technical === false,
            ),
        },
        {
            title: "Other criteria",
            data: criteriaData.filter(
                (criterion: CriterionDistributionResponse) => criterion.technical == null,
            ),
        },
    ].filter((group) => group.data.length > 0);

    // Compute stats
    let highestVarianceCriterion = "N/A";
    let maxVariance = -1;
    let totalStdDev = 0;
    let validStdDevCount = 0;

    criteriaData.forEach((c: CriterionDistributionResponse) => {
        const stdDev = c.standardDeviation;
        if (stdDev !== null && stdDev !== undefined) {
            totalStdDev += stdDev;
            validStdDevCount += 1;
            if (stdDev > maxVariance) {
                maxVariance = stdDev;
                highestVarianceCriterion = c.criteriaName;
            }
        }
    });

    const averageStdDev = validStdDevCount > 0 ? (totalStdDev / validStdDevCount).toFixed(2) : "N/A";

    const handlePublishConfirm = () => {
        publishMutation.mutate(calibrationId as UUID, {
            onSuccess: () => {
                setPublishDialogOpen(false);
            }
        });
    };

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-8 pb-32 pt-6">
            {/* Header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-6 xl:px-0">
                <div>
                    <Button
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate(backPath)}
                        sx={{ mb: 2, textTransform: "none", fontWeight: 800 }}
                    >
                        Back
                    </Button>
                    <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                        Calibration Distribution
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Review the score variance and benchmark consistency.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    {isPublished ? (
                        <Chip
                            label="Published"
                            color="info"
                            icon={<PublicOutlinedIcon />}
                            sx={{ fontWeight: 800, borderRadius: "8px", pl: 0.5 }}
                        />
                    ) : (
                        <Chip
                            label="Not published"
                            color="warning"
                            icon={<LockOutlinedIcon />}
                            sx={{ fontWeight: 800, borderRadius: "8px", pl: 0.5 }}
                        />
                    )}

                    {isCoordinator && !isPublished && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PublicOutlinedIcon />}
                            onClick={() => setPublishDialogOpen(true)}
                            sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none" }}
                        >
                            Publish Distribution
                        </Button>
                    )}
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 px-6 xl:px-0">
                <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Judges</span>
                    <span className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{judgeCount}</span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Criteria</span>
                    <span className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{criteriaCount}</span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</span>
                    <span className={`mt-1 text-lg font-black ${isPublished ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {isPublished ? "Published" : "Draft"}
                    </span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Highest Variance</span>
                    <span className="mt-1 truncate text-lg font-black text-slate-900 dark:text-white" title={highestVarianceCriterion}>
                        {highestVarianceCriterion}
                    </span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-4 lg:col-span-1 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Std Dev</span>
                    <span className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{averageStdDev}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-12 px-6 xl:px-0">
                {distributionGroups.length === 0 && (
                    <Alert severity="info">
                        No calibration score data is available for this distribution yet.
                    </Alert>
                )}

                {distributionGroups.map((group) => (
                    <section key={group.title} className="grid grid-cols-1 gap-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                {group.title}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                Benchmark comparison and scoring variance for this criterion group.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Benchmark vs Judge Mean</h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Comparison of the benchmark scores with the average judge scores.
                                    </p>
                                </div>
                                <CalibrationDistributionChart data={group.data} />
                            </div>
                            <div className="lg:col-span-4">
                                <CriterionVarianceCard data={group.data} />
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Distribution Details</h3>
                            </div>
                            <CalibrationDistributionTable data={group.data} />
                        </div>
                    </section>
                ))}
            </div>

            <PublishDistributionDialog
                open={publishDialogOpen}
                isPublishing={publishMutation.isPending}
                onClose={() => setPublishDialogOpen(false)}
                onConfirm={handlePublishConfirm}
            />
        </div>
    );
};
