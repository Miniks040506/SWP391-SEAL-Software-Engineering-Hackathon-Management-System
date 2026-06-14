import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type { TeamResponse } from "@/types/team.types";
import type {
  AssignMentorRequest,
  MentorAssignmentResponse,
  CreateTrackRequest,
  RegisterTeamTrackRequest,
  TrackDetailResponse,
  TrackResponse,
  TrackAvailabilityResponse,
  TrackTeamProgressResponse,
  UpdateTrackRequest,
} from "@/types/track.types";

export const trackApi = {
  createTrack(eventId: UUID, payload: CreateTrackRequest) {
    return apiRequest.post<TrackResponse>(`/events/${eventId}/tracks`, payload);
  },

  getTracksByEvent(eventId: UUID) {
    return apiRequest.get<TrackResponse[]>(`/events/${eventId}/tracks`);
  },

  getTrackById(trackId: UUID) {
    return apiRequest.get<TrackDetailResponse>(`/tracks/${trackId}`);
  },

  updateTrack(trackId: UUID, payload: UpdateTrackRequest) {
    return apiRequest.patch<TrackResponse>(`/tracks/${trackId}`, payload);
  },

  deleteTrack(trackId: UUID) {
    return apiRequest.delete<void>(`/tracks/${trackId}`);
  },

  assignMentor(trackId: UUID, payload: AssignMentorRequest) {
    return apiRequest.post<MentorAssignmentResponse>(
      `/tracks/${trackId}/mentor-assignments`,
      payload,
    );
  },

  getMentorAssignments(trackId: UUID) {
    return apiRequest.get<MentorAssignmentResponse[]>(
      `/tracks/${trackId}/mentor-assignments`,
    );
  },

  removeMentorAssignment(trackId: UUID, assignmentId: UUID) {
    return apiRequest.delete<void>(
      `/tracks/${trackId}/mentor-assignments/${assignmentId}`,
    );
  },

  getTrackTeams(trackId: UUID, params?: { page?: number; size?: number }) {
    return apiRequest.get<PageResponse<TrackTeamProgressResponse>>(
      `/tracks/${trackId}/teams`,
      { params },
    );
  },

  registerTeamForTrack(teamId: UUID, payload: RegisterTeamTrackRequest) {
    return apiRequest.post<TeamResponse>(
      `/teams/${teamId}/register-track`,
      payload,
    );
  },

  getAvailableTracks(eventId: UUID) {
    return apiRequest.get<TrackAvailabilityResponse[]>(
      `/events/${eventId}/tracks/available`,
    );
  },
};
