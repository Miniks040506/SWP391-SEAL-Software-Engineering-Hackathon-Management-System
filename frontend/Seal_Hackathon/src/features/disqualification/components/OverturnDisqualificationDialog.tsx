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
  overturnSchema,
  type OverturnFormValues,
} from "../schemas/disqualification.schema";

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
};

export interface OverturnDisqualificationDialogProps {
  open: boolean;
  onClose: () => void;
  disqualificationId: UUID;
  isPending: boolean;
  onConfirm: (values: OverturnFormValues) => Promise<import("@/types/disqualification.types").DisqualificationResponse | undefined>;
}

export function OverturnDisqualificationDialog({
  open,
  onClose,
  isPending,
  onConfirm,
}: OverturnDisqualificationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OverturnFormValues>({
    resolver: zodResolver(overturnSchema),
    defaultValues: {
      overturnReason: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: OverturnFormValues) => {
    try {
      const res = await onConfirm(values);
      enqueueSnackbar(
        `Disqualification overturned. Ranking recalculated: ${res?.rankingRecalculated ? "Yes" : "No"}.`,
        {
          variant: "success",
        }
      );
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to overturn disqualification.",
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
        Overturn Disqualification
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <Alert severity="warning">
            Overturning this decision will restore the submission status and
            recalculate ranking if the round already has rankings.
          </Alert>

          <TextField
            fullWidth
            size="small"
            label="Overturn reason *"
            multiline
            rows={3}
            {...register("overturnReason")}
            error={Boolean(errors.overturnReason)}
            helperText={errors.overturnReason?.message as string}
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
            color="warning"
            disabled={isPending}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {isPending ? "Overturning..." : "Overturn"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
