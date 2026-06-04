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
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Controller, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";

import {
  createUserSchema,
  type CreateUserFormInput,
  type CreateUserFormValues,
  CREATE_ROLES,
  CREATE_STATUSES,
  textFieldSx,
  selectSx,
  menuPropsDark,
} from "@/features/coordinator/schemas/coordinator.schema";

import { useCoordinatorCreateUserMutation } from "@/features/coordinator/hooks/useCoordinatorManageUserMutations";

export function CoordinatorUserCreateDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCoordinatorCreateUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormInput, unknown, CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "JUDGE",
      status: "ACTIVE",
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        email: values.email.trim().toLowerCase(),
        phone: values.phone || undefined,
      });
      enqueueSnackbar("User created successfully.", { variant: "success" });
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to create user.",
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
        Create New User
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Full Name *"
              {...register("fullName")}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Email *"
              {...register("email")}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              sx={textFieldSx}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Password *"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
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
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone"
              placeholder="Optional"
              {...register("phone")}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              sx={textFieldSx}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div>
                  <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-300">
                    Role *
                  </div>
                  <Select
                    {...field}
                    size="small"
                    fullWidth
                    displayEmpty
                    sx={selectSx}
                    MenuProps={menuPropsDark}
                  >
                    {CREATE_ROLES.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div>
                  <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-300">
                    Status *
                  </div>
                  <Select
                    {...field}
                    size="small"
                    fullWidth
                    sx={selectSx}
                    MenuProps={menuPropsDark}
                  >
                    {CREATE_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {createMutation.isPending ? "Creating…" : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
