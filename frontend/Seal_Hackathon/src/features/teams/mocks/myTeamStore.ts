import { create } from "zustand";

import {
  currentParticipantId,
  myTeamMock,
  participantEventsMock,
  participantTracksMock,
} from "../mocks/myTeams.mock";

import type {
  CreateTeamFormValues,
  InviteMemberFormValues,
  MyTeam,
  ParticipantEventOption,
  ParticipantTrackOption,
  TeamInvitation,
} from "../schemas/team.schema";

const createId = () => crypto.randomUUID();

const getNowLabel = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());

type MyTeamStore = {
  events: ParticipantEventOption[];
  tracks: ParticipantTrackOption[];
  currentParticipantId: string;
  myTeam: MyTeam | null;

  createTeam: (values: CreateTeamFormValues) => string;
  inviteMember: (values: InviteMemberFormValues) => void;
  cancelInvitation: (invitationId: string) => void;
  removeMember: (memberId: string) => void;
  transferLeader: (memberId: string) => void;
  leaveTeam: () => void;
  registerTrack: (trackId: string) => void;
};

const initialTeam: MyTeam | null = myTeamMock;
// Đổi thành null để test màn "You are not in any team yet."
// const initialTeam: MyTeam | null = null;

export const useMyTeamStore = create<MyTeamStore>((set, get) => ({
  events: participantEventsMock,
  tracks: participantTracksMock,
  currentParticipantId,
  myTeam: initialTeam,

  createTeam: (values) => {
    const teamId = createId();

    const newTeam: MyTeam = {
      id: teamId,
      teamName: values.teamName,
      projectName: values.projectName,
      projectDescription: values.projectDescription,
      eventId: values.eventId,
      leaderId: currentParticipantId,
      registration: null,
      members: [
        {
          id: currentParticipantId,
          name: "Nguyen Van A",
          email: "nguyenvana@fpt.edu.vn",
          role: "LEADER",
          studentType: "FPT_STUDENT",
          studentCode: "SE123456",
        },
      ],
      invitations: [],
    };

    set({ myTeam: newTeam });

    return teamId;
  },

  inviteMember: (values) => {
    const { myTeam } = get();
    if (!myTeam || myTeam.members.length >= 5) return;

    const newInvitation: TeamInvitation = {
      id: createId(),
      email: values.email,
      status: "PENDING",
      expiresIn: "24 hours",
    };

    set({
      myTeam: {
        ...myTeam,
        invitations: [newInvitation, ...myTeam.invitations],
      },
    });
  },

  cancelInvitation: (invitationId) => {
    const { myTeam } = get();
    if (!myTeam) return;

    set({
      myTeam: {
        ...myTeam,
        invitations: myTeam.invitations.map((invitation) =>
          invitation.id === invitationId
            ? { ...invitation, status: "CANCELLED" }
            : invitation,
        ),
      },
    });
  },

  removeMember: (memberId) => {
    const { myTeam } = get();
    if (!myTeam || memberId === myTeam.leaderId) return;

    set({
      myTeam: {
        ...myTeam,
        members: myTeam.members.filter((member) => member.id !== memberId),
      },
    });
  },

  transferLeader: (memberId) => {
    const { myTeam } = get();
    if (!myTeam) return;

    set({
      myTeam: {
        ...myTeam,
        leaderId: memberId,
        members: myTeam.members.map((member) => ({
          ...member,
          role: member.id === memberId ? "LEADER" : "MEMBER",
        })),
      },
    });
  },

  leaveTeam: () => {
    set({ myTeam: null });
  },

  registerTrack: (trackId) => {
    const { myTeam } = get();
    if (!myTeam) return;

    set({
      myTeam: {
        ...myTeam,
        registration: {
          eventId: myTeam.eventId,
          trackId,
          status: "PENDING_APPROVAL",
          submittedAt: getNowLabel(),
        },
      },
    });
  },
}));