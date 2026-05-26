export type EventStatus = 'Upcoming' | 'Ongoing' | 'Ended';

export interface Track {
  name: string;
  desc: string;
  rounds: Round[];
  prizes: Prize[];
}

export interface Round {
  id: string;
  name: string;
  duration: string;
}

export interface Prize {
  rank: string;
  value: string;
}

export interface Announcement {
  date: string;
  text: string;
  /* Optional phase tag shown in AnnouncementModal. */
  phase?: number;
  /* Optional extended body shown in AnnouncementModal detail block. */
  detail?: string;
}

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
  announcements: Announcement[];
}