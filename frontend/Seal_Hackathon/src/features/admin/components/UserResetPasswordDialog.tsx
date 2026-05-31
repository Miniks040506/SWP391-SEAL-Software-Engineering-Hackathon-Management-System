import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
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

  const onSubmit = async (_values: ResetPasswordFormValues) => {
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
        paper: "bg-white dark:bg-slate-800 dark:text-slate-200",
      }}
      sx={{
        "& .MuiDialog-paper": { backgroundImage: "none" },
      }}
    >
      <DialogTitle className="font-bold text-slate-800 dark:text-slate-100">
        Reset Password
        <div className="text-sm font-normal text-slate-400">{user.email}</div>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
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
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={resetMutation.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {resetMutation.isPending ? "Resetting…" : "Reset Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
