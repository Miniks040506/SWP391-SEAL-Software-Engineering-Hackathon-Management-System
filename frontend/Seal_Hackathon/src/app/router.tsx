import { createBrowserRouter, Navigate } from "react-router-dom";

import { NotFoundPage } from "@/components/common/NotFoundPage";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoggedinLayout } from "@/components/layout/LoggedinLayout";
import { RootLayout } from "@/components/layout/RootLayout";

import { JudgeDashboardPage } from "@/features/judge";

import { MentorDashboardPage } from "@/features/mentor";

import {
  ForgotPasswordPage,
  LoginPage,
  OAuthCallbackPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
  VerifyEmailSuccessPage,
} from "@/features/auth";

import {
  EventDetailPage,
  EventPrizesPage,
  EventsPage,
} from "@/features/events";

import { LeaderboardPage } from "@/features/ranking";

import {
  CoordinatorCreateEventPage,
  CoordinatorDashboardPage,
  CoordinatorEditEventPage,
  CoordinatorEventsPage,
} from "@/features/coordinator";

import { CoordinatorUsersPage } from "@/features/coordinator/pages/CoordinatorUsersPage";

import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { PersonalProfilePage } from "@/features/profile";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Navigate to="/events" replace /> },
      { path: "/events", element: <EventsPage /> },
      { path: "/explore", element: <EventsPage /> },
      { path: "/events/:eventId/prizes", element: <EventPrizesPage /> },
      { path: "/events/:eventId", element: <EventDetailPage /> },
      { path: "/standings", element: <LeaderboardPage /> },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/verify-email/success", element: <VerifyEmailSuccessPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/oauth/callback", element: <OAuthCallbackPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/personal", element: <PersonalProfilePage /> },
    ],
  },

  {
    path: "/coordinator",
    element: <LoggedinLayout sectionRole="COORDINATOR" />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <CoordinatorDashboardPage /> },
      { path: "events", element: <CoordinatorEventsPage /> },
      { path: "events/create", element: <CoordinatorCreateEventPage /> },
      { path: "events/:eventId/edit", element: <CoordinatorEditEventPage /> },
      { path: "events/:eventId/view", element: <EventDetailPage /> },
      { path: "users", element: <CoordinatorUsersPage /> },
      { path: "teams", element: <NotFoundPage /> },
      { path: "submissions", element: <NotFoundPage /> },
      { path: "judging", element: <NotFoundPage /> },
      { path: "prizes", element: <NotFoundPage /> },
      { path: "criteria", element: <NotFoundPage /> },
      { path: "analytics", element: <NotFoundPage /> },
      { path: "notifications", element: <NotFoundPage /> },
      { path: "schedule", element: <NotFoundPage /> },
      { path: "reports", element: <NotFoundPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
    ],
  },

  {
    path: "/admin",
    element: <LoggedinLayout sectionRole="ADMIN" />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
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
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
    ],
  },

  {
    path: "/judge",
    element: <LoggedinLayout sectionRole="JUDGE" />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <JudgeDashboardPage /> },
      { path: "events", element: <NotFoundPage /> },
      { path: "submissions", element: <NotFoundPage /> },
      { path: "scoring", element: <NotFoundPage /> },
      { path: "calibration", element: <NotFoundPage /> },
      { path: "notifications", element: <NotFoundPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
      { path: "schedule", element: <NotFoundPage /> },
    ],
  },

  {
    path: "/mentor",
    element: <LoggedinLayout sectionRole="MENTOR" />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <MentorDashboardPage /> },
      { path: "teams", element: <NotFoundPage /> },
      { path: "feedback", element: <NotFoundPage /> },
      { path: "submissions", element: <NotFoundPage /> },
      { path: "notifications", element: <NotFoundPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
      { path: "schedule", element: <NotFoundPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);