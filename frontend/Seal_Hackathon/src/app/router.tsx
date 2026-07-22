import { createBrowserRouter, Navigate } from "react-router-dom";

import { NotFoundPage } from "@/components/common/NotFoundPage";
import { RouteErrorPage } from "@/components/common/RouteErrorPage";
import { AuthGuard } from "@/components/guards/AuthGuard";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoggedinLayout } from "@/components/layout/LoggedinLayout";
import { RootLayout } from "@/components/layout/RootLayout";

import { AuditLogsPage } from "../features/auditLog";
import { ExportJobListPage } from "../features/exports";

import {
  JudgeDashboardPage,
  JudgeSubmissionDetailPage,
  JudgeAssignedSubmissionPage,
  JudgeSubmissionsPage,
} from "@/features/judge";

import { JudgeScoreSheetPage } from "@/features/grading/pages/JudgeScoreSheetPage";

import {
  JudgeCalibrationListPage,
  JudgeCalibrationScorePage,
  CalibrationDistributionPage,
} from "@/features/calibration";

import {
  MentorDashboardPage,
  MentorSubmissionDetailPage,
  MentorSubmissionPage,
  MentorTeamsPage,
  MentorTeamDetailPage,
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
  EventAwardsPage,
  EventDetailPage,
  EventsPage,
} from "@/features/events";

import {
  CoordinatorRankingPage,
  CoordinatorRoundRankingPage,
  PublicEventLeaderboardPage,
  StandingsPage,
} from "@/features/ranking";

import { TeamDetailedScorePage } from "@/features/results/pages/TeamDetailedScorePage";
import { TeamPublishedScoresPage } from "@/features/results/pages/TeamPublishedScoresPage";

import {
  CoordinatorCreateEventPage,
  CoordinatorDashboardPage,
  CoordinatorEditEventPage,
  CoordinatorEventsPage,
  CoordinatorAnnouncementPage,
  CoordinatorAwardManagementPage,
  CoordinatorAwardsRedirectPage,
  CoordinatorPrizeSetupPage,
  CoordinatorPrizesRedirectPage,
} from "@/features/coordinator";

import {
  CoordinatorEventGradingProgressPage,
  CoordinatorRoundGradingProgressPage,
  CoordinatorJudgeAssignmentProgressPage,
  GradingProgressRedirectPage,
} from "@/features/grading-progress";

