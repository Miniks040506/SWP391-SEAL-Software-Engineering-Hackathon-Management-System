import type { Event } from "@/types/event.types";

// Remove this file once the real API is connected.
// Replace with TanStack Query → GET /api/events in events.api.ts
export const EVENTS: Event[] = [
  // Active
  {
    id: "seal-spring-26",
    title: "SEAL Hackathon Spring 2026",
    season: "Spring",
    status: "Ongoing",
    registrationOpen: false,
    currentPhase: 2,
    description:
      "Conquer software engineering challenges and find innovative digital solutions for modern problems.",
    startDate: "Mar 15, 2026",
    endDate: "Mar 20, 2026",
    tracks: [
      {
        name: "Web Development",
        desc: "Building scalable modern web applications with cutting-edge tech.",
        rounds: [
          { id: "r1", name: "Proposal Submission", duration: "2 days" },
          { id: "r2", name: "MVP Development & Coding", duration: "3 days" },
          { id: "r3", name: "Grand Finale Pitching", duration: "1 day" },
        ],
      },
      {
        name: "Mobile App",
        desc: "Creating seamless and intuitive mobile experiences.",
        rounds: [
          { id: "r1", name: "UI/UX Prototype Submission", duration: "2 days" },
          {
            id: "r2",
            name: "App Core Feature Development",
            duration: "3 days",
          },
        ],
      },
      {
        name: "AI & Machine Learning",
        desc: "Implementing intelligent algorithms and data models.",
        rounds: [
          {
            id: "r1",
            name: "Dataset Analysis & Model Selection",
            duration: "2 days",
          },
          {
            id: "r2",
            name: "Model Training & Accuracy Optimization",
            duration: "2 days",
          },
          { id: "r3", name: "Solution Presentation", duration: "1 day" },
        ],
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
        phase: 2,
        detail:
          'Attention all teams!\n\nThe judges have revised the weight for the technical implementation sector from 30% to 40%.\n\nPlease review the updated scoring rubric PDF under the "Criteria" tab to ensure your project alignment meets the new expectations before the final submission deadline.',
      },
      {
        date: "1d ago",
        text: "Technical workshop recordings are now available on the portal.",
        phase: 1,
        detail:
          'Missed our live mentoring sessions?\n\nDon\'t worry! The full video recordings and presentation materials for "Scalable Architecture Setup" and "Smart Contract Security Audits" have been successfully processed.\n\nYou can access them directly via the Cloud drive link pinned in your dashboard announcements channel.',
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
    description:
      "Integrated competition for Smart City solutions and Software innovation.",
    startDate: "Jun 20, 2026",
    endDate: "Jun 25, 2026",
    tracks: [
      {
        name: "Cybersecurity",
        desc: "Secure software development and vulnerability mitigation.",
        rounds: [
          {
            id: "r1",
            name: "Capture The Flag (CTF) Qualifier",
            duration: "1 day",
          },
          { id: "r2", name: "Secure Architecture Design", duration: "2 days" },
          { id: "r3", name: "Live Defense Hack", duration: "2 days" },
        ],
      },
      {
        name: "Cloud Computing",
        desc: "Serverless solutions and infrastructure as code.",
        rounds: [
          { id: "r1", name: "Cloud Architecture Proposal", duration: "2 days" },
          {
            id: "r2",
            name: "IaC Implementation & Deployment",
            duration: "3 days",
          },
        ],
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
    description:
      "Successfully concluded with over 60 teams and hundreds of participants.",
    startDate: "Oct 10, 2025",
    endDate: "Oct 15, 2025",
    tracks: [
      {
        name: "Fintech",
        desc: "Innovation in the financial technology sector.",
        rounds: [
          {
            id: "r1",
            name: "Idea Brainstorming & Registration",
            duration: "2 days",
          },
          { id: "r2", name: "Prototype Construction", duration: "2 days" },
          { id: "r3", name: "Demo Day Pitching", duration: "1 day" },
        ],
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
    description:
      "A high-intensity 5-day sprint focused on sustainable tech and green software engineering.",
    startDate: "Jul 5, 2025",
    endDate: "Jul 10, 2025",
    tracks: [
      {
        name: "Green Tech",
        desc: "Energy-efficient software and environmental monitoring tools.",
        rounds: [
          { id: "r1", name: "Eco-Design & Concept Pitch", duration: "1 day" },
          { id: "r2", name: "Green Code Implementation", duration: "3 days" },
          { id: "r3", name: "Carbon Impact Evaluation", duration: "1 day" },
        ],
      },
      {
        name: "IoT & Hardware",
        desc: "Embedded systems and sensor-driven smart applications.",
        rounds: [
          {
            id: "r1",
            name: "Hardware Schema & Architecture",
            duration: "2 days",
          },
          {
            id: "r2",
            name: "Firmware & Sensor Integration",
            duration: "3 days",
          },
        ],
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
    description:
      "The inaugural SEAL Spring edition — 45 teams tackled real-world logistics and e-commerce problems.",
    startDate: "Mar 10, 2025",
    endDate: "Mar 14, 2025",
    tracks: [
      {
        name: "E-Commerce",
        desc: "Digital retail platforms and supply-chain automation.",
        rounds: [
          {
            id: "r1",
            name: "Market Research & Feature Definition",
            duration: "1 day",
          },
          { id: "r2", name: "Core Engine Development", duration: "3 days" },
        ],
      },
      {
        name: "Blockchain",
        desc: "Decentralised applications and smart contract systems.",
        rounds: [
          { id: "r1", name: "Smart Contract Design", duration: "2 days" },
          { id: "r2", name: "DApp Frontend Integration", duration: "2 days" },
        ],
      },
    ],
    prizes: [
      { rank: "Champion", value: "$800" },
      { rank: "Runner Up", value: "$400" },
    ],
    announcements: [],
  },

  {
    id: "seal-fall-24",
    title: "SEAL Hackathon Fall 2024",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "Fall 2024 edition focused on AI-assisted tooling and developer productivity.",
    startDate: "Oct 5, 2024",
    endDate: "Oct 10, 2024",
    tracks: [
      {
        name: "E-Commerce",
        desc: "Digital retail platforms and supply-chain automation.",
        rounds: [
          { id: "r1", name: "Product Requirement Document", duration: "1 day" },
          { id: "r2", name: "Coding & Integrations", duration: "4 days" },
        ],
      },
      {
        name: "Blockchain",
        desc: "Decentralised applications and smart contract systems.",
        rounds: [
          { id: "r1", name: "Whitepaper & Security Audit", duration: "2 days" },
          {
            id: "r2",
            name: "Mainnet Deployment Simulation",
            duration: "3 days",
          },
        ],
      },
    ],
    prizes: [
      { rank: "Champion", value: "$800" },
      { rank: "Runner Up", value: "$400" },
    ],
    announcements: [],
  },

  {
    id: "seal-fall-23",
    title: "SEAL Hackathon Fall 2023",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "Fall 2023 edition — teams competed across web, mobile and data tracks.",
    startDate: "Oct 8, 2023",
    endDate: "Oct 12, 2023",
    tracks: [
      {
        name: "E-Commerce",
        desc: "Digital retail platforms and supply-chain automation.",
        rounds: [
          { id: "r1", name: "System Design", duration: "1 day" },
          { id: "r2", name: "Hackathon Hack Time", duration: "3 days" },
        ],
      },
      {
        name: "Blockchain",
        desc: "Decentralised applications and smart contract systems.",
        rounds: [
          { id: "r1", name: "Tokenomics Formulation", duration: "2 days" },
          { id: "r2", name: "Protocol Prototyping", duration: "2 days" },
        ],
      },
    ],
    prizes: [
      { rank: "Champion", value: "$800" },
      { rank: "Runner Up", value: "$400" },
    ],
    announcements: [],
  },

  {
    id: "seal-fall-19",
    title: "SEAL Hackathon Fall 2019",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description: "The very first SEAL Hackathon — where it all began.",
    startDate: "Nov 1, 2019",
    endDate: "Nov 5, 2019",
    tracks: [
      {
        name: "E-Commerce",
        desc: "Digital retail platforms and supply-chain automation.",
        rounds: [
          { id: "r1", name: "Concept Formulation", duration: "1 day" },
          { id: "r2", name: "Development Sprint", duration: "3 days" },
        ],
      },
      {
        name: "Blockchain",
        desc: "Decentralised applications and smart contract systems.",
        rounds: [
          { id: "r1", name: "Genesis Block Setup", duration: "2 days" },
          { id: "r2", name: "Smart Contract Validation", duration: "2 days" },
        ],
      },
    ],
    prizes: [
      { rank: "Champion", value: "$800" },
      { rank: "Runner Up", value: "$400" },
    ],
    announcements: [],
  },

  {
    id: "seal-fall-18",
    title: "SEAL Hackathon Fall 2018",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description: "The pilot edition that sparked the SEAL Hackathon series.",
    startDate: "Nov 3, 2018",
    endDate: "Nov 7, 2018",
    tracks: [
      {
        name: "E-Commerce",
        desc: "Digital retail platforms and supply-chain automation.",
        rounds: [
          { id: "r1", name: "Initial Briefing", duration: "1 day" },
          { id: "r2", name: "Prototype Showcase", duration: "3 days" },
        ],
      },
      {
        name: "Blockchain",
        desc: "Decentralised applications and smart contract systems.",
        rounds: [
          { id: "r1", name: "Cryptography Basics Test", duration: "1 day" },
          { id: "r2", name: "Basic Ledger Deployment", duration: "3 days" },
        ],
      },
    ],
    prizes: [
      { rank: "Champion", value: "$800" },
      { rank: "Runner Up", value: "$400" },
    ],
    announcements: [],
  },
];
