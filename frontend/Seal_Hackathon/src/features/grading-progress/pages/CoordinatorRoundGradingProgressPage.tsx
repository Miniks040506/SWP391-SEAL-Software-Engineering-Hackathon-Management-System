import { useState } from "react";
import type { CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import {
    useRoundGradingProgressQuery,
    useGradingEventDetailQuery,
    isRoundProgressLive,
} from "../hooks/useGradingProgressQueries";
import { useLockRoundGradingMutation } from "../hooks/useGradingProgressMutations";
import { useLastUpdated } from "../hooks/useLastUpdated";
import { GradingProgressHero } from "../components/GradingProgressHero";
import type { HeroBreadcrumb } from "../components/GradingProgressHero";
import { GradingOverviewBand } from "../components/GradingOverviewBand";
import { JudgeAssignmentProgressTable } from "../components/JudgeAssignmentProgressTable";
import { LockGradingPanel } from "../components/LockGradingPanel";
import { LockGradingConfirmDialog } from "../components/LockGradingConfirmDialog";
import {
    GradingProgressSkeleton,
    GradingProgressErrorState,
} from "../components/GradingProgressStates";
import type { UUID } from "@/types/common.types";
import { formatShortDate } from "@/features/events/utils/publicEventView";
import "../styles/gradingProgress.css";

const ROUND_STATUS_STYLES: Record<string, string> = {
    OPEN: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    JUDGING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const roundStatusClass = (status: string) =>
    ROUND_STATUS_STYLES[status] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

const extractErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
            return response.data.message;
        }
    }
    return fallback;
};

export const CoordinatorRoundGradingProgressPage = () => {
    const { roundId } = useParams<{ roundId: string }>();
    const { enqueueSnackbar } = useSnackbar();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const {
        data: roundProgress,
        isLoading,
        isError,
        refetch,
        isRefetching,
        dataUpdatedAt,
    } = useRoundGradingProgressQuery(roundId as UUID);

    const { data: eventDetail } = useGradingEventDetailQuery(roundProgress?.eventId);
    const updatedLabel = useLastUpdated(dataUpdatedAt);
    const lockMutation = useLockRoundGradingMutation();

    if (isLoading) {
        return <GradingProgressSkeleton />;
    }

    if (isError || !roundProgress) {
        return (
            <GradingProgressErrorState
                message="Could not load round progress. Please try again."
                onRetry={() => refetch()}
            />
        );
    }

    const handleLockConfirm = () => {
        lockMutation.mutate(roundId as UUID, {
            onSuccess: () => {
                enqueueSnackbar("Grading locked successfully.", { variant: "success" });
                setConfirmOpen(false);
            },
            onError: (err: unknown) => {
                enqueueSnackbar(extractErrorMessage(err, "Failed to lock grading"), {
                    variant: "error",
                });
                setConfirmOpen(false);
            },
        });
    };

    const isLive = isRoundProgressLive(roundProgress.roundStatus, roundProgress.gradingLocked);

    // Never surface the raw event UUID: show the resolved name or skip the crumb.
    const breadcrumbs: HeroBreadcrumb[] = [
        { label: "Events", to: "/coordinator/events" },
        ...(eventDetail?.name
            ? [
                  {
                      label: eventDetail.name,
                      to: `/coordinator/events/${roundProgress.eventId}/edit`,
                  },
              ]
            : []),
        {
            label: "Grading Progress",
            to: `/coordinator/events/${roundProgress.eventId}/grading-progress`,
        },
        { label: roundProgress.roundName },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-24">
            <GradingProgressHero
                breadcrumbs={breadcrumbs}
                title={roundProgress.roundName}
                subtitle="Track each judge's scoring progress, then lock grading when the round is ready for ranking."
                chips={
                    <>
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${roundStatusClass(roundProgress.roundStatus)}`}
                        >
                            {isLive && (
                                <span className="gp-live-dot inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                            )}
                            {roundProgress.roundStatus}
                        </span>
                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                roundProgress.submissionLocked
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
                            }`}
                        >
                            {roundProgress.submissionLocked ? (
                                <LockOutlinedIcon sx={{ fontSize: 13 }} />
                            ) : (
                                <LockOpenOutlinedIcon sx={{ fontSize: 13 }} />
                            )}
                            {roundProgress.submissionLocked
                                ? `Submissions locked${roundProgress.submissionLockedAt ? ` · ${formatShortDate(roundProgress.submissionLockedAt)}` : ""}`
                                : "Submissions open"}
                        </span>
                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                roundProgress.gradingLocked
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                        >
                            {roundProgress.gradingLocked ? (
                                <LockOutlinedIcon sx={{ fontSize: 13 }} />
                            ) : (
                                <LockOpenOutlinedIcon sx={{ fontSize: 13 }} />
                            )}
                            {roundProgress.gradingLocked
                                ? `Grading locked${roundProgress.gradingLockedAt ? ` · ${formatShortDate(roundProgress.gradingLockedAt)}` : ""}`
                                : "Grading open"}
                        </span>
                    </>
                }
                isLive={isLive}
                updatedLabel={updatedLabel}
                isRefetching={isRefetching}
                onRefresh={() => refetch()}
            />

            <GradingOverviewBand
                percent={roundProgress.percent}
                completed={roundProgress.completedAssignedSubmissions}
                total={roundProgress.totalAssignedSubmissions}
                pending={roundProgress.pendingSubmissions}
                draft={roundProgress.draftSavedSubmissions}
                submitted={roundProgress.submittedSubmissions}
                locked={roundProgress.lockedSubmissions}
                tiles={[
                    {
                        label: "Confirmed scores",
                        value: `${roundProgress.confirmedScoreCount} / ${roundProgress.expectedFinalScoreCount}`,
                        hint: "Lock precondition",
                    },
                    {
                        label: "Judges",
                        value: `${roundProgress.judgeAssignmentCount}`,
                        hint: `${roundProgress.criteriaCount} criteria each`,
                    },
                ]}
            />

            <LockGradingPanel
                round={roundProgress}
                onLockClick={() => setConfirmOpen(true)}
                isLocking={lockMutation.isPending}
            />

            <section
                className="gp-fade-up space-y-4"
                style={{ "--gp-stagger": 3 } as CSSProperties}
            >
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Judge Assignments
                </h2>
                <JudgeAssignmentProgressTable assignments={roundProgress.judgeAssignments} />
            </section>

            <LockGradingConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleLockConfirm}
                round={roundProgress}
                isLocking={lockMutation.isPending}
            />
        </div>
    );
};
