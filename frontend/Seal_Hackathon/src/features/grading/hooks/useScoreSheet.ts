export const useScoreSheet = (submissionId?: string) => {
  return {
    submission: {
      id: submissionId || "sub-123",
      title: "AI Project Manager",
      teamName: "Code Ninjas",
      eventName: "SEAL Hackathon 2026",
      roundName: "Preliminary Round",
      trackName: "Software Engineering",
      submissionStatus: "SUBMITTED",
      gradingStatus: "IN_PROGRESS",
      links: [
        { id: "l1", type: "GITHUB", url: "https://github.com/example/repo" },
        { id: "l2", type: "DEMO_VIDEO", url: "https://youtube.com/watch?v=demo" },
      ]
    },
    criteria: [
      { id: "c1", name: "Innovation", category: "Core", maxScore: 20, weight: 1, description: "How unique and creative is the solution?" },
      { id: "c2", name: "Technical Complexity", category: "Core", maxScore: 30, weight: 1.5, description: "How technically challenging is the implementation?" },
      { id: "c3", name: "UI/UX Design", category: "Design", maxScore: 25, weight: 1, description: "Is the interface intuitive and visually appealing?" },
      { id: "c4", name: "Business Value", category: "Business", maxScore: 25, weight: 1, description: "Does it solve a real-world problem effectively?" },
    ],
    isLocked: false,
    isFinalSubmitted: false,
    isNotReady: false,
    isNotAssigned: false,
    isLoading: false,
  };
};
