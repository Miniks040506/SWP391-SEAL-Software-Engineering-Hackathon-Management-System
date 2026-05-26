export const EVENT_SEASONS = ['Spring', 'Summer', 'Fall'] as const;

export type EventSeason = (typeof EVENT_SEASONS)[number];

export type CreateEventFormValues = {
    eventName: string;
    season: EventSeason | '';
    registrationOpen: string;
    registrationClose: string;
    description: string;
    bannerFile: File | null;
};

export const initialCreateEventFormValues: CreateEventFormValues = {
    eventName: '',
    season: '',
    registrationOpen: '',
    registrationClose: '',
    description: '',
    bannerFile: null
};