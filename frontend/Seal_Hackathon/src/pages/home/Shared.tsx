import React from 'react';

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Ended';

export interface Track {
  name: string;
  desc: string;
}

export interface Prize {
  rank: string;
  value: string;
}

export interface Announcement {
  date: string;
  text: string;
}

export interface Event {
  id: string;
  title: string;
  season: string;
  status: EventStatus;
  registrationOpen: boolean;
  description: string;
  startDate: string;
  endDate: string;
  tracks: Track[];
  prizes: Prize[];
  announcements: Announcement[];
}

export interface RankingEntry {
  rank: number;
  team: string;
  members: string;
  score: number;
  track: string;
  round: string;
}

// --- Mock Data ---
export const EVENTS: Event[] = [
  {
    id: 'seal-spring-24',
    title: 'SEAL Hackathon Spring 2024',
    season: 'Spring',
    status: 'Ongoing',
    registrationOpen: false,
    description: 'Conquer software engineering challenges and find innovative digital solutions for modern problems.',
    startDate: 'Mar 15, 2024',
    endDate: 'Mar 20, 2024',
    tracks: [
      { name: 'Web Development',     desc: 'Building scalable modern web applications with cutting-edge tech.' },
      { name: 'Mobile App',          desc: 'Creating seamless and intuitive mobile experiences.' },
      { name: 'AI & Machine Learning', desc: 'Implementing intelligent algorithms and data models.' },
    ],
    prizes: [
      { rank: 'Champion',    value: '$1,000' },
      { rank: 'Runner Up',   value: '$600' },
      { rank: 'Third Place', value: '$300' },
    ],
    announcements: [
      { date: '2h ago', text: 'Final round scoring criteria have been updated.' },
      { date: '1d ago', text: 'Technical workshop recordings are now available on the portal.' },
    ],
  },
  {
    id: 'seal-summer-24',
    title: 'SEAL Hackathon Summer 2024',
    season: 'Summer',
    status: 'Upcoming',
    registrationOpen: true,
    description: 'Integrated competition for Smart City solutions and Software innovation.',
    startDate: 'Jun 20, 2024',
    endDate: 'Jun 25, 2024',
    tracks: [
      { name: 'Cybersecurity',   desc: 'Secure software development and vulnerability mitigation.' },
      { name: 'Cloud Computing', desc: 'Serverless solutions and infrastructure as code.' },
    ],
    prizes: [{ rank: 'Champion', value: '$1,200' }],
    announcements: [],
  },
  {
    id: 'seal-fall-23',
    title: 'SEAL Hackathon Fall 2023',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    description: 'Successfully concluded with over 60 teams and hundreds of participants.',
    startDate: 'Oct 10, 2023',
    endDate: 'Oct 15, 2023',
    tracks: [{ name: 'Fintech', desc: 'Innovation in the financial technology sector.' }],
    prizes: [],
    announcements: [],
  },
];

export const RANKINGS: RankingEntry[] = [
  { rank: 1, team: 'Tech Wizards',  members: 'John Doe, Jane Smith',    score: 95.5, track: 'Web Development',       round: 'Final' },
  { rank: 2, team: 'Code Ninjas',   members: 'Alex Lee, Bob Brown',     score: 92.0, track: 'Web Development',       round: 'Final' },
  { rank: 3, team: 'AI Explorers',  members: 'Alice Wong, David Tan',   score: 88.5, track: 'AI & Machine Learning', round: 'Final' },
  { rank: 4, team: 'Skyline Team',  members: 'Chris Evans, Sarah Park', score: 85.0, track: 'Mobile App',            round: 'Preliminary' },
  { rank: 5, team: 'Byte Me',       members: 'Lucas Gray, Mia Chen',    score: 84.2, track: 'Web Development',       round: 'Preliminary' },
];

// --- Utility Components ---
const STATUS_STYLES: Record<EventStatus, string> = {
  Upcoming: 'text-blue-600 bg-blue-50 border border-blue-100',
  Ongoing:  'text-white bg-blue-500 border border-blue-600',
  Ended:    'text-gray-400 bg-gray-50 border border-gray-100',
};

export const StatusBadge = ({ status }: { status: EventStatus }) => (
  <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm ${STATUS_STYLES[status]}`}>
    {status.toUpperCase()}
  </span>
);