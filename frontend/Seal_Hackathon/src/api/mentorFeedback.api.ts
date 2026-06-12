import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateMentorFeedbackRequest,
  MentorFeedbackResponse,
  UpdateMentorFeedbackRequest,
} from "@/types/mentorFeedback.types";

export const mentorFeedbackApi = {
  createFeedback(teamId: UUID, payload: CreateMentorFeedbackRequest) {
    return apiRequest.post<MentorFeedbackResponse>(
      `/mentor-feedback/teams/${teamId}`,
      payload,
    );
  },

  getMentorTeamFeedback(teamId: UUID) {
    return apiRequest.get<MentorFeedbackResponse[]>(
      `/mentor-feedback/teams/${teamId}`,
    );
  },

  getTeamFeedback(teamId: UUID) {
    return apiRequest.get<MentorFeedbackResponse[]>(
      `/mentor-feedback/teams/${teamId}`,
    );
  },

  getTeamVisibleFeedback(teamId: UUID) {
    return apiRequest.get<MentorFeedbackResponse[]>(`/teams/${teamId}/feedback`);
  },

  getFeedbackById(feedbackId: UUID) {
    return apiRequest.get<MentorFeedbackResponse>(
      `/mentor-feedback/${feedbackId}`,
    );
  },

  updateFeedback(feedbackId: UUID, payload: UpdateMentorFeedbackRequest) {
    return apiRequest.patch<MentorFeedbackResponse>(
      `/mentor-feedback/${feedbackId}`,
      payload,
    );
  },

  deleteFeedback(feedbackId: UUID) {
    return apiRequest.delete<void>(`/mentor-feedback/${feedbackId}`);
  },

  publishFeedback(feedbackId: UUID) {
    return apiRequest.post<MentorFeedbackResponse>(
      `/mentor-feedback/${feedbackId}/publish`,
    );
  },
};
