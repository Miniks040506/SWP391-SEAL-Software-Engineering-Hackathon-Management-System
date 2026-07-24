import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import GroupRemoveOutlinedIcon from "@mui/icons-material/GroupRemoveOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import { useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import type { UUID } from "@/types/common.types";
import {
  disqualifySchema,
  type DisqualifyFormValues,
} from "../schemas/disqualification.schema";
import "../styles/disqualifications.css";

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
};

const consequences = [
  { icon: <BlockOutlinedIcon sx={{ fontSize: 16 }} />, text: "Marks the submission as DISQUALIFIED" },
  { icon: <GroupRemoveOutlinedIcon sx={{ fontSize: 16 }} />, text: "Eliminates the team from the competition" },
  { icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 16 }} />, text: "Clears any prizes already awarded to the team" },
  { icon: <LeaderboardOutlinedIcon sx={{ fontSize: 16 }} />, text: "Recalculates ranking if it already exists" },
];

export interface DisqualifySubmissionDialogProps {
  open: boolean;
  onClose: () => void;
  submissionId: UUID;
  isPending: boolean;
  onConfirm: (
    values: DisqualifyFormValues,
  ) => Promise<
    import("@/types/disqualification.types").DisqualificationResponse | undefined
  >;
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
        { variant: "success" },
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
      classes={{
        paper: "bg-white dark:bg-slate-900 dark:text-slate-200 dqx-pop",
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(15, 23, 42, 0.55)",
          },
        },
      }}
      sx={{
        "& .MuiDialog-paper": {
          backgroundImage: "none",
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-red-700 px-6 py-5 text-white">
        <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GavelOutlinedIcon />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-100">
              Destructive action
            </p>
            <p className="text-xl font-extrabold tracking-tight">
              Disqualify submission
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4 px-6 py-5">
          {/* Consequences callout */}
          <div
            className="dqx-section rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10"
            style={{ animationDelay: "40ms" }}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
              <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
              This cannot be undone lightly — it will:
            </div>
            <ul className="space-y-1.5">
              {consequences.map((c) => (
                <li
                  key={c.text}
                  className="flex items-center gap-2 text-sm text-rose-800/90 dark:text-rose-200/90"
                >
                  <span className="text-rose-500 dark:text-rose-400">
                    {c.icon}
                  </span>
                  {c.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="dqx-section" style={{ animationDelay: "110ms" }}>
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
          </div>

          <div className="dqx-section" style={{ animationDelay: "170ms" }}>
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
          </div>
        </DialogContent>

        <DialogActions className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={isPending}
            startIcon={<GavelOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "10px",
              boxShadow: "none",
              px: 2.5,
            }}
          >
            {isPending ? "Disqualifying..." : "Disqualify submission"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
