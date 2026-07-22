import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import type { PrizeResponse } from "@/types/prize.types";

type DeletePrizeConfirmDialogProps = {
  open: boolean;
  prize: PrizeResponse | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (prizeId: string) => void;
};

const DIALOG_PAPER_SX = {
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    overflow: "hidden",
    backgroundImage: "none",
  },
} as const;

export const DeletePrizeConfirmDialog = ({
  open,
  prize,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePrizeConfirmDialogProps) => {
  if (!prize) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={DIALOG_PAPER_SX}
      classes={{ paper: "bg-white dark:bg-slate-900" }}
    >
      {/* Danger gradient header */}
      <div className="relative overflow-hidden bg-linear-to-br from-rose-950 via-slate-900 to-slate-950 px-6 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/25 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-red-600 text-white shadow-md">
            <WarningAmberRoundedIcon />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">Delete Prize</h2>
            <p className="text-xs font-medium text-slate-400">
              This permanently removes the prize
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Are you sure you want to delete the prize{" "}
          <strong className="text-slate-900 dark:text-white">
            {prize.title}
          </strong>{" "}
          (Rank {prize.rankPosition})?
        </p>

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          This action cannot be undone.
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <Button
          onClick={onClose}
          disabled={isDeleting}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(prize.id)}
          disabled={isDeleting}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: 800,
            boxShadow: "none",
          }}
        >
          {isDeleting ? "Deleting..." : "Delete Prize"}
        </Button>
      </div>
    </Dialog>
  );
};
