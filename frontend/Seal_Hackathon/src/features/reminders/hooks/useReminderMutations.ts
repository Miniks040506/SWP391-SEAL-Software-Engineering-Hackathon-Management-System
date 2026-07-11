import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { reminderApi } from "@/api/reminder.api";
import type { UUID } from "@/types/common.types";
import type { CreateReminderRequest, GenerateEventRemindersRequest } from "@/types/reminder.types";
import { reminderQueryKeys } from "./useReminderQueries";

export const useCreateReminderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: UUID; payload: CreateReminderRequest }) =>
      reminderApi.createEventReminder(eventId, payload),
    onSuccess: (_data, variables) => {
      enqueueSnackbar("Reminder created.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.event(variables.eventId) });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || error?.message || "Could not create reminder.", {
        variant: "error",
      });
    },
  });
};

export const useGenerateDeadlineRemindersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: UUID; payload?: GenerateEventRemindersRequest }) =>
      reminderApi.generateDeadlineReminders(eventId, payload),
    onSuccess: (data, variables) => {
      enqueueSnackbar(`Generated ${data.length} deadline reminder(s).`, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.event(variables.eventId) });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || error?.message || "Could not generate reminders.", {
        variant: "error",
      });
    },
  });
};

export const useSendReminderNowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId }: { reminderId: UUID; eventId?: UUID }) => reminderApi.sendReminderNow(reminderId),
    onSuccess: (_data, variables) => {
      enqueueSnackbar("Reminder sent.", { variant: "success" });
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: reminderQueryKeys.event(variables.eventId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reminderQueryKeys.all });
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || error?.message || "Could not send reminder.", {
        variant: "error",
      });
    },
  });
};
