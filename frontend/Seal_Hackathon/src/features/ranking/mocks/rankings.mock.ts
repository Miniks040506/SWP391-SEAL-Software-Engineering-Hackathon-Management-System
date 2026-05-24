import type { RankingEntry } from '@/types/ranking.types';

// remove this file if we connect the riel API
// replace with TanStack Query call GET /api/rankings in ranking.api.ts
export const RANKINGS: RankingEntry[] = [
  { rank: 1, team: 'Tech Wizards', members: 'John Doe, Jane Smith',    score: 95.5, track: 'Web Development',       round: 'Final'       },
  { rank: 2, team: 'Code Ninjas',  members: 'Alex Lee, Bob Brown',     score: 92.0, track: 'Web Development',       round: 'Final'       },
  { rank: 3, team: 'AI Explorers', members: 'Alice Wong, David Tan',   score: 88.5, track: 'AI & Machine Learning', round: 'Final'       },
  { rank: 4, team: 'Skyline Team', members: 'Chris Evans, Sarah Park', score: 85.0, track: 'Mobile App',            round: 'Preliminary' },
  { rank: 5, team: 'Byte Me',      members: 'Lucas Gray, Mia Chen',    score: 84.2, track: 'Web Development',       round: 'Preliminary' },
];
