import type { RankingEntry } from "@/types/ranking.types";

// remove this file if we connect the riel API
// replace with TanStack Query call GET /api/rankings in ranking.api.ts
export const RANKINGS_BY_EVENT: Record<string, RankingEntry[]> = {
  "seal-fall-25": [
    {
      rank: 1,
      team: "Fintech Titans",
      members: "John Doe, Jane Smith",
      score: 95.5,
      track: "Fintech Innovation",
      round: "Demo Day Pitching",
    },
    {
      rank: 2,
      team: "Alpha Ledger",
      members: "Alex Lee, Bob Brown",
      score: 92.0,
      track: "Fintech Innovation",
      round: "Demo Day Pitching",
    },
    {
      rank: 3,
      team: "EduFlow",
      members: "Alice Wong, David Tan",
      score: 88.5,
      track: "Digital Transformation",
      round: "Core System Deployment",
    },
    {
      rank: 4,
      team: "Nexus Pay",
      members: "Chris Evans, Sarah Park",
      score: 85.0,
      track: "Fintech Innovation",
      round: "Prototype Construction & API Integration",
    },
    {
      rank: 5,
      team: "UniSync",
      members: "Lucas Gray, Mia Chen",
      score: 84.2,
      track: "Digital Transformation",
      round: "System Architecture Proposal",
    },
  ],

  "seal-summer-25": [
    {
      rank: 1,
      team: "EcoMind AI",
      members: "Mario, Luigi",
      score: 97.5,
      track: "AI & Green Tech",
      round: "Final Q&A and Award Ceremony",
    },
    {
      rank: 2,
      team: "Smart Academy",
      members: "Steve Jobs, Tim Cook",
      score: 94.0,
      track: "Smart Education Frameworks",
      round: "Academic Poster Presentation",
    },
    {
      rank: 3,
      team: "Green Catalyst",
      members: "Tim Berners, Marc Andreessen",
      score: 90.0,
      track: "AI & Green Tech",
      round: "Defense Before Scientific Council",
    },
    {
      rank: 4,
      team: "Logos Framework",
      members: "Jony Ive, Dieter Rams",
      score: 88.5,
      track: "Smart Education Frameworks",
      round: "Research Paper Review",
    },
    {
      rank: 5,
      team: "Carbon Zero",
      members: "Grace Hopper, Alan Turing",
      score: 85.0,
      track: "AI & Green Tech",
      round: "Detailed Proposal Submission",
    },
  ],

  "seal-spring-25": [
    {
      rank: 1,
      team: "GenAI Pioneers",
      members: "Tom Hardy, Zendaya",
      score: 96.0,
      track: "Generative AI Application",
      round: "Final Round: 24-Hour Continuous Hacking",
    },
    {
      rank: 2,
      team: "Campus Grid",
      members: "Elon Tusk, Mark Zucker",
      score: 91.5,
      track: "Smart Campus Solutions",
      round: "Prototype Exhibition & Coding Sprint",
    },
    {
      rank: 3,
      team: "Prompt Engineers",
      members: "Dan Abramov, Sophie Alpert",
      score: 89.0,
      track: "Generative AI Application",
      round: "Final Round: 24-Hour Continuous Hacking",
    },
    {
      rank: 4,
      team: "Smart Route",
      members: "Guido van, Ada Lovelace",
      score: 86.5,
      track: "Smart Campus Solutions",
      round: "Technical Document Screening",
    },
    {
      rank: 5,
      team: "Synthia",
      members: "Jeff Bezos, Andy Jassy",
      score: 83.0,
      track: "Generative AI Application",
      round: "Preliminary Round: Concept Pitch",
    },
  ],

  "seal-fall-24": [
    {
      rank: 1,
      team: "Architect Matrix",
      members: "Robert Downey, Chris Hemsworth",
      score: 94.5,
      track: "Software Engineering",
      round: "Poster Presentation & Peer Review",
    },
    {
      rank: 2,
      team: "Predictive Analytics",
      members: "Scarlett Joh, Mark Ruffalo",
      score: 91.0,
      track: "Data Science & Analytics",
      round: "Empirical Result Presentation",
    },
    {
      rank: 3,
      team: "Framework Forge",
      members: "Chris Pratt, Zoe Saldana",
      score: 87.2,
      track: "Software Engineering",
      round: "Poster Presentation & Peer Review",
    },
    {
      rank: 4,
      team: "Data Stream",
      members: "Vin Diesel, Bradley Cooper",
      score: 85.5,
      track: "Data Science & Analytics",
      round: "Data Model Proposal",
    },
  ],

  "seal-summer-24": [
    {
      rank: 1,
      team: "Block Block",
      members: "Cillian Murphy, Emily Blunt",
      score: 95.0,
      track: "Metaverse & Blockchain",
      round: "Code Marathon & Cloud Deployment",
    },
    {
      rank: 2,
      team: "Identity Core",
      members: "Matt Damon, Robert Downey Jr",
      score: 91.8,
      track: "Web3 Utilities",
      round: "DApp Integration & Functional Testing",
    },
    {
      rank: 3,
      team: "Chain Space",
      members: "Florence Pugh, Rami Malek",
      score: 88.0,
      track: "Metaverse & Blockchain",
      round: "Preliminary Round: Solution Architecture",
    },
  ],

  "seal-spring-24": [
    {
      rank: 1,
      team: "Cyber Miners",
      members: "Leonardo DiCaprio, Jonah Hill",
      score: 93.5,
      track: "Information Technology",
      round: "Full Paper Defense",
    },
    {
      rank: 2,
      team: "Intelligent Grid",
      members: "Margot Robbie, Ryan Gosling",
      score: 90.2,
      track: "Automation & Intelligent Systems",
      round: "Experimental Defense",
    },
  ],

  "seal-fall-23": [
    {
      rank: 1,
      team: "Urban Flow",
      members: "Matthew McConaughey, Anne Hathaway",
      score: 96.2,
      track: "Internet of Things",
      round: "Hacking Time & Hardware Prototype Demo",
    },
    {
      rank: 2,
      team: "Logistics Engine",
      members: "Jessica Chastain, Michael Caine",
      score: 92.5,
      track: "Smart Automation Systems",
      round: "System Deployment & Continuous Simulation",
    },
  ],
};

export const RANKINGS = RANKINGS_BY_EVENT["seal-fall-25"];