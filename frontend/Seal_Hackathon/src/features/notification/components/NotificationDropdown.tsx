import { useNavigate } from "react-router-dom";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { useMarkNotificationReadMutation } from "@/features/notification/hooks/useNotificationMutations";
import { useNotificationsQuery } from "@/features/notification/hooks/useNotificationQueries";
import type { NotificationResponse } from "@/types/notification.types";

type Props = {
  inboxPath: string;
  onClose: () => void;
};

export function NotificationDropdown({ inboxPath, onClose }: Props) {
  const navigate = useNavigate();
  const notificationsQuery = useNotificationsQuery({ page: 0, size: 5 });
  const markReadMutation = useMarkNotificationReadMutation();

  const notifications = notificationsQuery.data?.content ?? [];

  const openNotification = async (notification: NotificationResponse) => {
    if (!notification.read) {
      await markReadMutation.mutateAsync(notification.id);
    }
    onClose();
    navigate(notification.targetUrl || inboxPath);
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-[min(calc(100vw-1rem),360px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Notifications</p>
          <p className="text-xs font-semibold text-slate-400">Latest SEAL updates</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(inboxPath);
          }}
          className="rounded-md px-3 py-1.5 text-xs font-black text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          View all
        </button>
      </div>
      <div className="max-h-[430px] overflow-y-auto p-3">
        {notificationsQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            compact
            onOpen={openNotification}
            onMarkRead={(notification) => markReadMutation.mutate(notification.id)}
          />
        )}
      </div>
    </div>
  );
}
