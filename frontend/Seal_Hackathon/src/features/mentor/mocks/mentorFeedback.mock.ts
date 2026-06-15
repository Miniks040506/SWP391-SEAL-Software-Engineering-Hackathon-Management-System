import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

export let mockTeamFeedbacks: MentorFeedbackResponse[] = [
  {
    id: "fb-team-1",
    teamId: "team-1111-1111-1111-111111111111",
    teamName: "Byte Me",
    submissionId: null,
    roundId: null,
    roundName: null,
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "GENERAL",
    content: "Các em làm việc nhóm rất tốt. Tuy nhiên tuần tới cần tăng tốc độ phát triển và chia task rõ ràng hơn nhé.",
    visibility: "PUBLISHED",
    visibleToTeam: true,
    createdAt: new Date(Date.now() - 100000000).toISOString(),
    publishedAt: new Date(Date.now() - 90000000).toISOString(),
  },
  
  {
    id: "fb-sub-1",
    teamId: "team-1111-1111-1111-111111111111",
    teamName: "Byte Me",
    submissionId: "sub-1111", 
    roundId: "round-1",
    roundName: "Preliminary Round",
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "TECHNICAL",
    content: "Cấu trúc mã nguồn của bài nộp này rất tốt. Tuy nhiên phần API kết nối database cần tối ưu lại các câu truy vấn để tránh N+1.",
    visibility: "DRAFT",
    visibleToTeam: false,
    createdAt: new Date().toISOString(),
  },

  {
    id: "fb-team-2",
    teamId: "team-2222-2222-2222-222222222222",
    teamName: "Null Pointers",
    submissionId: null, 
    roundId: null,
    roundName: null,
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "PROCESS",
    content: "Nhóm chưa nộp bài đúng hạn. Yêu cầu nhóm trưởng liên hệ Mentor để giải trình lý do trễ deadline.",
    visibility: "PUBLISHED",
    visibleToTeam: true,
    createdAt: new Date(Date.now() - 50000000).toISOString(),
    publishedAt: new Date(Date.now() - 40000000).toISOString(),
  },
];

export const getMockFeedbacks = () => [...mockTeamFeedbacks];

export const addMockFeedback = (feedback: Partial<MentorFeedbackResponse>) => {
  const newFb: MentorFeedbackResponse = {
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    content: feedback.content || "",
    category: feedback.category,
    visibility: feedback.visibility || "DRAFT",
    visibleToTeam: feedback.visibility === "PUBLISHED",
    teamId: feedback.teamId || null,
    teamName: feedback.teamName || "Unknown Team",
    submissionId: feedback.submissionId || null,
    roundId: feedback.roundId || null,
    roundName: feedback.submissionId ? "Current Round" : null,
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    ...feedback,
  };
  mockTeamFeedbacks = [newFb, ...mockTeamFeedbacks];
  return newFb;
};

export const updateMockFeedback = (id: string, data: any) => {
  mockTeamFeedbacks = mockTeamFeedbacks.map((fb) =>
    fb.id === id ? { ...fb, ...data, updatedAt: new Date().toISOString() } : fb
  );
};

export const deleteMockFeedback = (id: string) => {
  mockTeamFeedbacks = mockTeamFeedbacks.filter((fb) => fb.id !== id);
};

export const publishMockFeedback = (id: string) => {
  mockTeamFeedbacks = mockTeamFeedbacks.map((fb) =>
    fb.id === id ? { ...fb, visibility: "PUBLISHED", visibleToTeam: true, publishedAt: new Date().toISOString() } : fb
  );
};