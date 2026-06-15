import type { UUID } from "@/types/common.types";
import type { TeamStatus } from "@/types/team.types";

export type MentorTeamSummary = {
  id: UUID;
  name: string;
  projectName: string | null;
  memberCount: number;
  status: TeamStatus;
  latestSubmissionRound: string | null;
};

const mockMentorTeams: MentorTeamSummary[] = [
  {
    id: "team-1111-1111-1111-111111111111" as UUID,
    name: "Byte Me",
    projectName: "AI Traffic Controller",
    memberCount: 4,
    status: "COMPETING",
    latestSubmissionRound: "Preliminary Round",
  },
  {
    id: "team-2222-2222-2222-222222222222" as UUID,
    name: "Null Pointers",
    projectName: "Smart Healthcare App",
    memberCount: 3,
    status: "REGISTERED",
    latestSubmissionRound: null, // Nhóm này chưa nộp bài
  },
  {
    id: "team-3333-3333-3333-333333333333" as UUID,
    name: "404 Brain Not Found",
    projectName: "EduTrack Platform",
    memberCount: 5,
    status: "COMPETING",
    latestSubmissionRound: "Preliminary Round",
  },
];

const mockDelay = () => new Promise((resolve) => window.setTimeout(resolve, 400));

export const mockMentorTeamService = {
  async getTeamsByTrack(trackId: UUID) {
    await mockDelay();
    return mockMentorTeams;
  },
};