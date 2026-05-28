import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { Controller, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";

import {
  createUserSchema,
  editUserSchema,
  resetPasswordSchema,
  type CreateUserFormInput,
  type CreateUserFormValues,
  type EditUserFormInput,
  type EditUserFormValues,
  type ResetPasswordFormValues,
} from "@/features/admin/schemas/admin.schema";
import {
  useAdminUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
  useResetUserPasswordMutation,
} from "@/features/admin/hooks/useAdminMutations";
import type { AdminUser, UserStatus } from "@/types/admin.types";
import type { UserRole } from "@/types/auth.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "COORDINATOR",
  "JUDGE",
  "MENTOR",
  "PARTICIPANT",
  "STUDENT",
  "GUEST",
];

const ALL_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "PENDING", "BANNED"];

const PAGE_SIZE = 10;

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

// ─── Role / Status helpers ────────────────────────────────────────────────────

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  COORDINATOR: "bg-purple-100 text-purple-700",
  JUDGE: "bg-yellow-100 text-yellow-700",
  MENTOR: "bg-pink-100 text-pink-700",
  PARTICIPANT: "bg-blue-100 text-blue-700",
  STUDENT: "bg-green-100 text-green-700",
  GUEST: "bg-slate-100 text-slate-500",
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${ROLE_COLORS[role]}`}
    >
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: UserStatus }) {
  const dotColor =
    status === "ACTIVE"
      ? "bg-green-500"
      : status === "PENDING"
        ? "bg-orange-400"
        : status === "BANNED"
          ? "bg-red-500"
          : "bg-slate-400";

  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-600">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  count,
  sub,
  accent,
}: {
  label: string;
  count: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div
        className={`text-xs font-extrabold uppercase tracking-widest ${accent}`}
      >
        {label}
      </div>
      <div className="mt-1 text-3xl font-black text-slate-800">{count}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

// ─── Create User Dialog ───────────────────────────────────────────────────────

function CreateUserDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateUserMutation();
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
      role: "STUDENT",
      studentType: "FPT",
      fullName: "",
      email: "",
      password: "",
      phone: "",
      studentCode: "",
      universityName: "",
      major: "",
      graduationYear: "",
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
        studentCode: values.studentCode || undefined,
        universityName: values.universityName || undefined,
        major: values.major || undefined,
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        Create New User
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              {...register("fullName")}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Email"
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
              label="Password"
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

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                {...field}
                size="small"
                fullWidth
                displayEmpty
                sx={{ borderRadius: "10px" }}
              >
                {ALL_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Student Code"
              {...register("studentCode")}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="University"
              {...register("universityName")}
              sx={textFieldSx}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Major"
              {...register("major")}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Graduation Year"
              placeholder="2027"
              {...register("graduationYear")}
              error={Boolean(errors.graduationYear)}
              helperText={errors.graduationYear?.message}
              sx={textFieldSx}
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

// ─── Edit User Dialog ─────────────────────────────────────────────────────────

function EditUserDialog({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  const updateMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditUserFormInput, unknown, EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    values: user
      ? {
          fullName: user.fullName,
          phone: user.phone ?? "",
          role: user.role,
          status: user.status,
          studentCode: user.studentCode ?? "",
          universityName: user.universityName ?? "",
          major: user.major ?? "",
          graduationYear: user.graduationYear
            ? String(user.graduationYear)
            : "",
        }
      : undefined,
  });

  if (!user) return null;

  const onSubmit = async (values: EditUserFormValues) => {
    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        payload: {
          ...values,
          phone: values.phone || undefined,
          studentCode: values.studentCode || undefined,
          universityName: values.universityName || undefined,
          major: values.major || undefined,
        },
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
    <Dialog open={Boolean(user)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        Edit User
        <div className="text-sm font-normal text-slate-400">{user.email}</div>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              {...register("fullName")}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone"
              {...register("phone")}
              sx={textFieldSx}
            />
          </div>

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div>
                <div className="mb-1 text-xs font-bold text-slate-500">
                  Role
                </div>
                <Select
                  {...field}
                  size="small"
                  fullWidth
                  sx={{ borderRadius: "10px" }}
                >
                  {ALL_ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div>
                <div className="mb-1 text-xs font-bold text-slate-500">
                  Status
                </div>
                <Select
                  {...field}
                  size="small"
                  fullWidth
                  sx={{ borderRadius: "10px" }}
                >
                  {ALL_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Student Code"
              {...register("studentCode")}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="University"
              {...register("universityName")}
              sx={textFieldSx}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Major"
              {...register("major")}
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Graduation Year"
              {...register("graduationYear")}
              error={Boolean(errors.graduationYear)}
              helperText={errors.graduationYear?.message}
              sx={textFieldSx}
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
            disabled={updateMutation.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ─── Reset Password Dialog ────────────────────────────────────────────────────

function ResetPasswordDialog({
  user,
  onClose,
}: {
  user: AdminUser | null;
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
      await resetMutation.mutateAsync({
        userId: user.id,
        newPassword: values.newPassword,
      });
      enqueueSnackbar("Password reset successfully.", { variant: "success" });
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to reset password.",
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog open={Boolean(user)} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-black text-slate-800">
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
            color="warning"
            disabled={resetMutation.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 700,
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  const deactivateMutation = useDeactivateUserMutation();
  const activateMutation = useActivateUserMutation();

  const { data, isLoading } = useAdminUsersQuery({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // PageResponse<UserSummaryResponse> shape
  const users = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Counts for stat cards — derived from current page data
  const adminCount = users.filter(
    (u) => u.role === "ADMIN" && u.status === "ACTIVE",
  ).length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const mentorCount = users.filter((u) => u.role === "MENTOR").length;
  const judgeCount = users.filter((u) => u.role === "JUDGE").length;

  const handleToggleStatus = async (user: (typeof users)[number]) => {
    const isActive = user.status === "ACTIVE";
    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(user.id);
        enqueueSnackbar("User deactivated successfully.", { variant: "success" });
      } else {
        await activateMutation.mutateAsync(user.id);
        enqueueSnackbar("User activated successfully.", { variant: "success" });
      }
    } catch {
      enqueueSnackbar("Failed to update status.", { variant: "error" });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleRoleFilter = (value: UserRole | "") => {
    setRoleFilter(value);
    setPage(1);
  };
  const handleStatusFilter = (value: UserStatus | "") => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Manage Users & Permissions
          </h1>
          <p className="text-sm text-slate-400">{total} users total</p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            boxShadow: "none",
            height: 40,
          }}
        >
          Create New User
        </Button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Administrators"
          count={adminCount}
          sub="Active"
          accent="text-red-500"
        />
        <StatCard
          label="Students"
          count={studentCount}
          sub="Registered"
          accent="text-green-600"
        />
        <StatCard
          label="Mentors"
          count={mentorCount}
          sub="Assigned"
          accent="text-pink-600"
        />
        <StatCard
          label="Judges"
          count={judgeCount}
          sub="Invited"
          accent="text-yellow-600"
        />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <TextField
            size="small"
            placeholder="Search by name, email or ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" className="text-slate-400" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            size="small"
            displayEmpty
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value as UserRole | "")}
            sx={{ minWidth: 140, borderRadius: "10px" }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {ALL_ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            displayEmpty
            value={statusFilter}
            onChange={(e) =>
              handleStatusFilter(e.target.value as UserStatus | "")
            }
            sx={{ minWidth: 140, borderRadius: "10px" }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                {[
                  "User Details",
                  "Role",
                  "ID",
                  "Status",
                  "Last Login",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <CircularProgress size={28} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        {user.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusDot status={user.status} />
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt)
                            .toLocaleString("sv-SE")
                            .slice(0, 16)
                        : "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Tooltip title="Edit user">
                          <IconButton
                            size="small"
                            onClick={() => setEditUser(user as AdminUser)}
                          >
                            <EditIcon
                              fontSize="small"
                              className="text-slate-500"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Reset password">
                          <IconButton
                            size="small"
                            onClick={() => setResetUser(user as AdminUser)}
                          >
                            <LockResetIcon
                              fontSize="small"
                              className="text-slate-500"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            user.status === "ACTIVE"
                              ? "Deactivate user"
                              : "Activate user"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user)}
                            disabled={
                              deactivateMutation.isPending ||
                              activateMutation.isPending
                            }
                          >
                            {user.status === "ACTIVE" ? (
                              <BlockIcon
                                fontSize="small"
                                className="text-red-400"
                              />
                            ) : (
                              <CheckCircleIcon
                                fontSize="small"
                                className="text-green-500"
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total} users
            </span>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
              shape="rounded"
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <EditUserDialog user={editUser} onClose={() => setEditUser(null)} />
      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
      />
    </div>
  );
}