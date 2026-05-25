import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-16 flex items-center shadow-sm">
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-3 transition-transform">
            S
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-bold text-gray-900 tracking-tighter italic">SEAL</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hackathon System</span>
          </div>
        </div>

        {/* Nav links + auth */}
        <div className="flex items-center gap-2 md:gap-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => navigate('/standings')}
              className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/standings') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Standings
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200 mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-md active:translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
};
