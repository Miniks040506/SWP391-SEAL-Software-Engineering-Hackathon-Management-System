import { formatDistanceToNow } from "date-fns";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import type { NotificationResponse } from "@/types/notification.types";

type Props = {
  notifications: NotificationResponse[];
  onOpen?: (notification: NotificationResponse) => void;
  onMarkRead?: (notification: NotificationResponse) => void;
  compact?: boolean;
};

function timeAgo(value?: string | null) {
  if (!value) return "Just now";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
}

export function NotificationList({ notifications, onOpen, onMarkRead, compact }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <NotificationsNoneOutlinedIcon className="mx-auto text-slate-300" sx={{ fontSize: 42 }} />
        <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">No notifications</p>
        <p className="mt-1 text-xs text-slate-400">Important SEAL updates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((item) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen?.(item)}
          onKeyDown={(event) => event.key === "Enter" && onOpen?.(item)}
          className={[
            "group rounded-lg border p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-900/80",
            item.read
              ? "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
              : "border-blue-200 bg-blue-50/70 shadow-blue-100/50 dark:border-blue-500/30 dark:bg-blue-500/10",
            compact ? "p-3" : "p-4",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <span
              className={[
                "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                item.read
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  : "bg-blue-500 text-white",
              ].join(" ")}
            >
              <NotificationsNoneOutlinedIcon fontSize="small" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="line-clamp-1 text-sm font-black text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase text-blue-500">
                    {item.type?.replaceAll("_", " ")}
                  </p>
                </div>
                {!item.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />}
              </div>
              <p className={["mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300", compact ? "line-clamp-2" : "line-clamp-3"].join(" ")}>{item.body}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-400">{timeAgo(item.sentAt || item.scheduledAt)}</span>
                {!item.read && onMarkRead && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkRead(item);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-white dark:text-blue-300 dark:hover:bg-slate-800"
                  >
                    <MarkEmailReadOutlinedIcon sx={{ fontSize: 16 }} />
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
