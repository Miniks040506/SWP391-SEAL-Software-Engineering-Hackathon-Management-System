import type { UUID } from "@/types/common.types";
import type {
  CreateTeamRequest,
  InviteMemberRequest,
  LeaveTeamRequest,
  RejectInvitationRequest,
  RemoveMemberRequest,
  TeamDetailResponse,
  TeamInvitationResponse,
  TeamMemberResponse,
  TeamResponse,
  TeamSummaryResponse,
  TransferLeaderRequest,
  UpdateTeamRequest,
} from "@/types/team.types";

export type TeamSummaryWithMemberCount = TeamSummaryResponse & {
  memberCount: number;
};

export const currentUserId = "11111111-1111-1111-1111-111111111111" as UUID;
export const currentUserEmail = "nguyenvana@fpt.edu.vn";

export let mockTeams: TeamDetailResponse[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID,
    name: "Code Warriors",
    projectTitle: "Smart Campus App",
    description: "A campus management application that helps students manage schedules, notifications, and learning activities.",
    leaderId: currentUserId,
    leaderName: "Nguyen Van A",
    trackId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID,
    status: "APPROVED",
    members: [
      {
        memberId: "member-aaaaaaaa-0001-0001-0001-000000000001" as UUID,
        userId: currentUserId,
        fullName: "Nguyen Van A",
        email: "nguyenvana@fpt.edu.vn",
        memberRole: "LEADER",
        joinedAt: "2026-05-18T09:00:00",
      }
    ],
  },
  {
    id: "team-2222-2222-2222-222222222222" as UUID,
    name: "Null Pointers",
    projectTitle: "Smart Healthcare App",
    description: "AI-driven health analytics",
    leaderId: "user-9999" as UUID,
    leaderName: "Tran Minh B",
    trackId: null,
    status: "REGISTERED",
    members: [],
  }
];

export let mockInvitations: TeamInvitationResponse[] = [
  {
    id: "inv-1111" as UUID,
    teamId: "team-2222-2222-2222-222222222222" as UUID,
    teamName: "Null Pointers",
    invitedEmail: currentUserEmail,
    status: "PENDING",
    expiresAt: new Date(Date.now() + 86400000).toISOString().slice(0, 19),
    token: "mock-token-123",
    acceptUrl: "/invitations/accept?token=mock-token-123",
    rejectUrl: "/invitations/reject?token=mock-token-123",
  }
];

const createMockId = () => crypto.randomUUID() as UUID;
const getNowLocalDateTime = () => new Date().toISOString().slice(0, 19);
const getMockExpiresAt = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 19);
};
const mockDelay = () => new Promise((resolve) => window.setTimeout(resolve, 400));

const toTeamSummary = (team: TeamDetailResponse): TeamSummaryWithMemberCount => ({
  id: team.id,
  name: team.name,
  projectTitle: team.projectTitle,
  status: team.status,
  roleInTeam: team.leaderId === currentUserId ? "LEADER" : "MEMBER",
  memberCount: team.members.length,
});

const toTeamResponse = (team: TeamDetailResponse): TeamResponse => ({
  id: team.id,
  name: team.name,
  projectTitle: team.projectTitle,
  leaderId: team.leaderId,
  leaderName: team.leaderName,
  trackId: team.trackId,
  status: team.status,
  memberCount: team.members.length,
});

