// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useSnackbar } from "notistack";

// import { teamApi } from "@/api/team.api";
// import type { UUID } from "@/types/common.types";
// import type {
//   CreateTeamRequest,
//   LeaveTeamRequest,
//   RemoveMemberRequest,
//   TransferLeaderRequest,
//   UpdateTeamRequest,
// } from "@/types/team.types";

// export const participantTeamQueryKeys = {
//   myTeams: ["participant-my-teams"] as const,
//   detail: (teamId?: string) => ["participant-team-detail", teamId] as const,
//   members: (teamId?: string) => ["participant-team-members", teamId] as const,
// };

// export function useMyTeamsQuery() {
//   return useQuery({
//     queryKey: participantTeamQueryKeys.myTeams,
//     queryFn: teamApi.getMyTeams,
//   });
// }

// export function useTeamDetailQuery(teamId?: string) {
//   return useQuery({
//     queryKey: participantTeamQueryKeys.detail(teamId),
//     queryFn: () => teamApi.getTeamById(teamId as UUID),
//     enabled: Boolean(teamId),
//   });
// }

// export function useTeamMembersQuery(teamId?: string) {
//   return useQuery({
//     queryKey: participantTeamQueryKeys.members(teamId),
//     queryFn: () => teamApi.getTeamMembers(teamId as UUID),
//     enabled: Boolean(teamId),
//   });
// }

// export function useCreateTeamMutation() {
//   const queryClient = useQueryClient();
//   const { enqueueSnackbar } = useSnackbar();

//   return useMutation({
//     mutationFn: (payload: CreateTeamRequest) => teamApi.createTeam(payload),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.myTeams,
//       });

//       enqueueSnackbar("Team created successfully. You are now the Team Leader.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to create team.", {
//         variant: "error",
//       });
//     },
//   });
// }

// export function useUpdateTeamMutation(teamId?: string) {
//   const queryClient = useQueryClient();
//   const { enqueueSnackbar } = useSnackbar();

//   return useMutation({
//     mutationFn: (payload: UpdateTeamRequest) =>
//       teamApi.updateTeam(teamId as UUID, payload),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.detail(teamId),
//       });

//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.myTeams,
//       });

//       enqueueSnackbar("Team updated successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to update team.", {
//         variant: "error",
//       });
//     },
//   });
// }

// export function useRemoveTeamMemberMutation(teamId?: string) {
//   const queryClient = useQueryClient();
//   const { enqueueSnackbar } = useSnackbar();

//   return useMutation({
//     mutationFn: ({
//       memberId,
//       payload,
//     }: {
//       memberId: UUID;
//       payload?: RemoveMemberRequest;
//     }) => teamApi.removeMember(teamId as UUID, memberId, payload),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.detail(teamId),
//       });

//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.members(teamId),
//       });

//       enqueueSnackbar("Member removed successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to remove member.", {
//         variant: "error",
//       });
//     },
//   });
// }

// export function useTransferTeamLeaderMutation(teamId?: string) {
//   const queryClient = useQueryClient();
//   const { enqueueSnackbar } = useSnackbar();

//   return useMutation({
//     mutationFn: (payload: TransferLeaderRequest) =>
//       teamApi.transferLeader(teamId as UUID, payload),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.detail(teamId),
//       });

//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.myTeams,
//       });

//       enqueueSnackbar("Team leader transferred successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to transfer team leader.", {
//         variant: "error",
//       });
//     },
//   });
// }

// export function useLeaveTeamMutation(teamId?: string) {
//   const queryClient = useQueryClient();
//   const { enqueueSnackbar } = useSnackbar();

//   return useMutation({
//     mutationFn: (payload?: LeaveTeamRequest) =>
//       teamApi.leaveTeam(teamId as UUID, payload ?? {}),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: participantTeamQueryKeys.myTeams,
//       });

//       enqueueSnackbar("You left the team successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to leave team.", {
//         variant: "error",
//       });
//     },
//   });
// }

























//---------MOCKS-------------

import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

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

