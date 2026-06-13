import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

export const mockTeamVisibleFeedbacks: MentorFeedbackResponse[] = [
  {
    id: "fb-1",
    teamId: "team-1",
    teamName: "Byte Me",
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "TECHNICAL",
    content: "Kiến trúc hệ thống rất tốt, tuy nhiên phần database schema cần tối ưu lại các khóa ngoại để truy vấn nhanh hơn nhé.",
    visibility: "PUBLISHED",
    visibleToTeam: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    publishedAt: new Date(Date.now() - 80000000).toISOString(),
  },
  {
    id: "fb-3",
    teamId: "team-1",
    teamName: "Byte Me",
    mentorUserId: "mentor-1",
    mentorName: "Mentor John",
    category: "GENERAL",
    content: "Các em nhớ kiểm tra lại form nộp bài trước hạn chót đêm nay nhé. Team làm việc rất chăm chỉ, cố lên!",
    visibility: "PUBLISHED",
    visibleToTeam: true,
    createdAt: new Date(Date.now() - 20000000).toISOString(),
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
  }
];