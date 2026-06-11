import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type {
  CreateTeamRequest,
  LeaveTeamRequest,
  RemoveMemberRequest,
  TeamDetailResponse,
  TeamMemberResponse,
  TeamResponse,
  TeamSummaryResponse,
  TransferLeaderRequest,
  UpdateTeamRequest,
} from "@/types/team.types";

/**
 * true  = dùng mock, không gọi BE
 * false = gọi API BE thật qua teamApi
 */
const USE_MOCK_TEAMS = true;

export const participantTeamQueryKeys = {
  myTeams: ["participant-my-teams"] as const,
  detail: (teamId?: string) => ["participant-team-detail", teamId] as const,
  members: (teamId?: string) => ["participant-team-members", teamId] as const,
};

type TeamSummaryWithMemberCount = TeamSummaryResponse & {
  memberCount: number;
};

const currentUserId = "11111111-1111-1111-1111-111111111111" as UUID;

/* =========================================================
 * MOCK DATA
 * ======================================================= */

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
        userId: currentUserId,
        fullName: "Nguyen Van A",
        email: "nguyenvana@fpt.edu.vn",
        memberRole: "LEADER",
        joinedAt: "2026-05-18T09:00:00",
      },
      {
        userId: "22222222-2222-2222-2222-222222222222" as UUID,
        fullName: "Tran Minh B",
        email: "tranminhb@fpt.edu.vn",
        memberRole: "MEMBER",
        joinedAt: "2026-05-18T09:20:00",
      },
      {
        userId: "33333333-3333-3333-3333-333333333333" as UUID,
        fullName: "Le Hoang C",
        email: "lehoangc@student.hcmut.edu.vn",
        memberRole: "MEMBER",
        joinedAt: "2026-05-18T10:00:00",
      },
      {
        userId: "44444444-4444-4444-4444-444444444444" as UUID,
        fullName: "Pham Gia D",
        email: "phamgiad@fpt.edu.vn",
        memberRole: "MEMBER",
        joinedAt: "2026-05-19T08:30:00",
      },
    ],
  },
];

/* =========================================================
 * MOCK HELPERS
 * ======================================================= */

function createMockId() {
  return crypto.randomUUID() as UUID;
}

function getNowLocalDateTime() {
  return new Date().toISOString().slice(0, 19);
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

/* =========================================================
 * MOCK SERVICE
 * Phần này giả lập BE.
 * ======================================================= */

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

  async createTeam(payload: CreateTeamRequest) {
    await mockDelay();

    const newTeam: TeamDetailResponse = {
      id: createMockId(),
      name: payload.name,
      projectTitle: payload.projectTitle,
      description: payload.description,
      leaderId: currentUserId,
      leaderName: "Nguyen Van A",
      status: "DRAFT",
      members: [
        {
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

    if (team.leaderId === memberId) {
      throw new Error("Cannot remove team leader.");
    }

    mockTeams = mockTeams.map((item) => {
      if (item.id !== teamId) return item;

      return {
        ...item,
        members: item.members.filter((member) => member.userId !== memberId),
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

/* =========================================================
 * API SERVICE
 * Phần này gọi BE thật.
 * ======================================================= */

const apiTeamService = {
  getMyTeams: teamApi.getMyTeams,
  getTeamById: teamApi.getTeamById,
  getTeamMembers: teamApi.getTeamMembers,
  createTeam: teamApi.createTeam,
  updateTeam: teamApi.updateTeam,
  removeMember: teamApi.removeMember,
  transferLeader: teamApi.transferLeader,
  leaveTeam: teamApi.leaveTeam,
};

/* =========================================================
 * ACTIVE SERVICE
 * Đổi USE_MOCK_TEAMS ở đầu file để chuyển mock/API.
 * ======================================================= */

const activeTeamService = USE_MOCK_TEAMS ? mockTeamService : apiTeamService;

/* =========================================================
 * PUBLIC HOOKS
 * Các page chỉ import các hook bên dưới.
 * Không đổi tên hook để tránh sửa nhiều file.
 * ======================================================= */

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
        {
          variant: "success",
        },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS ? "Mock: Failed to create team." : "Failed to create team.",
        {
          variant: "error",
        },
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
        {
          variant: "success",
        },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS ? "Mock: Failed to update team." : "Failed to update team.",
        {
          variant: "error",
        },
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
        {
          variant: "success",
        },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to remove member."
          : "Failed to remove member.",
        {
          variant: "error",
        },
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
        {
          variant: "success",
        },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS
          ? "Mock: Failed to transfer team leader."
          : "Failed to transfer team leader.",
        {
          variant: "error",
        },
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
        {
          variant: "success",
        },
      );
    },

    onError: () => {
      enqueueSnackbar(
        USE_MOCK_TEAMS ? "Mock: Failed to leave team." : "Failed to leave team.",
        {
          variant: "error",
        },
      );
    },
  });
}