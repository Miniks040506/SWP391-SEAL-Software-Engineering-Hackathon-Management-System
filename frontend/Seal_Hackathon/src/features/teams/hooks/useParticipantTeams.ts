import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type {
  CreateTeamRequest,
  InviteMemberRequest,
  LeaveTeamRequest,
  RemoveMemberRequest,
  TeamDetailResponse,
  TeamInvitationResponse,
  TeamResponse,
  TeamSummaryResponse,
  TransferLeaderRequest,
  UpdateTeamRequest,
} from "@/types/team.types";

const USE_MOCK_TEAMS = false;

export const participantTeamQueryKeys = {
  myTeams: ["participant-my-teams"] as const,
  detail: (teamId?: string) => ["participant-team-detail", teamId] as const,
  members: (teamId?: string) => ["participant-team-members", teamId] as const,
  invitations: (teamId?: string) =>
    ["participant-team-invitations", teamId] as const,
};

type TeamSummaryWithMemberCount = TeamSummaryResponse & {
  memberCount: number;
};

const currentUserId = "11111111-1111-1111-1111-111111111111" as UUID;

let mockTeams: TeamDetailResponse[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID,
    name: "Code Warriors",
    projectTitle: "Smart Campus App",
    description:
      "A campus management application that helps students manage schedules, notifications, and learning activities.",
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
      },
      {
        memberId: "member-aaaaaaaa-0002-0002-0002-000000000002" as UUID,
        userId: "22222222-2222-2222-2222-222222222222" as UUID,
        fullName: "Tran Minh B",
        email: "tranminhb@fpt.edu.vn",
        memberRole: "MEMBER",
        joinedAt: "2026-05-18T09:20:00",
      },
      {
        memberId: "member-aaaaaaaa-0003-0003-0003-000000000003" as UUID,
        userId: "33333333-3333-3333-3333-333333333333" as UUID,
        fullName: "Le Hoang C",
        email: "lehoangc@student.hcmut.edu.vn",
        memberRole: "MEMBER",
        joinedAt: "2026-05-18T10:00:00",
      },
    ],
  },
];

let mockInvitations: TeamInvitationResponse[] = [];

function createMockId() {
  return crypto.randomUUID() as UUID;
}

function getNowLocalDateTime() {
  return new Date().toISOString().slice(0, 19);
}

function getMockExpiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 19);
}

async function mockDelay() {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });
}

function findMockTeam(teamId?: string) {
  return mockTeams.find((team) => team.id === teamId);
}

function toTeamSummary(team: TeamDetailResponse): TeamSummaryWithMemberCount {
  return {
    id: team.id,
    name: team.name,
    projectTitle: team.projectTitle,
    status: team.status,
    roleInTeam: team.leaderId === currentUserId ? "LEADER" : "MEMBER",
    memberCount: team.members.length,
  };
}

function toTeamResponse(team: TeamDetailResponse): TeamResponse {
  return {
    id: team.id,
    name: team.name,
    projectTitle: team.projectTitle,
    leaderId: team.leaderId,
    leaderName: team.leaderName,
    trackId: team.trackId,
    status: team.status,
    memberCount: team.members.length,
  };
}

