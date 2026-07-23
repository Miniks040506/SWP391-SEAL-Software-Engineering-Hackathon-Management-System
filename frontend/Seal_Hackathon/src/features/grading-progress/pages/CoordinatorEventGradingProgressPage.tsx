import type { CSSProperties } from "react";
import { useParams } from "react-router-dom";
import {
    useEventGradingProgressQuery,
    isEventProgressLive,
} from "../hooks/useGradingProgressQueries";
import { useLastUpdated } from "../hooks/useLastUpdated";
import { GradingProgressHero } from "../components/GradingProgressHero";
import { GradingOverviewBand } from "../components/GradingOverviewBand";
import { RoundGradingProgressTable } from "../components/RoundGradingProgressTable";
import {
    GradingProgressSkeleton,
    GradingProgressErrorState,
} from "../components/GradingProgressStates";
import type { UUID } from "@/types/common.types";
import "../styles/gradingProgress.css";

const EVENT_STATUS_STYLES: Record<string, string> = {
    ONGOING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    JUDGING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    PUBLISHED: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    UPCOMING: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const eventStatusClass = (status: string) =>
    EVENT_STATUS_STYLES[status] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

export const CoordinatorEventGradingProgressPage = () => {
    const { eventId } = useParams<{ eventId: string }>();

    const {
        data: eventProgress,
        isLoading,
        isError,
        refetch,
        isRefetching,
        dataUpdatedAt,
    } = useEventGradingProgressQuery(eventId as UUID);

    const updatedLabel = useLastUpdated(dataUpdatedAt);

    if (isLoading) {
        return <GradingProgressSkeleton />;
    }

    if (isError || !eventProgress) {
        return (
            <GradingProgressErrorState
                message="Could not load grading progress. Please try again."
                onRetry={() => refetch()}
            />
        );
    }

    const isLive = isEventProgressLive(eventProgress.eventStatus);

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-24">
            <GradingProgressHero
                breadcrumbs={[
                    { label: "Events", to: "/coordinator/events" },
                    { label: eventProgress.eventName, to: `/coordinator/events/${eventId}/edit` },
                    { label: "Grading Progress" },
                ]}
                title="Grading Progress"
                subtitle="Monitor judge scoring across every round before locking grading."
                chips={
                    <>
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${eventStatusClass(eventProgress.eventStatus)}`}
                        >
                            {eventProgress.eventStatus}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {eventProgress.roundCount}{" "}
                            {eventProgress.roundCount === 1 ? "round" : "rounds"}
                        </span>
                    </>
                }
                isLive={isLive}
                updatedLabel={updatedLabel}
                isRefetching={isRefetching}
                onRefresh={() => refetch()}
            />

            <GradingOverviewBand
                percent={eventProgress.percent}
                completed={eventProgress.completedAssignedSubmissions}
                total={eventProgress.totalAssignedSubmissions}
                pending={eventProgress.pendingSubmissions}
                draft={eventProgress.draftSavedSubmissions}
                submitted={eventProgress.submittedSubmissions}
                locked={eventProgress.lockedSubmissions}
                tiles={[
                    {
                        label: "Confirmed scores",
                        value: `${eventProgress.confirmedScoreCount} / ${eventProgress.expectedFinalScoreCount}`,
                        hint: "Final judge scores",
                    },
                    {
                        label: "Rounds",
                        value: `${eventProgress.roundCount}`,
                        hint: "In this event",
                    },
                ]}
            />

            <section
                className="gp-fade-up space-y-4"
                style={{ "--gp-stagger": 2 } as CSSProperties}
            >
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Rounds</h2>
                <RoundGradingProgressTable
                    rounds={eventProgress.rounds}
                    eventId={eventId as UUID}
                />
            </section>
        </div>
    );
};
