import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CreateNotificationRequest,
  GetMyNotificationsParams,
  NotificationResponse,
  UnreadCountResponse,
} from "@/types/notification.types";

function toParams(params?: GetMyNotificationsParams) {
  return {
    read: params?.read,
    page: params?.page ?? 0,
    size: params?.size ?? 20,
  };
}

export const notificationApi = {
  getMyNotifications: (params?: GetMyNotificationsParams) =>
    apiRequest.get<PageResponse<NotificationResponse>>("/notifications", {
      params: toParams(params),
    }),

  getUnreadCount: () =>
    apiRequest.get<UnreadCountResponse>("/notifications/unread-count"),

  getNotificationById: (notificationId: UUID) =>
    apiRequest.get<NotificationResponse>(`/notifications/${notificationId}`),

  markAsRead: (notificationId: UUID) =>
    apiRequest.post<void>(`/notifications/${notificationId}/read`),

  markAllAsRead: () => apiRequest.post<void>("/notifications/read-all"),

  deleteNotification: (notificationId: UUID) =>
    apiRequest.delete<void>(`/notifications/${notificationId}`),

  clearNotifications: (read?: boolean) =>
    apiRequest.delete<void>("/notifications/clear", { params: { read } }),

  createNotification: (payload: CreateNotificationRequest) =>
    apiRequest.post<NotificationResponse>("/notifications", payload),

  sendNotificationNow: (notificationId: UUID) =>
    apiRequest.post<NotificationResponse>(`/notifications/${notificationId}/send`),
};
