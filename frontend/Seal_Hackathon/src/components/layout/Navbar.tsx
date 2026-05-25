import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useAuth } from '@/hooks/useAuth';

/* Shared logo */
const Logo = ({ onClick }: { onClick: () => void }) => (
  <div
    className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
    onClick={onClick}>
    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-3 transition-transform">
      S
    </div>
    <div className="flex flex-col -space-y-1">
      <span className="text-xl font-bold text-gray-900 tracking-tighter italic">SEAL</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Hackathon System
      </span>
    </div>
  </div>
);

/* Shared nav links */
const NavLinks = ({
  isActive,
  navigate,
}: {
  isActive: (p: string) => boolean;
  navigate: (p: string) => void;
}) => (
  <div className="flex items-center">
    <button
      onClick={() => navigate('/')}
      className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
        isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
      }`}>
      Explore
    </button>
    <button
      onClick={() => navigate('/standings')}
      className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
        isActive('/standings') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
      }`}>
      Standings
    </button>
  </div>
);

/* Guest actions */
const GuestActions = ({ navigate }: { navigate: (p: string) => void }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate('/login')}
      className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
      Sign In
    </button>
    <button
      onClick={() => navigate('/register')}
      className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-md active:translate-y-0.5">
      Get Started
    </button>
  </div>
);

/* Avatar dropdown */
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen((v) => !v)}>
        <Avatar
          alt={fullName}
          src=""
          sx={{ width: 32, height: 32, border: '2px solid #bbf7d0', cursor: 'pointer' }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {/* User info */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
            <p className="text-xs text-blue-500 font-medium mt-0.5">{role}</p>
          </div>

          {/* Menu items */}
          <button
            onClick={() => { setOpen(false); onProfile(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <PersonOutlineOutlinedIcon fontSize="small" />
            Profile
          </button>

          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogoutOutlinedIcon fontSize="small" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

/* Auth actions */
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
        onClick={() => navigate('/coordinator/events')}
        className="hidden sm:block rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors">
        Current: {currentEventLabel}
      </button>
    )}

    <button
      onClick={() => navigate('/notifications')}
      className="hidden sm:flex text-gray-500 hover:text-gray-900 transition-colors">
      <NotificationsNoneOutlinedIcon />
    </button>

    <button
      onClick={() => navigate('/settings')}
      className="hidden sm:flex text-gray-500 hover:text-gray-900 transition-colors">
      <SettingsOutlinedIcon fontSize="small" />
    </button>

    <AvatarMenu
      fullName={fullName}
      role={role}
      onProfile={() => navigate('/personal')}
      onLogout={onLogout}
    />
  </div>
);

/* Navbar */
export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-16 flex items-center shadow-sm">
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
        <Logo onClick={() => navigate('/')} />

        <div className="flex items-center gap-2 md:gap-8">
          <NavLinks isActive={isActive} navigate={navigate} />

          <div className="w-px h-5 bg-gray-200 mx-2 hidden sm:block" />

          {isAuthenticated && user ? (
            <AuthActions
              navigate={navigate}
              fullName={user.fullName}
              role={user.role}
              onLogout={handleLogout}
              currentEventLabel={null} // TODO: wire to active event from store/API
            />
          ) : (
            <GuestActions navigate={navigate} />
          )}
        </div>
      </div>
    </nav>
  );
};