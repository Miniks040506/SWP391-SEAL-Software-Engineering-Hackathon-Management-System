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
  { id: 'j-6', name: 'Bui Van F', email: 'buivanf@seal.edu.vn', avatar: 'BV' },
  { id: 'j-7', name: 'Ngo Thi G', email: 'ngothig@seal.edu.vn', avatar: 'NT' },
  { id: 'j-8', name: 'Trinh Van H', email: 'trinhvanh@seal.edu.vn', avatar: 'TV' },
  { id: 'j-9', name: 'Ly Thi I', email: 'lythii@seal.edu.vn', avatar: 'LT' },
  { id: 'j-10', name: 'Phan Van J', email: 'phanvanj@seal.edu.vn', avatar: 'PV' },
  { id: 'j-11', name: 'Dao Thi K', email: 'daothik@seal.edu.vn', avatar: 'DT' },
  { id: 'j-12', name: 'Vuong Van L', email: 'vuongvanl@seal.edu.vn', avatar: 'VV' },
  { id: 'j-13', name: 'Chu Thi M', email: 'chuthim@seal.edu.vn', avatar: 'CT' },
  { id: 'j-14', name: 'Dinh Van N', email: 'dinhvann@seal.edu.vn', avatar: 'DV' },
  { id: 'j-15', name: 'Mai Thi O', email: 'maithio@seal.edu.vn', avatar: 'MT' },
  { id: 'j-16', name: 'Quach Van P', email: 'quachvanp@seal.edu.vn', avatar: 'QV' },
  { id: 'j-17', name: 'Ton Thi Q', email: 'tonthiq@seal.edu.vn', avatar: 'TT' },
  { id: 'j-18', name: 'Lam Van R', email: 'lamvanr@seal.edu.vn', avatar: 'LV' },
  { id: 'j-19', name: 'Doan Thi S', email: 'doanthis@seal.edu.vn', avatar: 'DT' },
  { id: 'j-20', name: 'Truong Van T', email: 'truongvant@seal.edu.vn', avatar: 'TV' },
  { id: 'j-21', name: 'Phung Thi U', email: 'phungthiu@seal.edu.vn', avatar: 'PT' },
  { id: 'j-22', name: 'To Van V', email: 'tovanv@seal.edu.vn', avatar: 'TV' },
  { id: 'j-23', name: 'Mac Thi W', email: 'macthiw@seal.edu.vn', avatar: 'MT' },
  { id: 'j-24', name: 'Lai Van X', email: 'laivanx@seal.edu.vn', avatar: 'LV' },
  { id: 'j-25', name: 'Kieu Thi Y', email: 'kieuthiy@seal.edu.vn', avatar: 'KT' }
];

