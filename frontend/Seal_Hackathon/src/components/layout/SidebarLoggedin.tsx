import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useLocation, useNavigate } from "react-router-dom";

import type { SidebarSection } from "@/components/layout/sidebar.config";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useAuthStore } from "@/stores/authStore";

type SidebarLoggedinProps = {
  sections: SidebarSection[];
  helpPath?: string;
};

export function SidebarLoggedin({
  sections,
  helpPath = "/help",
}: SidebarLoggedinProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutMutation = useLogoutMutation();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
    <aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.title || sectionIndex}>
              {section.title && (
                <div className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-slate-600">
                  {section.title}
                </div>
              )}

              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const active = isActive(item.path, item.end);

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={[
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                        active
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex items-center",
                          active
                            ? "text-blue-600 dark:text-blue-300"
                            : "text-gray-400 group-hover:text-gray-700 dark:text-slate-500 dark:group-hover:text-white",
                        ].join(" ")}
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-gray-100 px-4 py-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigate(helpPath)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <HelpOutlineOutlinedIcon fontSize="small" />
          Help
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogoutOutlinedIcon fontSize="small" />
          Logout
        </button>
      </div>
    </aside>
  );
}