import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { useThemeStore } from "@/stores/themeStore";
// import { ThemeTransitionLayer } from "./themeTransitionLayer";
import { AppNavbar } from "./AppNarbar";

export function RootLayout() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const location = useLocation();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-[#020617] dark:text-slate-100">
      {/* <ThemeTransitionLayer /> */}

      <AppNavbar />

      <main className="mx-auto min-h-[calc(100vh-280px)] max-w-6xl px-6 py-12 pb-20 md:py-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}