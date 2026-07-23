import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

type Props = {
  open: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  severity?: "info" | "warning" | "error";
  alertText?: React.ReactNode;
  
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  dialogClasses?: any;
  dialogSx?: any;
  titleClassName?: string;
  titleSx?: any;
  noDividers?: boolean;
  contentClassName?: string;
  actionsClassName?: string;
  cancelButtonSx?: any;
  confirmButtonSx?: any;
  confirmButtonColor?: "primary" | "error" | "warning" | "success" | "info" | "inherit";
  TransitionProps?: any;
  paperSx?: any;
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
  alertText = "This action affects persisted grading state.",
  maxWidth = "sm",
  dialogClasses,
  dialogSx,
  titleClassName,
  titleSx = { fontWeight: 800 },
  noDividers = false,
  contentClassName,
  actionsClassName,
  cancelButtonSx,
  confirmButtonSx,
  confirmButtonColor,
  TransitionProps,
  paperSx,
}: Props) => (
  <Dialog
    open={open}
    onClose={isPending ? undefined : onClose}
    maxWidth={maxWidth}
    fullWidth
    classes={dialogClasses}
    sx={dialogSx}
    slotProps={{
      transition: TransitionProps,
      paper: {
        sx: {
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
          ...paperSx,
        },
      },
    }}
  >
    <DialogTitle
      sx={{ px: 3, pb: 1.5, pt: 3, ...titleSx }}
      className={titleClassName}
    >
      {title}
    </DialogTitle>
    <DialogContent
      dividers={!noDividers}
      className={contentClassName}
      sx={{ px: 3, py: 1.5 }}
    >
      {alertText && (
        <Alert severity={severity} sx={{ mb: 2, borderRadius: 2 }}>
          {alertText}
        </Alert>
      )}
      {typeof description === "string" ? (
        <Typography color="text.secondary">{description}</Typography>
      ) : (
        description
      )}
    </DialogContent>
    <DialogActions
      sx={{ px: 3, py: 2.5, gap: 1, borderTop: "1px solid", borderColor: "divider" }}
      className={actionsClassName}
    >
      <Button onClick={onClose} disabled={isPending} color="inherit" sx={cancelButtonSx}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isPending}
        variant="contained"
        color={confirmButtonColor || (severity === "error" ? "error" : "warning")}
        sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: "none", ...confirmButtonSx }}
      >
        {isPending ? "Working..." : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
