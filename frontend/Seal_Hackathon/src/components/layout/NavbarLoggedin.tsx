import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useAuthStore } from "@/stores/authStore";

type NavbarLink = {
  label: string;
  path: string;
};

type NavbarLoggedinProps = {
  homePath: string;
  currentEventLabel?: string;
  navLinks?: NavbarLink[];
  notificationPath?: string;
  settingsPath?: string;
  profilePath?: string;
};

function getAvatarLetter(fullName?: string | null, email?: string | null) {
  const source = fullName || email || "U";
  return source.charAt(0).toUpperCase();
}

export const NavbarLoggedin = ({
  homePath,
  currentEventLabel = "Current: Spring 2024",
  navLinks = [],
  notificationPath,
  settingsPath,
  profilePath = "/personal",
}: NavbarLoggedinProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const displayName = user?.fullName || user?.email || "User";
  const avatarUrl = user?.avatarUrl || "";

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <div
          className="group flex cursor-pointer items-center gap-3 transition-transform active:scale-95"
          onClick={() => navigate(homePath)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-2xl font-bold text-white shadow-xl shadow-blue-500/20 transition-transform group-hover:rotate-3">
            S
          </div>

          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-bold italic tracking-tighter text-gray-900 dark:text-white">
              SEAL
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Hackathon System
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-2 md:gap-8">
          <div className="flex items-center">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  isActive(link.path)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="mx-2 hidden h-5 w-px bg-gray-200 dark:bg-slate-700 sm:block" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(homePath)}
              className="hidden rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 sm:block"
            >
              {currentEventLabel}
            </button>

            {notificationPath && (
              <button
                onClick={() => navigate(notificationPath)}
                className="hidden text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-white sm:flex"
              >
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </button>
            )}

            {settingsPath && (
              <button
                onClick={() => navigate(settingsPath)}
                className="hidden text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-white sm:flex"
              >
                <SettingsOutlinedIcon fontSize="small" />
              </button>
            )}

            <button
              onClick={() => navigate(profilePath)}
              className="hidden rounded-full outline-none ring-blue-200 transition-all focus-visible:ring-4 sm:block"
              title="Profile"
            >
              <Avatar
                alt={displayName}
                src={avatarUrl}
                sx={{
                  width: 34,
                  height: 34,
                  border: "2px solid #bfdbfe",
                  bgcolor: "#2563eb",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {getAvatarLetter(user?.fullName, user?.email)}
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};