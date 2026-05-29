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
} from "@/features/admin/schemas/admin.schema";
import {
  useAdminUserQuery,
  useUpdateUserMutation,
} from "@/features/admin/hooks/useAdminMutations";
import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/admin.types";

const ALL_ROLES: UserRole[] = [
  "ADMIN", "COORDINATOR", "JUDGE", "MENTOR", "PARTICIPANT", "STUDENT", "GUEST",
];
const ALL_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "PENDING", "BANNED"];
const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

export function UserEditDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const updateMutation = useUpdateUserMutation();
  const { data: user, isLoading } = useAdminUserQuery(userId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditUserFormInput, unknown, EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    values: user
      ? { fullName: user.fullName, phone: user.phone ?? "", role: user.role, status: user.status }
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

  return (
    <Dialog open={Boolean(userId)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        Edit User
        {user && <div className="text-sm font-normal text-slate-400">{user.email}</div>}
      </DialogTitle>

      {isLoading || !user ? (
        <DialogContent>
          <div className="flex justify-center py-10">
            <CircularProgress size={28} />
          </div>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth size="small" label="Full Name *"
                {...register("fullName")}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
                sx={textFieldSx}
              />
              <TextField
                fullWidth size="small" label="Phone"
                {...register("phone")}
                sx={textFieldSx}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control} name="role"
                render={({ field }) => (
                  <div>
                    <div className="mb-1 text-xs font-bold text-slate-500">Role</div>
                    <Select {...field} size="small" fullWidth sx={{ borderRadius: "10px" }}>
                      {ALL_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                  </div>
                )}
              />
              <Controller
                control={control} name="status"
                render={({ field }) => (
                  <div>
                    <div className="mb-1 text-xs font-bold text-slate-500">Status</div>
                    <Select {...field} size="small" fullWidth sx={{ borderRadius: "10px" }}>
                      {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </div>
                )}
              />
            </div>
          </DialogContent>

          <DialogActions className="px-6 pb-4">
            <Button onClick={onClose} sx={{ textTransform: "none" }}>Cancel</Button>
            <Button
              type="submit" variant="contained"
              disabled={updateMutation.isPending}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", boxShadow: "none" }}
            >
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}