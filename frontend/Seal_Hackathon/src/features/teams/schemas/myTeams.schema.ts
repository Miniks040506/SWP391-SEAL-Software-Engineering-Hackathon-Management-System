import { z } from "zod";

export const TEAM_STATUSES = [
  "NOT_REGISTERED",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
] as const;

export const TEAM_MEMBER_ROLES = ["LEADER", "MEMBER"] as const;

export const STUDENT_TYPES = ["FPT_STUDENT", "EXTERNAL_STUDENT"] as const;

export const INVITATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "CANCELLED",
  "EXPIRED",
  "APPROVED",
] as const;

export const createTeamSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(3, "Team name must be 3-50 characters.")
    .max(50, "Team name must be 3-50 characters."),
  projectName: z.string().trim().optional().or(z.literal("")),
  projectDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  eventId: z.string().min(1, "Select event is required."),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Email address is invalid"),
});

export type TeamStatus = (typeof TEAM_STATUSES)[number];
export type TeamMemberRole = (typeof TEAM_MEMBER_ROLES)[number];
export type StudentType = (typeof STUDENT_TYPES)[number];
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export type ParticipantEventOption = {
  id: string;
  name: string;
  season: "SPRING" | "SUMMER" | "FALL";
};

export type ParticipantTrackOption = {
  id: string;
  eventId: string;
  name: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  studentType: StudentType;
  studentCode?: string;
  university?: string;
};

export type TeamInvitation = {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresIn?: string;
};

export type TeamRegistration = {
  eventId: string;
  trackId: string;
  status: TeamStatus;
  submittedAt: string;
};

export type MyTeam = {
  id: string;
  teamName: string;
  projectName?: string;
  projectDescription?: string;
  eventId: string;
  leaderId: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  registration: TeamRegistration | null;
};
