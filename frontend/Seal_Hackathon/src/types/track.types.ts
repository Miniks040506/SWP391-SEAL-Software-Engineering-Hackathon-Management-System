import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateTrackRequest = {
  name: string;
  description?: string;
  maxTeams?: number;
  requiredLinkTypes?: string[];
};

export type UpdateTrackRequest = {
  name?: string;
  description?: string;
  maxTeams?: number;
  requiredLinkTypes?: string[];
  status?: string;
};

export type AssignMentorRequest = {
  mentorUserId: UUID;
};

export type RegisterTeamTrackRequest = {
  trackId: UUID;
};

export type TrackResponse = {
  id: UUID;
  eventId: UUID;
  name: string;
  description?: string;
  maxTeams?: number;
  requiredLinkTypes?: string[];
};

export type MentorAssignmentResponse = {
  id: UUID;
  trackId: UUID;
  mentorUserId: UUID;
  mentorName: string;
  assignedAt: ISODateTime;
};

export type TrackDetailResponse = {
  id: UUID;
  eventId: UUID;
  name: string;
  description?: string;
  maxTeams?: number;
  registeredTeamCount: number;
  mentors: MentorAssignmentResponse[];
};

export type TrackTeamProgressResponse = {
  teamId: UUID;
  teamName: string;
  leaderName: string;
  memberCount: number;
  latestSubmissionStatus?: string;
};
