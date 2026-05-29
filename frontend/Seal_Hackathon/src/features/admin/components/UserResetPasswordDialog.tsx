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
} from "@/features/admin/schemas/admin.schema";
import { useResetUserPasswordMutation } from "@/features/admin/hooks/useAdminMutations";

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

export function UserResetPasswordDialog({
  user,
  onClose,
}: {
  user: { id: string; email: string } | null;
  onClose: () => void;
}) {
  const resetMutation = useResetUserPasswordMutation();
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

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetMutation.mutateAsync({ userId: user.id, newPassword: values.newPassword });
      enqueueSnackbar("Password reset successfully.", { variant: "success" });
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to reset password.",
        { variant: "error" },
      );
    }
  };

  const toggleIcon = showPassword
    ? <VisibilityOffIcon fontSize="small" />
    : <VisibilityIcon fontSize="small" />;

  return (
    <Dialog open={Boolean(user)} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        Reset Password
        <div className="text-sm font-normal text-slate-400">{user.email}</div>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <TextField
            fullWidth size="small" label="New Password"
            type={showPassword ? "text" : "password"}
            {...register("newPassword")}
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            sx={textFieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" type="button" onClick={() => setShowPassword((s) => !s)}>
                      {toggleIcon}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth size="small" label="Confirm Password"
            type={showPassword ? "text" : "password"}
            {...register("confirmPassword")}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            sx={textFieldSx}
          />
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            type="submit" variant="contained" color="warning"
            disabled={resetMutation.isPending}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", boxShadow: "none" }}
          >
            {resetMutation.isPending ? "Resetting…" : "Reset Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}