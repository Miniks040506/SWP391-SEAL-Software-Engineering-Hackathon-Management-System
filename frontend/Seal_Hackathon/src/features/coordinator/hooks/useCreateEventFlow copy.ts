import { useMutation } from "@tanstack/react-query";

import { eventApi } from "@/api/event.api";
import type { UUID } from "@/types/common.types";
import type { 
    CreateEventRequest,
    UpdateEventRequest, 
} from "@/types/event.types";

export function useUpdateEventMutation() {
    return useMutation({
        mutationFn: ({
            eventId,
            payload,
        }: {
            eventId: UUID;
            payload: UpdateEventRequest;
        }) => eventApi.updateEvent(eventId, payload),
    });
}

export function useDeleteEventMutation() {
    return useMutation({
        mutationFn: (eventId: UUID) => eventApi.deleteEvent(eventId),
    });
}