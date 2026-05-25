import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NavbarLoggedin } from '@/components/layout/NavbarLoggedin';
import { SidebarLoggedin } from '@/components/layout/SidebarLoggedin';



import { EventsPage, EventDetailPage } from '@/features/events';
import { LeaderboardPage } from '@/features/ranking';
import { NotFoundPage } from '@/components/common/NotFoundPage';

import { CoordinatorDashboardPage, CoordinatorEventsPage } from '@/features/coordinator';
import { coordinatorSidebarItems } from '@/features/coordinator/configs/coordinatorSidebar.config';

// Layout shell: Navbar + <Outlet /> + Footer
const RootLayout = () => (
  <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
    <Navbar />
    <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-280px)]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Logged-in layout: NavbarLoggedin + Sidebar + Outlet
const LoggedinLayout = () => (
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

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <EventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
      { path: '/standings', element: <LeaderboardPage /> },
    ],
  },

  {
    element: <LoggedinLayout />,
    children: [
      { index: true, element: <Navigate to="/coordinator/dashboard" replace /> },
      { path: '/coordinator/dashboard', element: <CoordinatorDashboardPage /> },
      { path: '/coordinator/events', element: <CoordinatorEventsPage /> },
      { path: '/coordinator/teams', element: <NotFoundPage /> },
      { path: '/coordinator/submissions', element: <NotFoundPage /> },
      { path: '/coordinator/judging', element: <NotFoundPage /> },
      { path: '/coordinator/prizes', element: <NotFoundPage /> },
      { path: '/coordinator/analytics', element: <NotFoundPage /> },
      { path: '/coordinator/notifications', element: <NotFoundPage /> },
      { path: '/coordinator/schedule', element: <NotFoundPage /> },
      { path: '/coordinator/reports', element: <NotFoundPage /> },
      { path: '/coordinator/profile', element: <NotFoundPage /> },
      { path: '/coordinator/settings', element: <NotFoundPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);