import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
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
  const navigate = useNavigate();
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

    if (notification.targetUrl && notification.targetUrl !== "/notifications") {
      navigate(notification.targetUrl);
    }
  };

  const setFilterAndReset = (next: NotificationFilter) => {
    setFilter(next);
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <NotificationsNoneOutlinedIcon />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">Notification Inbox</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Announcements, team activity, submissions, mentor feedback, and judge assignments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshOutlinedIcon fontSize="small" />
              Refresh
            </button>
            <button
              type="button"
              disabled={unreadOnPage === 0 || markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DoneAllOutlinedIcon fontSize="small" />
              Mark all read
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-md bg-slate-100 p-1 dark:bg-slate-800">
            {(["ALL", "UNREAD", "READ"] as NotificationFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilterAndReset(item)}
                className={[
                  "rounded px-4 py-2 text-xs font-black transition-colors",
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
      </section>

      {query.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          Could not load notifications. Use refresh or try again later.
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
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
