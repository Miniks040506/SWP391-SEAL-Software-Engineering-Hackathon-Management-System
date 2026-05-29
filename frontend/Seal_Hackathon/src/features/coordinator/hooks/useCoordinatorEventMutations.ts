import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { eventApi } from "@/api/event.api";
import type { CreateEventRequest } from "@/types/event.types";

export const useCreateEventMutation = () => {
    const { enqueuceSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (payload: CreateEventRequest) => eventApi.createEvent(payload),

        onSuccess: () => {
            enqueuceSnackbar("Event created successfully.", {
                variant: "sucess",
            });
        },

        onError: () => {
            enqueuceSnackbar("Failed to create event. Please try again.", {
                variant: "error",
            });
        },
    });
};