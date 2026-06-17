import { useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { NotificationList } from "@/features/notification/components/NotificationList";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notification/hooks/useNotificationMutations";
import { useNotificationsQuery } from "@/features/notification/hooks/useNotificationQueries";
import type { NotificationFilter, NotificationResponse } from "@/types/notification.types";

const PAGE_SIZE = 10;

function filterToRead(filter: NotificationFilter) {
  if (filter === "READ") return true;
  if (filter === "UNREAD") return false;
  return undefined;
}

export function NotificationInboxPage() {
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [page, setPage] = useState(0);
  const query = useNotificationsQuery({ read: filterToRead(filter), page, size: PAGE_SIZE });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 1;

  const unreadOnPage = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const openNotification = async (notification: NotificationResponse) => {
    if (!notification.read) {
      await markReadMutation.mutateAsync(notification.id);
      enqueueSnackbar("Notification marked as read.", { variant: "success" });
    }
  };

  const setFilterAndReset = (next: NotificationFilter) => {
    setFilter(next);
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-8 text-white shadow-xl shadow-blue-500/20 dark:border-blue-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <NotificationsNoneOutlinedIcon />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">Notification Inbox</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-blue-50">
              Track announcements, team updates, round operations, mentor feedback, and judge assignments in one place.
            </p>
          </div>
          <button
            type="button"
            disabled={unreadOnPage === 0 || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-600 shadow-lg shadow-blue-950/10 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DoneAllOutlinedIcon fontSize="small" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["ALL", "UNREAD", "READ"] as NotificationFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilterAndReset(item)}
              className={[
                "rounded-lg px-4 py-2 text-xs font-black transition-all",
                filter === item
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-950 dark:text-blue-300"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="text-xs font-bold text-slate-400">
          {query.data?.totalElements ?? 0} notifications
        </p>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <NotificationList
          notifications={notifications}
          onOpen={openNotification}
          onMarkRead={(notification) => markReadMutation.mutate(notification.id)}
        />
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => setPage((current) => Math.max(current - 1, 0))}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Previous
        </button>
        <span className="text-sm font-bold text-slate-400">
          Page {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((current) => current + 1)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
