import type { Event } from '@/types/event.types';

// Remove this file once the real API is connected.
// Replace with TanStack Query → GET /api/events in events.api.ts
export const EVENTS: Event[] = [
  // Active
  {
    id: 'seal-spring-26',
    title: 'SEAL Hackathon Spring 2026',
    season: 'Spring',
    status: 'Ongoing',
    registrationOpen: false,
    currentPhase: 2,
    description:
      'Conquer software engineering challenges and find innovative digital solutions for modern problems.',
    startDate: 'Mar 15, 2026',
    endDate: 'Mar 20, 2026',
    tracks: [
      { name: 'Web Development',      desc: 'Building scalable modern web applications with cutting-edge tech.' },
      { name: 'Mobile App',           desc: 'Creating seamless and intuitive mobile experiences.' },
      { name: 'AI & Machine Learning',desc: 'Implementing intelligent algorithms and data models.' },
    ],
    prizes: [
      { rank: 'Champion',    value: '$1,000' },
      { rank: 'Runner Up',   value: '$600' },
      { rank: 'Third Place', value: '$300' },
    ],
    announcements: [
      {
        date: '2h ago',
        text: 'Final round scoring criteria have been updated.',
        phase: 2,
      },
      {
        date: '1d ago',
        text: 'Technical workshop recordings are now available on the portal.',
        phase: 1,
      },
    ],
  },

  {
    id: 'seal-summer-26',
    title: 'SEAL Hackathon Summer 2026',
    season: 'Summer',
    status: 'Upcoming',
    registrationOpen: true,
    currentPhase: 0,
    description: 'Integrated competition for Smart City solutions and Software innovation.',
    startDate: 'Jun 20, 2026',
    endDate: 'Jun 25, 2026',
    tracks: [
      { name: 'Cybersecurity',   desc: 'Secure software development and vulnerability mitigation.' },
      { name: 'Cloud Computing', desc: 'Serverless solutions and infrastructure as code.' },
    ],
    prizes: [{ rank: 'Champion', value: '$1,200' }],
    announcements: [],
  },

  {
    id: 'seal-fall-25',
    title: 'SEAL Hackathon Fall 2025',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description: 'Successfully concluded with over 60 teams and hundreds of participants.',
    startDate: 'Oct 10, 2025',
    endDate: 'Oct 15, 2025',
    tracks: [
      { name: 'Fintech', desc: 'Innovation in the financial technology sector.' },
    ],
    prizes: [],
    announcements: [],
  },

  {
    id: 'seal-summer-25',
    title: 'SEAL Hackathon Summer 2025',
    season: 'Summer',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description:
      'A high-intensity 5-day sprint focused on sustainable tech and green software engineering.',
    startDate: 'Jul 5, 2025',
    endDate: 'Jul 10, 2025',
    tracks: [
      { name: 'Green Tech',     desc: 'Energy-efficient software and environmental monitoring tools.' },
      { name: 'IoT & Hardware', desc: 'Embedded systems and sensor-driven smart applications.' },
    ],
    prizes: [
      { rank: 'Champion',    value: '$1,000' },
      { rank: 'Runner Up',   value: '$500' },
      { rank: 'Third Place', value: '$250' },
    ],
    announcements: [],
  },

  {
    id: 'seal-spring-25',
    title: 'SEAL Hackathon Spring 2025',
    season: 'Spring',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description:
      'The inaugural SEAL Spring edition — 45 teams tackled real-world logistics and e-commerce problems.',
    startDate: 'Mar 10, 2025',
    endDate: 'Mar 14, 2025',
    tracks: [
      { name: 'E-Commerce', desc: 'Digital retail platforms and supply-chain automation.' },
      { name: 'Blockchain',  desc: 'Decentralised applications and smart contract systems.' },
    ],
    prizes: [
      { rank: 'Champion',  value: '$800' },
      { rank: 'Runner Up', value: '$400' },
    ],
    announcements: [],
  },

  {
    id: 'seal-fall-24',
    title: 'SEAL Hackathon Fall 2024',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description: 'Fall 2024 edition focused on AI-assisted tooling and developer productivity.',
    startDate: 'Oct 5, 2024',
    endDate: 'Oct 10, 2024',
    tracks: [
      { name: 'E-Commerce', desc: 'Digital retail platforms and supply-chain automation.' },
      { name: 'Blockchain',  desc: 'Decentralised applications and smart contract systems.' },
    ],
    prizes: [
      { rank: 'Champion',  value: '$800' },
      { rank: 'Runner Up', value: '$400' },
    ],
    announcements: [],
  },

  {
    id: 'seal-fall-23',
    title: 'SEAL Hackathon Fall 2023',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description: 'Fall 2023 edition — teams competed across web, mobile and data tracks.',
    startDate: 'Oct 8, 2023',
    endDate: 'Oct 12, 2023',
    tracks: [
      { name: 'E-Commerce', desc: 'Digital retail platforms and supply-chain automation.' },
      { name: 'Blockchain',  desc: 'Decentralised applications and smart contract systems.' },
    ],
    prizes: [
      { rank: 'Champion',  value: '$800' },
      { rank: 'Runner Up', value: '$400' },
    ],
    announcements: [],
  },

  {
    id: 'seal-fall-19',
    title: 'SEAL Hackathon Fall 2019',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description: 'The very first SEAL Hackathon — where it all began.',
    startDate: 'Nov 1, 2019',
    endDate: 'Nov 5, 2019',
    tracks: [
      { name: 'E-Commerce', desc: 'Digital retail platforms and supply-chain automation.' },
      { name: 'Blockchain',  desc: 'Decentralised applications and smart contract systems.' },
    ],
    prizes: [
      { rank: 'Champion',  value: '$800' },
      { rank: 'Runner Up', value: '$400' },
    ],
    announcements: [],
  },

  {
    id: 'seal-fall-18',
    title: 'SEAL Hackathon Fall 2018',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    currentPhase: 3,
    description: 'The pilot edition that sparked the SEAL Hackathon series.',
    startDate: 'Nov 3, 2018',
    endDate: 'Nov 7, 2018',
    tracks: [
      { name: 'E-Commerce', desc: 'Digital retail platforms and supply-chain automation.' },
      { name: 'Blockchain',  desc: 'Decentralised applications and smart contract systems.' },
    ],
    prizes: [
      { rank: 'Champion',  value: '$800' },
      { rank: 'Runner Up', value: '$400' },
    ],
    announcements: [],
  },
];