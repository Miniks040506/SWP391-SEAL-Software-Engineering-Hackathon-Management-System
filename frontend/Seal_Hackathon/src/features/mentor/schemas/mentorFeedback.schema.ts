import { z } from "zod";

export const mentorFeedbackSchema = z.object({
    category: z.string().min(1, "Please select a category"),
    content: z.string().min(10, "Feedback content must be at least 10 characters long"),
    submissionId: z.string().optional().nullable(),
    roundId: z.string().optional().nullable(),
});

export type MentorFeedbackFormValues = z.infer<typeof mentorFeedbackSchema>;