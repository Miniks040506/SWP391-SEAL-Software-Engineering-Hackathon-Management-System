import type { ISODateTime, UUID } from "@/types/common.types";

export type ReminderType = "DEADLINE_REMINDER" | "SUBMISSION_REMINDER" | "JUDGING_REMINDER" | "CALIBRATION_REMINDER";
export type ReminderTargetScope =
  | "ALL"
  | "ROLE"
  | "TRACK"
  | "TEAM"
  | "SINGLE_USER"
  | "EVENT_PARTICIPANTS"
  | "EVENT_MENTORS"
  | "EVENT_JUDGES"
  | "EVENT_COORDINATORS"
  | "ROUND_JUDGES"
  | "ALL_EVENT_USERS";
export type ReminderChannel = "IN_APP" | "EMAIL" | "BOTH";

export type CreateReminderRequest = {
  type: ReminderType | string;
  title: string;
  body: string;
  targetScope: ReminderTargetScope | string;
  targetId?: UUID;
  role?: string;
  channel?: ReminderChannel | string;
  scheduledAt: ISODateTime;
};

export type GenerateEventRemindersRequest = {
  submissionDaysBefore?: number;
  judgingDaysBefore?: number;
  includeSubmissionReminders?: boolean;
  includeJudgingReminders?: boolean;
  emailEnabled?: boolean;
};

export type ReminderResponse = {
  id: UUID;
  eventId?: UUID;
  eventName?: string;
  type: string;
  title: string;
  body: string;
  targetScope: string;
  targetId?: UUID;
  channel: string;
  status: string;
  scheduledAt?: ISODateTime;
  sentAt?: ISODateTime;
  recipientCount?: number;
};
