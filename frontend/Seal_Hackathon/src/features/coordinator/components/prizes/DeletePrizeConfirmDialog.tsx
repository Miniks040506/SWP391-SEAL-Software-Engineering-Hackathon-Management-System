import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { PrizeResponse } from "@/types/prize.types";

type DeletePrizeConfirmDialogProps = {
  open: boolean;
  prize: PrizeResponse | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (prizeId: string) => void;
};

export const DeletePrizeConfirmDialog = ({
  open,
  prize,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePrizeConfirmDialogProps) => {
  if (!prize) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Delete Prize</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">
          Are you sure you want to delete the prize <strong>{prize.title}</strong> (Rank {prize.rankPosition})?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isDeleting} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(prize.id)}
          disabled={isDeleting}
          variant="contained"
          color="error"
          sx={{ fontWeight: "bold" }}
        >
          {isDeleting ? "Deleting..." : "Delete Prize"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
