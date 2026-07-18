import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";

import {
  editUserSchema,
  type EditUserFormInput,
  type EditUserFormValues,
  ALL_ROLES,
  textFieldSx,
  selectSx,
  menuPropsDark,
} from "@/features/admin/schemas/admin.schema";
import {
  useAdminUserQuery,
  useUpdateUserMutation,
} from "@/features/admin/hooks/useAdminMutations";
import type { UserRole } from "@/types/auth.types";

export function UserEditDialog({
  userId,
  onClose,
  availableRoles,
}: {
  userId: string | null;
  onClose: () => void;
  availableRoles?: readonly string[];
}) {
  const updateMutation = useUpdateUserMutation();
  const { data: user, isLoading } = useAdminUserQuery(userId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EditUserFormInput, unknown, EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      role: "STUDENT" as UserRole,
    },
    values: user
      ? {
          fullName: user.fullName,
          phone: user.phone ?? "",
          role: user.role as UserRole,
        }
      : undefined,
  });

  const onSubmit = async (values: EditUserFormValues) => {
    if (!userId) return;
    try {
      await updateMutation.mutateAsync({
        userId,
        payload: { ...values, phone: values.phone || undefined },
      });
      enqueueSnackbar("User updated successfully.", { variant: "success" });
      onClose();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update user.",
        { variant: "error" },
      );
    }
  };

  const currentRole = watch("role");
  const isRestrictedRole = Boolean(
    availableRoles !== undefined &&
    currentRole &&
    !availableRoles.includes(currentRole)
  );

  return (
    <Dialog 
      open={Boolean(userId)} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      classes={{ paper: "bg-white dark:bg-slate-800 dark:text-slate-200" }}
      sx={{ "& .MuiDialog-paper": { backgroundImage: "none" } }}
    >
      <DialogTitle className="font-bold text-slate-800 dark:text-slate-100">
        Edit User
        {user && (
          <div className="text-sm font-normal text-slate-500 dark:text-slate-400">{user.email}</div>
        )}
      </DialogTitle>

      {isLoading || !user ? (
        <DialogContent>
          <div className="flex justify-center py-10">
            <CircularProgress size={28} />
          </div>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                size="small"
                label="Full Name *"
                {...register("fullName")}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
                disabled={isRestrictedRole}
                sx={textFieldSx}
              />
              <TextField
                fullWidth
                size="small"
                label="Phone"
                {...register("phone")}
                disabled={isRestrictedRole}
                sx={textFieldSx}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="role"
                render={({ field }) => {
                  const displayRoles = isRestrictedRole ? [field.value] : (availableRoles || ALL_ROLES);

                  return (
                    <div>
                      <div className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-300">
                        Role
                      </div>
                      <Select
                        {...field}
                        value={field.value || ""}
                        size="small"
                        fullWidth
                        sx={selectSx}
                        MenuProps={menuPropsDark}
                        disabled={isRestrictedRole}
                      >
                        {displayRoles.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                      {isRestrictedRole && (
                        <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                          Role editing restricted
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </DialogContent>

          <DialogActions className="px-6 pb-4">
            <Button onClick={onClose} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending || isRestrictedRole}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                boxShadow: "none",
              }}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}