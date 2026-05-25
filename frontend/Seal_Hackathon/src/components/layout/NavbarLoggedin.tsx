import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

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

export const NavbarLoggedin = ({
  homePath,
  currentEventLabel = 'Current: Spring 2024',
  navLinks = [],
  notificationPath,
  settingsPath,
  profilePath,
}: NavbarLoggedinProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-16 flex items-center shadow-sm">
<div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">        
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
          onClick={() => navigate(homePath)}
        >
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-3 transition-transform">
            S
          </div>

          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-bold text-gray-900 tracking-tighter italic">
              SEAL
            </span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
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
                className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${isActive(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(homePath)}
              className="hidden sm:block rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              {currentEventLabel}
            </button>

            {notificationPath && (
              <button
                onClick={() => navigate(notificationPath)}
                className="hidden sm:flex text-gray-500 hover:text-gray-900 transition-colors"
              >
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </button>
            )}

            {settingsPath && (
              <button
                onClick={() => navigate(settingsPath)}
                className="hidden sm:flex text-gray-500 hover:text-gray-900 transition-colors"
              >
                <SettingsOutlinedIcon fontSize="small" />
              </button>
            )}

            {profilePath && (
              <button
                onClick={() => navigate(profilePath)}
                className="hidden sm:block"
              >
                <Avatar
                  alt="User Avatar"
                  src=""
                  sx={{
                    width: 32,
                    height: 32,
                    border: '2px solid #bbf7d0',
                    bgcolor: '#2563eb',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  U
                </Avatar>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
