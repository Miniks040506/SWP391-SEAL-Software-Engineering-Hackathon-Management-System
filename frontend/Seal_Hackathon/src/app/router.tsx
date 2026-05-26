import { createBrowserRouter, Navigate } from "react-router-dom";

import { EventsPage, EventDetailPage } from "@/features/events";
import { LeaderboardPage } from "@/features/ranking";
import { NotFoundPage } from "@/components/common/NotFoundPage";

import { CoordinatorDashboardPage, CoordinatorEventsPage } from "@/features/coordinator";

import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { VerifyEmailSuccessPage } from "@/features/auth/pages/VerifyEmailSuccessPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { CoordinatorCreateEventPage } from "@/features/coordinator/pages/CoordinatorCreateEventPage";

import { RootLayout } from "@/components/layout/RootLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoggedinLayout } from "@/components/layout/LoggedinLayout";


export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Navigate to="/events" replace /> },
      { path: "/events", element: <EventsPage /> },
      { path: "/events/:id", element: <EventDetailPage /> },
      { path: "/standings", element: <LeaderboardPage /> },
    ],
  },
  
  {
    element: <AuthLayout />,
    children: [
      //AUTH ROUTES
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/verify-email/success", element: <VerifyEmailSuccessPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/oauth/callback", element: <NotFoundPage /> },
      { path: "/forgot-password", element: <NotFoundPage /> },
      { path: "/reset-password/code", element: <NotFoundPage /> },
      { path: "/reset-password/new", element: <NotFoundPage /> },
            
      { path: '/coordinator/events/create', element: <CoordinatorCreateEventPage /> },

    ]
  },
  
  {
    path: "/coordinator",
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

  { path: "*", element: <NotFoundPage /> },
]);