import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { RoleBadge, StatusDot } from "../ManageUserPage/UserBadges";
import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

type UserTableProps = {
  users: User[];
  isLoading: boolean;
  isMutating: boolean;
  onView: (userId: string) => void;
  onEdit: (userId: string) => void;
  onResetPassword: (user: { id: string; email: string }) => void;
  onToggleStatus: (user: User) => void;
};

const TABLE_HEADERS = ["User Details", "Role", "ID", "Status", "Actions"];

// ─── Row ──────────────────────────────────────────────────────────────────────

function UserTableRow({
  user,
  isMutating,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: Omit<UserTableProps, "users" | "isLoading"> & { user: User }) {
  const isAdmin = user.role === "ADMIN";
  const isActive = user.status === "ACTIVE";

  return (
    <tr className="border-b border-slate-50 dark:border-slate-700/50 transition hover:bg-slate-50/60 dark:hover:bg-slate-700/40">
      {/* User Details */}
      <td className="px-5 py-3.5">
        <button type="button" className="text-left" onClick={() => onView(user.id)}>
          <div className="font-semibold text-slate-800 dark:text-slate-300 hover:underline">
            {user.fullName}
          </div>
          <div className="text-xs text-slate-400">{user.email}</div>
        </button>
      </td>

      {/* Role */}
      <td className="px-5 py-3.5">
        <RoleBadge role={user.role as UserRole} />
      </td>

      {/* ID */}
      <td className="px-5 py-3.5">
        <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-400">
          {user.id.slice(0, 8).toUpperCase()}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <StatusDot status={user.status as UserStatus} />
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <Tooltip title={isAdmin ? "Cannot edit Admin" : "Edit user"}>
            <span>
              <IconButton size="small" onClick={() => onEdit(user.id)} disabled={isAdmin}>
                <EditIcon
                  fontSize="small"
                  className={isAdmin ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isAdmin ? "Cannot reset Admin" : "Reset password"}>
            <span>
              <IconButton
                size="small"
                onClick={() => onResetPassword({ id: user.id, email: user.email })}
                disabled={isAdmin}
              >
                <LockResetIcon
                  fontSize="small"
                  className={isAdmin ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip
            title={
              isAdmin
                ? "Admin is always active"
                : isActive
                  ? "Deactivate user"
                  : "Activate user"
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => onToggleStatus(user)}
                disabled={isAdmin || isMutating}
              >
                {isActive ? (
                  <BlockIcon
                    fontSize="small"
                    className={isAdmin ? "text-slate-300 dark:text-slate-600" : "text-red-400"}
                  />
                ) : (
                  <CheckCircleIcon
                    fontSize="small"
                    className={isAdmin ? "text-slate-300 dark:text-slate-600" : "text-green-500"}
                  />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

export function UserTable({
  users,
  isLoading,
  isMutating,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700 text-left">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="py-16 text-center">
                <CircularProgress size={28} />
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isMutating={isMutating}
                onView={onView}
                onEdit={onEdit}
                onResetPassword={onResetPassword}
                onToggleStatus={onToggleStatus}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}