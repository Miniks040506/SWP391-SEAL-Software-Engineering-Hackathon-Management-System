import type { RankingEntry } from "@/types/ranking.types";

// remove this file if we connect the riel API
// replace with TanStack Query call GET /api/rankings in ranking.api.ts
export const RANKINGS_BY_EVENT: Record<string, RankingEntry[]> = {
  "seal-fall-25": [
    {
      rank: 1,
      team: "Tech Wizards",
      members: "John Doe, Jane Smith",
      score: 95.5,
      track: "Web Development",
      round: "Final",
    },
    {
      rank: 2,
      team: "Code Ninjas",
      members: "Alex Lee, Bob Brown",
      score: 92.0,
      track: "Web Development",
      round: "Final",
    },
    {
      rank: 3,
      team: "AI Explorers",
      members: "Alice Wong, David Tan",
      score: 88.5,
      track: "AI & Machine Learning",
      round: "Final",
    },
    {
      rank: 4,
      team: "Skyline Team",
      members: "Chris Evans, Sarah Park",
      score: 85.0,
      track: "Mobile App",
      round: "Preliminary",
    },
    {
      rank: 5,
      team: "Byte Me",
      members: "Lucas Gray, Mia Chen",
      score: 84.2,
      track: "Web Development",
      round: "Preliminary",
    },
  ],

  "seal-summer-25": [
    {
      rank: 1,
      team: "Pixel Pushers",
      members: "Mario, Luigi",
      score: 97.5,
      track: "Game Development",
      round: "Final",
    },
    {
      rank: 2,
      team: "App Masters",
      members: "Steve Jobs, Tim Cook",
      score: 94.0,
      track: "Mobile App",
      round: "Final",
    },
    {
      rank: 3,
      team: "Web Weavers",
      members: "Tim Berners, Marc Andreessen",
      score: 90.0,
      track: "Web Development",
      round: "Final",
    },
    {
      rank: 4,
      team: "UI Wizards",
      members: "Jony Ive, Dieter Rams",
      score: 88.5,
      track: "UI/UX Design",
      round: "Preliminary",
    },
    {
      rank: 5,
      team: "Bug Squashers",
      members: "Grace Hopper, Alan Turing",
      score: 85.0,
      track: "Quality Assurance",
      round: "Preliminary",
    },
  ],

  "seal-spring-25": [
    {
      rank: 1,
      team: "Cyber Punks",
      members: "Tom Hardy, Zendaya",
      score: 96.0,
      track: "Cyber Security",
      round: "Final",
    },
    {
      rank: 2,
      team: "Data Miners",
      members: "Elon Tusk, Mark Zucker",
      score: 91.5,
      track: "Data Science",
      round: "Final",
    },
    {
      rank: 3,
      team: "React Rangers",
      members: "Dan Abramov, Sophie Alpert",
      score: 89.0,
      track: "Web Development",
      round: "Final",
    },
    {
      rank: 4,
      team: "Pythoneers",
      members: "Guido van, Ada Lovelace",
      score: 86.5,
      track: "AI & Machine Learning",
      round: "Preliminary",
    },
    {
      rank: 5,
      team: "Cloud Surfers",
      members: "Jeff Bezos, Andy Jassy",
      score: 83.0,
      track: "Cloud Computing",
      round: "Preliminary",
    },
  ],
};

export const RANKINGS = RANKINGS_BY_EVENT["seal-fall-25"];
