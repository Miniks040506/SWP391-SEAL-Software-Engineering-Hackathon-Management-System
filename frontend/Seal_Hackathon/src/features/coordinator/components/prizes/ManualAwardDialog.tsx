import { useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";

import type { PrizeResponse } from "@/types/prize.types";
import type { CoordinatorTeamSummaryResponse } from "@/types/team.types";
import {
  manualAwardSchema,
  type ManualAwardFormInput,
  type ManualAwardFormValues,
} from "../../schemas/prize.schema";

type ManualAwardDialogProps = {
  open: boolean;
  prize: PrizeResponse | null;
  teams: CoordinatorTeamSummaryResponse[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ManualAwardFormValues) => void;
};

const DIALOG_PAPER_SX = {
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    overflow: "hidden",
    backgroundImage: "none",
  },
} as const;

export const ManualAwardDialog = ({
  open,
  prize,
  teams,
  isSubmitting,
  onClose,
  onSubmit,
}: ManualAwardDialogProps) => {
  const methods = useForm<ManualAwardFormInput, unknown, ManualAwardFormValues>({
    resolver: zodResolver(manualAwardSchema),
    defaultValues: {
      teamId: "",
      reason: "",
      sendNotification: true,
      sendInApp: true,
      sendEmail: true,
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = methods;
  const sendNotification = watch("sendNotification");
  const isReassign = Boolean(prize?.awardedTeamId);

  useEffect(() => {
    if (open) {
      reset({
        teamId: prize?.awardedTeamId || "",
        reason: "",
        sendNotification: true,
        sendInApp: true,
        sendEmail: true,
      });
    }
  }, [open, prize, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={DIALOG_PAPER_SX}
      classes={{ paper: "bg-white dark:bg-slate-900" }}
    >
      {/* Gradient header */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-blue-500/25 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-md">
            <EmojiEventsOutlinedIcon />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">
              {isReassign ? "Reassign Winner" : "Manual Award"}
            </h2>
            <p className="text-xs font-medium text-slate-400">Pick the winning team for this prize</p>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
            {/* Prize info card */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500/80 dark:text-blue-300/70">
                Awarding prize
              </p>
              <p className="mt-1 text-base font-black text-blue-700 dark:text-blue-200">
                {prize?.title}{" "}
                <span className="text-sm font-bold text-blue-500 dark:text-blue-300/80">
                  {prize?.trackName ? `· ${prize.trackName}` : "· Overall"}
                </span>
              </p>
            </div>

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Use manual award to set or adjust the winner after reviewing final results. A reason is
              recorded in the audit log.
            </p>

            <Controller
              name="teamId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Select team"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={Boolean(errors.teamId)}
                  helperText={errors.teamId?.message}
                  fullWidth
                  required
                  size="small"
                >
                  <MenuItem value="" disabled>
                    <em>Select a team</em>
                  </MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.teamId} value={team.teamId}>
                      {team.teamName} {team.trackName ? `(${team.trackName})` : ""}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField
              label="Reason (recommended)"
              placeholder="Reason for this manual award..."
              error={Boolean(errors.reason)}
              helperText={errors.reason?.message || "Recommended for audit traceability."}
              fullWidth
              multiline
              minRows={3}
              size="small"
              {...methods.register("reason")}
            />

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-200">
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} className="text-blue-500" />
                Notifications
              </p>

              <Controller
                name="sendNotification"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={field.onChange} />}
                    label="Send notification to the team"
                  />
                )}
              />

              {sendNotification && (
                <div className="ml-6 flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <Controller
                    name="sendInApp"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox size="small" checked={field.value} onChange={field.onChange} />}
                        label={<span className="text-sm">In-app</span>}
                      />
                    )}
                  />
                  <Controller
                    name="sendEmail"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox size="small" checked={field.value} onChange={field.onChange} />}
                        label={<span className="text-sm">Email</span>}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <Button onClick={onClose} disabled={isSubmitting} variant="outlined" sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                fontWeight: 800,
                boxShadow: "none",
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {isSubmitting ? "Awarding..." : "Confirm Award"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};