const mockTeamService = {
  async getMyTeams() {
    await mockDelay();

    return mockTeams.map(toTeamSummary);
  },

  async getTeamById(teamId: UUID) {
    await mockDelay();

    const team = findMockTeam(teamId);

    if (!team) {
      throw new Error("Team not found.");
    }

    return team;
  },

  async getTeamMembers(teamId: UUID) {
    await mockDelay();

    const team = findMockTeam(teamId);

    if (!team) {
      throw new Error("Team not found.");
    }

    return team.members;
  },

  async getTeamInvitations(teamId: UUID) {
    await mockDelay();

    return mockInvitations.filter(
      (invitation) =>
        invitation.teamId === teamId && invitation.status !== "CANCELLED",
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

    if (!updatedTeam) {
      throw new Error("Team not found.");
    }

    return toTeamResponse(updatedTeam);
  },

  async inviteMember(teamId: UUID, payload: InviteMemberRequest) {
    await mockDelay();

    const team = findMockTeam(teamId);

    if (!team) {
      throw new Error("Team not found.");
    }

    if (team.members.length >= 5) {
      throw new Error("Your team is full.");
    }

    const invitationId = createMockId();
    const token = createMockId();

    const invitation: TeamInvitationResponse = {
      id: invitationId,
      teamId,
      teamName: team.name,
      invitedEmail: payload.email,
      status: "PENDING",
      expiresAt: getMockExpiresAt(),
      token,
      acceptUrl: `/invitations/accept?token=${token}`,
      rejectUrl: `/invitations/reject?token=${token}`,
    };

    mockInvitations = [invitation, ...mockInvitations];

    return invitation;
  },

  async cancelInvitation(invitationId: UUID) {
    await mockDelay();

    mockInvitations = mockInvitations.map((invitation) =>
      invitation.id === invitationId
        ? { ...invitation, status: "CANCELLED" }
        : invitation,
    );
  },

  async removeMember(
    teamId: UUID,
    memberId: UUID,
    _payload?: RemoveMemberRequest,
  ) {
    await mockDelay();

    const team = findMockTeam(teamId);

    if (!team) {
      throw new Error("Team not found.");
    }

    const targetMember = team.members.find(
      (member) => member.memberId === memberId,
    );

    if (!targetMember) {
      throw new Error("Member not found.");
    }

    if (targetMember.userId === team.leaderId) {
      throw new Error("Cannot remove team leader.");
    }

    mockTeams = mockTeams.map((item) => {
      if (item.id !== teamId) return item;

      return {
        ...item,
        members: item.members.filter((member) => member.memberId !== memberId),
      };
    });
  },

  async transferLeader(teamId: UUID, payload: TransferLeaderRequest) {
    await mockDelay();

    let updatedTeam: TeamDetailResponse | undefined;

    mockTeams = mockTeams.map((team) => {
      if (team.id !== teamId) return team;

      const newLeader = team.members.find(
        (member) => member.userId === payload.newLeaderUserId,
      );

      if (!newLeader) {
        throw new Error("New leader not found.");
      }

      updatedTeam = {
        ...team,
        leaderId: newLeader.userId,
        leaderName: newLeader.fullName,
        members: team.members.map((member) => ({
          ...member,
          memberRole:
            member.userId === newLeader.userId ? "LEADER" : "MEMBER",
        })),
      };

      return updatedTeam;
    });

    if (!updatedTeam) {
      throw new Error("Team not found.");
    }

    return toTeamResponse(updatedTeam);
  },

  async leaveTeam(teamId: UUID, _payload?: LeaveTeamRequest) {
    await mockDelay();

    const team = findMockTeam(teamId);

    if (!team) {
      throw new Error("Team not found.");
    }

    if (team.leaderId === currentUserId) {
      mockTeams = mockTeams.filter((item) => item.id !== teamId);
      return;
    }

    mockTeams = mockTeams.map((item) => {
      if (item.id !== teamId) return item;

      return {
        ...item,
        members: item.members.filter(
          (member) => member.userId !== currentUserId,
        ),
      };
    });
  },
};

const apiTeamService = {
  getMyTeams: teamApi.getMyTeams,
  getTeamById: teamApi.getTeamById,
  getTeamMembers: teamApi.getTeamMembers,
  getTeamInvitations: teamApi.getTeamInvitations,
  createTeam: teamApi.createTeam,
  updateTeam: teamApi.updateTeam,
  inviteMember: teamApi.inviteMember,
  cancelInvitation: teamApi.cancelInvitation,
  removeMember: teamApi.removeMember,
  transferLeader: teamApi.transferLeader,
  leaveTeam: teamApi.leaveTeam,
};

const activeTeamService = USE_MOCK_TEAMS ? mockTeamService : apiTeamService;

export function useMyTeamsQuery() {
  return useQuery({
    queryKey: participantTeamQueryKeys.myTeams,
    queryFn: () => activeTeamService.getMyTeams(),
  });
}

export function useTeamDetailQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.detail(teamId),
    queryFn: () => activeTeamService.getTeamById(teamId as UUID),
    enabled: Boolean(teamId),
  });
}

export function useTeamMembersQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.members(teamId),
    queryFn: () => activeTeamService.getTeamMembers(teamId as UUID),
    enabled: Boolean(teamId),
  });
}

export function useTeamInvitationsQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.invitations(teamId),
    queryFn: () => activeTeamService.getTeamInvitations(teamId as UUID),
    enabled: Boolean(teamId),
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateTeamRequest) =>
      activeTeamService.createTeam(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Team created successfully. You are now the Team Leader."
          : "Team created successfully. You are now the Team Leader.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to create team."
          : "Failed to create team.",
        { variant: "error" },
      );
    },
  });
}

export function useUpdateTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateTeamRequest) =>
      activeTeamService.updateTeam(teamId as UUID, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });

      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Team updated successfully."
          : "Team updated successfully.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to update team."
          : "Failed to update team.",
        { variant: "error" },
      );
    },
  });
}

export function useInviteTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: InviteMemberRequest) =>
      activeTeamService.inviteMember(teamId as UUID, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.invitations(teamId),
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Invitation sent successfully."
          : "Invitation sent successfully.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to send invitation."
          : "Failed to send invitation.",
        { variant: "error" },
      );
    },
  });
}

export function useCancelTeamInvitationMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (invitationId: UUID) =>
      activeTeamService.cancelInvitation(invitationId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.invitations(teamId),
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Invitation cancelled successfully."
          : "Invitation cancelled successfully.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to cancel invitation."
          : "Failed to cancel invitation.",
        { variant: "error" },
      );
    },
  });
}

export function useRemoveTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: UUID;
      payload?: RemoveMemberRequest;
    }) => activeTeamService.removeMember(teamId as UUID, memberId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });

      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.members(teamId),
      });

      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Member removed successfully."
          : "Member removed successfully.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to remove member."
          : "Failed to remove member.",
        { variant: "error" },
      );
    },
  });
}

export function useTransferTeamLeaderMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: TransferLeaderRequest) =>
      activeTeamService.transferLeader(teamId as UUID, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });

      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Team leader transferred successfully."
          : "Team leader transferred successfully.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to transfer team leader."
          : "Failed to transfer team leader.",
        { variant: "error" },
      );
    },
  });
}

export function useLeaveTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload?: LeaveTeamRequest) =>
      activeTeamService.leaveTeam(teamId as UUID, payload ?? {}),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });

      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });

      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: You left the team successfully."
          : "You left the team successfully.",
        { variant: "success" },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to leave team."
          : "Failed to leave team.",
        { variant: "error" },
      );
    },
  });
}