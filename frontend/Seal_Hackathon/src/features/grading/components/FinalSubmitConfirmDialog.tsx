import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
};

export const FinalSubmitConfirmDialog = ({ open, onClose, onConfirm, isSubmitting }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle className="font-extrabold text-gray-900 dark:text-white">
        Final submit scores?
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" className="text-gray-700 dark:text-slate-300">
          You cannot edit scores after final submission or after coordinator locks grading. Please review all criteria before confirming.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ color: "gray", fontWeight: 700, textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 800, borderRadius: "8px", textTransform: "none" }}
        >
          {isSubmitting ? "Submitting..." : "Submit final scores"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