import {
  CreateTeamPage,
  EventCompetitionPage,
  InvitationResponsePage,
  JoinRequestResponsePage,
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
import { IntegrationOAuthCallbackPage } from "@/features/submissions/pages/IntegrationOAuthCallbackPage";

import {
  CoordinatorCalibrationPage,
  CalibrationRoundFormPage,
} from "@/features/calibration";

import { RoundAdvancementPage } from "@/features/advancement/pages/RoundAdvancementPage";
import { TeamAdvancementPage } from "@/features/advancement/pages/TeamAdvancementPage";

import { CoordinatorDisqualificationsPage } from "@/features/disqualification/pages/CoordinatorDisqualificationsPage";
import { ParticipantDisqualificationPage } from "@/features/disqualification/pages/ParticipantDisqualificationPage";
import { DisqualificationsRedirectPage } from "@/features/disqualification/pages/DisqualificationsRedirectPage";

import { ScoreVarianceDashboardPage } from "@/features/rbl/pages/ScoreVarianceDashboardPage";
import {
  AdminSystemConfigPage,
  AdminSystemHealthPage,
} from "@/features/system";
import { CoordinatorEventRemindersPage } from "@/features/reminders";
import {
  AdminAiKnowledgePage,
  AdminAiSafetyLogsPage,
} from "@/features/assistant";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <Navigate to="/events" replace /> },
      { path: "/events", element: <EventsPage /> },
      { path: "/explore", element: <Navigate to="/events" replace /> },
      {
        path: "/events/:eventId/competing",
        element: (
          <AuthGuard>
            <EventCompetitionPage />
          </AuthGuard>
        ),
      },
      { path: "/events/:eventId/awards", element: <EventAwardsPage /> },
      { path: "/events/:eventId", element: <EventDetailPage /> },
      { path: "/standings", element: <StandingsPage /> },
      {
        path: "/events/:eventId/leaderboard",
        element: <PublicEventLeaderboardPage />,
      },
      {
        path: "/events/:eventId/tracks/:trackId/leaderboard",
        element: <PublicEventLeaderboardPage />,
      },
    ],
  },

  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    path: "/verify-email/success",
    element: <VerifyEmailSuccessPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/oauth/callback", element: <OAuthCallbackPage /> },
      { path: "/personal", element: <PersonalProfilePage /> },
    ],
  },

  // Provider OAuth lands here inside a popup and closes itself, so it renders
  // bare — no layout chrome.
  {
    path: "/oauth/integration-callback",
    element: <IntegrationOAuthCallbackPage />,
    errorElement: <RouteErrorPage />,
  },

  {
    path: "/participant",
    element: (
      <AuthGuard>
        <RootLayout />
      </AuthGuard>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="teams" replace /> },
      { path: "teams", element: <MyTeamsPage /> },
      { path: "teams/create", element: <CreateTeamPage /> },
      { path: "teams/:teamId", element: <TeamDetailPage /> },
      {
        path: "teams/:teamId/advancement",
        element: <TeamAdvancementPage />,
      },
      {
        path: "teams/:teamId/scores",
        element: <TeamPublishedScoresPage />,
      },
      {
        path: "events/:eventId/competing",
        element: <EventCompetitionPage />,
      },
      {
        path: "teams/:teamId/submissions",
        element: <ParticipantSubmissionsPage />,
      },
      {
        path: "teams/:teamId/rounds/:roundId/submission",
        element: <SubmissionFormPage />,
      },
      {
        path: "teams/:teamId/rounds/:roundId/scores",
        element: <TeamDetailedScorePage />,
      },
      {
        path: "teams/:teamId/disqualification",
        element: <ParticipantDisqualificationPage />,
      },
      { path: "invitations", element: <MyInvitationsPage /> },
      { path: "notifications", element: <NotificationInboxPage /> },
    ],
  },

  {
    path: "/coordinator",
    element: <LoggedinLayout sectionRole="COORDINATOR" />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <CoordinatorDashboardPage /> },
      { path: "events", element: <CoordinatorEventsPage /> },
      { path: "events/create", element: <CoordinatorCreateEventPage /> },
      { path: "events/:eventId/edit", element: <CoordinatorEditEventPage /> },
      {
        path: "events/:eventId/prizes",
        element: <CoordinatorPrizeSetupPage />,
      },
      {
        path: "events/:eventId/awards",
        element: <CoordinatorAwardManagementPage />,
      },
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
      {
        path: "rounds/:roundId/advance-rules",
        element: <RoundAdvancementPage />,
      },
      {
        path: "rounds/:roundId/advancement",
        element: <RoundAdvancementPage />,
      },
      {
        path: "events/:eventId/grading-progress",
        element: <CoordinatorEventGradingProgressPage />,
      },
      {
        path: "events/:eventId/disqualifications",
        element: <CoordinatorDisqualificationsPage />,
      },
      {
        path: "disqualifications",
        element: <DisqualificationsRedirectPage />,
      },
      {
        path: "grading-progress",
        element: <GradingProgressRedirectPage />,
      },
      {
        path: "events/:eventId/rankings",
        element: <CoordinatorRankingPage />,
      },
      {
        path: "events/:eventId/variance-dashboard",
        element: <ScoreVarianceDashboardPage />,
      },
      {
        path: "events/:eventId/reminders",
        element: <CoordinatorEventRemindersPage />,
      },
      {
        path: "rounds/:roundId/rankings",
        element: <CoordinatorRoundRankingPage />,
      },
      {
        path: "rounds/:roundId/grading-progress",
        element: <CoordinatorRoundGradingProgressPage />,
      },
      {
        path: "judge-assignments/:assignmentId/progress",
        element: <CoordinatorJudgeAssignmentProgressPage />,
      },
      { path: "events/:eventId/view", element: <EventDetailPage /> },
      {
        path: "calibrations",
        element: <CoordinatorCalibrationPage />,
      },
      {
        path: "calibrations/create",
        element: <CalibrationRoundFormPage />,
      },
      {
        path: "events/:eventId/calibrations",
        element: <CoordinatorCalibrationPage />,
      },
      {
        path: "events/:eventId/calibrations/create",
        element: <CalibrationRoundFormPage />,
      },
      {
        path: "calibrations/:calibrationId",
        element: <CalibrationRoundFormPage />,
      },
      {
        path: "calibrations/:calibrationId/distribution",
        element: <CalibrationDistributionPage />,
      },
      {
        path: "calibrations/:calibrationId/edit",
        element: <CalibrationRoundFormPage />,
      },
      { path: "users", element: <CoordinatorUsersPage /> },
      { path: "teams", element: <CoordinatorTeamsPage /> },
      { path: "teams/:teamId", element: <CoordinatorTeamsPage /> },
      { path: "submissions", element: <CoordinatorSubmissionsPage /> },
      {
        path: "submissions/:submissionId",
        element: <CoordinatorSubmissionsPage />,
      },
      { path: "judging", element: <NotFoundPage /> },
      { path: "prizes", element: <CoordinatorPrizesRedirectPage /> },
      { path: "awards", element: <CoordinatorAwardsRedirectPage /> },
      { path: "criteria", element: <ScoringCriteriaManagementPage /> },
      { path: "analytics", element: <NotFoundPage /> },
      { path: "announcement", element: <CoordinatorAnnouncementPage /> },
      { path: "notifications", element: <NotificationInboxPage /> },
      { path: "schedule", element: <NotFoundPage /> },
      { path: "reminders", element: <CoordinatorEventRemindersPage /> },
      { path: "exports", element: <ExportJobListPage /> },
      { path: "events/:eventId/exports", element: <ExportJobListPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "auditLogs", element: <AuditLogsPage /> },
    ],
  },

  {
    path: "/admin",
    element: <LoggedinLayout sectionRole="ADMIN" />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "users/create", element: <NotFoundPage /> },
      { path: "users/:id", element: <NotFoundPage /> },
      { path: "users/:id/edit", element: <NotFoundPage /> },
      { path: "roles", element: <NotFoundPage /> },
      { path: "permissions", element: <NotFoundPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "auditLogs", element: <AuditLogsPage /> },
      { path: "notifications", element: <NotificationInboxPage /> },
      { path: "system-config", element: <AdminSystemConfigPage /> },
      { path: "health", element: <AdminSystemHealthPage /> },
      { path: "criteria", element: <ScoringCriteriaManagementPage /> },
      { path: "criteria/:id/edit", element: <ScoringCriteriaManagementPage /> },
      { path: "exports", element: <ExportJobListPage /> },
      { path: "ai/knowledge", element: <AdminAiKnowledgePage /> },
      { path: "ai/safety-logs", element: <AdminAiSafetyLogsPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
    ],
  },

  {
    path: "/judge",
    element: <LoggedinLayout sectionRole="JUDGE" />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <JudgeDashboardPage /> },
      { path: "events", element: <NotFoundPage /> },
      { path: "submissions", element: <JudgeAssignedSubmissionPage /> },
      {
        path: "rounds/:roundId/submissions",
        element: <JudgeAssignedSubmissionPage />,
      },
      {
        path: "submissions/:submissionId",
        element: <JudgeSubmissionDetailPage />,
      },
      {
        path: "submissions/:submissionId/score",
        element: <JudgeScoreSheetPage />,
      },
      { path: "scoring", element: <JudgeSubmissionsPage /> },
      { path: "calibrations", element: <JudgeCalibrationListPage /> },
      {
        path: "calibrations/:calibrationId",
        element: <Navigate to="score" replace />,
      },
      {
        path: "calibrations/:calibrationId/score",
        element: <JudgeCalibrationScorePage />,
      },
      {
        path: "calibrations/:calibrationId/distribution",
        element: <CalibrationDistributionPage />,
      },
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
      { path: "reminders", element: <CoordinatorEventRemindersPage /> },
    ],
  },

  {
    path: "/mentor",
    element: <LoggedinLayout sectionRole="MENTOR" />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <MentorDashboardPage /> },
      { path: "teams", element: <MentorTeamsPage /> },
      { path: "teams/:teamId", element: <MentorTeamDetailPage /> },
      { path: "teams/:teamId/scores", element: <TeamPublishedScoresPage /> },
      {
        path: "teams/:teamId/rounds/:roundId/scores",
        element: <TeamDetailedScorePage />,
      },
      { path: "submissions", element: <MentorSubmissionPage /> },
      {
        path: "submissions/:submissionId",
        element: <MentorSubmissionDetailPage />,
      },
      { path: "notifications", element: <NotificationInboxPage /> },
      { path: "profile", element: <PersonalProfilePage /> },
      { path: "settings", element: <NotFoundPage /> },
      { path: "schedule", element: <NotFoundPage /> },
      { path: "reminders", element: <CoordinatorEventRemindersPage /> },
    ],
  },

  {
    path: "/invitations/accept",
    element: <InvitationResponsePage action="accept" />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/invitations/reject",
    element: <InvitationResponsePage action="reject" />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/join-requests/accept",
    element: <JoinRequestResponsePage action="accept" />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/join-requests/reject",
    element: <JoinRequestResponsePage action="reject" />,
    errorElement: <RouteErrorPage />,
  },

  { path: "*", element: <NotFoundPage /> },
]);
