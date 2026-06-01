import { useState, useEffect } from "react";
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

const ALL_ROLES: UserRole[] = ["ADMIN", "COORDINATOR", "JUDGE", "MENTOR", "STUDENT"];
const ALL_STATUSES: UserStatus[] = ["UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"];
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

  const { data: adminStats } = useAdminUsersQuery({ role: "ADMIN", status: "ACTIVE", pageSize: 1 });
  const { data: studentStats } = useAdminUsersQuery({ role: "STUDENT", pageSize: 1 });
  const { data: mentorStats } = useAdminUsersQuery({ role: "MENTOR", pageSize: 1 });
  const { data: judgeStats } = useAdminUsersQuery({ role: "JUDGE", pageSize: 1 });
  const { data: coordinatorStats } = useAdminUsersQuery({ role: "COORDINATOR", pageSize: 1 });

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

  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      (document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark")
  );

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const filterSx = {
    color: isDark ? "#cbd5e1" : "#1e293b",
    bg: "transparent",
    border: isDark ? "#334155" : "rgba(0,0,0,0.23)",
    borderHover: isDark ? "#475569" : "rgba(0,0,0,0.87)",
    placeholder: isDark ? "#64748b" : "#94a3b8",
  };

  const paginationSx = {
    "& .MuiPaginationItem-root": {
      color: isDark ? "#cbd5e1" : "#334155",
      borderColor: isDark ? "#334155" : "#e2e8f0",
      fontWeight: 600,
      borderRadius: "8px",
      minWidth: "32px",
      height: "32px",
      margin: "0 2px",
    },
    "& .MuiPaginationItem-root:hover": {
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      borderColor: isDark ? "#3b82f6" : "#3b82f6",
      color: isDark ? "#60a5fa" : "#2563eb",
    },
    "& .MuiPaginationItem-root.Mui-selected": {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    },
    "& .MuiPaginationItem-ellipsis": {
      color: isDark ? "#64748b" : "#94a3b8",
    },
  };

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-slate-800/40">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">Manage Users & Permissions</h1>
          <p className="text-sm text-slate-400 dark:text-slate-400">{total} users total</p>
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

      <UserStatCards
        adminStats={adminStats}
        studentStats={studentStats}
        mentorStats={mentorStats}
        judgeStats={judgeStats}
        coordinatorStats={coordinatorStats}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-700 p-4">
          <TextField
            size="small"
            label="Search"
            placeholder="Name, email or ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: filterSx.bg,
                color: filterSx.color,
                transition: "border-color 0.2s ease",
                "& fieldset": { borderColor: filterSx.border },
                "&:hover:not(.Mui-focused) fieldset": { borderColor: filterSx.borderHover },
                "&.Mui-focused fieldset": { borderColor: isDark ? "#3b82f6" : "#2563eb" },
              },
              "& .MuiInputBase-input": { color: filterSx.color },
              "& .MuiInputBase-input::placeholder": {
                color: isDark ? "#64748b" : "#94a3b8",
                opacity: 1,
              },
              "& .MuiInputLabel-root": {
                color: isDark ? "#64748b" : "#94a3b8",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: isDark ? "#93c5fd" : "#3b82f6",
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" sx={{ color: isDark ? "#475569" : "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          
          <div className="ml-auto flex items-center gap-3">
            <Select
              size="small" displayEmpty value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value as UserRole | "")}
              sx={{
                minWidth: 140,
                borderRadius: "10px",
                backgroundColor: filterSx.bg,
                color: filterSx.color,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: filterSx.border },
                "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": { borderColor: filterSx.borderHover },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#3b82f6" : "#2563eb" },
                "& .MuiSvgIcon-root": { color: filterSx.color },
              }}
              MenuProps={{
                sx: {
                  "& .MuiPaper-root": {
                    bgcolor: isDark ? "#1e293b" : "#ffffff",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                  }
                }
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              {ALL_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>

            <Select
              size="small" displayEmpty value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as UserStatus | "")}
              sx={{
                minWidth: 140,
                borderRadius: "10px",
                backgroundColor: filterSx.bg,
                color: filterSx.color,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: filterSx.border },
                "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": { borderColor: filterSx.borderHover },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#3b82f6" : "#2563eb" },
                "& .MuiSvgIcon-root": { color: filterSx.color },
              }}
              MenuProps={{
                sx: {
                  "& .MuiPaper-root": {
                    bgcolor: isDark ? "#1e293b" : "#ffffff",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                  }
                }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-left">
                {["User Details", "Role", "ID", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
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
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isAdmin = user.role === "ADMIN";

                  return (
                    <tr key={user.id} className="border-b border-slate-50 dark:border-slate-700/50 transition hover:bg-slate-50/60 dark:hover:bg-slate-700/40">
                      <td className="px-5 py-3.5">
                        <button type="button" className="text-left" onClick={() => setViewUserId(user.id)}>
                          <div className="font-semibold text-slate-800 dark:text-slate-300 hover:underline">{user.fullName}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-400">{user.email}</div>
                        </button>
                      </td>
                      <td className="px-5 py-3.5"><RoleBadge role={user.role as UserRole} /></td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {user.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><StatusDot status={user.status as UserStatus} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Tooltip title={isAdmin ? "Cannot edit Admin" : "Edit user"}>
                            <span>
                              <IconButton size="small" onClick={() => setEditUserId(user.id)} disabled={isAdmin}>
                                <EditIcon fontSize="small" className={!isAdmin ? "text-slate-500" : "text-slate-300 dark:text-slate-600"} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={isAdmin ? "Cannot reset Admin" : "Reset password"}>
                            <span>
                              <IconButton size="small" onClick={() => setResetUser(user)} disabled={isAdmin}>
                                <LockResetIcon fontSize="small" className={!isAdmin ? "text-slate-500" : "text-slate-300 dark:text-slate-600"} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={isAdmin ? "Admin is always active" : (user.status === "ACTIVE" ? "Deactivate user" : "Activate user")}>
                            <span> 
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user)}
                                disabled={isAdmin || deactivateMutation.isPending || activateMutation.isPending}
                              >
                                {user.status === "ACTIVE"
                                  ? <BlockIcon fontSize="small" className={!isAdmin ? "text-red-400" : "text-slate-300 dark:text-slate-600"} />
                                  : <CheckCircleIcon fontSize="small" className={!isAdmin ? "text-green-500" : "text-slate-300 dark:text-slate-600"} />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-5 py-3">
            <span className="text-xs text-slate-400 dark:text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} users
            </span>
            <Pagination
              count={totalPages} page={page}
              onChange={(_, p) => setPage(p)}
              size="small" shape="rounded"
              variant="outlined"
              sx={paginationSx}
            />
          </div>
        )}
      </div>

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