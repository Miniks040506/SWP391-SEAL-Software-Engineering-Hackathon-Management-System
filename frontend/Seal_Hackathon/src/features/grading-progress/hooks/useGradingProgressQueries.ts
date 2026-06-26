import { useQuery } from "@tanstack/react-query";
import { gradingApi } from "@/api/grading.api";
import type { UUID } from "@/types/common.types";
import { mockGradingProgressService } from "../mocks/gradingProgress.mock"; // <-- Import mock service

const USE_MOCK = false;

export const gradingProgressQueryKeys = {
    all: ["grading-progress"] as const,
    events: () => [...gradingProgressQueryKeys.all, "events"] as const,
    eventProgress: (eventId: UUID) => [...gradingProgressQueryKeys.events(), eventId] as const,
    rounds: () => [...gradingProgressQueryKeys.all, "rounds"] as const,
    roundProgress: (roundId: UUID) => [...gradingProgressQueryKeys.rounds(), roundId] as const,
    judgeAssignments: () => [...gradingProgressQueryKeys.all, "judge-assignments"] as const,
    judgeAssignmentProgress: (assignmentId: UUID) => [...gradingProgressQueryKeys.judgeAssignments(), assignmentId] as const,
};

export const useEventGradingProgressQuery = (eventId?: UUID, eventStatus?: string) => {
    return useQuery({
        queryKey: gradingProgressQueryKeys.eventProgress(eventId!),
        queryFn: () => USE_MOCK
            ? mockGradingProgressService.getEventGradingProgress(eventId!)
            : gradingApi.getEventGradingProgress(eventId!),
        enabled: !!eventId,
        refetchInterval: (query) => {
            if (eventStatus === "JUDGING" || eventStatus === "ONGOING") {
                return 30000;
            }
            const data = query.state?.data as any;
            if (data && (data.eventStatus === "JUDGING" || data.eventStatus === "ONGOING")) {
                return 30000;
            }
            return false;
        },
    });
};

export const useRoundGradingProgressQuery = (roundId?: UUID) => {
    return useQuery({
        queryKey: gradingProgressQueryKeys.roundProgress(roundId!),
        queryFn: () => USE_MOCK
            ? mockGradingProgressService.getRoundGradingProgress(roundId!)
            : gradingApi.getRoundGradingProgress(roundId!),
        enabled: !!roundId,
    });
};

export const useJudgeAssignmentProgressQuery = (assignmentId?: UUID) => {
    return useQuery({
        queryKey: gradingProgressQueryKeys.judgeAssignmentProgress(assignmentId!),
        queryFn: () => USE_MOCK
            ? mockGradingProgressService.getJudgeAssignmentProgress(assignmentId!)
            : gradingApi.getJudgeAssignmentProgress(assignmentId!),
        enabled: !!assignmentId,
    });
};