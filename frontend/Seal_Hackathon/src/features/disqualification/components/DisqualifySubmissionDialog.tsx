import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import type { UUID } from "@/types/common.types";
import {
  disqualifySchema,
  type DisqualifyFormValues,
} from "../schemas/disqualification.schema";

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
};

export interface DisqualifySubmissionDialogProps {
  open: boolean;
  onClose: () => void;
  submissionId: UUID;
  isPending: boolean;
  onConfirm: (values: DisqualifyFormValues) => Promise<import("@/types/disqualification.types").DisqualificationResponse | undefined>;
}

export function DisqualifySubmissionDialog({
  open,
  onClose,
  isPending,
  onConfirm,
}: DisqualifySubmissionDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisqualifyFormValues>({
    resolver: zodResolver(disqualifySchema),
    defaultValues: {
      reason: "",
      evidenceUrl: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: DisqualifyFormValues) => {
    try {
      const res = await onConfirm(values);
      enqueueSnackbar(
        `Submission disqualified. Ranking recalculated: ${res?.rankingRecalculated ? "Yes" : "No"}.`,
        {
          variant: "success",
        },
      );
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to disqualify submission.",
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      classes={{ paper: "bg-white dark:bg-slate-800 dark:text-slate-200" }}
      sx={{
        "& .MuiDialog-paper": {
          backgroundImage: "none",
          borderRadius: 16,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
        },
      }}
    >
      <DialogTitle className="px-6 pb-2 pt-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <GavelOutlinedIcon fontSize="small" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Destructive action
            </p>
            <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Disqualify submission
            </p>
          </div>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4 px-6 py-3">
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This action will mark the submission as DISQUALIFIED, eliminate the
            team, clear awarded prizes for this team if any, and recalculate
            ranking if ranking already exists.
          </Alert>

          <TextField
            fullWidth
            size="small"
            label="Reason *"
            multiline
            rows={3}
            {...register("reason")}
            error={Boolean(errors.reason)}
            helperText={errors.reason?.message as string}
            sx={textFieldSx}
          />

          <TextField
            fullWidth
            size="small"
            label="Evidence URL"
            placeholder="https://..."
            {...register("evidenceUrl")}
            error={Boolean(errors.evidenceUrl)}
            helperText={errors.evidenceUrl?.message as string}
            sx={textFieldSx}
          />
        </DialogContent>

        <DialogActions className="border-t border-slate-200 px-6 py-5 dark:border-slate-700">
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={isPending}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            {isPending ? "Disqualifying..." : "Disqualify submission"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
