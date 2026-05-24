import { Outlet, Link, useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

export const CoordinatorLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">S</div>
              <div>
                <h2 className="font-bold text-gray-900 italic tracking-tight leading-none text-lg">SEAL LEAGUE</h2>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="hidden md:flex items-center gap-2 px-8 border-l border-gray-200 h-8">
              <Link to="/coordinator" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPath === '/coordinator' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                Dashboard
              </Link>
              <Link to="/coordinator/events" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPath.includes('/events') ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                Event Management
              </Link>
              <Link to="/coordinator/audit" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPath.includes('/audit') ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                Audit Log
              </Link>
            </nav>
          </div>

          {/* Right Icons (Đã fix sang MUI) */}
          <div className="flex items-center gap-5 shrink-0">
            <span className="text-sm font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">Current: Spring 2024</span>
            <NotificationsIcon style={{ fontSize: 20 }} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"/>
            <SettingsIcon style={{ fontSize: 20 }} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"/>
            {/* Avatar Placeholder */}
            <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 cursor-pointer"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};