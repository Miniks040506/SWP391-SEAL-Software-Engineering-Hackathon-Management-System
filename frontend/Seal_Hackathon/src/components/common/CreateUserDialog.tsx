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
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Controller, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { ZodType } from "zod";

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
};

const selectSx = {
  borderRadius: "10px",
  ".dark &": { color: "#cbd5e1" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiSvgIcon-root": { color: "#94a3b8" },
};

const menuPropsDark = {
  sx: {
    ".dark & .MuiPaper-root": {
      bgcolor: "#1e293b",
      color: "#f1f5f9",
      border: "1px solid #334155",
    },
  },
};

export type BaseCreateUserPayload = {
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string;
  password?: string;
};

export type CreateGuestJudgePayload = {
  email: string;
  fullName: string;
  affiliation?: string;
  expertise?: string;
  temporaryAccountExpiresAt?: string;
};

export interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  availableRoles: readonly string[];
  defaultRole: string;
  validationSchema: ZodType<any, any, any>;
  isPending: boolean;
  isPendingGuestJudge: boolean;
  onSubmitUser: (payload: BaseCreateUserPayload) => Promise<void>;
  onSubmitGuestJudge: (payload: CreateGuestJudgePayload) => Promise<void>;
}

export function CreateUserDialog({
  open,
  onClose,
  availableRoles,
  defaultRole,
  validationSchema,
  isPending,
  isPendingGuestJudge,
  onSubmitUser,
  onSubmitGuestJudge,
}: CreateUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      role: defaultRole,
      judgeType: "INTERNAL",
      fullName: "",
      email: "",
      password: "",
      phone: "",
      affiliation: "",
      expertise: "",
      temporaryAccountExpiresAt: "",
    },
  });

  const role = watch("role");
  const judgeType = watch("judgeType");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: any) => {
    try {
      if (values.role === "JUDGE" && values.judgeType === "GUEST") {
        await onSubmitGuestJudge({
          email: values.email.trim().toLowerCase(),
          fullName: values.fullName.trim(),
          affiliation: values.affiliation?.trim() || undefined,
          expertise: values.expertise?.trim() || undefined,
          temporaryAccountExpiresAt:
            values.temporaryAccountExpiresAt || undefined,
        });
      } else {
        await onSubmitUser({
          ...values,
          email: values.email.trim().toLowerCase(),
          phone: values.phone || undefined,
          status: "ACTIVE",
        });
      }
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
              helperText={errors.fullName?.message as string}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Email *"
              {...register("email")}
              error={Boolean(errors.email)}
              helperText={errors.email?.message as string}
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
              helperText={errors.password?.message as string}
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
              helperText={errors.phone?.message as string}
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
                    {availableRoles.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.role.message as string}
                    </p>
                  )}
                </div>
              )}
            />
            {role === "JUDGE" && (
              <Controller
                control={control}
                name="judgeType"
                render={({ field }) => (
                  <div>
                    <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-300">
                      Judge Type *
                    </div>
                    <RadioGroup row {...field}>
                      <FormControlLabel
                        value="INTERNAL"
                        control={<Radio size="small" />}
                        label={<span className="text-sm">Internal</span>}
                      />
                      <FormControlLabel
                        value="GUEST"
                        control={<Radio size="small" />}
                        label={<span className="text-sm">Guest</span>}
                      />
                    </RadioGroup>
                  </div>
                )}
              />
            )}
          </div>

          {role === "JUDGE" && judgeType === "GUEST" && (
            <div className="grid grid-cols-1 gap-4 mt-4 border-t pt-4 dark:border-slate-700">
              <TextField
                label="Affiliation"
                placeholder="Optional"
                {...register("affiliation")}
                size="small"
                fullWidth
                sx={textFieldSx}
              />
              <TextField
                label="Expertise"
                placeholder="Optional"
                {...register("expertise")}
                size="small"
                fullWidth
                sx={textFieldSx}
              />
              <TextField
                label="Expires At"
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("temporaryAccountExpiresAt")}
                size="small"
                fullWidth
                sx={textFieldSx}
              />
              <p className="text-xs text-slate-500 -mt-2">
                Defaults to 3 days from now if left empty.
              </p>
            </div>
          )}
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || isPendingGuestJudge}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {isPending || isPendingGuestJudge ? "Creating…" : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
