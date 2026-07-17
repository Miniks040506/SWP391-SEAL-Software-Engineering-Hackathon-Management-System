import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  severity?: "info" | "warning" | "error";
};

export const ActionConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
  isPending = false,
  severity = "warning",
}: Props) => (
  <Dialog
    open={open}
    onClose={isPending ? undefined : onClose}
    maxWidth="sm"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: 3 } } }}
  >
    <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
    <DialogContent dividers>
      <Alert severity={severity} sx={{ mb: 2 }}>
        This action affects persisted grading state.
      </Alert>
      <Typography color="text.secondary">{description}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
      <Button onClick={onClose} disabled={isPending} color="inherit">
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isPending}
        variant="contained"
        color={severity === "error" ? "error" : "warning"}
      >
        {isPending ? "Working..." : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
