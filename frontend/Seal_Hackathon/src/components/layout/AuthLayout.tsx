import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import BottomBar from "@/components/layout/BottomBar";
import { useThemeStore } from "@/stores/themeStore";
// import { ThemeTransitionLayer } from "./themeTransitionLayer";
import { AppNavbar } from "./AppNarbar";

export function AuthLayout() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-[#020617] dark:text-slate-100">
      {/* <ThemeTransitionLayer /> */}

      <AppNavbar />

      <main className="mx-auto min-h-[calc(100vh-280px)] max-w-6xl px-6 py-12 md:py-16">
        <Outlet />
      </main>

      <footer className="bg-gray-50/40 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6">
          <BottomBar />
        </div>
      </footer>
    </div>
  );
}