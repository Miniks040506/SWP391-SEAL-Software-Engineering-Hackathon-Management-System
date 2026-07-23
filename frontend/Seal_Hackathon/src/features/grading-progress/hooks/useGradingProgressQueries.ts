import { useQuery } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";
import { eventApi } from "@/api/event.api";
import type { UUID } from "@/types/common.types";

const LIVE_REFETCH_INTERVAL_MS = 30_000;

export const gradingProgressQueryKeys = {
    all: ["grading-progress"] as const,
    events: () => [...gradingProgressQueryKeys.all, "events"] as const,
    eventProgress: (eventId: UUID) => [...gradingProgressQueryKeys.events(), eventId] as const,
    rounds: () => [...gradingProgressQueryKeys.all, "rounds"] as const,
    roundProgress: (roundId: UUID) => [...gradingProgressQueryKeys.rounds(), roundId] as const,
    judgeAssignments: () => [...gradingProgressQueryKeys.all, "judge-assignments"] as const,
    judgeAssignmentProgress: (assignmentId: UUID) => [...gradingProgressQueryKeys.judgeAssignments(), assignmentId] as const,
};

export const useEventGradingProgressQuery = (eventId?: UUID) => {
    return useQuery({
        queryKey: gradingProgressQueryKeys.eventProgress(eventId!),
        queryFn: () => gradingApi.getEventGradingProgress(eventId!),
        enabled: !!eventId,
        // Poll while the event is actually live; derived from the response
        // itself instead of a hardcoded caller-provided status.
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && (data.eventStatus === "ONGOING" || data.eventStatus === "JUDGING")) {
                return LIVE_REFETCH_INTERVAL_MS;
            }
            return false;
        },
    });
};

export const useRoundGradingProgressQuery = (roundId?: UUID) => {
    return useQuery({
        queryKey: gradingProgressQueryKeys.roundProgress(roundId!),
        queryFn: () => gradingApi.getRoundGradingProgress(roundId!),
        enabled: !!roundId,
        // Live judging rounds keep polling until grading is locked, so the
        // coordinator sees judge progress without mashing Refresh.
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && !data.gradingLocked && data.roundStatus === "JUDGING") {
                return LIVE_REFETCH_INTERVAL_MS;
            }
            return false;
        },
    });
};

export const useJudgeAssignmentProgressQuery = (assignmentId?: UUID) => {
    return useQuery({
        queryKey: gradingProgressQueryKeys.judgeAssignmentProgress(assignmentId!),
        queryFn: () => gradingApi.getJudgeAssignmentProgress(assignmentId!),
        enabled: !!assignmentId,
    });
};

/**
 * Lightweight event lookup so the round page can show the event *name*
 * instead of leaking the raw event UUID (RoundGradingProgressResponse
 * only carries `eventId`). Cached aggressively — the name never changes
 * during a monitoring session.
 */
export const useGradingEventDetailQuery = (eventId?: UUID) => {
    return useQuery({
        queryKey: [...gradingProgressQueryKeys.all, "event-detail", eventId] as const,
        queryFn: () => eventApi.getEventById(eventId!),
        enabled: !!eventId,
        staleTime: 5 * 60_000,
    });
};

/** Whether live polling is currently active for an event progress payload. */
export const isEventProgressLive = (eventStatus?: string) =>
    eventStatus === "ONGOING" || eventStatus === "JUDGING";

/** Whether live polling is currently active for a round progress payload. */
export const isRoundProgressLive = (roundStatus?: string, gradingLocked?: boolean) =>
    roundStatus === "JUDGING" && !gradingLocked;
