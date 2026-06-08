import { z } from "zod";

export const announcementFormSchema = z.object({
  eventId: z.string().min(1, "Event is required."),
  title: z.string().min(1, "Title is required.").max(200),
  content: z.string().min(1, "Content is required.").max(5000),
  pinned: z.boolean().default(false),
  resultAnnouncement: z.boolean().default(false),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export const initialAnnouncementFormValues: AnnouncementFormValues = {
  eventId: "",
  title: "",
  content: "",
  pinned: false,
  resultAnnouncement: false,
};

export type AnnouncementAction = "DRAFT" | "PUBLISH";
