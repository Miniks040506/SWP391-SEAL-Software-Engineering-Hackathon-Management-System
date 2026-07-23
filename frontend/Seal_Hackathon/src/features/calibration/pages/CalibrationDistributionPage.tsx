import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Alert, Button } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

import {
    useCalibrationDistributionQuery,
    useCalibrationRoundQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import { usePublishCalibrationDistributionMutation } from "@/features/calibration/hooks/useCalibrationMutations";
import { CalibrationDistributionChart } from "../components/CalibrationChart/CalibrationDistributionChart";
import { CalibrationDistributionTable } from "../components/CalibrationChart/CalibrationDistributionTable";
import { CriterionVarianceCard } from "../components/CalibrationChart/CriterionVarianceCard";
import { PublishDistributionDialog } from "../components/CoordinatorCalibration/PublishDistributionDialog";
import { CALIB, VARIANCE_TIER_CONFIG } from "../constants/calibrationUi";
import { formatDateRange, formatScore, getVarianceTier } from "../utils/format";
import type { UUID } from "@/types/common.types";
import type { CriterionDistributionResponse } from "@/types/calibration.types";
import "../components/calibration.css";

export const CalibrationDistributionPage = () => {
    const { calibrationId } = useParams<{ calibrationId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isCoordinator = location.pathname.startsWith("/coordinator");
    const backPath = isCoordinator ? `/coordinator/calibrations` : `/judge/calibrations`;

    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    const { data: distribution, isLoading, isError } = useCalibrationDistributionQuery(calibrationId as UUID);
    const { data: roundDetail } = useCalibrationRoundQuery(
        isCoordinator ? (calibrationId as UUID) : undefined,
    );
    const publishMutation = usePublishCalibrationDistributionMutation();

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6 pt-6">
                <div className="calib-shimmer h-24 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="calib-shimmer h-24 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
                    ))}
                </div>
                <div className="calib-shimmer h-80 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
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

    // Aggregate stats: highest variance criterion + average std dev + largest benchmark drift.
    let highestVarianceCriterion = "N/A";
    let maxVariance = -1;
    let totalStdDev = 0;
    let validStdDevCount = 0;
    let maxDriftCriterion: string | null = null;
    let maxDrift = 0;

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
        if (c.mean != null && c.benchmarkScore != null) {
            const drift = c.mean - c.benchmarkScore;
            if (Math.abs(drift) > Math.abs(maxDrift)) {
                maxDrift = drift;
                maxDriftCriterion = c.criteriaName;
            }
        }
    });

    const averageStdDev = validStdDevCount > 0 ? totalStdDev / validStdDevCount : null;
    const consensusTier = getVarianceTier(averageStdDev);
    const consensusLabel =
        consensusTier === "low" ? "strong" : consensusTier === "medium" ? "moderate" : "weak";
    const varianceTier = getVarianceTier(maxVariance >= 0 ? maxVariance : null);
    const varianceConfig = VARIANCE_TIER_CONFIG[varianceTier];

    const insightTone =
        consensusTier === "low"
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            : consensusTier === "medium"
                ? "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                : "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200";

    const handlePublishConfirm = () => {
        publishMutation.mutate(calibrationId as UUID, {
            onSuccess: () => {
                setPublishDialogOpen(false);
            }
        });
    };

    const kpis = [
        {
            label: "Judges",
            value: String(judgeCount),
            icon: <GroupsOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
            valueClass: "text-slate-900 dark:text-white",
        },
        {
            label: "Criteria",
            value: String(criteriaCount),
            icon: <ChecklistOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
            valueClass: "text-slate-900 dark:text-white",
        },
        {
            label: "Status",
            value: isPublished ? "Published" : "Draft",
            icon: isPublished
                ? <PublicOutlinedIcon sx={{ fontSize: 18 }} />
                : <LockOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: isPublished
                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
            valueClass: isPublished
                ? "text-blue-600 dark:text-blue-400"
                : "text-amber-600 dark:text-amber-400",
        },
        {
            label: "Highest Variance",
            value: highestVarianceCriterion,
            icon: <TrendingUpOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: `${varianceConfig.chip}`,
            valueClass: `${varianceConfig.text}`,
            isText: true,
            title: `${highestVarianceCriterion} (σ ${formatScore(maxVariance >= 0 ? maxVariance : null, 2)})`,
        },
        {
            label: "Avg Std Dev",
            value: formatScore(averageStdDev, 2),
            icon: <QueryStatsOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
            valueClass: "text-slate-900 dark:text-white",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-7 pb-24 pt-6">
            {/* Header */}
            <header
                className="calib-fade-up flex flex-col gap-4 px-6 sm:flex-row sm:items-start sm:justify-between xl:px-0"
                style={{ "--calib-stagger": 0 } as React.CSSProperties}
            >
                <div>
                    <Button
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate(backPath)}
                        sx={{ mb: 1.5, textTransform: "none", fontWeight: 800 }}
                    >
                        Back
                    </Button>
                    <p className={CALIB.eyebrow}>Calibration · Analytics</p>
                    <div className="mt-1.5 flex items-center gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${CALIB.gradient} ${CALIB.glow}`}>
                            <InsightsOutlinedIcon sx={{ fontSize: 22 }} />
                        </span>
                        <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                            Score Distribution
                        </h1>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {roundDetail?.description || "Review score variance and benchmark consistency."}
                        {roundDetail?.startAt && (
                            <span className="ml-2 text-slate-400 dark:text-slate-500">
                                · {formatDateRange(roundDetail.startAt, roundDetail.endAt)}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    {isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                            <PublicOutlinedIcon sx={{ fontSize: 14 }} /> Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                            <LockOutlinedIcon sx={{ fontSize: 14 }} /> Not published
                        </span>
                    )}

                    {isCoordinator && !isPublished && (
                        <Button
                            variant="contained"
                            startIcon={<PublicOutlinedIcon />}
                            onClick={() => setPublishDialogOpen(true)}
                            className="calib-press"
                            sx={{
                                borderRadius: "12px",
                                fontWeight: 800,
                                textTransform: "none",
                                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                                boxShadow: "0 10px 24px -8px rgba(16,185,129,0.5)",
                                "&:hover": { background: "linear-gradient(135deg, #059669, #0d9488)" },
                            }}
                        >
                            Publish Distribution
                        </Button>
                    )}
                </div>
            </header>

            {/* KPI strip */}
            <div className="grid grid-cols-2 gap-4 px-6 md:grid-cols-3 lg:grid-cols-5 xl:px-0">
                {kpis.map((kpi, index) => (
                    <div
                        key={kpi.label}
                        className="calib-fade-up flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                        style={{ "--calib-stagger": index + 1 } as React.CSSProperties}
                        title={kpi.title}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-0 ${kpi.chip}`}>
                                {kpi.icon}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {kpi.label}
                            </span>
                        </div>
                        <span
                            className={`mt-3 font-black tabular-nums ${kpi.valueClass} ${
                                kpi.isText ? "line-clamp-2 text-base leading-snug" : "text-2xl"
                            }`}
                        >
                            {kpi.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Insight banner */}
            {criteriaData.length > 0 && (
                <div
                    className={`calib-fade-up mx-6 flex items-start gap-3 rounded-2xl border p-4 xl:mx-0 ${insightTone}`}
                    style={{ "--calib-stagger": 6 } as React.CSSProperties}
                >
                    <LightbulbOutlinedIcon sx={{ fontSize: 20, marginTop: "1px" }} />
                    <p className="text-sm font-semibold leading-relaxed">
                        {maxDriftCriterion && Math.abs(maxDrift) >= 0.05 ? (
                            <>
                                Judges deviate from the benchmark most on{" "}
                                <strong className="font-black">{maxDriftCriterion}</strong>{" "}
                                ({maxDrift > 0 ? "+" : ""}{formatScore(maxDrift)}).{" "}
                            </>
                        ) : null}
                        Overall consensus is <strong className="font-black">{consensusLabel}</strong>
                        {averageStdDev != null && <> (avg σ {formatScore(averageStdDev, 2)})</>}.
                    </p>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-12 px-6 xl:px-0">
                {distributionGroups.length === 0 && (
                    <Alert severity="info">
                        No calibration score data is available for this distribution yet.
                    </Alert>
                )}

                {distributionGroups.map((group, groupIndex) => (
                    <section
                        key={group.title}
                        className="calib-fade-up grid grid-cols-1 gap-8"
                        style={{ "--calib-stagger": groupIndex + 7 } as React.CSSProperties}
                    >
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
                                        Side-by-side bars with the min–max range of judge scores.
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
