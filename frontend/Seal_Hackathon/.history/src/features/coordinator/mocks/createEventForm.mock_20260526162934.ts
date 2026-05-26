export const EVENT_SEASONS = ["Spring", "Summer", "Fall"] as const;

export const ADVANCEMENT_RULE_TYPES = [
    'top-N Teams',
    'Threshold Score',
    'Manual Selection',
] as const;

export type EventSeason = (typeof EVENT_SEASONS)[number];

export type AdvancementRuleType = (typeof ADVANCEMENT_RULE_TYPES)[number];

export type RoundFormValues = {
    id: string;
    roundName: string;
    submissionDeadline: string;
    judgingDeadline: string;
    advancementRuleType: AdvancementRuleType;
    advancementRuleValue: string;
};

export type TrackFormValues = {
    id: string;
    trackName: string;
    description: string;
    rounds: RoundFormValues[];
};

export type CreateEventFormValues = {
  eventName: string;
  season: EventSeason | "";
  registrationOpen: string;
  registrationClose: string;
  competitionStartDate: string;
  competitionEndDate: string;
  description: string;
  bannerFile: File | null;
};

export const createEmptyRound = (): RoundFormValues => ({
    id: crypto.randomUUID(),
    roundName: '',
    submissionDeadline: '',
    judgingDeadline: '',
    advancementRuleType: 'top-N Teams',
    advancementRuleValue: '',
});

export const createEmptyTrack = (): TrackFormValues => ({
    id: crypto.randomUUID(),
    trackName: '',
    description: '',
    rounds: [],
});

export const initialCreateEventFormValues: CreateEventFormValues = {
  eventName: "",
  season: "",
  registrationOpen: "",
  registrationClose: "",
  competitionStartDate: "",
  competitionEndDate: "",
  description: "",
  bannerFile: null,
};
