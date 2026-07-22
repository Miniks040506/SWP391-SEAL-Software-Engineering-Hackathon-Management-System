import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircularProgress,
  Dialog,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
import { RoleBadge } from "./UserBadges";
import type { UserRole } from "@/types/auth.types";

/** Two initials from the user's name, for the avatar fallback. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update user.";
      enqueueSnackbar(message, { variant: "error" });
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
          className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl"
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
            Edit User
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <CloseOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {user && (
          <div className="relative mt-5 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-500/20 text-xl font-black text-white ring-2 ring-white/20 ring-offset-2 ring-offset-slate-900">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="tracking-wide">{initialsOf(user.fullName)}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black tracking-tight text-white">
                {user.fullName}
              </h2>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-400">
                {user.email}
              </p>
              <div className="mt-2">
                <RoleBadge role={user.role as UserRole} />
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading || !user ? (
        <div className="relative -mt-8 px-6 pb-6">
          <div className="flex justify-center rounded-3xl border border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900">
            <CircularProgress size={28} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative -mt-8 px-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => {
                    const displayRoles = isRestrictedRole
                      ? [field.value]
                      : availableRoles || ALL_ROLES;

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
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 cursor-pointer items-center rounded-xl px-4 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || isRestrictedRole}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