export const availableMentors: EventUser[] = [
  { id: 'm-1', name: 'Do Thi F', email: 'dothif@seal.edu.vn', avatar: 'DT' },
  { id: 'm-2', name: 'Vu Van G', email: 'vuvang@seal.edu.vn', avatar: 'VV' },
  { id: 'm-3', name: 'Bui Thi H', email: 'buithih@seal.edu.vn', avatar: 'BT' },
  { id: 'm-4', name: 'Dang Van I', email: 'dangvani@seal.edu.vn', avatar: 'DV' },
  { id: 'm-5', name: 'Ngo Van A', email: 'ngovana@seal.edu.vn', avatar: 'NV' },
  { id: 'm-6', name: 'Le Thi B', email: 'lethib@seal.edu.vn', avatar: 'LT' },
  { id: 'm-7', name: 'Tran Van C', email: 'tranvanc@seal.edu.vn', avatar: 'TV' },
  { id: 'm-8', name: 'Pham Thi D', email: 'phamthid@seal.edu.vn', avatar: 'PT' },
  { id: 'm-9', name: 'Hoang Van E', email: 'hoangvane@seal.edu.vn', avatar: 'HV' },
  { id: 'm-10', name: 'Vo Thi K', email: 'vothik@seal.edu.vn', avatar: 'VT' },
  { id: 'm-11', name: 'Phan Van L', email: 'phanvanl@seal.edu.vn', avatar: 'PV' },
  { id: 'm-12', name: 'Truong Thi M', email: 'truongthim@seal.edu.vn', avatar: 'TT' },
  { id: 'm-13', name: 'Ngo Van N', email: 'ngovann@seal.edu.vn', avatar: 'NV' },
  { id: 'm-14', name: 'Bui Thi O', email: 'buithio@seal.edu.vn', avatar: 'BT' },
  { id: 'm-15', name: 'Vu Van P', email: 'vuvanp@seal.edu.vn', avatar: 'VV' },
  { id: 'm-16', name: 'Trinh Thi Q', email: 'trinhthiq@seal.edu.vn', avatar: 'TT' },
  { id: 'm-17', name: 'Doan Van R', email: 'doanvanr@seal.edu.vn', avatar: 'DV' },
  { id: 'm-18', name: 'Ly Thi S', email: 'lythis@seal.edu.vn', avatar: 'LT' },
  { id: 'm-19', name: 'Ton Van T', email: 'tonvant@seal.edu.vn', avatar: 'TV' },
  { id: 'm-20', name: 'Lam Thi U', email: 'lamthiu@seal.edu.vn', avatar: 'LT' },
  { id: 'm-21', name: 'Quach Van V', email: 'quachvanv@seal.edu.vn', avatar: 'QV' },
  { id: 'm-22', name: 'Chu Thi W', email: 'chuthiw@seal.edu.vn', avatar: 'CT' },
  { id: 'm-23', name: 'Dao Van X', email: 'daovanx@seal.edu.vn', avatar: 'DV' },
  { id: 'm-24', name: 'Mai Thi Y', email: 'maithiy@seal.edu.vn', avatar: 'MT' },
  { id: 'm-25', name: 'Dinh Van Z', email: 'dinhvanz@seal.edu.vn', avatar: 'DV' }
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
      { id: 'u-3', name: 'Tran Duc Huy', email: 'huy@student.edu.vn', role: 'Member' },
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
      { id: 'u-5', name: 'Hoang Ngoc Anh', email: 'anh@student.edu.vn', role: 'Member' },
    ],
  },
  {
    id: 'team-3',
    name: 'ByteBuilders',
    trackId: 'track-2',
    status: 'PENDING',
    registeredAt: 'May 13, 2026',
    members: [
      { id: 'u-6', name: 'Vu Thanh Nam', email: 'nam@student.edu.vn', role: 'Leader' },
      { id: 'u-7', name: 'Do Quynh Nhu', email: 'nhu@student.edu.vn', role: 'Member' },
      { id: 'u-8', name: 'Bui Tuan Kiet', email: 'kiet@student.edu.vn', role: 'Member' },
    ],
  },
  {
    id: 'team-4',
    name: 'CloudChasers',
    trackId: 'track-3',
    status: 'REJECTED',
    registeredAt: 'May 11, 2026',
    members: [
      { id: 'u-9', name: 'Dang Huu Phuc', email: 'phuc@student.edu.vn', role: 'Leader' },
      { id: 'u-10', name: 'Ly Thi Mai', email: 'mai@student.edu.vn', role: 'Member' },
    ],
  },
  {
    id: 'team-5',
    name: 'StackSurfers',
    trackId: 'track-2',
    status: 'APPROVED',
    registeredAt: 'May 9, 2026',
    members: [
      { id: 'u-11', name: 'Truong Van Binh', email: 'binh@student.edu.vn', role: 'Leader' },
      { id: 'u-12', name: 'Nguyen Thi Hoa', email: 'hoa@student.edu.vn', role: 'Member' },
    ],
  },
];

// ─── Round ──────────────────────────────────────────────────────────────────
export type EventRound = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  criteriaIds: string[];
};

// ─── Track ──────────────────────────────────────────────────────────────────
export type EventTrack = {
  id: string;
  name: string;
  description: string;
  judgeIds: string[];
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
      judgeIds: ['j-1', 'j-2'],
      mentorIds: ['m-1'],
      rounds: [
        {
          id: 'round-1-1',
          name: 'Preliminary Round',
          startDate: '2026-05-25',
          endDate: '2026-05-27',
          criteriaIds: ['sc-1', 'sc-2', 'sc-5'],
        },
        {
          id: 'round-1-2',
          name: 'Final Round',
          startDate: '2026-05-28',
          endDate: '2026-05-30',
          criteriaIds: ['sc-1', 'sc-2', 'sc-4', 'sc-5'],
        },
      ],
    },
    {
      id: 'track-2',
      name: 'Web Dev Track',
      description: 'Full-stack web applications and platforms.',
      judgeIds: ['j-3'],
      mentorIds: ['m-2', 'm-3'],
      rounds: [
        {
          id: 'round-2-1',
          name: 'Preliminary Round',
          startDate: '2026-05-25',
          endDate: '2026-05-27',
          criteriaIds: ['sc-3', 'sc-6', 'sc-7'],
        },
      ],
    },
    {
      id: 'track-3',
      name: 'Mobile Track',
      description: 'iOS and Android mobile applications.',
      judgeIds: ['j-4', 'j-5'],
      mentorIds: ['m-4'],
      rounds: [
        {
          id: 'round-3-1',
          name: 'Preliminary Round',
          startDate: '2026-05-25',
          endDate: '2026-05-27',
          criteriaIds: ['sc-4', 'sc-6', 'sc-8'],
        },
        {
          id: 'round-3-2',
          name: 'Final Round',
          startDate: '2026-05-29',
          endDate: '2026-05-30',
          criteriaIds: ['sc-4', 'sc-5', 'sc-6'],
        },
      ],
    },
  ],
};