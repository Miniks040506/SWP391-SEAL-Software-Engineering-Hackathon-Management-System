import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";
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
  restrictedRoles?: readonly string[];
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
  restrictedRoles,
}: Omit<UserTableProps, "users" | "isLoading"> & { user: User }) {
  const isAdmin = user.role === "ADMIN";
  const isOutOfScope = restrictedRoles !== undefined && !restrictedRoles.includes(user.role);
  const isDisabled = isAdmin || isOutOfScope;
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
          <Tooltip title={isDisabled ? (isAdmin ? "Cannot edit Admin" : "Restricted role") : "Edit user"}>
            <span>
              <IconButton size="small" onClick={() => onEdit(user.id)} disabled={isDisabled}>
                <EditIcon
                  fontSize="small"
                  className={isDisabled ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isDisabled ? (isAdmin ? "Cannot reset Admin" : "Restricted role") : "Reset password"}>
            <span>
              <IconButton
                size="small"
                onClick={() => onResetPassword({ id: user.id, email: user.email })}
                disabled={isDisabled}
              >
                <LockResetIcon
                  fontSize="small"
                  className={isDisabled ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip
            title={
              isDisabled
                ? (isAdmin ? "Admin is always active" : "Restricted role")
                : isActive
                  ? "Deactivate user"
                  : "Activate user"
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => onToggleStatus(user)}
                disabled={isDisabled || isMutating}
              >
                {isActive ? (
                  <BlockIcon
                    fontSize="small"
                    className={isDisabled ? "text-slate-300 dark:text-slate-600" : "text-red-400"}
                  />
                ) : (
                  <CheckCircleIcon
                    fontSize="small"
                    className={isDisabled ? "text-slate-300 dark:text-slate-600" : "text-green-500"}
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
  restrictedRoles,
}: UserTableProps) {
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isToggleOpen, setIsToggleOpen] = useState(false);

  const handleRequestToggle = (user: User) => {
    setUserToToggle(user);
    setIsToggleOpen(true);
  };

  const handleConfirmToggle = () => {
    if (userToToggle) {
      onToggleStatus(userToToggle);
      setIsToggleOpen(false);
    }
  };

  return (
    <>
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
                  onToggleStatus={handleRequestToggle}
                  restrictedRoles={restrictedRoles}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <ActionConfirmDialog
        open={isToggleOpen}
        title={
          <>
            {userToToggle?.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
            <div className="text-sm font-normal text-slate-400 mt-1">{userToToggle?.email}</div>
          </>
        }
        description={
          <>
            Are you sure you want to {userToToggle?.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
            <strong>{userToToggle?.fullName}</strong>?
          </>
        }
        confirmLabel={userToToggle?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        alertText={null}
        isPending={isMutating}
        onClose={() => setIsToggleOpen(false)}
        onConfirm={handleConfirmToggle}
        TransitionProps={{ onExited: () => setUserToToggle(null) }}
        maxWidth="xs"
        dialogClasses={{ paper: "bg-white dark:bg-slate-800 dark:text-slate-200" }}
        dialogSx={{ "& .MuiDialog-paper": { backgroundImage: "none" } }}
        paperSx={{ borderRadius: "10px" }}
        titleClassName="font-bold text-slate-800 dark:text-slate-100"
        titleSx={{}}
        noDividers={true}
        actionsClassName="px-6 pb-4"
        cancelButtonSx={{ textTransform: "none" }}
        confirmButtonSx={{
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          boxShadow: "none",
        }}
        confirmButtonColor={userToToggle?.status === "ACTIVE" ? "error" : "primary"}
      />
    </>
  );
}