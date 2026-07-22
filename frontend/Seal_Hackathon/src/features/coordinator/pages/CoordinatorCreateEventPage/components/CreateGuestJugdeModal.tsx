import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";

import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import { useCreateGuestJudgeMutation } from "@/features/coordinator/hooks/useCoordinatorManageUserMutations";

import {
  createGuestJudgeFormSchema,
  initialCreateGuestJudgeFormValues,
  type CreateGuestJudgeFormValues
} from "@/features/coordinator/schemas/createEvent.schema";
import type { GuestJudgeResponse } from "@/types/user.types";

type CreateGuestJudgeModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (judge: GuestJudgeResponse, fullName: string) => void | Promise<void>;
};

const DIALOG_PAPER_SX = {
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    overflow: "hidden",
    backgroundImage: "none",
  },
} as const;

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "14px" },
};

const dateTimeFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "14px" },
  "& .MuiInputLabel-root": { backgroundColor: "white", paddingInline: "4px" },
  ".dark & .MuiInputLabel-root": { backgroundColor: "#0f172a" },
};

export const CreateGuestJudgeModal = ({
  open,
  onClose,
  onSuccess,
}: CreateGuestJudgeModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateGuestJudgeMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateGuestJudgeFormValues>({
    resolver: zodResolver(createGuestJudgeFormSchema),
    defaultValues: initialCreateGuestJudgeFormValues,
  });

  useEffect(() => {
    if (open) reset(initialCreateGuestJudgeFormValues);
  }, [open, reset]);

  const onSubmit = handleSubmit((data) => {
    createMutation.mutate(
      {
        fullName: data.fullName,
        email: data.email,
        affiliation: data.affiliation || undefined,
        expertise: data.expertise || undefined,
        temporaryAccountExpiresAt: data.temporaryAccountExpiresAt
          ? (data.temporaryAccountExpiresAt.length === 16 ? `${data.temporaryAccountExpiresAt}:00` : data.temporaryAccountExpiresAt)
          : undefined,
      },
      {
        onSuccess: async (response) => {
          enqueueSnackbar("Guest Judge created successfully!", { variant: "success" });
          void onSuccess(response, response.fullName || data.fullName);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Failed to create guest judge. Email might be in use.";
          enqueueSnackbar(msg, { variant: "error" });
        },
      }
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={DIALOG_PAPER_SX}
      classes={{ paper: "bg-white dark:bg-slate-900" }}
    >
      {/* Gradient header — shared chrome across edit-event popups */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-500/25 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-400 text-white shadow-md">
            <PersonAddOutlinedIcon />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">Create Guest Judge</h2>
            <p className="text-xs font-medium text-slate-400">
              A temporary account with emailed login instructions
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5">
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Full Name *"
              fullWidth
              size="small"
              sx={textFieldSx}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address *"
              type="email"
              fullWidth
              size="small"
              sx={textFieldSx}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="affiliation"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Affiliation / Company"
                fullWidth
                size="small"
                sx={textFieldSx}
              />
            )}
          />

          <Controller
            name="expertise"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Expertise"
                fullWidth
                size="small"
                sx={textFieldSx}
              />
            )}
          />
        </div>

        <Controller
          name="temporaryAccountExpiresAt"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Account Expires At (Optional)"
              type="datetime-local"
              fullWidth
              size="small"
              sx={dateTimeFieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(errors.temporaryAccountExpiresAt)}
              helperText={errors.temporaryAccountExpiresAt?.message || "Leave blank for standard duration."}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={createMutation.isPending}
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: 800,
            boxShadow: "none",
            bgcolor: "#0891b2",
            "&:hover": { bgcolor: "#0e7490" },
          }}
        >
          {createMutation.isPending ? "Creating..." : "Create Guest Judge"}
        </Button>
      </div>
    </Dialog>
  );
};
