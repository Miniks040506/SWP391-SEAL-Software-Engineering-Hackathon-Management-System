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
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>Publish results?</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography>
            This will make {scopeLabel} results visible to participants and public result pages.
          </Typography>
          <Alert severity="info">
            Ranking rows to publish: <strong>{rankingCount}</strong>
          </Alert>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={createAnnouncement}
                onChange={(event) => setCreateAnnouncement(event.target.checked)}
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
            label="Send in-app notification"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmail}
                onChange={(event) => setSendEmail(event.target.checked)}
                disabled={isPending}
              />
            }
            label="Queue team result email"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={understood}
                onChange={(event) => setUnderstood(event.target.checked)}
                disabled={isPending}
              />
            }
            label="I understand published results will be visible to participants."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isPending} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!understood || isPending}
          variant="contained"
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Publish Results
        </Button>
      </DialogActions>
    </Dialog>
  );
}
