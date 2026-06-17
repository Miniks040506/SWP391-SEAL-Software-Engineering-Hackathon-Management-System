import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/api/notification.api";
import type { GetMyNotificationsParams } from "@/types/notification.types";

export const NOTIFICATION_QUERY_KEY = "notifications";

export function useNotificationsQuery(params: GetMyNotificationsParams = {}) {
  return useQuery({
    queryKey: [NOTIFICATION_QUERY_KEY, "list", params],
    queryFn: () => notificationApi.getMyNotifications(params),
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: [NOTIFICATION_QUERY_KEY, "unread-count"],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30_000,
  });
}
