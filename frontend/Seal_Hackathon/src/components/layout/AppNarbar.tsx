import { useLocation, useNavigate } from "react-router-dom";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
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

type ExploreLink = NavbarLink & {
  description: string;
  icon: typeof DashboardOutlinedIcon;
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

const publicNavLinks: NavbarLink[] = [{ label: "Explore", path: "/events" }];

const publicExploreLinks: ExploreLink[] = [
  {
    label: "Dashboard",
    path: "/events#dashboard",
    description: "Season overview",
    icon: DashboardOutlinedIcon,
  },
  {
    label: "Standings",
    path: "/standings",
    description: "Public rankings",
    icon: LeaderboardOutlinedIcon,
  },
  {
    label: "Teams",
    path: "/events#teams",
    description: "Registration flow",
    icon: GroupsOutlinedIcon,
  },
  {
    label: "Projects",
    path: "/events#projects",
    description: "Scoring model",
    icon: RocketLaunchOutlinedIcon,
  },
  {
    label: "Schedule",
    path: "/events#schedule",
    description: "Season rounds",
    icon: CalendarMonthOutlinedIcon,
  },
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
  const isPublicNavigation = navLinks === publicNavLinks;

  const isActive = (path: string) => {
    if (path.includes("#")) {
      const [pathname, hash] = path.split("#");
      return (
        location.pathname === pathname &&
        (location.hash === `#${hash}` || (hash === "dashboard" && !location.hash))
      );
    }

    if (path === "/events") {
      return location.pathname === "/" || location.pathname.startsWith("/events");
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const scrollToHash = (path: string) => {
    if (!path.includes("#")) return;

    window.setTimeout(() => {
      document
        .getElementById(path.split("#")[1])
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handlePublicNavigate = (path: string) => {
    navigate(path);
    scrollToHash(path);
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

  const dashboardPath =
    isAuthenticated && user
      ? homePath || getRoleRedirectPath(user)
      : "/events#dashboard";

  const exploreLinks = publicExploreLinks.map((link) =>
    link.label === "Dashboard" ? { ...link, path: dashboardPath } : link,
  );

  const isExploreActive =
    location.pathname.startsWith("/events") ||
    exploreLinks.some((link) => isActive(link.path));

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
            {isPublicNavigation ? (
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => handlePublicNavigate("/events#dashboard")}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                    isExploreActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
                      : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white",
                  ].join(" ")}
                  aria-haspopup="menu"
                >
                  Explore
                  <KeyboardArrowDownRoundedIcon
                    fontSize="small"
                    className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                </button>

                <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 translate-y-3 pt-3 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-blue-950/10 ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 dark:ring-white/10">
                    {exploreLinks.map((link) => {
                      const Icon = link.icon;

                      return (
                        <button
                          key={`${link.label}-${link.path}`}
                          type="button"
                          onClick={() => handlePublicNavigate(link.path)}
                          className={[
                            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                            isActive(link.path)
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                          ].join(" ")}
                          role="menuitem"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                            <Icon fontSize="small" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">
                              {link.label}
                            </span>
                            <span className="block truncate text-xs font-medium text-gray-400 dark:text-slate-500">
                              {link.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              navLinks.map((link) => (
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
              ))
            )}
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
