import { apiRequest } from "./apiRequest";
import type { ScheduleEntry, ScheduleParams } from "@/types/schedule.types";

export const scheduleApi = {
  getMySchedule(params: ScheduleParams) {
    return apiRequest.get<ScheduleEntry[]>("/schedule", { params });
  },
};
