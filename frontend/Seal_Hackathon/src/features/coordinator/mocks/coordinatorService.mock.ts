import { availableJudges, availableMentors, editEventMock } from "./coordinatorEditEvent.mock";
import { coordinatorEventsMock } from "./coordinatorEvents.mock";
import type { UUID } from "@/types/common.types";

let mentorAssignmentsMock: any[] = [];
let judgeAssignmentsMock: any[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockCoordinatorService = {
  eventApi: {
    getAllEvents: async (params?: any) => {
      await delay(300);
      return { content: coordinatorEventsMock, page: 0, size: 10, totalElements: coordinatorEventsMock.length, totalPages: 1 };
    },
    getEventById: async (id: UUID) => {
      await delay(300);
      return editEventMock;
    },
    createEvent: async (p: any) => { await delay(300); return p; },
    updateEvent: async (id: UUID, p: any) => { await delay(300); return p; },
    deleteEvent: async (id: UUID) => { await delay(300); },
  },

  trackApi: {
    getTracksByEvent: async (id: UUID) => {
      await delay(300);
      return editEventMock.tracks;
    },
    createTrack: async (id: UUID, p: any) => { await delay(300); return p; },
    updateTrack: async (id: UUID, p: any) => { await delay(300); return p; },
    deleteTrack: async (id: UUID) => { await delay(300); },
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
    removeMentorAssignment: async (trackId: UUID, assignId: UUID) => {
      await delay(400);
      mentorAssignmentsMock = mentorAssignmentsMock.filter(m => m.id !== assignId);
    }
  },

  roundApi: {
    getRoundsByEvent: async (id: UUID) => {
      await delay(300);
      return editEventMock.tracks.flatMap(t => t.rounds);
    },
    createRound: async (id: UUID, p: any) => { await delay(300); return p; },
    updateRound: async (id: UUID, p: any) => { await delay(300); return p; },
    deleteRound: async (id: UUID) => { await delay(300); },
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
    removeJudgeAssignment: async (roundId: UUID, assignId: UUID) => {
      await delay(400);
      judgeAssignmentsMock = judgeAssignmentsMock.filter(j => j.id !== assignId);
    }
  },

  prizeApi: {
    getPrizesByEvent: async (id: UUID) => { await delay(300); return []; },
    createPrize: async (p: any) => { await delay(300); return p; },
    updatePrize: async (id: UUID, p: any) => { await delay(300); return p; },
    deletePrize: async (id: UUID) => { await delay(300); },
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
  }
};