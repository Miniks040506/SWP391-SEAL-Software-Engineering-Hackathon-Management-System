import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Chip from "@mui/material/Chip";

import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

export type NotificationResponse = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt?: string | Date;
  sentAt?: string | Date;
  scheduledAt?: string | Date;
};

type Props = {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  notifications: NotificationResponse[];
  isLoading?: boolean;
  isProcessing?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkMultiRead?: (ids: string[]) => void;
  onDeleteMulti?: (ids: string[]) => void;
};

export const NotificationDropdown = ({ 
  anchorEl, 
  onClose,
  notifications = [],
  isLoading = false,
  isProcessing = false,
  onMarkRead,
  onMarkMultiRead,
  onDeleteMulti
}: Props) => {
  const open = Boolean(anchorEl);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingNotif, setViewingNotif] = useState<NotificationResponse | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAllSelected = notifications.length > 0 && selectedIds.length === notifications.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < notifications.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(notifications.map(n => n.id));
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    onDeleteMulti?.(selectedIds);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  const handleBulkMarkRead = () => {
    onMarkMultiRead?.(selectedIds);
    setSelectedIds([]); 
  };

  const handleNotifClick = (notif: NotificationResponse) => {
    if (!notif.read) {
      onMarkRead?.(notif.id);
    }
    setViewingNotif(notif);
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxHeight: 480,
              borderRadius: "16px",
              mt: 1.5,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          }
        }}
      >
        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 dark:bg-slate-800 shrink-0">
          {selectedIds.length > 0 ? (
            <>
              <div className="flex items-center gap-1.5 min-w-0">
                <Checkbox size="small" checked={isAllSelected} indeterminate={isIndeterminate} onChange={handleToggleSelectAll} sx={{ p: 0.5 }} />
                <span className="text-xs font-bold text-blue-600 truncate">{selectedIds.length} selected</span>
              </div>
              <div className="flex items-center shrink-0">
                <Tooltip title="Mark as read">
                  <IconButton size="small" color="primary" onClick={handleBulkMarkRead} disabled={isProcessing}>
                    <MarkEmailReadOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete selected">
                  <IconButton size="small" color="error" onClick={handleBulkDelete} disabled={isProcessing}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 min-w-0">
                <Checkbox size="small" checked={false} onChange={handleToggleSelectAll} disabled={notifications.length === 0} sx={{ p: 0.5 }} />
                <span className="font-extrabold text-sm text-gray-900 dark:text-white truncate">Notifications</span>
                {unreadCount > 0 && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">{unreadCount}</span>
                )}
              </div>
            </>
          )}
        </div>

        <Divider />

        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          {isLoading ? (
            <div className="flex justify-center py-12"><CircularProgress size={28} /></div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <NotificationsOffOutlinedIcon sx={{ fontSize: 36, mb: 1.5 }} />
              <p className="text-sm font-semibold text-gray-500">No notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {notifications.map((notif) => {
                const timeDisplay = notif.sentAt || notif.scheduledAt || notif.createdAt;
                return (
                  <div 
                    key={notif.id} 
                    className={`flex items-start gap-2.5 p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800 ${!notif.read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <Checkbox 
                        size="small" 
                        checked={selectedIds.includes(notif.id)} 
                        onChange={() => handleToggleItem(notif.id)} 
                        sx={{ p: 0 }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotifClick(notif)}>
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate flex-1 min-w-0 ${!notif.read ? 'font-extrabold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      
                      <p 
                        className="text-xs text-gray-600 dark:text-slate-400 leading-snug"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word'
                        }}
                      >
                        {notif.body}
                      </p>
                      
                      {timeDisplay && (
                        <p className="mt-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          {formatDistanceToNow(new Date(timeDisplay), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Popover>

      <Dialog 
        open={Boolean(viewingNotif)} 
        onClose={() => setViewingNotif(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, pb: 1, display: "flex", alignItems: "flex-start", gap: 2, justifyContent: "space-between" }}>
          <div className="flex items-center gap-2">
            <InfoOutlinedIcon color="primary" />
            <span className="font-extrabold text-gray-900 dark:text-white text-lg">
              Notification Detail
            </span>
          </div>
          <IconButton onClick={() => setViewingNotif(null)} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 1 }}>
          {viewingNotif && (
            <div className="space-y-4">
              <div>
                <Chip 
                  label={viewingNotif.type.replace(/_/g, " ")} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ fontWeight: 800, mb: 2 }}
                />
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {viewingNotif.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-gray-400">
                  {viewingNotif.sentAt || viewingNotif.createdAt 
                    ? format(new Date(viewingNotif.sentAt || viewingNotif.createdAt!), "MMM dd, yyyy 'at' hh:mm a") 
                    : "Unknown date"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {viewingNotif.body}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ActionConfirmDialog
        open={bulkDeleteOpen}
        title="Delete selected notifications?"
        description={`${selectedIds.length} selected notification${selectedIds.length === 1 ? "" : "s"} will be permanently removed.`}
        confirmLabel="Delete notifications"
        severity="error"
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        isPending={isProcessing}
      />
    </>
  );
};
