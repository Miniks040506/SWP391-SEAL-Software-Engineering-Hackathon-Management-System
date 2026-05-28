import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateMentorFeedbackRequest = {
  content: string;
  rating?: number;
  privateNote?: string;
};

export type UpdateMentorFeedbackRequest = {
  content?: string;
  rating?: number;
  privateNote?: string;
};

export type MentorFeedbackResponse = {
  id: UUID;
  teamId: UUID;
  mentorId: UUID;
  mentorName: string;
  content: string;
  rating?: number;
  privateNote?: string;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
};
