import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { useThemeStore } from "@/stores/themeStore";
// import { ThemeTransitionLayer } from "./themeTransitionLayer";
import { AppNavbar } from "./AppNarbar";
import { useAuthStore } from "@/stores/authStore";
import { getPrimaryRole } from "@/utils/roleRedirect";
import type { AuthUser } from "@/types/auth.types";

function getNotificationPath(user: AuthUser | null) {
  const role = user ? getPrimaryRole(user) : null;
  if (!role) return undefined;
  if (role === "ADMIN") return "/admin/notifications";
  if (role === "COORDINATOR") return "/coordinator/notifications";
  if (role === "JUDGE") return "/judge/notifications";
  if (role === "MENTOR") return "/mentor/notifications";
  return "/participant/notifications";
}

export function RootLayout() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-[#020617] dark:text-slate-100">
      {/* <ThemeTransitionLayer /> */}

      <AppNavbar notificationPath={getNotificationPath(user)} />

      <main className="mx-auto min-h-[calc(100vh-280px)] max-w-6xl px-6 py-12 pb-20 md:py-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}