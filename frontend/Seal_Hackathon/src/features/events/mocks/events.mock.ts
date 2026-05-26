import type { Event } from "@/types/event.types";

// Remove this file once the real API is connected.
// Replace with TanStack Query → GET /api/events in events.api.ts
export const EVENTS: Event[] = [
  {
    id: "seal-spring-26",
    title: "SEAL Hackathon Spring 2026",
    season: "Spring",
    status: "Ongoing",
    registrationOpen: false,
    currentPhase: 2,
    description:
      "Conquer software engineering challenges and find innovative digital solutions for modern problems.",
    startDate: "Feb 15, 2026",
    endDate: "Mar 20, 2026",
    tracks: [
      {
        name: "Web Application",
        desc: "Building scalable modern web applications with cutting-edge tech and microservices.",
        rounds: [
          { id: "r1", name: "Proposal Submission", duration: "14 days" },
          { id: "r2", name: "48-Hour Live Coding Sprint", duration: "2 days" },
          { id: "r3", name: "Grand Finale Pitching", duration: "1 day" },
        ],
        prizes: [
          { rank: "Champion", value: "10,000,000 VND" },
          { rank: "Runner Up", value: "5,000,000 VND" },
          { rank: "Third Place", value: "2,500,000 VND" },
        ],
      },
      {
        name: "Mobile Application",
        desc: "Creating seamless, high-performance, and intuitive mobile experiences.",
        rounds: [
          { id: "r1", name: "UI/UX & Architecture Proposal", duration: "14 days" },
          { id: "r2", name: "48-Hour Live Coding Sprint", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "10,000,000 VND" },
          { rank: "Runner Up", value: "5,000,000 VND" },
          { rank: "Third Place", value: "2,500,000 VND" },
        ],
      },
      {
        name: "AI & Machine Learning",
        desc: "Implementing intelligent algorithms, NLP, and predictive data models.",
        rounds: [
          { id: "r1", name: "Dataset Analysis & Model Selection", duration: "14 days" },
          { id: "r2", name: "Model Training & Optimization Sprint", duration: "2 days" },
          { id: "r3", name: "Solution Presentation", duration: "1 day" },
        ],
        prizes: [
          { rank: "Champion", value: "5,000,000 VND" },
          { rank: "Runner Up", value: "3,000,000 VND" },
          { rank: "Third Place", value: "2,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "Mar 19, 2026",
        text: "Grand Finale Pitching Registration Deadline Extended",
        detail:
          "Teams now have until 11:59 PM tonight to submit their final pitch decks and repository links. No further extensions will be granted.",
        phase: 3,
      },
      {
        date: "Mar 18, 2026",
        text: "Phase 2 Live Coding Sprint Results Dispatched",
        detail:
          "Check your registered team emails for detailed code quality and architecture feedback matrices from the technical jury. Top 10 teams move to the Grand Finale.",
        phase: 2,
      },
      {
        date: "Mar 17, 2026",
        text: "Mentorship Session #2: UI/UX & Scaling on Cloud Hosting",
        detail:
          "Join our industry experts at Room 204 or via the Microsoft Teams link provided in the Discord announcements channel at 2:00 PM.",
        phase: 2,
      },
      {
        date: "Mar 16, 2026",
        text: "Phase 1 Proposal Submission Approved Shortlist Released",
        detail:
          "Congratulations to all qualifying tracks! Please review the cloud computing requirements and workspace setups in the shared drive.",
        phase: 1,
      },
      {
        date: "Mar 15, 2026",
        text: "Official Kick-off: Opening Ceremony Live Stream Link",
        detail:
          "Watch the opening briefing from the SE Faculty management detailing evaluation criteria, scoring metrics, and resource allocations.",
        phase: 1,
      },
      {
        date: "Feb 20, 2026",
        text: "Pre-Event Technical Guidelines & Repository Standard",
        detail:
          "All source code must be hosted on GitHub under a clean organizational structure using continuous integration templates.",
        phase: 1,
      },
      {
        date: "Feb 15, 2026",
        text: "Team Formation & Mandatory Discord Server Join Request",
        detail:
          "Ensure all 4 members have verified their student credentials on our automation system to unlock private channels.",
        phase: 1,
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
      "Intensive competition focusing on Enterprise Software Solutions and Cloud Architecture innovation.",
    startDate: "May 20, 2026",
    endDate: "Jun 25, 2026",
    tracks: [
      {
        name: "Information Security",
        desc: "Secure software development and backend vulnerability mitigation.",
        rounds: [
          { id: "r1", name: "Capture The Flag (CTF) Qualifier", duration: "14 days" },
          { id: "r2", name: "Secure Architecture Design", duration: "7 days" },
          { id: "r3", name: "48-Hour Live Defense Hack", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "15,000,000 VND" },
          { rank: "Runner Up", value: "8,000,000 VND" },
        ],
      },
      {
        name: "Cloud Native Solutions",
        desc: "Serverless architectures, containerization, and infrastructure as code.",
        rounds: [
          { id: "r1", name: "Cloud Architecture Proposal", duration: "14 days" },
          { id: "r2", name: "IaC Implementation & Deployment Sprint", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "15,000,000 VND" },
          { rank: "Runner Up", value: "7,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "Jun 02, 2026",
        text: "Detailed Rulebook & Sandbox Server Credentials Disclosed",
        phase: 1,
        detail:
          "The updated competition parameters document has been uploaded to the dashboard. Teams can now log into their designated target isolated environments.",
      },
      {
        date: "May 28, 2026",
        text: "Upcoming Pre-Hackathon Webinar: Mastering Infrastructure as Code",
        phase: 1,
        detail:
          "Set up your reminders for a live technological breakdown of containerization strategies and serverless microarchitectures on our streaming terminal.",
      },
      {
        date: "May 20, 2026",
        text: "Registration portal for SEAL Hackathon Summer 2026 is officially open!",
        phase: 1,
        detail:
          "Ready to build scalable Cloud and Security solutions? Gather your team and complete the registration form before June 15, 2026 to secure your slot.",
      },
    ],
  },
  {
    id: "seal-fall-25",
    title: "SEAL Hackathon Fall 2025",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "Successfully concluded with over 60 teams driving automated software solutions and modern technology implementation across FPT campuses.",
    startDate: "Sep 10, 2025",
    endDate: "Oct 15, 2025",
    tracks: [
      {
        name: "Fintech & Open Banking",
        desc: "Developing next-generation financial applications and secure transaction gateways.",
        rounds: [
          { id: "r1", name: "Abstract & Architecture Wireframing", duration: "14 days" },
          { id: "r2", name: "Prototype Construction & API Integration", duration: "7 days" },
          { id: "r3", name: "Demo Day Pitching", duration: "1 day" },
        ],
        prizes: [
          { rank: "Champion", value: "12,000,000 VND" },
          { rank: "Runner Up", value: "6,000,000 VND" },
        ],
      },
      {
        name: "Enterprise Digitalization",
        desc: "Optimizing university enterprise workflows and educational resource distribution systems.",
        rounds: [
          { id: "r1", name: "System Architecture Proposal", duration: "14 days" },
          { id: "r2", name: "48-Hour Core System Deployment", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "8,000,000 VND" },
          { rank: "Runner Up", value: "4,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "Oct 16, 2025",
        text: "Final scoreboard and winners announcement.",
        phase: 3,
        detail: "Congratulations to all winners! Full results published on the dashboard.",
      },
    ],
  },
  {
    id: "seal-spring-25",
    title: "FPT Edu Hackathon 2025",
    season: "Spring",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "The ultimate coding arena for FPT Edu students to tackle real-world problems with disruptive software solutions.",
    startDate: "Feb 10, 2025",
    endDate: "Mar 14, 2025",
    tracks: [
      {
        name: "Generative AI Application",
        desc: "Building software solutions integrated with GenAI, RAG architectures, and Large Language Models.",
        rounds: [
          { id: "r1", name: "Preliminary Round: Concept Pitch", duration: "14 days" },
          { id: "r2", name: "Final Round: 24-Hour Continuous Hacking", duration: "1 day" },
        ],
        prizes: [
          { rank: "Champion", value: "30,000,000 VND" },
          { rank: "Runner Up", value: "15,000,000 VND" },
        ],
      },
      {
        name: "Campus Management Systems",
        desc: "Leveraging software tools to improve campus scheduling optimization and student management.",
        rounds: [
          { id: "r1", name: "Technical Document Screening", duration: "14 days" },
          { id: "r2", name: "Prototype Exhibition & Coding Sprint", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "20,000,000 VND" },
          { rank: "Runner Up", value: "10,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "Mar 14, 2025",
        text: "Final Showcase Live Execution Metrics Update",
        phase: 3,
        detail:
          "Pitch timing allocations will adhere strictly to a 5-minute configuration followed by a 3-minute validation sequence by enterprise professionals.",
      },
      {
        date: "Mar 13, 2025",
        text: "24-Hour continuous coding marathon phase completed.",
        phase: 2,
        detail:
          "All repository access has been restricted as coding time concludes. Prepare your slides and dynamic models for tomorrow's grand evaluation.",
      },
      {
        date: "Feb 15, 2025",
        text: "API Rate-Limiting Protocols & Structural Blueprint Review",
        phase: 1,
        detail:
          "Please prevent spamming requests against the localized embedding models. Ensure intelligent local operational caching systems are integrated.",
      },
    ],
  },
  {
    id: "seal-fall-24",
    title: "FPT Edu Research Festival 2024",
    season: "Fall",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "An annual academic event rooted in innovative teaching and learning, gathering hundreds of software and data science papers from students.",
    startDate: "Aug 15, 2024",
    endDate: "Oct 10, 2024",
    tracks: [
      {
        name: "Software Engineering",
        desc: "Researching software architecture design, agile methodologies, and testing frameworks.",
        rounds: [
          { id: "r1", name: "Abstract & Overview Screening", duration: "30 days" },
          { id: "r2", name: "Poster Presentation & Peer Review", duration: "4 days" },
        ],
        prizes: [
          { rank: "First Prize", value: "12,000,000 VND" },
          { rank: "Second Prize", value: "6,000,000 VND" },
        ],
      },
      {
        name: "Data Science & Analytics",
        desc: "Exploring predictive data engineering models and advanced analytics for commercial applications.",
        rounds: [
          { id: "r1", name: "Data Model Proposal", duration: "30 days" },
          { id: "r2", name: "Empirical Result Presentation", duration: "3 days" },
        ],
        prizes: [
          { rank: "First Prize", value: "8,000,000 VND" },
          { rank: "Second Prize", value: "4,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "Oct 11, 2024",
        text: "Closing ceremony updates and academic certificate distribution.",
        phase: 3,
        detail:
          "Digital participation credentials and peer-review accolades will be sent to your registered student dashboard accounts within 7 working days.",
      },
      {
        date: "Oct 08, 2024",
        text: "Anomalous Structural Data Submission Constraints Modified",
        phase: 2,
        detail:
          "The evaluation council explicitly demands all analytical software outputs compile safely under standard isolated terminal execution environments.",
      },
      {
        date: "Sep 01, 2024",
        text: "Peer Review Assignment Matrix Available",
        phase: 1,
        detail:
          "Please verify your localized evaluation targets under the research panel mapping matrix on your portal accounts directly.",
      },
    ],
  },
  {
    id: "seal-summer-24",
    title: "FPT Edu Hackathon 2024",
    season: "Summer",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "A high-intensity software competition deeply exploring the concepts of Blockchain and Web3 technologies.",
    startDate: "May 15, 2024",
    endDate: "Jul 12, 2024",
    tracks: [
      {
        name: "Blockchain & Web3",
        desc: "Developing secure smart contracts and decentralized systems for community benefits.",
        rounds: [
          { id: "r1", name: "Preliminary Round: Solution Architecture", duration: "14 days" },
          { id: "r2", name: "48-Hour Code Marathon & Cloud Deployment", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "18,000,000 VND" },
          { rank: "Runner Up", value: "9,000,000 VND" },
        ],
      },
      {
        name: "Decentralized Applications (DApps)",
        desc: "Creating secure user identity management and asset distribution frameworks on-chain.",
        rounds: [
          { id: "r1", name: "Smart Contract Design Proposal", duration: "14 days" },
          { id: "r2", name: "DApp Integration & Functional Testing", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "12,000,000 VND" },
          { rank: "Runner Up", value: "6,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "May 12, 2024",
        text: "Web3 and Blockchain tracks system deployment audit complete.",
        phase: 3,
        detail:
          "The decentralized smart contracts deployed on the sandbox network have been verified and scored by the central engineering committee.",
      },
      {
        date: "May 10, 2024",
        text: "Gas Fee Optimization Architecture Directive Issued",
        phase: 2,
        detail:
          "Smart contract implementations failing to apply computational loop optimizations will incur significant functional baseline penalties during execution tests.",
      },
      {
        date: "Apr 01, 2024",
        text: "RPC Network Infrastructure Latency Resolution",
        phase: 1,
        detail:
          "The primary node configuration endpoints have been scaled up horizontally to isolate connection drops during parallel deployment phases.",
      },
    ],
  },

  {
    id: "seal-spring-24",
    title: "FPT Edu Hackathon Spring 2024",
    season: "Spring",
    status: "Ended",
    registrationOpen: false,
    currentPhase: 3,
    description:
      "A high-intensity software competition deeply exploring the concepts of Blockchain and Web3 technologies.",
    startDate: "Feb 15, 2024",
    endDate: "May 12, 2024",
    tracks: [
      {
        name: "Blockchain & Web3",
        desc: "Developing secure smart contracts and decentralized systems for community benefits.",
        rounds: [
          { id: "r1", name: "Preliminary Round: Solution Architecture", duration: "14 days" },
          { id: "r2", name: "48-Hour Code Marathon & Cloud Deployment", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "18,000,000 VND" },
          { rank: "Runner Up", value: "9,000,000 VND" },
        ],
      },
      {
        name: "Decentralized Applications (DApps)",
        desc: "Creating secure user identity management and asset distribution frameworks on-chain.",
        rounds: [
          { id: "r1", name: "Smart Contract Design Proposal", duration: "14 days" },
          { id: "r2", name: "DApp Integration & Functional Testing", duration: "2 days" },
        ],
        prizes: [
          { rank: "Champion", value: "12,000,000 VND" },
          { rank: "Runner Up", value: "6,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "May 12, 2024",
        text: "Web3 and Blockchain tracks system deployment audit complete.",
        phase: 3,
        detail:
          "The decentralized smart contracts deployed on the sandbox network have been verified and scored by the central engineering committee.",
      },
      {
        date: "May 10, 2024",
        text: "Gas Fee Optimization Architecture Directive Issued",
        phase: 2,
        detail:
          "Smart contract implementations failing to apply computational loop optimizations will incur significant functional baseline penalties during execution tests.",
      },
      {
        date: "Apr 01, 2024",
        text: "RPC Network Infrastructure Latency Resolution",
        phase: 1,
        detail:
          "The primary node configuration endpoints have been scaled up horizontally to isolate connection drops during parallel deployment phases.",
      },
    ],
  },

  {
    id: "seal-stress-test-26",
    title: "SEAL UI Stress Test 2026",
    season: "Winter",
    status: "Upcoming",
    registrationOpen: true,
    currentPhase: 0,
    description: "Event mock data created specifically to test horizontal scrolling with a large number of tracks and extremely long track names.",
    startDate: "Nov 01, 2026",
    endDate: "Dec 31, 2026",
    tracks: [
      {
        name: "Frontend & Advanced UI/UX Engineering",
        desc: "Building intuitive interfaces.",
        rounds: [{ id: "r1", name: "UI Challenge", duration: "7 days" }],
        prizes: [
          { rank: "Champion", value: "10,000,000 VND" },
          { rank: "Runner Up", value: "5,000,000 VND" },
        ],
      },
      {
        name: "Backend Architectures & Distributed Systems",
        desc: "Scaling servers and databases.",
        rounds: [{ id: "r1", name: "System Design", duration: "7 days" }],
        prizes: [
          { rank: "Champion", value: "10,000,000 VND" },
          { rank: "Runner Up", value: "5,000,000 VND" },
        ],
      },
      {
        name: "Artificial Intelligence & Natural Language Processing",
        desc: "Training custom models.",
        rounds: [{ id: "r1", name: "Model Tuning", duration: "7 days" }],
        prizes: [
          { rank: "Champion", value: "15,000,000 VND" },
        ],
      },
      {
        name: "Cybersecurity & Ethical Hacking Operations",
        desc: "Securing vulnerabilities.",
        rounds: [{ id: "r1", name: "CTF Live", duration: "2 days" }],
        prizes: [
          { rank: "Champion", value: "20,000,000 VND" },
          { rank: "Runner Up", value: "10,000,000 VND" },
        ],
      },
      {
        name: "Blockchain Technologies & Smart Contracts",
        desc: "On-chain development.",
        rounds: [{ id: "r1", name: "Smart Contract Audit", duration: "7 days" }],
        prizes: [
          { rank: "Champion", value: "12,000,000 VND" },
        ],
      },
      {
        name: "Internet of Things (IoT) & Embedded Systems",
        desc: "Hardware programming.",
        rounds: [{ id: "r1", name: "Hardware Prototyping", duration: "14 days" }],
        prizes: [
          { rank: "Champion", value: "8,000,000 VND" },
        ],
      },
      {
        name: "Game Development & Interactive Media Entertainment",
        desc: "Building immersive games.",
        rounds: [{ id: "r1", name: "Game Jam Sprint", duration: "3 days" }],
        prizes: [
          { rank: "Champion", value: "15,000,000 VND" },
          { rank: "Runner Up", value: "7,000,000 VND" },
          { rank: "Third Place", value: "3,000,000 VND" },
        ],
      },
    ],
    announcements: [
      {
        date: "Nov 01, 2026",
        text: "Stress Test Initiated",
        detail: "This event contains 7 tracks to verify that the UI tab list scrolls perfectly.",
        phase: 1,
      }
    ],
  }
];