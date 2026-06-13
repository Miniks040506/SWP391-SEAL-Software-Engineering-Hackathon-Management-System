export type MentorTeamSummary = {
  id: string;
  name: string;
  projectName: string;
  memberCount: number;
  status: string;
  latestSubmissionRound: string | null;
};

export const mockMentorTeams: MentorTeamSummary[] = [
  {
    id: "team-1",
    name: "Byte Me",
    projectName: "AI Traffic Controller",
    memberCount: 4,
    status: "ACTIVE",
    latestSubmissionRound: "Preliminary Round",
  },
  {
    id: "team-2",
    name: "Null Pointers",
    projectName: "Smart Healthcare App",
    memberCount: 3,
    status: "ACTIVE",
    latestSubmissionRound: null, // Chưa nộp bài
  },
  {
    id: "team-3",
    name: "404 Brain Not Found",
    projectName: "EduTrack Platform",
    memberCount: 5,
    status: "ACTIVE",
    latestSubmissionRound: "Preliminary Round",
  },
];