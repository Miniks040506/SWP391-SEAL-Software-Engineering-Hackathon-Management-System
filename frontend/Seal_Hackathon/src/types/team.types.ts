import type { ISODateTime, UUID } from "@/types/common.types";

export type TeamStatus =
  | "FORMING"
  | "INCOMPLETE"
  | "REGISTERED"
  | "COMPETING"
  | "ADVANCED"
  | "ELIMINATED"
  | "WINNER"
  | string;

export type TeamMemberRole = "LEADER" | "MEMBER" | string;

export type TeamInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"
  | string;

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

export type JoinTeamByCodeRequest = {
  joinCode: string;
};

export type TeamResponse = {
  id: UUID;
  name: string;
  projectTitle?: string | null;
  leaderId: UUID;
  leaderName: string;
  trackId?: UUID | null;
  status: TeamStatus;
  memberCount: number;
};

export type TeamSummaryResponse = {
  id: UUID;
  name: string;
  projectTitle?: string | null;
  status: TeamStatus;
  roleInTeam: TeamMemberRole;
};

export type TeamMemberResponse = {
  memberId: UUID;
  userId: UUID;
  fullName: string;
  email: string;
  memberRole: TeamMemberRole;
  joinedAt: ISODateTime;
};

export type TeamDetailResponse = {
  id: UUID;
  name: string;
  projectTitle?: string | null;
  description?: string | null;
  leaderId: UUID;
  leaderName: string;
  trackId?: UUID | null;
  status: TeamStatus;
  members: TeamMemberResponse[];
};

export type TeamInvitationResponse = {
  id: UUID;
  teamId: UUID;
  teamName: string;
  invitedEmail: string;
  status: TeamInvitationStatus;
  expiresAt: ISODateTime;
  token: string;
  acceptUrl: string;
  rejectUrl: string;
};

export type TeamJoinCodePreviewResponse = {
  teamId: UUID;
  teamName: string;
  projectTitle?: string | null;
  description?: string | null;
  leaderId?: UUID | null;
  leaderName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  eventId?: UUID | null;
  eventName?: string | null;
  status: TeamStatus;
  memberCount: number;
  maxMembers: number;
  joinCodeEnabled: boolean;
};

// added
export type CoordinatorTeamListParams = {
  trackId?: string;
  eventId?: string;
  search?: string;
  status?: string;
  page?: number;
  size?: number;
};
