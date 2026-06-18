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

export type CoordinatorTeamSubmissionProgressResponse = {
  roundId?: UUID | null;
  roundName?: string | null;
  roundOrderIndex?: number | null;
  roundStatus?: string | null;
  submissionId?: UUID | null;
  submissionStatus?: string | null;
  submissionNumber?: number | null;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  linkCount: number;
  note?: string | null;
};

export type CoordinatorTeamMemberResponse = {
  memberId: UUID;
  userId?: UUID | null;
  fullName?: string | null;
  email?: string | null;
  role?: TeamMemberRole | null;
  userStatus?: string | null;
  joinedAt?: ISODateTime | null;
};

export type CoordinatorTeamSummaryResponse = {
  teamId: UUID;
  teamName: string;
  projectTitle?: string | null;
  status?: TeamStatus | null;
  eventId?: UUID | null;
  eventName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  leaderId?: UUID | null;
  leaderName?: string | null;
  leaderEmail?: string | null;
  memberCount: number;
  submissionCount: number;
  submittedSubmissionCount: number;
  missingSubmissionCount: number;
  latestSubmissionStatus?: string | null;
  registeredAt?: ISODateTime | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
};

export type CoordinatorTeamDetailResponse = CoordinatorTeamSummaryResponse & {
  description?: string | null;
  joinCode?: string | null;
  joinCodeEnabled: boolean;
  members: CoordinatorTeamMemberResponse[];
  submissions: CoordinatorTeamSubmissionProgressResponse[];
};

export type CoordinatorTeamListParams = {
  trackId?: UUID;
  eventId?: UUID;
  search?: string;
  status?: string;
  page?: number;
  size?: number;
};

export type MentorTeamProgressResponse = {
  teamId: UUID;
  teamName: string;
  projectTitle?: string | null;
  status?: TeamStatus | null;
  eventId?: UUID | null;
  eventName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  leaderId?: UUID | null;
  leaderName?: string | null;
  leaderEmail?: string | null;
  memberCount: number;
  submissionCount: number;
  submittedSubmissionCount: number;
  missingSubmissionCount: number;
  latestSubmissionStatus?: string | null;
  registeredAt?: ISODateTime | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundProgress: CoordinatorTeamSubmissionProgressResponse[];
};

export type MentorTeamDetailResponse = {
  teamId: UUID;
  teamName: string;
  projectTitle?: string | null;
  description?: string | null;
  status?: string | null;
  eventId?: UUID | null;
  eventName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  leaderId?: UUID | null;
  leaderName?: string | null;
  leaderEmail?: string | null;
  memberCount: number;
  submissionCount: number;
  submittedSubmissionCount: number;
  missingSubmissionCount: number;
  latestSubmissionStatus?: string | null;
  registeredAt?: ISODateTime | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  members: CoordinatorTeamMemberResponse[];
  submissions: CoordinatorTeamSubmissionProgressResponse[];
};
