import { createBrowserRouter, Navigate } from "react-router-dom";

import { NotFoundPage } from "@/components/common/NotFoundPage";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoggedinLayout } from "@/components/layout/LoggedinLayout";
import { RootLayout } from "@/components/layout/RootLayout";

import {
  JudgeDashboardPage,
  JudgeSubmissionDetailPage,
  JudgeSubmissionsPage,
} from "@/features/judge";

import {
  MentorDashboardPage,
  MentorSubmissionDetailPage,
  MentorSubmissionPage,
  MentorTeamsPage,
} from "@/features/mentor";

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
  CoordinatorAnnouncementPage,
} from "@/features/coordinator";

import {
  CreateTeamPage,
  InvitationResponsePage,
  MyInvitationsPage,
  MyTeamsPage,
  TeamDetailPage,
} from "@/features/teams";

import { CoordinatorUsersPage } from "@/features/coordinator/pages/CoordinatorUsersPage";

import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { PersonalProfilePage } from "@/features/profile";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { EventCriteriaManagementPage } from "@/features/criteria/pages/EventCriteriaManagementPage";
import { EventCriteriaViewPage } from "@/features/criteria/pages/EventCriteriaViewPage";
import { ScoringCriteriaManagementPage } from "@/features/criteria/pages/ScoringCriteriaManagementPage";
import { CoordinatorSubmissionsPage } from "@/features/submissions/pages/CoordinatorSubmissionsPage";
import { CoordinatorTeamsPage } from "@/features/teams";
import { ParticipantSubmissionsPage } from "@/features/submissions/pages/ParticipantSubmissionsPage";
import { NotificationInboxPage } from "@/features/notification";
import { SubmissionFormPage } from "@/features/submissions/pages/SubmissionFormPage";

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
    path: "/participant",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="teams" replace /> },
      { path: "teams", element: <MyTeamsPage /> },
      { path: "teams/create", element: <CreateTeamPage /> },
      { path: "teams/:teamId", element: <TeamDetailPage /> },
      { path: "teams/:teamId/submissions", element: <ParticipantSubmissionsPage /> },
      { path: "teams/:teamId/rounds/:roundId/submission", element: <SubmissionFormPage /> },
      { path: "invitations", element: <MyInvitationsPage /> },
      { path: "notifications", element: <NotificationInboxPage /> },
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
      {
        path: "events/:eventId/criteria",
        element: <EventCriteriaManagementPage />,
      },
      {
        path: "events/:eventId/criteria/view",
        element: <EventCriteriaViewPage mode="EVENT" />,
      },
      {
        path: "rounds/:roundId/criteria",
        element: <EventCriteriaViewPage mode="ROUND" />,
      },
      { path: "events/:eventId/view", element: <EventDetailPage /> },
      { path: "users", element: <CoordinatorUsersPage /> },
      { path: "teams", element: <CoordinatorTeamsPage /> },
      { path: "teams/:teamId", element: <CoordinatorTeamsPage /> },
      { path: "submissions", element: <CoordinatorSubmissionsPage /> },
      {
        path: "submissions/:submissionId",
        element: <CoordinatorSubmissionsPage />,
      },
      { path: "judging", element: <NotFoundPage /> },
      { path: "prizes", element: <NotFoundPage /> },
      { path: "criteria", element: <ScoringCriteriaManagementPage /> },
      { path: "analytics", element: <NotFoundPage /> },
      { path: "announcement", element: <CoordinatorAnnouncementPage /> },
      { path: "notifications", element: <NotificationInboxPage /> },
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
      { path: "notifications", element: <NotificationInboxPage /> },
      { path: "system-config", element: <NotFoundPage /> },
      { path: "health", element: <NotFoundPage /> },
      { path: "criteria", element: <ScoringCriteriaManagementPage /> },
      { path: "criteria/:id/edit", element: <ScoringCriteriaManagementPage /> },
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
      { path: "submissions", element: <JudgeSubmissionsPage /> },
      { path: "submissions/:submissionId", element: <JudgeSubmissionDetailPage /> },
      { path: "scoring", element: <NotFoundPage /> },
      { path: "calibration", element: <NotFoundPage /> },
      {
        path: "rounds/:roundId/criteria",
        element: <EventCriteriaViewPage mode="ROUND" />,
      },
      {
        path: "events/:eventId/criteria",
        element: <EventCriteriaViewPage mode="EVENT" />,
      },
      { path: "notifications", element: <NotificationInboxPage /> },
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
      { path: "teams", element: <MentorTeamsPage /> },
      { path: "feedback", element: <NotFoundPage /> },
      { path: "submissions", element: <MentorSubmissionPage /> },
      { path: "submissions/:submissionId", element: <MentorSubmissionDetailPage /> },
      { path: "notifications", element: <NotificationInboxPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
      { path: "schedule", element: <NotFoundPage /> },
    ],
  },

  { path: "/invitations/accept", element: <InvitationResponsePage action="accept" /> },
  { path: "/invitations/reject", element: <InvitationResponsePage action="reject" /> },

  { path: "*", element: <NotFoundPage /> },
]);
