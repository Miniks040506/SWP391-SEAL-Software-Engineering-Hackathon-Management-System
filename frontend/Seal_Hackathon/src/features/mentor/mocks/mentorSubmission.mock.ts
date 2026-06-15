import type {
  SubmissionDetailResponse,
  SubmissionSummaryResponse,
} from "@/types/submission.types";
import type { UUID } from "@/types/common.types";

export const mockTrackSubmissions: SubmissionSummaryResponse[] = [
  {
    id: "sub-1111" as UUID,
    teamId: "team-1111-1111-1111-111111111111" as UUID, // <-- Đã đồng bộ UUID
    teamName: "Byte Me",
    trackId: "track-1" as UUID,
    trackName: "AI Track",
    roundId: "round-1" as UUID,
    roundName: "Preliminary Round",
    status: "SUBMITTED",
    submissionNumber: 1,
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    linkCount: 2,
  },
  {
    id: "sub-2222" as UUID,
    teamId: "team-2222-2222-2222-222222222222" as UUID, // <-- Đã đồng bộ UUID
    teamName: "Null Pointers",
    trackId: "track-1" as UUID,
    trackName: "AI Track",
    roundId: "round-1" as UUID,
    roundName: "Preliminary Round",
    status: "LATE",
    submissionNumber: 2,
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    linkCount: 3,
  },
  {
    id: "sub-3333" as UUID,
    teamId: "team-3333-3333-3333-333333333333" as UUID, // <-- Đã đồng bộ UUID
    teamName: "404 Brain Not Found",
    trackId: "track-1" as UUID,
    trackName: "AI Track",
    roundId: "round-1" as UUID,
    roundName: "Preliminary Round",
    status: "DRAFT",
    submissionNumber: 0,
    submittedAt: null,
    updatedAt: new Date().toISOString(),
    linkCount: 0,
  },
];

export const mockSubmissionDetail: SubmissionDetailResponse = {
  id: "sub-1111" as UUID,
  eventId: "evt-1" as UUID,
  eventName: "Spring Hackathon 2026",
  
  teamId: "team-1111-1111-1111-111111111111" as UUID, 
  
  teamName: "Byte Me",
  leaderId: "user-99" as UUID,
  leaderName: "Nguyễn Văn A",
  trackId: "track-1" as UUID,
  trackName: "AI Track",
  roundId: "round-1" as UUID,
  roundName: "Preliminary Round",
  note: "Tụi em đã fix lỗi CORS ở bản demo, mentor xem giúp ạ. Cảm ơn mentor!",
  status: "SUBMITTED",
  submissionNumber: 1,
  submittedAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  roundSubmissionLocked: false,
  roundSubmissionLockedAt: null,
  links: [
    {
      id: "link-1" as UUID,
      submissionId: "sub-1111" as UUID,
      linkType: "REPOSITORY",
      url: "https://github.com/byteme/ai-project",
      label: "Frontend & Backend Source Code",
      isPrimary: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "link-2" as UUID,
      submissionId: "sub-1111" as UUID,
      linkType: "DEMO",
      url: "https://byteme-demo.vercel.app",
      label: "Live Demo Website",
      isPrimary: false,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
    },
  ],
};