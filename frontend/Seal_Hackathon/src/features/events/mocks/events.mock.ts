import type { Event } from "@/types/event.types";

// remove this file if we connect the riel API
// replace with TanStack Query call GET /api/rankings in ranking.api.ts
export const EVENTS: Event[] = [
  {
    id: "seal-spring-26",
    title: "SEAL Hackathon Spring 2026",
    season: "Spring",
    status: "Ongoing",
    registrationOpen: false,
    currentPhase: 2,
    description: "Conquer software engineering challenges and find innovative digital solutions for modern problems.",
    startDate: "Mar 15, 2026",
    endDate: "Mar 20, 2026",
    tracks: [
      {
        name: "Web Development",
        desc: "Building scalable modern web applications with cutting-edge tech.",
      },
      {
        name: "Mobile App",
        desc: "Creating seamless and intuitive mobile experiences.",
      },
      {
        name: "AI & Machine Learning",
        desc: "Implementing intelligent algorithms and data models.",
      },
    ],
    prizes: [
      { rank: "Champion", value: "$1,000" },
      { rank: "Runner Up", value: "$600" },
      { rank: "Third Place", value: "$300" },
    ],
    announcements: [
      {
        date: "2h ago",
        text: "Final round scoring criteria have been updated.",
      },
      {
        date: "1d ago",
        text: "Technical workshop recordings are now available on the portal.",
      },
    ],
  },
  {
    id: "seal-summer-26",
    title: "SEAL Hackathon Summer 2026",
    season: "Summer",
    status: "Upcoming",
    registrationOpen: true,
    currentPhase: 0,
    description: "Integrated competition for Smart City solutions and Software innovation.",
    startDate: "Jun 20, 2026",
    endDate: "Jun 25, 2026",
    tracks: [
      {
        name: "Cybersecurity",
        desc: "Secure software development and vulnerability mitigation.",
      },
      {
        name: "Cloud Computing",
        desc: "Serverless solutions and infrastructure as code.",
      },
    ],
    prizes: [{ rank: "Champion", value: "$1,200" }],
    announcements: [],
  },
  {
    id: "seal-fall-25",
    title: "SEAL Hackathon Fall 2025",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description: "Successfully concluded with over 60 teams and hundreds of participants.",
    startDate: "Oct 10, 2025",
    endDate: "Oct 15, 2025",
    tracks: [
      {
        name: "Fintech",
        desc: "Innovation in the financial technology sector.",
      },
    ],
    prizes: [],
    announcements: [],
  },
  {
    id: "seal-summer-25",
    title: "SEAL Hackathon Summer 2025",
    season: "Summer",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description: "A high-intensity 5-day sprint focused on sustainable tech and green software engineering.",
    startDate: "Jul 5, 2025",
    endDate: "Jul 10, 2025",
    tracks: [
      {
        name: "Green Tech",
        desc: "Energy-efficient software and environmental monitoring tools.",
      },
      {
        name: "IoT & Hardware",
        desc: "Embedded systems and sensor-driven smart applications.",
      },
    ],
    prizes: [
      { rank: "Champion", value: "$1,000" },
      { rank: "Runner Up", value: "$500" },
      { rank: "Third Place", value: "$250" },
    ],
    announcements: [],
  },
  {
    id: "seal-spring-25",
    title: "SEAL Hackathon Spring 2025",
    season: "Spring",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description: "The inaugural SEAL Spring edition - 45 teams tackled real-world logistics and e-commerce problems.",
    startDate: "Mar 10, 2025",
    endDate: "Mar 14, 2025",
    tracks: [
      {
        name: "E-Commerce",
        desc: "Digital retail platforms and supply-chain automation.",
      },
      {
        name: "Blockchain",
        desc: "Decentralised applications and smart contract systems.",
      },
    ],
    prizes: [
      { rank: "Champion", value: "$800" },
      { rank: "Runner Up", value: "$400" },
    ],
    announcements: [],
  },
];
