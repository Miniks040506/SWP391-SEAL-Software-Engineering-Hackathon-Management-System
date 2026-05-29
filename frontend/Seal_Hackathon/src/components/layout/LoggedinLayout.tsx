// Logged-in layout

import { Outlet } from 'react-router-dom';

import { NavbarLoggedin } from './NavbarLoggedin';
import { SidebarLoggedin } from './SidebarLoggedin';
import { coordinatorSidebarItems } from "./coordinatorSidebar.config";

export const LoggedinLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      <NavbarLoggedin
        homePath="/coordinator/dashboard"
        currentEventLabel="Current: Spring 2024"
        notificationPath="/coordinator/notifications"
        settingsPath="/coordinator/settings"
        profilePath="/coordinator/profile"
      />

      <SidebarLoggedin items={coordinatorSidebarItems} />

      <main className="ml-64 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};