export type EventStatus = 'Upcoming' | 'Ongoing' | 'Ended';

export interface Track { name: string; desc: string; }
export interface Prize { rank: string; value: string; }
export interface Announcement { date: string; text: string; }

export interface Event {
  id: string;
  title: string;
  season: string;
  status: EventStatus;
  registrationOpen: boolean;
  currentPhase: number;
  description: string;
  startDate: string;
  endDate: string;
  tracks: Track[];
  prizes: Prize[];
  announcements: Announcement[];
}