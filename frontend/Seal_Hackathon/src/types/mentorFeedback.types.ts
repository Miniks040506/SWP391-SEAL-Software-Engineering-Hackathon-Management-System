import type { ISODateTime, UUID } from "@/types/common.types";

export type MentorFeedbackCategory =
  | "TECHNICAL"
  | "PROCESS"
  | "PRESENTATION"
  | "GENERAL"
  | string;

export type MentorFeedbackVisibility = "DRAFT" | "PUBLISHED" | string;

export type CreateMentorFeedbackRequest = {
  submissionId?: UUID | null;
  roundId?: UUID | null;
  category?: MentorFeedbackCategory;
  content: string;
  publish?: boolean;
  visibleToTeam?: boolean;
};

export type UpdateMentorFeedbackRequest = {
  submissionId?: UUID | null;
  roundId?: UUID | null;
  category?: MentorFeedbackCategory;
  content?: string;
  visibleToTeam?: boolean;
};

export type MentorFeedbackResponse = {
  id: UUID;
  teamId?: UUID | null;
  teamName?: string | null;
  submissionId?: UUID | null;
  submissionNumber?: number | null;
  roundId?: UUID | null;
  roundName?: string | null;
  mentorUserId?: UUID | null;
  mentorName?: string | null;
  category?: MentorFeedbackCategory | null;
  content: string;
  visibility?: MentorFeedbackVisibility | null;
  visibleToTeam?: boolean | null;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime | null;
  publishedAt?: ISODateTime | null;
};
