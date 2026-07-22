import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
  textFieldSx,
} from "@/features/admin/schemas/admin.schema";

export function UserResetPasswordDialog({
  user,
  onClose,
}: {
  user: { id: string; email: string } | null;
  onClose: () => void;
}) {
  // TODO: Restore once backend confirms admin reset-password endpoint.
  // Verified endpoints: PATCH /users/me/password, POST /auth/forgot-password, POST /auth/reset-password
  // None support admin resetting another user's password by userId.
  const resetMutation = { isPending: false };
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  const onSubmit = async () => {
    // TODO: Implement once backend confirms admin reset-password endpoint.
    // Do not call any unverified endpoint here.
    enqueueSnackbar("Reset password is not yet available.", {
      variant: "warning",
    });
  };

  const toggleIcon = showPassword ? (
    <VisibilityOffIcon fontSize="small" />
  ) : (
    <VisibilityIcon fontSize="small" />
  );

  return (
    <Dialog
      open={Boolean(user)}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      classes={{
        paper:
          "!rounded-3xl overflow-hidden bg-white dark:bg-slate-900 dark:text-slate-200",
      }}
      sx={{ "& .MuiDialog-paper": { backgroundImage: "none" } }}
    >
      {/* Immersive hero banner */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-6 pb-14 pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">
            Reset Password
          </p>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <CloseOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 ring-2 ring-white/20 ring-offset-2 ring-offset-slate-900">
            <LockResetOutlinedIcon sx={{ fontSize: 30 }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black tracking-tight text-white">
              Set a new password
            </h2>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative -mt-8 px-6">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <TextField
              fullWidth
              size="small"
              label="New Password"
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword?.message}
              sx={textFieldSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {toggleIcon}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              sx={textFieldSx}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 cursor-pointer items-center rounded-xl px-4 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <LockResetOutlinedIcon sx={{ fontSize: 18 }} />
            {resetMutation.isPending ? "Resetting…" : "Reset Password"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
