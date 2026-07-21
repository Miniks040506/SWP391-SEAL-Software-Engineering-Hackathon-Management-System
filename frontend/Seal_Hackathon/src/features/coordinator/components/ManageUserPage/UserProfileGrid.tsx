import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { Tooltip } from "@mui/material";
import { useState } from "react";
import type { ReactNode } from "react";

import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};

type UserProfileGridProps = {
  users: User[];
  isLoading: boolean;
  isMutating: boolean;
  onView: (userId: string) => void;
  onEdit: (userId: string) => void;
  onResetPassword: (user: { id: string; email: string }) => void;
  onToggleStatus: (user: User) => void;
  restrictedRoles?: readonly string[];
};

// role → avatar gradient + soft badge styling
const roleTheme: Record<
  string,
  { gradient: string; badge: string; ring: string }
> = {
  ADMIN: {
    gradient: "from-rose-500 to-red-600",
    badge:
      "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    ring: "ring-rose-500/30",
  },
  COORDINATOR: {
    gradient: "from-violet-500 to-purple-600",
    badge:
      "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
    ring: "ring-violet-500/30",
  },
  JUDGE: {
    gradient: "from-amber-500 to-orange-600",
    badge:
      "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    ring: "ring-amber-500/30",
  },
  MENTOR: {
    gradient: "from-pink-500 to-rose-600",
    badge:
      "border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300",
    ring: "ring-pink-500/30",
  },
  STUDENT: {
    gradient: "from-emerald-500 to-teal-600",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    ring: "ring-emerald-500/30",
  },
};

const fallbackTheme = {
  gradient: "from-slate-500 to-slate-600",
  badge:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300",
  ring: "ring-slate-500/30",
};

const statusTheme: Record<string, { dot: string; label: string; text: string }> = {
  ACTIVE: { dot: "bg-emerald-500", label: "Active", text: "text-emerald-600 dark:text-emerald-400" },
  PENDING_APPROVAL: {
    dot: "bg-orange-400",
    label: "Pending Approval",
    text: "text-orange-600 dark:text-orange-400",
  },
  UNVERIFIED: { dot: "bg-blue-400", label: "Unverified", text: "text-blue-600 dark:text-blue-400" },
  SUSPENDED: { dot: "bg-red-500", label: "Suspended", text: "text-red-600 dark:text-red-400" },
  DEACTIVATED: {
    dot: "bg-slate-400",
    label: "Deactivated",
    text: "text-slate-500 dark:text-slate-400",
  },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatJoined(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ActionButton({
  label,
  disabled,
  onClick,
  tone = "neutral",
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  tone?: "neutral" | "danger" | "success";
  children: ReactNode;
}) {
  const toneClass = disabled
    ? "border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-700"
    : tone === "danger"
      ? "border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
      : tone === "success"
        ? "border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
        : "border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";

  return (
    <Tooltip title={label}>
      <span>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            toneClass,
          ].join(" ")}
        >
          {children}
        </button>
      </span>
    </Tooltip>
  );
}

function UserProfileCard({
  user,
  isMutating,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
  restrictedRoles,
}: Omit<UserProfileGridProps, "users" | "isLoading"> & { user: User }) {
  const isAdmin = user.role === "ADMIN";
  const isOutOfScope =
    restrictedRoles !== undefined && !restrictedRoles.includes(user.role);
  const isDisabled = isAdmin || isOutOfScope;
  const isActive = user.status === "ACTIVE";

  const theme = roleTheme[user.role] ?? fallbackTheme;
  const status = statusTheme[user.status] ?? {
    dot: "bg-slate-400",
    label: user.status,
    text: "text-slate-500",
  };
  const joined = formatJoined(user.createdAt);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
      {/* Cover strip */}
      <div className={["h-16 w-full bg-linear-to-r", theme.gradient].join(" ")}>
        <div
          aria-hidden
          className="pointer-events-none h-full w-full opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
      </div>

      {/* Identity — clickable to open profile */}
      <button
        type="button"
        onClick={() => onView(user.id)}
        className="-mt-8 flex flex-col items-center px-5 text-center focus-visible:outline-none"
      >
        <span
          className={[
            "flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br text-xl font-black text-white shadow-md ring-4 ring-white transition-transform group-hover:scale-105 motion-reduce:transition-none dark:ring-slate-900",
            theme.gradient,
          ].join(" ")}
        >
          {getInitials(user.fullName)}
        </span>

        <h3 className="mt-3 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
          {user.fullName}
        </h3>
        <p className="line-clamp-1 max-w-full text-xs font-medium text-slate-400">
          {user.email}
        </p>
      </button>

      {/* Badges */}
      <div className="mt-3 flex items-center justify-center gap-2 px-5">
        <span
          className={[
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
            theme.badge,
          ].join(" ")}
        >
          {user.role}
        </span>
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-800/60",
            status.text,
          ].join(" ")}
        >
          <span className={["h-1.5 w-1.5 rounded-full", status.dot].join(" ")} />
          {status.label}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 space-y-1.5 px-5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <FingerprintOutlinedIcon sx={{ fontSize: 15 }} className="text-slate-400" />
          <span className="font-mono tracking-tight">
            {user.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} className="text-slate-400" />
          <span>{joined ? `Joined ${joined}` : "Join date unavailable"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
        <ActionButton
          label={isDisabled ? (isAdmin ? "Cannot edit Admin" : "Restricted role") : "Edit user"}
          disabled={isDisabled}
          onClick={() => onEdit(user.id)}
        >
          <EditOutlinedIcon sx={{ fontSize: 18 }} />
        </ActionButton>

        <ActionButton
          label={isDisabled ? (isAdmin ? "Cannot reset Admin" : "Restricted role") : "Reset password"}
          disabled={isDisabled}
          onClick={() => onResetPassword({ id: user.id, email: user.email })}
        >
          <LockResetIcon sx={{ fontSize: 18 }} />
        </ActionButton>

        <ActionButton
          label={
            isDisabled
              ? isAdmin
                ? "Admin is always active"
                : "Restricted role"
              : isActive
                ? "Deactivate user"
                : "Activate user"
          }
          disabled={isDisabled || isMutating}
          tone={isActive ? "danger" : "success"}
          onClick={() => onToggleStatus(user)}
        >
          {isActive ? (
            <BlockIcon sx={{ fontSize: 18 }} />
          ) : (
            <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
          )}
        </ActionButton>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="h-16 w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="flex flex-col items-center px-5">
        <div className="-mt-8 h-16 w-16 animate-pulse rounded-2xl bg-slate-200 ring-4 ring-white dark:bg-slate-700 dark:ring-slate-900" />
        <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-5 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 space-y-2 px-5 pb-5">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function UserProfileGrid({
  users,
  isLoading,
  isMutating,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
  restrictedRoles,
}: UserProfileGridProps) {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-5 py-16 text-center text-sm text-slate-400">
        No users found.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {users.map((user) => (
          <UserProfileCard
            key={user.id}
            user={user}
            isMutating={isMutating}
            onView={onView}
            onEdit={onEdit}
            onResetPassword={onResetPassword}
            onToggleStatus={handleRequestToggle}
            restrictedRoles={restrictedRoles}
          />
        ))}
      </div>

      <ActionConfirmDialog
        open={isToggleOpen}
        title={
          <>
            {userToToggle?.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
            <div className="text-sm font-normal text-slate-400 mt-1">
              {userToToggle?.email}
            </div>
          </>
        }
        description={
          <>
            Are you sure you want to{" "}
            {userToToggle?.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
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
