import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { isAxiosError } from "axios";

import type { UUID } from "@/types/common.types";
import type { CalibrationRoundResponse } from "@/types/calibration.types";
import {
    useEventCalibrationRoundsQuery,
    useManagedCalibrationRoundsQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import {
    usePublishCalibrationDistributionMutation,
} from "@/features/calibration/hooks/useCalibrationMutations";
import { CalibrationRoundTable } from "@/features/calibration/components/CoordinatorCalibration/CalibrationRoundTable";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";
import { CALIB } from "@/features/calibration/constants/calibrationUi";
import { getRoundLifecycle } from "@/features/calibration/utils/format";
import "@/features/calibration/components/calibration.css";

type KpiCard = {
    label: string;
    value: number;
    hint: string;
    icon: React.ReactNode;
    chip: string;
    ring: string;
    valueClass: string;
};

export const CoordinatorCalibrationPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const eventQuery = useEventCalibrationRoundsQuery(eventId as UUID);
    const allQuery = useManagedCalibrationRoundsQuery();

    const activeQuery = eventId ? eventQuery : allQuery;
    const calibrationRounds: CalibrationRoundResponse[] = activeQuery.data ?? [];
    const isLoading = activeQuery.isLoading;
    const isError = activeQuery.isError;

    const publishMutation = usePublishCalibrationDistributionMutation();
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [publishCandidateId, setPublishCandidateId] = useState<string | null>(null);

    const handlePublish = (id: string) => setPublishCandidateId(id);

    const confirmPublish = () => {
        if (!publishCandidateId) return;
        setPublishingId(publishCandidateId);
        publishMutation.mutate(publishCandidateId as UUID, {
            onSuccess: () => {
                setPublishCandidateId(null);
                enqueueSnackbar("Distribution published successfully", { variant: "success" });
            },
            onError: (error: unknown) => {
                const message = isAxiosError<{ message?: string }>(error)
                    ? error.response?.data?.message
                    : undefined;
                enqueueSnackbar(
                    message || "Failed to publish distribution",
                    { variant: "error" }
                );
            },
            onSettled: () => {
                setPublishingId(null);
            },
        });
    };

    const totalRounds = calibrationRounds.length;
    const liveRounds = calibrationRounds.filter((r) => getRoundLifecycle(r) === "LIVE").length;
    const publishedDistributions = calibrationRounds.filter((r) => r.distributionPublishedAt).length;
    const pendingJudgeSubmissions = calibrationRounds.reduce(
        (total, round) => total + round.pendingJudgeCount,
        0,
    );

    const createPath = eventId
        ? `/coordinator/events/${eventId}/calibrations/create`
        : `/coordinator/calibrations/create`;

    const kpis: KpiCard[] = [
        {
            label: "Total Rounds",
            value: totalRounds,
            hint: "All calibration rounds",
            icon: <LayersOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
            ring: "hover:ring-slate-300 dark:hover:ring-slate-600",
            valueClass: "text-slate-900 dark:text-white",
        },
        {
            label: "Live Now",
            value: liveRounds,
            hint: "Scoring window open",
            icon: <PlayCircleOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
            ring: "hover:ring-emerald-300 dark:hover:ring-emerald-500/50",
            valueClass: "text-emerald-600 dark:text-emerald-400",
        },
        {
            label: "Published",
            value: publishedDistributions,
            hint: "Distributions visible to judges",
            icon: <PublicOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
            ring: "hover:ring-blue-300 dark:hover:ring-blue-500/50",
            valueClass: "text-blue-600 dark:text-blue-400",
        },
        {
            label: "Pending Scores",
            value: pendingJudgeSubmissions,
            hint: "Judges yet to submit",
            icon: <PendingActionsOutlinedIcon sx={{ fontSize: 18 }} />,
            chip: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
            ring: "hover:ring-amber-300 dark:hover:ring-amber-500/50",
            valueClass: "text-amber-600 dark:text-amber-400",
        },
    ];

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <header
                className="calib-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
                style={{ "--calib-stagger": 0 } as React.CSSProperties}
            >
                <div>
                    {eventId ? (
                        <Button
                            startIcon={<ArrowBackOutlinedIcon />}
                            onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
                            sx={{ mb: 1.5, textTransform: "none", fontWeight: 800 }}
                        >
                            Back to Event
                        </Button>
                    ) : (
                        <nav className="mb-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                            <Link to="/coordinator/dashboard" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
                                Coordinator
                            </Link>
                            <span className="mx-1.5">/</span>
                            <span className="text-slate-600 dark:text-slate-300">Calibrations</span>
                        </nav>
                    )}
                    <p className={CALIB.eyebrow}>Calibration</p>
                    <div className="mt-1.5 flex items-center gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${CALIB.gradient} ${CALIB.glow}`}>
                            <TuneOutlinedIcon sx={{ fontSize: 22 }} />
                        </span>
                        <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                            Calibration Rounds
                        </h1>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                        Align judges on a benchmark sample before real grading begins.
                    </p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={() => navigate(createPath)}
                    className="calib-press"
                    sx={{
                        borderRadius: "14px",
                        textTransform: "none",
                        fontWeight: 900,
                        height: 48,
                        px: 3,
                        background: "linear-gradient(135deg, #10b981, #14b8a6)",
                        boxShadow: "0 10px 24px -8px rgba(16,185,129,0.5)",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                        "&:hover": {
                            background: "linear-gradient(135deg, #059669, #0d9488)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 14px 28px -8px rgba(16,185,129,0.55)",
                        },
                    }}
                >
                    Create Calibration Round
                </Button>
            </header>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((kpi, index) => (
                    <div
                        key={kpi.label}
                        className={`calib-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-transparent transition dark:border-slate-700 dark:bg-slate-900 ${kpi.ring}`}
                        style={{ "--calib-stagger": index + 1 } as React.CSSProperties}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpi.chip}`}>
                                {kpi.icon}
                            </span>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{kpi.label}</p>
                        </div>
                        <p className={`mt-3 text-3xl font-black tabular-nums ${kpi.valueClass}`}>{kpi.value}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-400 dark:text-slate-500">{kpi.hint}</p>
                    </div>
                ))}
            </div>

            <div
                className="calib-fade-up rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
                style={{ "--calib-stagger": 5 } as React.CSSProperties}
            >
                <h2 className="mb-6 text-lg font-black text-slate-900 dark:text-white">
                    All Calibration Rounds
                </h2>
                {isLoading ? (
                    <div className="space-y-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="calib-shimmer h-32 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                            />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="py-12 text-center font-medium text-rose-500">
                        Failed to load calibration rounds. Please try again.
                    </div>
                ) : calibrationRounds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
                        <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white ${CALIB.gradient} ${CALIB.glow}`}>
                            <TuneOutlinedIcon sx={{ fontSize: 28 }} />
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            No calibration rounds yet
                        </h3>
                        <p className="mt-1 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
                            Create a calibration round so judges can align on a benchmark
                            sample before official grading opens.
                        </p>
                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => navigate(createPath)}
                            className="calib-press"
                            sx={{
                                mt: 3,
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                                "&:hover": { background: "linear-gradient(135deg, #059669, #0d9488)" },
                            }}
                        >
                            Create your first round
                        </Button>
                    </div>
                ) : (
                    <CalibrationRoundTable
                        rounds={calibrationRounds}
                        onPublish={handlePublish}
                        isPublishing={publishingId}
                    />
                )}
            </div>
            <ActionConfirmDialog
                open={publishCandidateId !== null}
                title="Publish calibration distribution?"
                description="Publishing is irreversible and prevents further edits to this distribution."
                confirmLabel="Publish distribution"
                onClose={() => setPublishCandidateId(null)}
                onConfirm={confirmPublish}
                isPending={publishMutation.isPending}
            />
        </div>
    );
};
