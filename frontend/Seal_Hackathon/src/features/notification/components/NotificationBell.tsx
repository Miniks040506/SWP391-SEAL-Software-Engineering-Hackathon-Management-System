import { useEffect, useRef, useState } from "react";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { NotificationDropdown } from "@/features/notification/components/NotificationDropdown";
import { useUnreadNotificationCountQuery } from "@/features/notification/hooks/useNotificationQueries";

type Props = {
  inboxPath: string;
};

export function NotificationBell({ inboxPath }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadQuery = useUnreadNotificationCountQuery();
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".MuiDialog-root")) return;
      if (ref.current && !ref.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-full p-1.5 text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Open notifications"
      >
        <NotificationsNoneOutlinedIcon fontSize="small" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && <NotificationDropdown inboxPath={inboxPath} onClose={() => setOpen(false)} />}
    </div>
  );
}
