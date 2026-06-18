import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import type { NotificationResponse } from "@/types/notification.types";

type Props = {
  notification: NotificationResponse | null;
  open: boolean;
  onClose: () => void;
  onMarkRead?: (notification: NotificationResponse) => void;
  onDelete?: (notification: NotificationResponse) => void;
  onOpenTarget?: (notification: NotificationResponse) => void;
  markReadLoading?: boolean;
  deleteLoading?: boolean;
};

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function NotificationDetailDialog({
  notification,
  open,
  onClose,
  onMarkRead,
  onDelete,
  onOpenTarget,
  markReadLoading,
  deleteLoading,
}: Props) {
  const canOpenTarget =
    notification?.targetUrl && notification.targetUrl !== "/notifications";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
        {notification?.title ?? "Notification"}
      </DialogTitle>
      <DialogContent dividers>
        {notification && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Chip
                size="small"
                label={notification.type?.replaceAll("_", " ") ?? "GENERAL"}
                color="primary"
                variant="outlined"
              />
              <Chip
                size="small"
                label={notification.read ? "READ" : "UNREAD"}
                color={notification.read ? "default" : "success"}
                variant="outlined"
              />
              <Chip size="small" label={notification.status ?? "SENT"} variant="outlined" />
            </div>

            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/60">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                {notification.body}
              </p>
            </div>

            <Divider />

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info label="Target" value={notification.targetScope ?? "N/A"} />
              <Info label="Channel" value={notification.channel ?? "N/A"} />
              <Info label="Sent at" value={formatDateTime(notification.sentAt)} />
              <Info label="Scheduled at" value={formatDateTime(notification.scheduledAt)} />
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {notification && onDelete && (
          <Button
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => onDelete(notification)}
            disabled={deleteLoading}
            sx={{ mr: "auto", fontWeight: 800, textTransform: "none" }}
          >
            Clear
          </Button>
        )}
        {notification && !notification.read && onMarkRead && (
          <Button
            startIcon={<MarkEmailReadOutlinedIcon />}
            onClick={() => onMarkRead(notification)}
            disabled={markReadLoading}
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            Mark read
          </Button>
        )}
        {notification && canOpenTarget && onOpenTarget && (
          <Button
            startIcon={<LaunchOutlinedIcon />}
            onClick={() => onOpenTarget(notification)}
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            Open target
          </Button>
        )}
        <Button onClick={onClose} sx={{ fontWeight: 800, textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words font-bold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}
