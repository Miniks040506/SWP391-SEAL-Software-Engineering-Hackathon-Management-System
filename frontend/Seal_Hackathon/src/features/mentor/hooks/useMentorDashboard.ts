import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/api/user.api";
import { trackApi } from "@/api/track.api";
import { scheduleApi } from "@/api/schedule.api";

import { mentorDashboardMock, type MentorDashboardData } from "../mocks/mentorDashboard.mock";

const USE_MOCK = false;

export function useMentorDashboard() {
  const navigate = useNavigate();

  // --- Profile ---
  const profileQuery = useQuery({
    queryKey: ["mentor-dashboard-profile"],
    queryFn: () => userApi.getMyProfile(),
    enabled: !USE_MOCK,
  });

  // --- Assigned tracks ---
  const myTracksQuery = useQuery({
    queryKey: ["mentor-my-tracks"],
    queryFn: () => trackApi.getMyAssignedTracks(),
    enabled: !USE_MOCK,
  });
  const myTracks = myTracksQuery.data || [];
  const myTrackInfo = myTracks[0] || null;

  const activeEventsCount = myTracks.length > 0
    ? new Set(myTracks.map((track) => track.eventId)).size
    : 0;

  // --- Teams in the first assigned track ---
  // MentorTeamProgressResponse already contains submissionCount, submittedSubmissionCount,
  // missingSubmissionCount — no need for per-team submission API calls on the dashboard.
  const trackTeamsQuery = useQuery({
    queryKey: ["mentor-dashboard-teams", myTrackInfo?.trackId],
    queryFn: () =>
      trackApi.getTeamInAssignedTracks(myTrackInfo!.trackId, { page: 0, size: 100 }),
    enabled: !USE_MOCK && Boolean(myTrackInfo?.trackId),
  });

  const teamList = trackTeamsQuery.data?.content ?? [];

  const scheduleQuery = useQuery({
    queryKey: ["mentor-dashboard-schedule"],
    queryFn: () => {
      const from = new Date();
      const to = new Date(from);
      to.setDate(to.getDate() + 30);
      return scheduleApi.getMySchedule({
        from: format(from, "yyyy-MM-dd'T'HH:mm:ss"),
        to: format(to, "yyyy-MM-dd'T'HH:mm:ss"),
      });
    },
    enabled: !USE_MOCK,
  });

  // --- Build dashboard ---
  let dashboard: MentorDashboardData;

  if (USE_MOCK) {
    dashboard = mentorDashboardMock;
  } else {
    // Use pre-aggregated counts from MentorTeamProgressResponse
    const totalSubmissions = teamList.reduce(
      (count, team) => count + team.submissionCount,
      0,
    );
    // missingSubmissionCount = teams that have not yet submitted
    const pendingReviewCount = teamList.reduce(
      (count, team) => count + team.missingSubmissionCount,
      0,
    );

    // Build recent submissions from teamList round progress
    const recentSubmissions = teamList
      .flatMap((team) =>
        team.roundProgress.filter((round) => round.submissionId).map((round) => ({
          id: round.submissionId!,
          teamName: team.teamName || "Unknown Team",
          projectName: team.projectTitle || team.trackName || "No Project Title",
          roundName: round.roundName || `Round ${round.roundId?.slice(0, 6) ?? ""}`,
          submittedAt: round.submittedAt
              ? new Date(round.submittedAt).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })
              : "Not submitted",
          feedbackStatus: "Not Given" as const,
        })),
      )
      .slice(0, 5);

    dashboard = {
      mentorName: profileQuery.data?.fullName || "Mentor",
      summaryCards: [
        {
          title: "Assigned Events",
          value: activeEventsCount,
          description: "Events you are mentoring",
          iconType: "event",
          color: "bg-blue-50 text-blue-600",
        },
        {
          title: "Assigned Tracks",
          value: myTracks.length,
          description: "Tracks assigned to you",
          iconType: "track",
          color: "bg-indigo-50 text-indigo-600",
        },
        {
          title: "Teams in Track",
          value: teamList.length,
          description: "Teams under your mentoring scope",
          iconType: "team",
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          title: "Missing Submissions",
          value: pendingReviewCount,
          description: "Teams that haven't submitted yet",
          iconType: "feedback",
          color: "bg-amber-50 text-amber-600",
        },
        {
          title: "Total Submissions",
          value: totalSubmissions,
          description: "Total submissions across all teams",
          iconType: "deadline",
          color: "bg-rose-50 text-rose-600",
        },
      ],
      assignedTrack: {
        eventName: myTrackInfo?.eventName || "No Active Event",
        trackName: myTrackInfo?.trackName || "No Assigned Track",
        teamCount: teamList.length,
        recentSubmissionCount: totalSubmissions,
        pendingFeedbackCount: pendingReviewCount,
      },
      recentSubmissions,
      upcomingSchedule: (scheduleQuery.data ?? []).slice(0, 2).map((entry) => ({
        id: entry.id,
        date: new Date(entry.startAt).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        title: entry.title,
        context: entry.eventName,
      })),
    };
  }

  const isLoading =
    !USE_MOCK &&
    (profileQuery.isLoading ||
      myTracksQuery.isLoading ||
      trackTeamsQuery.isLoading ||
      scheduleQuery.isLoading);

  const goToTeams = () => navigate("/mentor/teams");
  const goToSubmissions = () => navigate("/mentor/submissions");
  const goToSchedule = () => navigate("/mentor/schedule");
  const goToSubmissionDetail = (submissionId: string) =>
    navigate(`/mentor/submissions/${submissionId}`);

  return {
    isLoading,
    dashboard,
    myTrackId: myTrackInfo?.trackId ?? null,
    teamList,
    goToTeams,
    goToSubmissions,
    goToSchedule,
    goToSubmissionDetail,
  };
}
