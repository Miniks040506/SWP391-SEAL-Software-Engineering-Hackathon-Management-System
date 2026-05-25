import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NavbarLoggedin } from '@/components/layout/NavbarLoggedin';
import { SidebarLoggedin } from '@/components/layout/SidebarLoggedin';

import { EventsPage, EventDetailPage } from '@/features/events';
import { LeaderboardPage } from '@/features/ranking';
import { NotFoundPage } from '@/components/common/NotFoundPage';

import {
  CoordinatorDashboardPage,
  CoordinatorEventsPage,
} from '@/features/coordinator';

import { coordinatorSidebarItems } from '@/features/coordinator/configs/coordinatorSidebar.config';

// Public layout
const RootLayout = () => (
  <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
    <Navbar />

    <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-280px)]">
      <Outlet />
    </main>

    <Footer />
  </div>
);

// Logged-in layout
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
    path: '/coordinator',
    element: <LoggedinLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <CoordinatorDashboardPage /> },
      { path: 'events', element: <CoordinatorEventsPage /> },
      { path: 'teams', element: <NotFoundPage /> },
      { path: 'submissions', element: <NotFoundPage /> },
      { path: 'judging', element: <NotFoundPage /> },
      { path: 'prizes', element: <NotFoundPage /> },
      { path: 'analytics', element: <NotFoundPage /> },
      { path: 'notifications', element: <NotFoundPage /> },
      { path: 'schedule', element: <NotFoundPage /> },
      { path: 'reports', element: <NotFoundPage /> },
      { path: 'profile', element: <NotFoundPage /> },
      { path: 'settings', element: <NotFoundPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);