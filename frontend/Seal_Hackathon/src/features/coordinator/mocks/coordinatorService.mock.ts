import { availableJudges, availableMentors, editEventMock } from "./coordinatorEditEvent.mock";
import { coordinatorEventsMock } from "./coordinatorEvents.mock";
import type { UUID } from "@/types/common.types";

let mentorAssignmentsMock: any[] = [];
let judgeAssignmentsMock: any[] = [];

let prizesMock: any[] = [
  {
    id: "prize-1",
    eventId: "seal-spring-2026",
    eventName: "Mock Event",
    rankPosition: 1,
    title: "Champion",
    description: "Overall champion of the hackathon",
    value: 5000,
    currency: "USD",
    awardedTeamId: "team-1",
    awardedTeamName: "Alpha Team",
    awardedAt: new Date().toISOString(),
  },
  {
    id: "prize-2",
    eventId: "seal-spring-2026",
    eventName: "Mock Event",
    trackId: "track-1",
    trackName: "AI Track",
    rankPosition: 1,
    title: "Best AI Project",
    value: 2000,
    currency: "USD",
    awardedTeamId: "team-2",
    awardedTeamName: "Neural Ninjas",
    awardedAt: new Date().toISOString(),
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockCoordinatorService = {
  eventApi: {
    getAllEvents: async (_params?: any) => {
      await delay(300);
      return { content: coordinatorEventsMock, page: 0, size: 10, totalElements: coordinatorEventsMock.length, totalPages: 1 };
    },
    getEventById: async (_id: UUID) => {
      await delay(300);
      return editEventMock;
    },
    createEvent: async (p: any) => { await delay(300); return p; },
    updateEvent: async (_id: UUID, p: any) => { await delay(300); return p; },
    deleteEvent: async (_id: UUID) => { await delay(300); },
  },

  trackApi: {
    getTracksByEvent: async (_id: UUID) => {
      await delay(300);
      return editEventMock.tracks;
    },
    createTrack: async (_id: UUID, p: any) => { await delay(300); return p; },
    updateTrack: async (_id: UUID, p: any) => { await delay(300); return p; },
    deleteTrack: async (_id: UUID) => { await delay(300); },
    getMentorAssignments: async (trackId: UUID) => {
      await delay(300);
      return mentorAssignmentsMock.filter(m => m.trackId === trackId);
    },
    assignMentor: async (trackId: UUID, payload: any) => {
      await delay(400);
      const user = availableMentors.find(u => u.id === payload.mentorUserId);
      const newAssign = {
        id: crypto.randomUUID(),
        trackId,
        mentorUserId: payload.mentorUserId,
        mentorName: user?.name || "Unknown Mentor",
        assignedAt: new Date().toISOString()
      };
      mentorAssignmentsMock.push(newAssign);
      return newAssign;
    },
    removeMentorAssignment: async (_trackId: UUID, assignId: UUID) => {
      await delay(400);
      mentorAssignmentsMock = mentorAssignmentsMock.filter(m => m.id !== assignId);
    }
  },

  roundApi: {
    getRoundsByEvent: async (_id: UUID) => {
      await delay(300);
      return editEventMock.tracks.flatMap(t => t.rounds);
    },
    createRound: async (_id: UUID, p: any) => { await delay(300); return p; },
    updateRound: async (_id: UUID, p: any) => { await delay(300); return p; },
    deleteRound: async (_id: UUID) => { await delay(300); },
    getJudgeAssignments: async (roundId: UUID) => {
      await delay(300);
      return judgeAssignmentsMock.filter(j => j.roundId === roundId);
    },
    assignJudge: async (roundId: UUID, payload: any) => {
      await delay(400);
      const user = availableJudges.find(u => u.id === payload.judgeId);
      const newAssign = {
        id: crypto.randomUUID(),
        roundId,
        judgeId: payload.judgeId,
        judgeName: user?.name || "Unknown Judge",
        trackId: payload.trackId,
        scoringProgress: 0,
        totalToScore: payload.totalToScore || null
      };
      judgeAssignmentsMock.push(newAssign);
      return newAssign;
    },
    removeJudgeAssignment: async (_roundId: UUID, assignId: UUID) => {
      await delay(400);
      judgeAssignmentsMock = judgeAssignmentsMock.filter(j => j.id !== assignId);
    }
  },

  prizeApi: {
    getPrizesByEvent: async (_id: UUID) => {
      await delay(300);
      return [...prizesMock];
    },
    getPrizeById: async (id: UUID) => {
      await delay(300);
      return prizesMock.find(p => p.id === id);
    },
    getPublishedAwards: async (_id: UUID) => {
      await delay(300);
      return prizesMock.filter(p => p.awardedTeamId);
    },
    createPrize: async (p: any) => {
      await delay(300);
      const newPrize = {
        id: crypto.randomUUID(),
        ...p
      };
      prizesMock.push(newPrize);
      return newPrize;
    },
    updatePrize: async (id: UUID, p: any) => {
      await delay(300);
      const index = prizesMock.findIndex(prize => prize.id === id);
      if (index !== -1) {
        prizesMock[index] = { ...prizesMock[index], ...p };
        return prizesMock[index];
      }
      throw new Error("Prize not found");
    },
    deletePrize: async (id: UUID) => {
      await delay(300);
      prizesMock = prizesMock.filter(p => p.id !== id);
    },
    assignFromRanking: async (eventId: UUID, payload: any) => {
      await delay(500);
      return {
        eventId,
        prizeCount: prizesMock.length,
        awardedCount: 1,
        skippedCount: 0,
        notificationSent: payload.sendNotification,
        emailQueued: payload.sendEmail,
        assignedAt: new Date().toISOString(),
        prizes: prizesMock
      };
    },
    awardPrize: async (prizeId: UUID, payload: any) => {
      await delay(300);
      const index = prizesMock.findIndex(prize => prize.id === prizeId);
      if (index !== -1) {
        prizesMock[index].awardedTeamId = payload.teamId;
        prizesMock[index].awardedTeamName = "Mock Team Awarded";
        prizesMock[index].awardedAt = new Date().toISOString();
        return prizesMock[index];
      }
      throw new Error("Prize not found");
    },
    updatePrizeWinner: async (prizeId: UUID, payload: any) => {
      await delay(300);
      const index = prizesMock.findIndex(prize => prize.id === prizeId);
      if (index !== -1) {
        prizesMock[index].awardedTeamId = payload.teamId;
        return prizesMock[index];
      }
      throw new Error("Prize not found");
    },
    clearAward: async (prizeId: UUID, _payload: any) => {
      await delay(300);
      const index = prizesMock.findIndex(prize => prize.id === prizeId);
      if (index !== -1) {
        prizesMock[index].awardedTeamId = undefined;
        prizesMock[index].awardedTeamName = undefined;
        prizesMock[index].awardedAt = undefined;
      }
    }
  },

  assignableUserApi: {
    getAssignableUsers: async (role: string, search?: string) => {
      await delay(300);
      let users = role === "MENTOR" ? availableMentors : availableJudges;
      if (search) {
        users = users.filter(u =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      return users.map(u => ({
        userId: u.id,
        judgeId: role === "JUDGE" ? u.id : undefined,
        email: u.email,
        fullName: u.name,
        role: role,
        guest: false,
        temporary: false
      }));
    }
  },

  rankingApi: {
    getPublicEventLeaderboard: async (eventId: UUID, _params?: any) => {
      await delay(300);
      return [
        {
          id: crypto.randomUUID(),
          eventId: eventId,
          submissionId: "sub-1",
          teamId: "team-1",
          teamName: "Alpha Team",
          roundId: "round-1",
          roundName: "Final Round",
          trackId: "t1",
          trackName: "Web3 Track",
          totalScore: 92.5,
          rankPosition: 1,
          advanced: true,
          judgeCount: 3,
          published: true,
        },
        {
          id: crypto.randomUUID(),
          eventId: eventId,
          submissionId: "sub-2",
          teamId: "team-2",
          teamName: "Neural Ninjas",
          roundId: "round-1",
          roundName: "Final Round",
          trackId: "t1",
          trackName: "Web3 Track",
          totalScore: 88.0,
          rankPosition: 2,
          advanced: false,
          judgeCount: 3,
          published: true,
        }
      ];
    },
    getPublicTrackLeaderboard: async (_eventId: UUID, _trackId: UUID, _params?: any) => {
      await delay(300);
      return []; // Return empty for other tracks for simplicity
    }
  }
};
