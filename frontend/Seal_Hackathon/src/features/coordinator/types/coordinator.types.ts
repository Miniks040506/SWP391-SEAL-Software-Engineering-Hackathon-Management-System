export type TabId = "info" | "tracks" | "teams";

export type TeamStatus = "APPROVED" | "PENDING" | "REJECTED";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type EventTeam = {
  id: string;
  name: string;
  trackId: string;
  status: TeamStatus;
  registeredAt: string;
  members: TeamMember[];
};

export type EventRound = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  criteriaIds: string[];
};

export type EventTrack = {
  id: string;
  name: string;
  description: string;
  judgeIds: string[];
  mentorIds: string[];
  rounds: EventRound[];
};

export type EditEventData = {
  name: string;
  season: string;
  description: string;
  startDate: string;
  endDate: string;
  tracks: EventTrack[];
};

export type DialogState =
  | { kind: "addJudge"; trackId: string }
  | { kind: "addMentor"; trackId: string }
  | { kind: "addRound"; trackId: string }
  | { kind: "editCriteria"; trackId: string; roundId: string }
  | { kind: "addTrack" }
  | { kind: "teamDetail"; team: EventTeam }
  | { kind: "editTrack"; trackId: string }
  | { kind: "editRound"; trackId: string; roundId: string }
  | null;

export type EventFormErrors = Partial<
  Record<keyof Omit<EditEventData, "tracks" | "season" | "description">, string>
>;
