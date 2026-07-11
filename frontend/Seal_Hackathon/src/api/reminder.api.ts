import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateReminderRequest,
  GenerateEventRemindersRequest,
  ReminderResponse,
} from "@/types/reminder.types";

export const reminderApi = {
  listEventReminders(eventId: UUID) {
    return apiRequest.get<ReminderResponse[]>(`/events/${eventId}/reminders`);
  },

  createEventReminder(eventId: UUID, payload: CreateReminderRequest) {
    return apiRequest.post<ReminderResponse>(`/events/${eventId}/reminders`, payload);
  },

  generateDeadlineReminders(eventId: UUID, payload?: GenerateEventRemindersRequest) {
    return apiRequest.post<ReminderResponse[]>(`/events/${eventId}/reminders/generate-deadlines`, payload ?? {});
  },

  sendReminderNow(reminderId: UUID) {
    return apiRequest.post<ReminderResponse>(`/reminders/${reminderId}/send`);
  },
};
