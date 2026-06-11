import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "@/hooks/useAuth";

const publicExploreLinks = [
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

const Logo = ({ onClick }: { onClick: () => void }) => (
  <div
    className="flex cursor-pointer items-center gap-3 transition-transform active:scale-95 group"
    onClick={onClick}
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-2xl font-bold text-white shadow-xl shadow-blue-500/20 transition-transform group-hover:rotate-3">
      S
    </div>

    <div className="flex flex-col -space-y-1">
      <span className="text-xl font-bold italic tracking-tighter text-gray-900">
        SEAL
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Hackathon System
      </span>
    </div>
  </div>
);

const NavLinks = ({
  isActive,
  navigate,
  pathname,
  hash,
}: {
  isActive: (p: string) => boolean;
  navigate: (p: string) => void;
  pathname: string;
  hash: string;
}) => {
  const isExploreActive =
    pathname.startsWith("/events") ||
    publicExploreLinks.some((link) => {
      if (link.path.includes("#")) {
        const [targetPath, targetHash] = link.path.split("#");
        return (
          pathname === targetPath &&
          (hash === `#${targetHash}` || (targetHash === "dashboard" && !hash))
        );
      }

      return isActive(link.path);
    });

  const navigateTo = (path: string) => {
    navigate(path);

    if (!path.includes("#")) return;

    window.setTimeout(() => {
      document
        .getElementById(path.split("#")[1])
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="flex items-center">
      <div className="group relative">
        <button
          type="button"
          onClick={() => navigateTo("/events#dashboard")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            isExploreActive
              ? "bg-blue-50 text-blue-500"
              : "text-gray-500 hover:text-gray-900"
          }`}
          aria-haspopup="menu"
        >
          Explore
          <KeyboardArrowDownRoundedIcon
            fontSize="small"
            className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
          />
        </button>

        <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 translate-y-3 pt-3 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-blue-950/10 ring-1 ring-black/5">
            {publicExploreLinks.map((link) => {
              const Icon = link.icon;

              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigateTo(link.path)}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                    isActive(link.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950",
                  ].join(" ")}
                  role="menuitem"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon fontSize="small" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{link.label}</span>
                    <span className="block truncate text-xs font-medium text-gray-400">
                      {link.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const GuestActions = ({ navigate }: { navigate: (p: string) => void }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate("/login")}
      className="hidden text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 sm:block"
    >
      Sign In
    </button>

    <button
      onClick={() => navigate("/register")}
      className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-black active:translate-y-0.5"
    >
      Get Started
    </button>
  </div>
);

const AvatarMenu = ({
  fullName,
  role,
  onProfile,
  onLogout,
}: {
  fullName: string;
  role: string;
  onProfile: () => void;
  onLogout: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button type="button" onClick={() => setOpen((v) => !v)}>
        <Avatar
          alt={fullName}
          src=""
          sx={{
            width: 32,
            height: 32,
            border: "2px solid #bfdbfe",
            cursor: "pointer",
            bgcolor: "#3b82f6",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {fullName.charAt(0).toUpperCase()}
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-gray-900">
              {fullName}
            </p>
            <p className="mt-0.5 text-xs font-medium text-blue-500">{role}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onProfile();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <PersonOutlineOutlinedIcon fontSize="small" />
            Profile
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogoutOutlinedIcon fontSize="small" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

const AuthActions = ({
  navigate,
  fullName,
  role,
  onLogout,
  currentEventLabel,
}: {
  navigate: (p: string) => void;
  fullName: string;
  role: string;
  onLogout: () => void;
  currentEventLabel?: string | null;
}) => (
  <div className="flex items-center gap-3">
    {currentEventLabel && (
      <button
        type="button"
        onClick={() => navigate("/coordinator/events")}
        className="hidden rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-500 transition-colors hover:bg-blue-100 sm:block"
      >
        Current: {currentEventLabel}
      </button>
    )}

    <button
      type="button"
      onClick={() => navigate("/notifications")}
      className="hidden text-gray-500 transition-colors hover:text-gray-900 sm:flex"
    >
      <NotificationsNoneOutlinedIcon />
    </button>

    <button
      type="button"
      onClick={() => navigate("/settings")}
      className="hidden text-gray-500 transition-colors hover:text-gray-900 sm:flex"
    >
      <SettingsOutlinedIcon fontSize="small" />
    </button>

    <AvatarMenu
      fullName={fullName}
      role={role}
      onProfile={() => navigate("/personal")}
      onLogout={onLogout}
    />
  </div>
);

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path.includes("#")) {
      const [pathname, hash] = path.split("#");
      return (
        location.pathname === pathname &&
        (location.hash === `#${hash}` || (hash === "dashboard" && !location.hash))
      );
    }

    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/events", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        <Logo onClick={() => navigate("/")} />

        <div className="flex items-center gap-2 md:gap-8">
          <NavLinks
            isActive={isActive}
            navigate={navigate}
            pathname={location.pathname}
            hash={location.hash}
          />

          <div className="mx-2 hidden h-5 w-px bg-gray-200 sm:block" />

          {isAuthenticated && user ? (
            <AuthActions
              navigate={navigate}
              fullName={user.fullName || user.email}
              role={user.role || "PARTICIPANT"}
              onLogout={handleLogout}
              currentEventLabel={null}
            />
          ) : (
            <GuestActions navigate={navigate} />
          )}
        </div>
      </div>
    </nav>
  );
};
