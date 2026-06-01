import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { eventApi } from "@/api/event.api";
import type { CreateEventRequest } from "@/types/event.types";

export const useCreateEventMutation = () => {
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (payload: CreateEventRequest) => eventApi.createEvent(payload),

        onSuccess: () => {
            enqueueSnackbar("Event created successfully.", {
                variant: "success",
            });
        },

        onError: () => {
            enqueueSnackbar("Failed to create event. Please try again.", {
                variant: "error",
            });
        },
    });
};