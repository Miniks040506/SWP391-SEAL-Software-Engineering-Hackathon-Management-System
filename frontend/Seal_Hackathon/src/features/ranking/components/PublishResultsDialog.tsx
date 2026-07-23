import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import type { PublishResultsRequest } from "@/types/ranking.types";

type PublishResultsDialogProps = {
  open: boolean;
  scopeLabel: string;
  rankingCount: number;
  defaultTitle: string;
  defaultContent: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (payload: PublishResultsRequest) => void;
};

export function PublishResultsDialog({
  open,
  scopeLabel,
  rankingCount,
  defaultTitle,
  defaultContent,
  isPending,
  onClose,
  onConfirm,
}: PublishResultsDialogProps) {
  const [announcementTitle, setAnnouncementTitle] = useState(defaultTitle);
  const [announcementBody, setAnnouncementBody] = useState(defaultContent);
  const [createAnnouncement, setCreateAnnouncement] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (open) {
      setAnnouncementTitle(defaultTitle);
      setAnnouncementBody(defaultContent);
      setCreateAnnouncement(true);
      setSendInApp(true);
      setSendEmail(true);
      setUnderstood(false);
    }
  }, [defaultContent, defaultTitle, open]);

  const handleConfirm = () => {
    onConfirm({
      title: announcementTitle,
      content: announcementBody,
      announcementTitle,
      announcementBody,
      createAnnouncement,
      sendNotification: sendInApp || sendEmail,
      sendInApp,
      sendEmail,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundImage: "none",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pb: 1.5, pt: 3 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "flex-start" }}
        >
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <PublicOutlinedIcon fontSize="small" />
          </span>
          <span>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.12em", fontWeight: 800 }}>
              Public release
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
              Publish results
            </Typography>
          </span>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <Stack spacing={2.5}>
          <Typography color="text.secondary">
            Make {scopeLabel} visible to participants and the public leaderboard.
          </Typography>
          <Alert severity="info" icon={<PublicOutlinedIcon fontSize="small" />} sx={{ borderRadius: 2 }}>
            <strong>{rankingCount}</strong> ranking rows will be published.
          </Alert>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              Announcement
            </Typography>
            <Stack spacing={2}>
          <TextField
            label="Announcement title"
            value={announcementTitle}
            onChange={(event) => setAnnouncementTitle(event.target.value)}
            disabled={isPending}
            fullWidth
          />
          <TextField
            label="Announcement body"
            value={announcementBody}
            onChange={(event) => setAnnouncementBody(event.target.value)}
            disabled={isPending}
            multiline
            minRows={3}
            fullWidth
          />
            </Stack>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              Distribution
            </Typography>
            <Stack spacing={0.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={createAnnouncement}
                onChange={(event) =>
                  setCreateAnnouncement(event.target.checked)
                }
                disabled={isPending}
              />
            }
            label="Create result announcement"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={sendInApp}
                onChange={(event) => setSendInApp(event.target.checked)}
                disabled={isPending}
              />
            }
            label={
              <span className="inline-flex items-center gap-2">
                <NotificationsNoneOutlinedIcon fontSize="small" />
                Send in-app notification
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmail}
                onChange={(event) => setSendEmail(event.target.checked)}
                disabled={isPending}
              />
            }
            label={
              <span className="inline-flex items-center gap-2">
                <MailOutlineOutlinedIcon fontSize="small" />
                Queue team result email
              </span>
            }
          />
            </Stack>
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={understood}
                onChange={(event) => setUnderstood(event.target.checked)}
                disabled={isPending}
              />
            }
            label="I understand this release is visible to participants."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} disabled={isPending} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!understood || isPending}
          variant="contained"
          startIcon={
            isPending ? <CircularProgress size={18} color="inherit" /> : null
          }
          sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: "none", px: 2.5 }}
        >
          {isPending ? "Publishing..." : "Publish results"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