export const mockTeamService = {
  async getMyTeams() {
    await mockDelay();
    return mockTeams.filter(t => t.members.some(m => m.userId === currentUserId)).map(toTeamSummary);
  },

  async getTeamById(teamId: UUID) {
    await mockDelay();
    const team = mockTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");
    return team;
  },

  async getTeamMembers(teamId: UUID) {
    await mockDelay();
    const team = mockTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");
    return team.members;
  },

  async getTeamInvitations(teamId: UUID) {
    await mockDelay();
    return mockInvitations.filter(
      (inv) => inv.teamId === teamId && inv.status !== "CANCELLED"
    );
  },

  async createTeam(payload: CreateTeamRequest) {
    await mockDelay();
    const newTeam: TeamDetailResponse = {
      id: createMockId(),
      name: payload.name,
      projectTitle: payload.projectTitle,
      description: payload.description,
      leaderId: currentUserId,
      leaderName: "Nguyen Van A",
      trackId: null,
      status: "DRAFT",
      members: [
        {
          memberId: createMockId(),
          userId: currentUserId,
          fullName: "Nguyen Van A",
          email: "nguyenvana@fpt.edu.vn",
          memberRole: "LEADER",
          joinedAt: getNowLocalDateTime(),
        },
      ],
    };
    mockTeams = [newTeam, ...mockTeams];
    return toTeamResponse(newTeam);
  },

  async updateTeam(teamId: UUID, payload: UpdateTeamRequest) {
    await mockDelay();
    let updatedTeam: TeamDetailResponse | undefined;
    mockTeams = mockTeams.map((team) => {
      if (team.id !== teamId) return team;
      updatedTeam = {
        ...team,
        name: payload.name ?? team.name,
        projectTitle: payload.projectTitle ?? team.projectTitle,
        description: payload.description ?? team.description,
      };
      return updatedTeam;
    });
    if (!updatedTeam) throw new Error("Team not found.");
    return toTeamResponse(updatedTeam);
  },

  async inviteMember(teamId: UUID, payload: InviteMemberRequest) {
    await mockDelay();
    const team = mockTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");
    if (team.members.length >= 5) throw new Error("Your team is full.");

    const isDuplicate = mockInvitations.some(i => i.teamId === teamId && i.invitedEmail === payload.email && i.status === "PENDING");
    if (isDuplicate) throw new Error("An invitation is already pending for this email.");

    const token = createMockId();
    const invitation: TeamInvitationResponse = {
      id: createMockId(),
      teamId,
      teamName: team.name,
      invitedEmail: payload.email,
      status: "PENDING",
      expiresAt: getMockExpiresAt(),
      token,
      acceptUrl: `/invitations/accept?token=${token}`,
      rejectUrl: `/invitations/reject?token=${token}`,
    };
    mockInvitations.unshift(invitation);
    return invitation;
  },

  async cancelInvitation(invitationId: UUID) {
    await mockDelay();
    mockInvitations = mockInvitations.map((inv) =>
      inv.id === invitationId ? { ...inv, status: "CANCELLED" } : inv
    );
  },

  async removeMember(teamId: UUID, memberId: UUID, _payload?: RemoveMemberRequest) {
    await mockDelay();
    const team = mockTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");

    const targetMember = team.members.find((m) => m.memberId === memberId);
    if (!targetMember) throw new Error("Member not found.");
    if (targetMember.userId === team.leaderId) throw new Error("Cannot remove team leader.");

    mockTeams = mockTeams.map((item) => {
      if (item.id !== teamId) return item;
      return { ...item, members: item.members.filter((m) => m.memberId !== memberId) };
    });
  },

  async transferLeader(teamId: UUID, payload: TransferLeaderRequest) {
    await mockDelay();
    let updatedTeam: TeamDetailResponse | undefined;
    mockTeams = mockTeams.map((team) => {
      if (team.id !== teamId) return team;
      const newLeader = team.members.find((m) => m.userId === payload.newLeaderUserId);
      if (!newLeader) throw new Error("New leader not found.");
      
      updatedTeam = {
        ...team,
        leaderId: newLeader.userId,
        leaderName: newLeader.fullName,
        members: team.members.map((m) => ({
          ...m,
          memberRole: m.userId === newLeader.userId ? "LEADER" : "MEMBER",
        })),
      };
      return updatedTeam;
    });
    if (!updatedTeam) throw new Error("Team not found.");
    return toTeamResponse(updatedTeam);
  },

  async leaveTeam(teamId: UUID, _payload?: LeaveTeamRequest) {
    await mockDelay();
    const team = mockTeams.find((t) => t.id === teamId);
    if (!team) throw new Error("Team not found.");

    if (team.leaderId === currentUserId) {
      mockTeams = mockTeams.filter((item) => item.id !== teamId);
      return;
    }

    mockTeams = mockTeams.map((item) => {
      if (item.id !== teamId) return item;
      return { ...item, members: item.members.filter((m) => m.userId !== currentUserId) };
    });
  },

  async getMyInvitations() {
    await mockDelay();
    return mockInvitations.filter((i) => i.invitedEmail === currentUserEmail && i.status === "PENDING");
  },

  async getInvitationByToken(token: string) {
    await mockDelay();
    const inv = mockInvitations.find((i) => i.token === token);
    if (!inv) throw new Error("Invalid or expired invitation token.");
    return inv;
  },

  async acceptInvitation(invitationId: UUID) {
    await mockDelay();
    const inv = mockInvitations.find((i) => i.id === invitationId);
    if (!inv || inv.status !== "PENDING") throw new Error("Invalid invitation.");
    inv.status = "ACCEPTED";
    
    const team = mockTeams.find((t) => t.id === inv.teamId);
    let newMember: TeamMemberResponse | null = null;
    if (team) {
      newMember = { 
        memberId: createMockId(), userId: currentUserId, fullName: "Nguyen Van A", 
        email: currentUserEmail, memberRole: "MEMBER", joinedAt: getNowLocalDateTime() 
      };
      team.members.push(newMember);
    }
    return newMember as TeamMemberResponse;
  },

  async rejectInvitation(invitationId: UUID, payload?: RejectInvitationRequest) {
    await mockDelay();
    const inv = mockInvitations.find((i) => i.id === invitationId);
    if (!inv || inv.status !== "PENDING") throw new Error("Invalid invitation.");
    inv.status = "DECLINED";
  },

  async acceptInvitationByToken(token: string) {
    const inv = mockInvitations.find((i) => i.token === token);
    if (!inv) throw new Error("Invalid token.");
    return this.acceptInvitation(inv.id);
  },

  async rejectInvitationByToken(token: string, payload?: RejectInvitationRequest) {
    const inv = mockInvitations.find((i) => i.token === token);
    if (!inv) throw new Error("Invalid token.");
    return this.rejectInvitation(inv.id, payload);
  }
};