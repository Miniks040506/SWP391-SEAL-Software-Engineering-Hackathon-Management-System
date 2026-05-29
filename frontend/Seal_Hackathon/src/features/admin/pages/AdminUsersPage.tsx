import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import PersonIcon from "@mui/icons-material/Person";
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
  useAdminUserQuery,
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
  loading,
}: {
  label: string;
  count: number;
  sub: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`text-xs font-extrabold uppercase tracking-widest ${accent}`}>
        {label}
      </div>
      <div className="mt-1 text-3xl font-black text-slate-800">
        {loading ? (
          <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-100" />
        ) : (
          count
        )}
      </div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

// ─── View User Dialog ─────────────────────────────────────────────────────────
// Fetches the full UserDetailResponse (phone, studentCode, etc.) for a given id.

function ViewUserDialog({
  userId,
  onClose,
  onEdit,
  onResetPassword,
}: {
  userId: string | null;
  onClose: () => void;
  onEdit: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
}) {
  // ✅ useAdminUserQuery accepts null and is disabled when null
  const { data: user, isLoading } = useAdminUserQuery(userId);

  return (
    <Dialog open={Boolean(userId)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        User Profile
        {user && (
          <div className="text-sm font-normal text-slate-400">{user.email}</div>
        )}
      </DialogTitle>

      <DialogContent>
        {isLoading || !user ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={28} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <PersonIcon fontSize="large" />
                )}
              </div>
              <div>
                <div className="text-base font-bold text-slate-800">
                  {user.fullName}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  <StatusDot status={user.status} />
                </div>
              </div>
            </div>

            <Divider />

            {/* Core fields */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone" value={user.phone ?? "—"} />
              <DetailRow
                label="User ID"
                value={
                  <span className="font-mono text-xs">
                    {user.id.slice(0, 8).toUpperCase()}
                  </span>
                }
              />
              <DetailRow
                label="Last Login"
                value={
                  user.lastLoginAt
                    ? new Date(user.lastLoginAt)
                        .toLocaleString("sv-SE")
                        .slice(0, 16)
                    : "Never"
                }
              />
              <DetailRow
                label="Created"
                value={new Date(user.createdAt).toLocaleDateString("sv-SE")}
              />
            </div>

            {/* Student profile — only shown when fields present */}
            {(user.studentCode ||
              user.universityName ||
              user.major ||
              user.graduationYear) && (
              <>
                <Divider />
                <div>
                  <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Student Profile
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <DetailRow
                      label="Student Code"
                      value={user.studentCode ?? "—"}
                    />
                    <DetailRow
                      label="Student Type"
                      value={user.studentType ?? "—"}
                    />
                    <DetailRow
                      label="University"
                      value={user.universityName ?? "—"}
                    />
                    <DetailRow label="Major" value={user.major ?? "—"} />
                    <DetailRow
                      label="Graduation Year"
                      value={user.graduationYear?.toString() ?? "—"}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions className="gap-2 px-6 pb-4">
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        {user && (
          <>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<LockResetIcon />}
              onClick={() => {
                onResetPassword(user);
                onClose();
              }}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Reset Password
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                onEdit(user);
                onClose();
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                boxShadow: "none",
              }}
            >
              Edit User
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-slate-700">{value}</div>
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
    watch,
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

  const selectedRole = watch("role");
  const isStudentRole =
    selectedRole === "STUDENT" || selectedRole === "PARTICIPANT";

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
        // graduationYear already transformed to number | undefined by Zod
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
          {/* Name + Email */}
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

          {/* Password + Phone */}
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

          {/* Role */}
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div>
                <div className="mb-1 text-xs font-bold text-slate-500">
                  Role *
                </div>
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
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Student fields — only visible for STUDENT / PARTICIPANT */}
          {isStudentRole && (
            <>
              <Divider>
                <span className="text-xs font-bold text-slate-400">
                  Student Profile
                </span>
              </Divider>

              <Controller
                control={control}
                name="studentType"
                render={({ field }) => (
                  <div>
                    <div className="mb-1 text-xs font-bold text-slate-500">
                      Student Type
                    </div>
                    <Select
                      {...field}
                      size="small"
                      fullWidth
                      sx={{ borderRadius: "10px" }}
                    >
                      <MenuItem value="FPT">FPT Student</MenuItem>
                      <MenuItem value="EXTERNAL">External Student</MenuItem>
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
                  placeholder="2027"
                  {...register("graduationYear")}
                  error={Boolean(errors.graduationYear)}
                  helperText={errors.graduationYear?.message}
                  sx={textFieldSx}
                />
              </div>
            </>
          )}
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
// ✅ Fetches the full UserDetailResponse before populating the form so phone,
//    studentCode, etc. are available (list endpoint only returns UserSummaryResponse).

function EditUserDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const updateMutation = useUpdateUserMutation();

  // Fetch full detail — form only populates once this resolves
  const { data: user, isLoading } = useAdminUserQuery(userId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditUserFormInput, unknown, EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    // "values" mode re-syncs when user data arrives
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

  const onSubmit = async (values: EditUserFormValues) => {
    if (!userId) return;
    try {
      await updateMutation.mutateAsync({
        userId,
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
    <Dialog open={Boolean(userId)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        Edit User
        {user && (
          <div className="text-sm font-normal text-slate-400">{user.email}</div>
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
          <DialogContent className="space-y-4">
            {/* Name + Phone */}
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
                label="Phone"
                {...register("phone")}
                sx={textFieldSx}
              />
            </div>

            {/* Role + Status */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Student profile */}
            <Divider>
              <span className="text-xs font-bold text-slate-400">
                Student Profile (optional)
              </span>
            </Divider>

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
      )}
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
        // ✅ confirmPassword is NOT sent — validation only
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
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  // ✅ Edit and Reset dialogs store userId string, not the summary object
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  const deactivateMutation = useDeactivateUserMutation();
  const activateMutation = useActivateUserMutation();

  // ── Main list (with active filters)
  const { data, isLoading } = useAdminUsersQuery({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // ── Stat card queries — each fetches only 1 row just to read totalElements.
  // ✅ These are NOT derived from the current page; they are independent queries
  //    so the counts are always accurate across all pages.
  const { data: adminStats } = useAdminUsersQuery({
    role: "ADMIN",
    status: "ACTIVE",
    pageSize: 1,
  });
  const { data: studentStats } = useAdminUsersQuery({
    role: "STUDENT",
    pageSize: 1,
  });
  const { data: mentorStats } = useAdminUsersQuery({
    role: "MENTOR",
    pageSize: 1,
  });
  const { data: judgeStats } = useAdminUsersQuery({
    role: "JUDGE",
    pageSize: 1,
  });

  const users = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const handleToggleStatus = async (user: (typeof users)[number]) => {
    const isActive = user.status === "ACTIVE";
    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(user.id);
        enqueueSnackbar("User deactivated successfully.", {
          variant: "success",
        });
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

      {/* Stat Cards — counts from totalElements, not from current page */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Administrators"
          count={adminStats?.totalElements ?? 0}
          sub="Active"
          accent="text-red-500"
          loading={!adminStats}
        />
        <StatCard
          label="Students"
          count={studentStats?.totalElements ?? 0}
          sub="Registered"
          accent="text-green-600"
          loading={!studentStats}
        />
        <StatCard
          label="Mentors"
          count={mentorStats?.totalElements ?? 0}
          sub="Assigned"
          accent="text-pink-600"
          loading={!mentorStats}
        />
        <StatCard
          label="Judges"
          count={judgeStats?.totalElements ?? 0}
          sub="Invited"
          accent="text-yellow-600"
          loading={!judgeStats}
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
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => setViewUserId(user.id)}
                      >
                        <div className="font-semibold text-slate-800 hover:underline">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.email}
                        </div>
                      </button>
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
                            // ✅ Pass userId; EditUserDialog will fetch full detail
                            onClick={() => setEditUserId(user.id)}
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
                            // ✅ user here is UserSummaryResponse which has id + email
                            //    that's all ResetPasswordDialog needs
                            onClick={() =>
                              setResetUser(user as unknown as AdminUser)
                            }
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
      <ViewUserDialog
        userId={viewUserId}
        onClose={() => setViewUserId(null)}
        onEdit={(u) => setEditUserId(u.id)}
        onResetPassword={(u) => setResetUser(u)}
      />
      <CreateUserDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      {/* ✅ EditUserDialog now receives userId and fetches full detail internally */}
      <EditUserDialog
        userId={editUserId}
        onClose={() => setEditUserId(null)}
      />
      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
      />
    </div>
  );
}