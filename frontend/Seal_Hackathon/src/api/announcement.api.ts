import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  AnnouncementResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/types/announcement.types";

export const announcementApi = {
  getEventAnnouncements(eventId: UUID) {
    return apiRequest.get<AnnouncementResponse[]>(
      `/events/${eventId}/announcements`,
    );
  },

  createAnnouncement(eventId: UUID, payload: CreateAnnouncementRequest) {
    return apiRequest.post<AnnouncementResponse>(
      `/events/${eventId}/announcements`,
      payload,
    );
  },

  getAnnouncementById(announcementId: UUID) {
    return apiRequest.get<AnnouncementResponse>(
      `/announcements/${announcementId}`,
    );
  },

  updateAnnouncement(announcementId: UUID, payload: UpdateAnnouncementRequest) {
    return apiRequest.patch<AnnouncementResponse>(
      `/announcements/${announcementId}`,
      payload,
    );
  },

  deleteAnnouncement(announcementId: UUID) {
    return apiRequest.delete<void>(`/announcements/${announcementId}`);
  },

  publishAnnouncement(announcementId: UUID) {
    return apiRequest.post<AnnouncementResponse>(
      `/announcements/${announcementId}/publish`,
    );
  },

  unpublishAnnouncement(announcementId: UUID) {
    return apiRequest.post<AnnouncementResponse>(
      `/announcements/${announcementId}/unpublish`,
    );
  },

  pinAnnouncement(announcementId: UUID) {
    return apiRequest.post<AnnouncementResponse>(
      `/announcements/${announcementId}/pin`,
    );
  },

  unpinAnnouncement(announcementId: UUID) {
    return apiRequest.post<AnnouncementResponse>(
      `/announcements/${announcementId}/unpin`,
    );
  },

  markResultAnnouncement(announcementId: UUID) {
    return apiRequest.post<AnnouncementResponse>(
      `/announcements/${announcementId}/mark-result`,
    );
  },
};
