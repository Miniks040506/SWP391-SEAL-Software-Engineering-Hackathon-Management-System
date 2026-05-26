import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RootLayout } from '@/components/layout/RootLayout';
import { LoggedinLayout } from '@/components/layout/LoggedinLayout';

import { EventsPage, EventDetailPage } from '@/features/events';
import { LeaderboardPage } from '@/features/ranking';
import { NotFoundPage } from '@/components/common/NotFoundPage';

import {
  CoordinatorDashboardPage,
  CoordinatorEventsPage,
  CoordinatorCreateEventPage
} from '@/features/coordinator';

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
      { path: 'events/create', element: <CoordinatorCreateEventPage /> },
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