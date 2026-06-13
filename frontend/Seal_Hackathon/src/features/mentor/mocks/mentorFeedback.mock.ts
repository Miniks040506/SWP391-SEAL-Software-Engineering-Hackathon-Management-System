import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

export let mockTeamFeedbacks: MentorFeedbackResponse[] = [
  {
    id: "fb-1",
    teamId: "team-1",
    teamName: "Byte Me",
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "TECHNICAL",
    content:
      "Kiến trúc hệ thống rất tốt, tuy nhiên phần database schema cần tối ưu lại các khóa ngoại để truy vấn nhanh hơn nhé.",
    visibility: "PUBLISHED",
    visibleToTeam: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    publishedAt: new Date(Date.now() - 80000000).toISOString(),
  },

  {
    id: "fb-2",
    teamId: "team-1",
    teamName: "Byte Me",
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "PRESENTATION",
    content: "Slide demo đang hơi nhiều chữ. Các em nên dùng thêm biểu đồ (chart) để hội đồng dễ hình dung luồng dữ liệu.",
    visibility: "DRAFT",
    visibleToTeam: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper functions for mock hook
export const getMockFeedbacks = () => [...mockTeamFeedbacks];

export const addMockFeedback = (feedback: Partial<MentorFeedbackResponse>) => {
  const newFb: MentorFeedbackResponse = {
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    content: feedback.content || "",
    category: feedback.category,
    visibility: feedback.visibility || "DRAFT",
    visibleToTeam: feedback.visibility === "PUBLISHED",
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