export const participantTeamQueryKeys = {
  myTeams: ["participant-my-teams"] as const,
  detail: (teamId?: string) => ["participant-team-detail", teamId] as const,
  members: (teamId?: string) => ["participant-team-members", teamId] as const,
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

let mockVersion = 0;

const listeners = new Set<() => void>();

function notifyStoreChanged() {
  mockVersion += 1;
  listeners.forEach((listener) => listener());
}

function subscribeToMockStore(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getMockSnapshot() {
  return mockVersion;
}

function useMockVersion() {
  useSyncExternalStore(
    subscribeToMockStore,
    getMockSnapshot,
    getMockSnapshot,
  );
}

function toTeamSummary(team: TeamDetailResponse): TeamSummaryResponse {
  const isLeader = team.leaderId === currentUserId;

  return {
    id: team.id,
    name: team.name,
    projectTitle: team.projectTitle,
    status: team.status,
    roleInTeam: isLeader ? "LEADER" : "MEMBER",
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

function findTeam(teamId?: string) {
  return mockTeams.find((team) => team.id === teamId);
}

function createMockId() {
  return crypto.randomUUID() as UUID;
}

export function useMyTeamsQuery() {
  useMockVersion();

  return {
    data: mockTeams.map(toTeamSummary),
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      return {
        data: mockTeams.map(toTeamSummary),
      };
    },
  };
}

export function useTeamDetailQuery(teamId?: string) {
  useMockVersion();

  return {
    data: findTeam(teamId),
    isLoading: false,
    isError: Boolean(teamId && !findTeam(teamId)),
    error: null,
    refetch: async () => {
      return {
        data: findTeam(teamId),
      };
    },
  };
}

export function useTeamMembersQuery(teamId?: string) {
  useMockVersion();

  const team = findTeam(teamId);

  return {
    data: team?.members ?? [],
    isLoading: false,
    isError: Boolean(teamId && !team),
    error: null,
    refetch: async () => {
      return {
        data: team?.members ?? [],
      };
    },
  };
}

export function useCreateTeamMutation() {
  const { enqueueSnackbar } = useSnackbar();

  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (payload: CreateTeamRequest) => {
    setIsPending(true);

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
          joinedAt: new Date().toISOString().slice(0, 19),
        },
      ],
    };

    mockTeams = [newTeam, ...mockTeams];
    notifyStoreChanged();

    enqueueSnackbar("Mock: Team created successfully. You are now the Team Leader.", {
      variant: "success",
    });

    setIsPending(false);

    return toTeamResponse(newTeam);
  };

  return {
    mutateAsync,
    isPending,
  };
}

export function useUpdateTeamMutation(teamId?: string) {
  const { enqueueSnackbar } = useSnackbar();

  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (payload: UpdateTeamRequest) => {
    setIsPending(true);

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

    notifyStoreChanged();

    enqueueSnackbar("Mock: Team updated successfully.", {
      variant: "success",
    });

    setIsPending(false);

    return updatedTeam ? toTeamResponse(updatedTeam) : undefined;
  };

  return {
    mutateAsync,
    mutate: (payload: UpdateTeamRequest) => {
      void mutateAsync(payload);
    },
    isPending,
  };
}

export function useRemoveTeamMemberMutation(teamId?: string) {
  const { enqueueSnackbar } = useSnackbar();

  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({
    memberId,
  }: {
    memberId: UUID;
    payload?: RemoveMemberRequest;
  }) => {
    setIsPending(true);

    mockTeams = mockTeams.map((team) => {
      if (team.id !== teamId) return team;

      if (team.leaderId === memberId) return team;

      return {
        ...team,
        members: team.members.filter((member) => member.userId !== memberId),
      };
    });

    notifyStoreChanged();

    enqueueSnackbar("Mock: Member removed successfully.", {
      variant: "success",
    });

    setIsPending(false);
  };

  return {
    mutateAsync,
    mutate: (payload: { memberId: UUID; payload?: RemoveMemberRequest }) => {
      void mutateAsync(payload);
    },
    isPending,
  };
}

export function useTransferTeamLeaderMutation(teamId?: string) {
  const { enqueueSnackbar } = useSnackbar();

  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (payload: TransferLeaderRequest) => {
    setIsPending(true);

    let updatedTeam: TeamDetailResponse | undefined;

    mockTeams = mockTeams.map((team) => {
      if (team.id !== teamId) return team;

      const newLeader = team.members.find(
        (member) => member.userId === payload.newLeaderUserId,
      );

      if (!newLeader) return team;

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

    notifyStoreChanged();

    enqueueSnackbar("Mock: Team leader transferred successfully.", {
      variant: "success",
    });

    setIsPending(false);

    return updatedTeam ? toTeamResponse(updatedTeam) : undefined;
  };

  return {
    mutateAsync,
    mutate: (payload: TransferLeaderRequest) => {
      void mutateAsync(payload);
    },
    isPending,
  };
}

export function useLeaveTeamMutation(teamId?: string) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (_payload?: LeaveTeamRequest) => {
    setIsPending(true);

    const team = findTeam(teamId);

    if (team?.leaderId === currentUserId) {
      mockTeams = mockTeams.filter((item) => item.id !== teamId);
    } else {
      mockTeams = mockTeams.map((item) => {
        if (item.id !== teamId) return item;

        return {
          ...item,
          members: item.members.filter(
            (member) => member.userId !== currentUserId,
          ),
        };
      });
    }

    notifyStoreChanged();

    enqueueSnackbar("Mock: You left the team successfully.", {
      variant: "success",
    });

    setIsPending(false);
    navigate("/participant/teams");
  };

  return {
    mutateAsync,
    mutate: (payload?: LeaveTeamRequest) => {
      void mutateAsync(payload);
    },
    isPending,
  };
}