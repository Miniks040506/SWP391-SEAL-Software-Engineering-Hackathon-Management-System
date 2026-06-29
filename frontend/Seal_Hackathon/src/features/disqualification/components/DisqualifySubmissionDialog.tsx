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
  onConfirm: (values: DisqualifyFormValues) => Promise<void>;
}

export function DisqualifySubmissionDialog({
  open,
  onClose,
  submissionId: _submissionId,
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
      await onConfirm(values);
      enqueueSnackbar("Submission disqualified successfully.", {
        variant: "success",
      });
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to disqualify submission.",
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
      sx={{ "& .MuiDialog-paper": { backgroundImage: "none" } }}
    >
      <DialogTitle className="font-bold text-slate-800 dark:text-slate-100">
        Disqualify Submission
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <Alert severity="warning">
            This action will mark the submission as DISQUALIFIED, eliminate the team, clear awarded prizes for this team if any, and recalculate ranking if ranking already exists.
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

        <DialogActions className="px-6 pb-4">
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
              fontWeight: 700,
              borderRadius: "8px",
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
