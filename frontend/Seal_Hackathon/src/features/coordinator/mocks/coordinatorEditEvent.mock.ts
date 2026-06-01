// ─── Score Criteria (created externally, only selected here) ───────────────
export type ScoreCriteria = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
};

export const availableScoreCriteria: ScoreCriteria[] = [
  { id: 'sc-1', name: 'Innovation', description: 'Originality and creativity of the solution', maxScore: 10 },
  { id: 'sc-2', name: 'Technical Complexity', description: 'Depth and quality of technical implementation', maxScore: 10 },
  { id: 'sc-3', name: 'Feasibility', description: 'Real-world applicability and viability', maxScore: 10 },
  { id: 'sc-4', name: 'Presentation', description: 'Clarity and quality of the demo/pitch', maxScore: 10 },
  { id: 'sc-5', name: 'Impact', description: 'Potential social or business impact', maxScore: 10 },
  { id: 'sc-6', name: 'UI/UX Design', description: 'User experience and visual design quality', maxScore: 10 },
  { id: 'sc-7', name: 'Code Quality', description: 'Readability, structure, and best practices', maxScore: 10 },
  { id: 'sc-8', name: 'Documentation', description: 'Quality of README, comments, and docs', maxScore: 10 },
];

// ─── Judges & Mentors (user pool) ──────────────────────────────────────────
export type EventUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export const availableJudges: EventUser[] = [
  { id: 'j-1', name: 'Nguyen Van A', email: 'nguyenvana@seal.edu.vn', avatar: 'NV' },
  { id: 'j-2', name: 'Tran Thi B', email: 'tranthib@seal.edu.vn', avatar: 'TT' },
  { id: 'j-3', name: 'Le Van C', email: 'levanc@seal.edu.vn', avatar: 'LV' },
  { id: 'j-4', name: 'Pham Thi D', email: 'phamthid@seal.edu.vn', avatar: 'PT' },
  { id: 'j-5', name: 'Hoang Van E', email: 'hoangvane@seal.edu.vn', avatar: 'HV' },
  { id: 'j-6', name: 'Bui Van F', email: 'buivanf@seal.edu.vn', avatar: 'BV' }
];

export const availableMentors: EventUser[] = [
  { id: 'm-1', name: 'Do Thi F', email: 'dothif@seal.edu.vn', avatar: 'DT' },
  { id: 'm-2', name: 'Vu Van G', email: 'vuvang@seal.edu.vn', avatar: 'VV' },
  { id: 'm-3', name: 'Bui Thi H', email: 'buithih@seal.edu.vn', avatar: 'BT' },
  { id: 'm-4', name: 'Dang Van I', email: 'dangvani@seal.edu.vn', avatar: 'DV' }
];

// ─── Teams ──────────────────────────────────────────────────────────────────
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Leader' | 'Member';
};

export type EventTeam = {
  id: string;
  name: string;
  trackId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  members: TeamMember[];
  registeredAt: string;
};

export const eventTeamsMock: EventTeam[] = [
  {
    id: 'team-1',
    name: 'Code Warriors',
    trackId: 'track-1',
    status: 'APPROVED',
    registeredAt: 'May 10, 2026',
    members: [
      { id: 'u-1', name: 'Nguyen Minh Khoa', email: 'khoa@student.edu.vn', role: 'Leader' },
      { id: 'u-2', name: 'Le Thi Lan', email: 'lan@student.edu.vn', role: 'Member' },
    ],
  },
  {
    id: 'team-2',
    name: 'Neural Ninjas',
    trackId: 'track-1',
    status: 'PENDING',
    registeredAt: 'May 12, 2026',
    members: [
      { id: 'u-4', name: 'Pham Bao Long', email: 'long@student.edu.vn', role: 'Leader' },
    ],
  }
];

// ─── Round ──────────────────────────────────────────────────────────────────
export type EventRound = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  criteriaIds: string[];
  judgeIds: string[]; // <-- Chuyển Judge vào Round
};

// ─── Track ──────────────────────────────────────────────────────────────────
export type EventTrack = {
  id: string;
  name: string;
  description: string;
  mentorIds: string[];
  rounds: EventRound[];
};

// ─── Full Event ──────────────────────────────────────────────────────────────
export type EditEventData = {
  id: string;
  name: string;
  season: 'Spring' | 'Summer' | 'Fall';
  description: string;
  startDate: string;
  endDate: string;
  status: 'ONGOING' | 'DRAFT' | 'ENDED';
  tracks: EventTrack[];
};

export const editEventMock: EditEventData = {
  id: 'seal-spring-2026',
  name: 'SEAL Spring 2026',
  season: 'Spring',
  description: 'Annual Spring Hackathon organized by SEAL, open to all students across tracks.',
  startDate: '2026-05-25',
  endDate: '2026-05-30',
  status: 'ONGOING',
  tracks: [
    {
      id: 'track-1',
      name: 'AI Track',
      description: 'Solutions powered by machine learning and AI.',
      mentorIds: ['m-1'],
      rounds: [
        {
          id: 'round-1-1',
          name: 'Preliminary Round',
          startDate: '2026-05-25',
          endDate: '2026-05-27',
          criteriaIds: ['sc-1', 'sc-2', 'sc-5'],
          judgeIds: ['j-1'], // <-- Judge được gán cho Round
        },
        {
          id: 'round-1-2',
          name: 'Final Round',
          startDate: '2026-05-28',
          endDate: '2026-05-30',
          criteriaIds: ['sc-1', 'sc-2', 'sc-4', 'sc-5'],
          judgeIds: ['j-1', 'j-2'], // <-- Judge được gán cho Round
        },
      ],
    },
    {
      id: 'track-2',
      name: 'Web Dev Track',
      description: 'Full-stack web applications and platforms.',
      mentorIds: ['m-2', 'm-3'],
      rounds: [
        {
          id: 'round-2-1',
          name: 'Preliminary Round',
          startDate: '2026-05-25',
          endDate: '2026-05-27',
          criteriaIds: ['sc-3', 'sc-6', 'sc-7'],
          judgeIds: ['j-3'],
        },
      ],
    }
  ],
};