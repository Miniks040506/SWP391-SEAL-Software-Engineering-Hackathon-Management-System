import { useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";

import type { TrackResponse } from "@/types/track.types";
import {
  assignPrizesFromRankingSchema,
  type AssignPrizesFromRankingFormInput,
  type AssignPrizesFromRankingFormValues,
} from "../../schemas/prize.schema";

type AssignPrizesFromRankingDialogProps = {
  open: boolean;
  tracks: TrackResponse[];
  rounds: { id: string; name: string }[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AssignPrizesFromRankingFormValues) => void;
};

const DIALOG_PAPER_SX = {
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    overflow: "hidden",
    backgroundImage: "none",
  },
} as const;

export const AssignPrizesFromRankingDialog = ({
  open,
  tracks,
  rounds,
  isSubmitting,
  onClose,
  onSubmit,
}: AssignPrizesFromRankingDialogProps) => {
  const methods = useForm<
    AssignPrizesFromRankingFormInput,
    unknown,
    AssignPrizesFromRankingFormValues
  >({
    resolver: zodResolver(assignPrizesFromRankingSchema),
    defaultValues: {
      roundId: "",
      trackId: "",
      overwriteExistingAwards: false,
      sendNotification: true,
      sendInApp: true,
      sendEmail: true,
    },
    mode: "onSubmit",
  });

  const { handleSubmit, control, reset, watch } = methods;
  const sendNotification = watch("sendNotification");

  useEffect(() => {
    if (open) {
      reset({
        roundId: "",
        trackId: "",
        overwriteExistingAwards: false,
        sendNotification: true,
        sendInApp: true,
        sendEmail: true,
      });
    }
  }, [open, reset]);

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
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md">
            <AutoFixHighOutlinedIcon />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">Auto-Assign Prizes</h2>
            <p className="text-xs font-medium text-slate-400">Populate winners from current ranking</p>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Automatically assign configured prizes to teams based on their current ranking. Narrow
              the scope by round or track if needed.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="roundId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Round (optional)"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">
                      <em>All Rounds</em>
                    </MenuItem>
                    {rounds.map((round) => (
                      <MenuItem key={round.id} value={round.id}>
                        {round.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="trackId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Track (optional)"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">
                      <em>All Tracks</em>
                    </MenuItem>
                    {tracks.map((track) => (
                      <MenuItem key={track.id} value={track.id}>
                        {track.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>

            <Controller
              name="overwriteExistingAwards"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 transition-colors hover:bg-amber-100/60 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/15">
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    size="small"
                    sx={{ p: 0, mt: "1px" }}
                  />
                  <span className="text-sm">
                    <span className="block font-bold text-amber-800 dark:text-amber-200">
                      Overwrite existing awards
                    </span>
                    <span className="text-xs font-medium text-amber-700/80 dark:text-amber-300/70">
                      Replaces winners already assigned to these prizes.
                    </span>
                  </span>
                </label>
              )}
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
                    label="Send notification to winners"
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
                background: "linear-gradient(to right, #fbbf24, #f97316)",
                color: "#0f172a",
                "&:hover": { background: "linear-gradient(to right, #f59e0b, #ea580c)" },
              }}
            >
              {isSubmitting ? "Assigning..." : "Assign Prizes"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};
