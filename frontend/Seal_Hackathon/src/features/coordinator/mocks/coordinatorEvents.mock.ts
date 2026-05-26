export type CoordinatorEventStatus = 'ONGOING' | 'DRAFT' | 'ENDED';

export type CoordinatorEvent = {
    id: string;
    name: string;
    season: 'Spring' | 'Summer' | 'Fall';
    rounds: number;
    status: CoordinatorEventStatus;
};

export const coordinatorEventsMock: CoordinatorEvent[] = [
    {
        id: 'seal-spring-26',
        name: 'SEAL Hackathon Spring 2026',
        season: 'Spring',
        rounds: 3,
        status: 'ONGOING',
    },
    {
        id: 'seal-summer-26',
        name: 'SEAL Hackathon Summer 2026',
        season: 'Summer',
        rounds: 3,
        status: 'DRAFT',
    },
    {
        id: 'seal-fall-25',
        name: 'SEAL Hackathon Fall 2025',
        season: 'Fall',
        rounds: 3,
        status: 'ENDED',
    },
    {
        id: 'seal-summer-25',
        name: 'FPT Edu Research Festival 2025',
        season: 'Summer',
        rounds: 3,
        status: 'ENDED',
    },
    {
        id: 'seal-spring-25',
        name: 'FPT Edu Hackathon 2025',
        season: 'Spring',
        rounds: 2,
        status: 'ENDED',
    },
    {
        id: 'seal-fall-24',
        name: 'FPT Edu Research Festival 2024',
        season: 'Fall',
        rounds: 2,
        status: 'ENDED',
    },
    {
        id: 'seal-summer-24',
        name: 'FPT Edu Hackathon 2024',
        season: 'Summer',
        rounds: 2,
        status: 'ENDED',
    }
];