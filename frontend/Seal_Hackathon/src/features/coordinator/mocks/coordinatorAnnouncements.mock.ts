import type { AnnouncementResponse } from "@/types/announcement.types";

export type AnnouncementEventOption = {
  id: string;
  name: string;
};

export const coordinatorAnnouncementEventsMock: AnnouncementEventOption[] = [
  {
    id: "event-spring-2026",
    name: "SEAL Spring 2026",
  },
  {
    id: "event-summer-2026",
    name: "SEAL Summer 2026",
  },
];

export const coordinatorAnnouncementsMock: AnnouncementResponse[] = [
  {
    id: "announcement-1",
    eventId: "event-spring-2026",
    title: "Submission deadline reminder",
    content:
      "Please submit your preliminary round deliverables before the deadline. Late submissions may not be accepted.",
    pinned: true,
    resultAnnouncement: false,
    publishedAt: "May 24, 2026 - 10:00",
    createdBy: "coordinator-1",
  },
  {
    id: "announcement-2",
    eventId: "event-spring-2026",
    title: "Rule update for preliminary round",
    content:
      "A small rule clarification has been added to the event guide. Please review the updated scoring and submission requirements.",
    pinned: false,
    resultAnnouncement: false,
    createdBy: "coordinator-1",
  },
  {
    id: "announcement-3",
    eventId: "event-summer-2026",
    title: "Final result announcement",
    content:
      "The final result announcement will be published after the judging process is completed.",
    pinned: false,
    resultAnnouncement: true,
    createdBy: "coordinator-1",
  },
];