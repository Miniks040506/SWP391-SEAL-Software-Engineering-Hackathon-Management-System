import { useLocation, useNavigate } from "react-router-dom";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import { AppLogo } from "@/components/layout/AppLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useAuthStore } from "@/stores/authStore";
import { getRoleRedirectPath } from "@/utils/roleRedirect";

type NavbarLink = {
  label: string;
  path: string;
};

type AppNavbarProps = {
  navLinks?: NavbarLink[];
  homePath?: string;
  notificationPath?: string;
  settingsPath?: string;
  profilePath?: string;
  currentEventLabel?: string | null;
  maxWidthClassName?: string;
};

const publicNavLinks: NavbarLink[] = [
  { label: "Explore", path: "/events" },
  { label: "Standings", path: "/standings" },
];

export function AppNavbar({
  navLinks = publicNavLinks,
  homePath,
  notificationPath,
  settingsPath,
  profilePath,
  currentEventLabel,
  maxWidthClassName = "max-w-6xl",
}: AppNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutMutation = useLogoutMutation();

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isAuthenticated = Boolean(user && accessToken);

  const isActive = (path: string) => {
    if (path === "/events") {
      return location.pathname === "/" || location.pathname.startsWith("/events");
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogoClick = () => {
    if (isAuthenticated && user) {
      navigate(homePath || getRoleRedirectPath(user));
      return;
    }

    navigate("/events");
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      clearAuth();
      navigate("/events", { replace: true });
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div
        className={[
          "mx-auto flex w-full items-center justify-between px-6",
          maxWidthClassName,
        ].join(" ")}
      >
        <AppLogo onClick={handleLogoClick} />

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                  isActive(link.path)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="mx-1 hidden h-5 w-px bg-gray-200 dark:bg-slate-800 sm:block" />

          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {currentEventLabel && (
                <button
                  type="button"
                  onClick={() => homePath && navigate(homePath)}
                  className="hidden rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 sm:block"
                >
                  {currentEventLabel}
                </button>
              )}

              {notificationPath && (
                <button
                  type="button"
                  onClick={() => navigate(notificationPath)}
                  className="hidden text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-white sm:flex"
                >
                  <NotificationsNoneOutlinedIcon fontSize="small" />
                </button>
              )}

              {settingsPath && (
                <button
                  type="button"
                  onClick={() => navigate(settingsPath)}
                  className="hidden text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-white sm:flex"
                >
                  <SettingsOutlinedIcon fontSize="small" />
                </button>
              )}

              <UserAvatarMenu
                user={user}
                profilePath={profilePath}
                settingsPath={settingsPath}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="hidden text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-white sm:block"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-black active:translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}