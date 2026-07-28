import type { ISODateTime, UUID } from "@/types/common.types";

export type TeamStatus =
  | "FORMING"
  | "COMPLETE"
  | "INCOMPLETE"
  | "REGISTERED"
  | "COMPETING"
  | "ADVANCED"
  | "ELIMINATED"
  | "WINNER"
  | string;

export type TeamRegistrationStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
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

export type RejectTeamRegistrationRequest = {
  reason: string;
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

export type DeleteTeamRequest = {
  reason?: string;
};

export type ToggleJoinCodeRequest = {
  enabled: boolean;
};

export type JoinTeamByCodeRequest = {
  joinCode: string;
};

export type CreateTeamJoinRequest = {
  message?: string;
};

export type FormingTeamListParams = {
  eventId?: UUID;
  trackId?: UUID;
  search?: string;
  page?: number;
  size?: number;
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
  registrationStatus?: TeamRegistrationStatus | null;
  joinCode?: string | null;
  joinCodeEnabled?: boolean | null;
};

export type TeamSummaryResponse = {
  id: UUID;
  name: string;
  projectTitle?: string | null;
  status: TeamStatus;
  registrationStatus?: TeamRegistrationStatus | null;
  roleInTeam: TeamMemberRole;
  memberCount: number;
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
  registrationStatus?: TeamRegistrationStatus | null;
  joinCode?: string | null;
  joinCodeEnabled?: boolean | null;
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

export type EventCompetitionSummaryResponse = {
  eventId: UUID;
  eventName: string;
  eventStatus: string;
  teamId: UUID;
  teamName: string;
  teamStatus: TeamStatus;
  trackId: UUID;
  trackName: string;
};

export type EventCompetitionRoundResponse = {
  roundId: UUID;
  roundName: string;
  orderIndex: number;
  description?: string | null;
  status: string;
  isFinal: boolean;
  startAt?: ISODateTime | null;
  endAt?: ISODateTime | null;
  submissionDeadline?: ISODateTime | null;
  judgingDeadline?: ISODateTime | null;
  submissionLockedAt?: ISODateTime | null;
  open: boolean;
  submissionLocked: boolean;
  canSubmit: boolean;
  canAccessRound: boolean;
  advancementConfirmed: boolean;
  advancementConfirmedAt?: ISODateTime | null;
  advanced?: boolean | null;
  eliminated: boolean;
  advanceReason?: string | null;
  rankPosition?: number | null;
  totalScore?: number | null;
  submissionId?: UUID | null;
  submissionStatus?: string | null;
  submissionNumber?: number | null;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  linkCount: number;
  problemStatementUrl?: string | null;
  problemStatementFileName?: string | null;
};

export type EventCompetitionResponse = {
  eventId: UUID;
  eventName: string;
  eventStatus: string;
  teamId: UUID;
  teamName: string;
  teamStatus: TeamStatus;
  leader: boolean;
  trackId: UUID;
  trackName: string;
  trackDescription?: string | null;
  rounds: EventCompetitionRoundResponse[];
  serverTime: ISODateTime;
};


export type TeamAdvancementStatusResponse = {
  eventId: UUID;
  eventName: string;
  teamId: UUID;
  teamName: string;
  teamStatus: TeamStatus;
  trackId: UUID;
  trackName: string;
  roundId: UUID;
  roundName: string;
  advancementConfirmed: boolean;
  advancementConfirmedAt?: ISODateTime | null;
  advanced?: boolean | null;
  eliminated: boolean;
  advanceReason?: string | null;
  rankPosition?: number | null;
  totalScore?: number | null;
  nextRoundId?: UUID | null;
  nextRoundName?: string | null;
  nextRoundStatus?: string | null;
  canAccessNextRound: boolean;
  message: string;
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

export type FormingTeamResponse = {
  id: UUID;
  name: string;
  projectTitle?: string | null;
  description?: string | null;
  leaderId: UUID;
  leaderName: string;
  trackId?: UUID | null;
  trackName?: string | null;
  eventId?: UUID | null;
  eventName?: string | null;
  status: TeamStatus;
  memberCount: number;
  maxMembers: number;
  joinCodeEnabled: boolean;
  canRequestJoin: boolean;
  alreadyMember: boolean;
  pendingJoinRequest: boolean;
};

export type TeamJoinRequestResponse = {
  id: UUID;
  teamId: UUID;
  teamName: string;
  requesterId: UUID;
  requesterName: string;
  requesterEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED" | string;
  message?: string | null;
  responseReason?: string | null;
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
  respondedAt?: ISODateTime | null;
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
  registrationStatus?: TeamRegistrationStatus | null;
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
  registrationReviewedById?: UUID | null;
  registrationReviewedByName?: string | null;
  registrationReviewedAt?: ISODateTime | null;
  registrationRejectionReason?: string | null;
  members: CoordinatorTeamMemberResponse[];
  submissions: CoordinatorTeamSubmissionProgressResponse[];
};

export type CoordinatorTeamListParams = {
  trackId?: UUID;
  eventId?: UUID;
  search?: string;
  status?: string;
  page?: number;
  registrationStatus?: TeamRegistrationStatus;
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
