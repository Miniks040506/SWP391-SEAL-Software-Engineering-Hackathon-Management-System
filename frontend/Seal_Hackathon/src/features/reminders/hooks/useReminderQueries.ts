import { useQuery } from "@tanstack/react-query";
import { reminderApi } from "@/api/reminder.api";
import type { UUID } from "@/types/common.types";

export const reminderQueryKeys = {
  all: ["reminders"] as const,
  event: (eventId?: UUID) => [...reminderQueryKeys.all, "event", eventId] as const,
};

export const useEventRemindersQuery = (eventId?: UUID) =>
  useQuery({
    queryKey: reminderQueryKeys.event(eventId),
    queryFn: () => reminderApi.listEventReminders(eventId!),
    enabled: !!eventId,
  });
