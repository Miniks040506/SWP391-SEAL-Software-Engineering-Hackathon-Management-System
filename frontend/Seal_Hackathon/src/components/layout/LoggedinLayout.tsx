import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { SidebarLoggedin } from "@/components/layout/SidebarLoggedin";
import {
  getRoleLayoutConfig,
  type RoleLayoutConfig,
} from "@/components/layout/sidebar.config";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import type { UserRole } from "@/types/auth.types";
import { getPrimaryRole } from "@/utils/roleRedirect";
// import { ThemeTransitionLayer } from "./themeTransitionLayer";
import { AppNavbar } from "./AppNarbar";
import { AssistantWidget } from "@/features/assistant";

type LoggedinLayoutProps = {
  sectionRole: UserRole;
};

function canUseSection(userRole: UserRole | null, sectionRole: UserRole) {
  if (!userRole) return false;
  if (userRole === "ADMIN") return true;

  return userRole === sectionRole;
}

export function LoggedinLayout({ sectionRole }: LoggedinLayoutProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const location = useLocation();

  const storedUser = useAuthStore((state) => state.user);
  const storedAccessToken = useAuthStore((state) => state.accessToken);

  const devUser =
    import.meta.env.DEV
      ? {
          userId: "dev-user-id",
          email: "dev@seal.local",
          fullName: "Dev ADMIN",
          role: "ADMIN" as const,
          roles: ["ADMIN" as const],
          status: "ACTIVE",
        }
      : null;

  const user = storedUser ?? devUser;
  const accessToken = storedAccessToken ?? (import.meta.env.DEV ? "dev-token" : null);
  

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getPrimaryRole(user);

  if (!canUseSection(userRole, sectionRole)) {
    return <Navigate to="/events" replace />;
  }

  const layoutConfig = getRoleLayoutConfig(sectionRole) as RoleLayoutConfig;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 dark:bg-[#020617] dark:text-slate-100">
      {/* <ThemeTransitionLayer /> */}

      <AppNavbar
        homePath={layoutConfig.homePath}
        notificationPath={layoutConfig.notificationPath}
        settingsPath={layoutConfig.settingsPath}
        profilePath={layoutConfig.profilePath}
        currentEventLabel={sectionRole === "COORDINATOR" ? "Current Event" : null}
        maxWidthClassName="max-w-none"
      />

      <SidebarLoggedin sections={layoutConfig.sidebar} />

      <main className="ml-64 px-8 py-8 pb-20">
        <Outlet />
      </main>

      <AssistantWidget />
    </div>
  );
}