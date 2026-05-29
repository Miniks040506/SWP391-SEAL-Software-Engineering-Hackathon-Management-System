import { createBrowserRouter, Navigate } from "react-router-dom";

import { EventsPage, EventDetailPage } from "@/features/events";
import { LeaderboardPage } from "@/features/ranking";
import { NotFoundPage } from "@/components/common/NotFoundPage";

import { CoordinatorCreateEventPage, CoordinatorDashboardPage, CoordinatorEventsPage, CoordinatorEditEventPage } from "@/features/coordinator";

import { RootLayout } from "@/components/layout/RootLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoggedinLayout } from "@/components/layout/LoggedinLayout";

import { ForgotPasswordPage, LoginPage, OAuthCallbackPage, RegisterPage, ResetPasswordPage, VerifyEmailPage, VerifyEmailSuccessPage } from "@/features/auth";


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
      { path: "/oauth/callback", element: <OAuthCallbackPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ]
  },
  
  {
    path: "/coordinator",
    element: <LoggedinLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <CoordinatorDashboardPage /> },
      { path: 'events', element: <CoordinatorEventsPage /> },
      { path: 'events/create', element: <CoordinatorCreateEventPage /> },
      { path: 'events/:id/edit', element: <CoordinatorEditEventPage /> },
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