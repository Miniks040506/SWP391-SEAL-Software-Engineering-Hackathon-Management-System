import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export type SidebarLoggedinItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

type SidebarLoggedinProps = {
  items: SidebarLoggedinItem[];
  helpPath?: string;
  logoutPath?: string;
  onLogout?: () => void;
};

export const SidebarLoggedin = ({
  items,
  helpPath = '/help',
  logoutPath = '/login',
  onLogout,
}: SidebarLoggedinProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    navigate(logoutPath);
  };

  return (
    <aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span
                  className={`flex items-center ${
                    active
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-700'
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-100 px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(helpPath)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900"
        >
          <HelpOutlineOutlinedIcon fontSize="small" />
          Help
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogoutOutlinedIcon fontSize="small" />
          Logout
        </button>
      </div>
    </aside>
  );
};