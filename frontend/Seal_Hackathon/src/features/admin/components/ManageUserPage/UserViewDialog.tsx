import type { ReactNode } from "react";
import { CircularProgress, Dialog, Tooltip } from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import GppMaybeOutlinedIcon from "@mui/icons-material/GppMaybeOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import { useAdminUserQuery } from "@/features/admin/hooks/useAdminMutations";
import { RoleBadge, StatusDot } from "./UserBadges";
import type { UserRole } from "@/types/auth.types";
import type { UserDetailResponse, UserStatus } from "@/types/user.types";

/** Two initials from the user's name, for the avatar fallback. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateTime(value?: string): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString("sv-SE").slice(0, 16);
}

function InfoCard({
  icon,
  label,
  value,
  accent = "text-blue-500 dark:text-blue-400",
  wide = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-slate-600",
        wide ? "sm:col-span-2" : "",
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/60",
          accent,
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </div>
        <div className="mt-0.5 break-words text-sm font-medium text-slate-700 dark:text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}

/**
 * The detail endpoint can occasionally return a malformed payload (e.g. a
 * server-side serialization error surfaced as a raw string). Guard against it
 * so a bad response degrades into an inline error instead of crashing the whole
 * page through the router error boundary.
 */
function asUserDetail(data: unknown): UserDetailResponse | null {
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id?: unknown }).id;
    if (typeof id === "string") return data as UserDetailResponse;
  }
  return null;
}

export function UserViewDialog({
  userId,
  onClose,
  onEdit,
  onResetPassword,
}: {
  userId: string | null;
  onClose: () => void;
  onEdit: (userId: string) => void;
  onResetPassword: (user: { id: string; email: string }) => void;
}) {
  const { data, isLoading } = useAdminUserQuery(userId);

  const user = asUserDetail(data);
  const loadFailed = Boolean(userId) && !isLoading && !user;
  const isAdmin = user?.role === "ADMIN";
  const verifiedAt = formatDateTime(user?.emailVerifiedAt);

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
            User Profile
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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role as UserRole} />
                <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                  <StatusDot status={user.status as UserStatus} />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body — pulled up to overlap the banner */}
      <div className="relative -mt-8 px-6 pb-2">
        {isLoading ? (
          <div className="flex justify-center rounded-3xl border border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900">
            <CircularProgress size={28} />
          </div>
        ) : loadFailed ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <ReportGmailerrorredOutlinedIcon
              sx={{ fontSize: 40 }}
              className="text-rose-400"
            />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Couldn&apos;t load this profile
              </p>
              <p className="mt-1 text-xs text-slate-400">
                The server returned an unexpected response. Please try again
                later.
              </p>
            </div>
          </div>
        ) : user ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              wide
              icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Email Address"
              value={user.email}
            />
            <InfoCard
              icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Phone"
              value={user.phone ?? "—"}
              accent="text-emerald-500 dark:text-emerald-400"
            />
            <InfoCard
              icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />}
              label="User ID"
              value={
                <span className="font-mono text-xs tracking-wide">
                  {user.id.slice(0, 8).toUpperCase()}
                </span>
              }
              accent="text-violet-500 dark:text-violet-400"
            />
            <InfoCard
              icon={
                verifiedAt ? (
                  <VerifiedOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <GppMaybeOutlinedIcon sx={{ fontSize: 18 }} />
                )
              }
              label="Email Verified"
              value={verifiedAt ?? "Not verified"}
              accent={
                verifiedAt
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-amber-500 dark:text-amber-400"
              }
            />
            <InfoCard
              icon={<LoginOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Last Login"
              value={formatDateTime(user.lastLoginAt) ?? "Never"}
              accent="text-sky-500 dark:text-sky-400"
            />
          </div>
        ) : null}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 cursor-pointer items-center rounded-xl px-4 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          Close
        </button>

        {user && (
          <>
            <Tooltip title={isAdmin ? "Cannot reset Admin" : ""}>
              <span>
                <button
                  type="button"
                  disabled={isAdmin}
                  onClick={() => {
                    onResetPassword(user);
                    onClose();
                  }}
                  className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <LockResetOutlinedIcon sx={{ fontSize: 18 }} />
                  Reset Password
                </button>
              </span>
            </Tooltip>

            <Tooltip title={isAdmin ? "Cannot edit Admin" : ""}>
              <span>
                <button
                  type="button"
                  disabled={isAdmin}
                  onClick={() => {
                    onEdit(user.id);
                    onClose();
                  }}
                  className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  Edit User
                </button>
              </span>
            </Tooltip>
          </>
        )}
      </div>
    </Dialog>
  );
}
