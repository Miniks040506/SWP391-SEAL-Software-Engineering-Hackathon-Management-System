import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateTeamRequest = {
  name: string;
  projectTitle?: string;
  description?: string;
};

export type UpdateTeamRequest = {
  name?: string;
  projectTitle?: string;
  description?: string;
};

export type InviteMemberRequest = {
  email: string;
  message?: string;
};

export type RejectInvitationRequest = {
  reason?: string;
};

export type RemoveMemberRequest = {
  reason?: string;
};

export type TransferLeaderRequest = {
  newLeaderUserId: UUID;
};

export type LeaveTeamRequest = {
  reason?: string;
};

export type ToggleJoinCodeRequest = {
  enabled: boolean;
};

export type TeamResponse = {
  id: UUID;
  name: string;
  projectTitle?: string;
  leaderId: UUID;
  leaderName: string;
  trackId?: UUID;
  status: string;
  memberCount: number;
};

export type TeamSummaryResponse = {
  id: UUID;
  name: string;
  projectTitle?: string;
  status: string;
  roleInTeam: string;
};

export type TeamMemberResponse = {
  userId: UUID;
  fullName: string;
  email: string;
  memberRole: string;
  joinedAt: ISODateTime;
};

export type TeamDetailResponse = {
  id: UUID;
  name: string;
  projectTitle?: string;
  description?: string;
  leaderId: UUID;
  leaderName: string;
  trackId?: UUID;
  status: string;
  members: TeamMemberResponse[];
};

export type TeamInvitationResponse = {
  id: UUID;
  teamId: UUID;
  invitedEmail: string;
  status: string;
  expiresAt: ISODateTime;
};