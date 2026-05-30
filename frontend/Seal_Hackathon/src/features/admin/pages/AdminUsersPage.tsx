import { useState } from "react";
import {
  Button,
  CircularProgress,
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
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { enqueueSnackbar } from "notistack";

import {
  useAdminUsersQuery,
  useDeactivateUserMutation,
  useActivateUserMutation,
} from "@/features/admin/hooks/useAdminMutations";
import { RoleBadge, StatusDot } from "@/features/admin/components/UserBadges";
import { UserStatCards } from "@/features/admin/components/UserStatCards";
import { UserViewDialog } from "@/features/admin/components/UserViewDialog";
import { UserCreateDialog } from "@/features/admin/components/UserCreateDialog";
import { UserEditDialog } from "@/features/admin/components/UserEditDialog";
import { UserResetPasswordDialog } from "@/features/admin/components/UserResetPasswordDialog";
import type { UserStatus } from "@/types/user.types";
import type { UserRole } from "@/types/auth.types";

const ALL_ROLES: UserRole[] = [
  "ADMIN", "COORDINATOR", "JUDGE", "MENTOR", "PARTICIPANT", "STUDENT", "GUEST",
];
const ALL_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "PENDING", "BANNED"];
const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<{ id: string; email: string } | null>(null);

  const deactivateMutation = useDeactivateUserMutation();
  const activateMutation = useActivateUserMutation();

  const { data, isLoading } = useAdminUsersQuery({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // Stat card queries
  const { data: adminStats } = useAdminUsersQuery({ role: "ADMIN", status: "ACTIVE", pageSize: 1 });
  const { data: studentStats } = useAdminUsersQuery({ role: "STUDENT", pageSize: 1 });
  const { data: mentorStats } = useAdminUsersQuery({ role: "MENTOR", pageSize: 1 });
  const { data: judgeStats } = useAdminUsersQuery({ role: "JUDGE", pageSize: 1 });

  const users = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

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

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleRoleFilter = (value: UserRole | "") => { setRoleFilter(value); setPage(1); };
  const handleStatusFilter = (value: UserStatus | "") => { setStatusFilter(value); setPage(1); };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manage Users & Permissions</h1>
          <p className="text-sm text-slate-400">{total} users total</p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(true)}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", boxShadow: "none", height: 40 }}
        >
          Create New User
        </Button>
      </div>

      {/* Stat Cards */}
      <UserStatCards
        adminStats={adminStats}
        studentStats={studentStats}
        mentorStats={mentorStats}
        judgeStats={judgeStats}
      />

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <TextField
            size="small"
            placeholder="Search by name, email or ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ width: 300, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
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
            size="small" displayEmpty value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value as UserRole | "")}
            sx={{ minWidth: 140, borderRadius: "10px" }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {ALL_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
          <Select
            size="small" displayEmpty value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as UserStatus | "")}
            sx={{ minWidth: 140, borderRadius: "10px" }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                {["User Details", "Role", "ID", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">
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
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <button type="button" className="text-left" onClick={() => setViewUserId(user.id)}>
                        <div className="font-semibold text-slate-800 hover:underline">{user.fullName}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </button>
                    </td>
                    <td className="px-5 py-3.5"><RoleBadge role={user.role as UserRole} /></td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        {user.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><StatusDot status={user.status as UserStatus} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Tooltip title="Edit user">
                          <IconButton size="small" onClick={() => setEditUserId(user.id)}>
                            <EditIcon fontSize="small" className="text-slate-500" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset password">
                          <IconButton size="small" onClick={() => setResetUser(user)}>
                            <LockResetIcon fontSize="small" className="text-slate-500" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.status === "ACTIVE" ? "Deactivate user" : "Activate user"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user)}
                            disabled={deactivateMutation.isPending || activateMutation.isPending}
                          >
                            {user.status === "ACTIVE"
                              ? <BlockIcon fontSize="small" className="text-red-400" />
                              : <CheckCircleIcon fontSize="small" className="text-green-500" />}
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
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} users
            </span>
            <Pagination
              count={totalPages} page={page}
              onChange={(_, p) => setPage(p)}
              size="small" shape="rounded"
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserViewDialog
        userId={viewUserId}
        onClose={() => setViewUserId(null)}
        onEdit={(id) => setEditUserId(id)}
        onResetPassword={(u) => setResetUser(u)}
      />
      <UserCreateDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <UserEditDialog userId={editUserId} onClose={() => setEditUserId(null)} />
      <UserResetPasswordDialog user={resetUser} onClose={() => setResetUser(null)} />
    </div>
  );
}