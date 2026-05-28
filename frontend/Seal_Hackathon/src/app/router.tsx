import { createBrowserRouter, Navigate } from "react-router-dom";

import { EventsPage, EventDetailPage } from "@/features/events";
import { LeaderboardPage } from "@/features/ranking";
import { NotFoundPage } from "@/components/common/NotFoundPage";

import {
  CoordinatorCreateEventPage,
  CoordinatorDashboardPage,
  CoordinatorEventsPage,
  CoordinatorEditEventPage,
} from "@/features/coordinator";

import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { VerifyEmailSuccessPage } from "@/features/auth/pages/VerifyEmailSuccessPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";

import { RootLayout } from "@/components/layout/RootLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoggedinLayout } from "@/components/layout/LoggedinLayout";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { OAuthCallbackPage } from "@/features/auth/pages/OAuthCallbackPage";

import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";

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
    ],
  },

  {
    path: "/coordinator",
    element: <LoggedinLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <CoordinatorDashboardPage /> },
      { path: "events", element: <CoordinatorEventsPage /> },
      { path: "events/create", element: <CoordinatorCreateEventPage /> },
      { path: "events/:id/edit", element: <CoordinatorEditEventPage /> },
      { path: "events/:id/view", element: <EventDetailPage /> },
      { path: "teams", element: <NotFoundPage /> },
      { path: "submissions", element: <NotFoundPage /> },
      { path: "judging", element: <NotFoundPage /> },
      { path: "prizes", element: <NotFoundPage /> },
      { path: "analytics", element: <NotFoundPage /> },
      { path: "notifications", element: <NotFoundPage /> },
      { path: "schedule", element: <NotFoundPage /> },
      { path: "reports", element: <NotFoundPage /> },
      { path: "profile", element: <NotFoundPage /> },
      { path: "settings", element: <NotFoundPage /> },
    ],
  },

  {
  path: "/admin",
  element: <LoggedinLayout />,
  children: [
    { index: true, element: <Navigate to="users" replace /> },
    { path: "dashboard", element: <Navigate to="../users" replace /> },
    { path: "users", element: <AdminUsersPage /> },
    { path: "users/create", element: <NotFoundPage /> },
    { path: "users/:id", element: <NotFoundPage /> },
    { path: "users/:id/edit", element: <NotFoundPage /> },
    { path: "roles", element: <NotFoundPage /> },
    { path: "permissions", element: <NotFoundPage /> },
    { path: "audit-logs", element: <NotFoundPage /> },
    { path: "system-config", element: <NotFoundPage /> },
    { path: "health", element: <NotFoundPage /> },
    { path: "criteria", element: <NotFoundPage /> },
    { path: "criteria/:id/edit", element: <NotFoundPage /> },
    { path: "exports", element: <NotFoundPage /> },
    { path: "profile", element: <NotFoundPage /> },
    { path: "settings", element: <NotFoundPage /> },
  ],
},

  { path: "*", element: <NotFoundPage /> },
]);
