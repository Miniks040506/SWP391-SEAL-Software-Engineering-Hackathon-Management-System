import type { ISODateTime, UUID } from "./common.types";

export type ScheduleEntryType =
  | "EVENT"
  | "ROUND"
  | "DEADLINE"
  | "CALIBRATION"
  | "REMINDER"
  | "ANNOUNCEMENT";

export type ScheduleEntry = {
  id: string;
  type: ScheduleEntryType;
  title: string;
  description: string;
  startAt: ISODateTime;
  endAt?: ISODateTime | null;
  eventId: UUID;
  eventName: string;
  sourceId: UUID;
  roundId?: UUID | null;
  status: string;
};

export type ScheduleParams = {
  from: ISODateTime;
  to: ISODateTime;
  eventId?: UUID;
  type?: ScheduleEntryType;
};
