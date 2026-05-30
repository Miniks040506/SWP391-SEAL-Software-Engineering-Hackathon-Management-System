import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import type { AuthUser } from "@/types/auth.types";
import { getPrimaryRole, getRoleRedirectPath } from "@/utils/roleRedirect";

type UserAvatarMenuProps = {
  user: AuthUser;
  profilePath?: string;
  settingsPath?: string;
  onLogout: () => Promise<void> | void;
};

function getAvatarLetter(user: AuthUser) {
  const source = user.fullName || user.email || "U";
  return source.charAt(0).toUpperCase();
}

export function UserAvatarMenu({
  user,
  profilePath,
  settingsPath,
  onLogout,
}: UserAvatarMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const primaryRole = getPrimaryRole(user);
  const dashboardPath = getRoleRedirectPath(user);

  const displayName = user.fullName || user.email || "User";
  const roleLabel = primaryRole || user.role || "USER";

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full outline-none ring-blue-200 transition-all focus-visible:ring-4"
      >
        <Avatar
          alt={displayName}
          src=""
          sx={{
            width: 34,
            height: 34,
            border: "2px solid #bfdbfe",
            cursor: "pointer",
            bgcolor: "#3b82f6",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {getAvatarLetter(user)}
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
          <div className="px-4 py-3">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
              {displayName}
            </p>

            <p className="mt-0.5 truncate text-xs font-semibold text-gray-400">
              {user.email}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              {roleLabel}
            </span>
          </div>

          <Divider />

          <button
            type="button"
            onClick={() => go(dashboardPath)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <DashboardOutlinedIcon fontSize="small" />
            Dashboard
          </button>

          {profilePath && (
            <button
              type="button"
              onClick={() => go(profilePath)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <PersonOutlineOutlinedIcon fontSize="small" />
              Profile
            </button>
          )}

          {settingsPath && (
            <button
              type="button"
              onClick={() => go(settingsPath)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <SettingsOutlinedIcon fontSize="small" />
              Settings
            </button>
          )}

          <Divider />

          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogoutOutlinedIcon fontSize="small" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}