import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { notificationApi } from "@/api/notification.api";
import { NOTIFICATION_QUERY_KEY } from "@/features/notification/hooks/useNotificationQueries";
import type { UUID } from "@/types/common.types";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: UUID) => notificationApi.markAsRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: async () => {
      enqueueSnackbar("All notifications marked as read.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: UUID) => notificationApi.deleteNotification(notificationId),
    onSuccess: async () => {
      enqueueSnackbar("Notification cleared.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
    },
  });
}

export function useClearNotificationsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (read?: boolean) => notificationApi.clearNotifications(read),
    onSuccess: async () => {
      enqueueSnackbar("Notifications cleaned.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
    },
  });
}
