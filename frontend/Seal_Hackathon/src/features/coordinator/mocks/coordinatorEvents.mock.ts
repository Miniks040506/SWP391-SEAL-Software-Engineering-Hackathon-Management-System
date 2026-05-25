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
    id: 'seal-spring-2024',
    name: 'SEAL Spring 2024',
    season: 'Spring',
    rounds: 2,
    status: 'ONGOING',
  },
  {
    id: 'seal-summer-2024',
    name: 'SEAL Summer 2024',
    season: 'Summer',
    rounds: 3,
    status: 'DRAFT',
  },
  {
    id: 'seal-fall-2023',
    name: 'SEAL Fall 2023',
    season: 'Fall',
    rounds: 2,
    status: 'ENDED',
  },
]