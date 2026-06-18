import { useQuery, useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/api/user.api";
import { trackApi } from "@/api/track.api";
import { submissionApi } from "@/api/submission.api";
import { mentorFeedbackApi } from "@/api/mentorFeedback.api";
import { notificationApi } from "@/api/notification.api";

import { mentorDashboardMock, type MentorDashboardData } from "../mocks/mentorDashboard.mock";

const USE_MOCK = false;

export function useMentorDashboard() {
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["mentor-dashboard-profile"],
    queryFn: () => userApi.getMyProfile(),
    enabled: !USE_MOCK,
  });

  const myTracksQuery = useQuery({
    queryKey: ["mentor-my-tracks"],
    queryFn: () => trackApi.getMyAssignedTracks(),
    enabled: !USE_MOCK,
  });
  const myTrackInfo = (myTracksQuery.data || [])[0] || null;

  const activeEventsCount = myTracksQuery.data 
    ? new Set(myTracksQuery.data.map((t: any) => t.eventId)).size 
    : 0;

  const trackTeamsQuery = useQuery({
    queryKey: ["mentor-dashboard-teams", myTrackInfo?.trackId],
    queryFn: () => trackApi.getTeamInAssignedTracks(myTrackInfo!.trackId, { page: 0, size: 1000 } as any),
    enabled: !USE_MOCK && Boolean(myTrackInfo?.trackId),
  });

  const teamList = trackTeamsQuery.data?.content || (trackTeamsQuery.data as any)?.data?.content || [];
  
  const teamSubmissionQueries = useQueries({
    queries: teamList.map((team: any) => ({
      queryKey: ["mentor-dashboard-team-submissions", team.teamId],
      queryFn: () => submissionApi.getMentorTeamSubmissions(team.teamId),
      enabled: !USE_MOCK && Boolean(team.teamId),
      staleTime: 60_000,
    })),
  });
  
  const feedbackQueries = useQueries({
    queries: teamList.map((team: any) => ({
      queryKey: ["mentor-team-feedbacks", team.teamId],
      queryFn: () => mentorFeedbackApi.getMentorTeamFeedback(team.teamId),
      enabled: !USE_MOCK && Boolean(team.teamId),
    })),
  });

  const notifsQuery = useQuery({
    queryKey: ["mentor-dashboard-notifs"],
    queryFn: () => notificationApi.getMyNotifications({ page: 0, size: 5 }),
    enabled: !USE_MOCK,
  });

  let dashboard: MentorDashboardData;

  if (USE_MOCK) {
    dashboard = mentorDashboardMock;
  } else {
    const allSubmissions = teamSubmissionQueries.flatMap((q) => {
      const d = q.data as any;
      return d?.data || d || [];
    });
    const allFeedbacks = feedbackQueries.map((q) => q.data || []).flat();
    
    const pendingReviewCount = allSubmissions.filter((s: any) => {
      if (s.status !== "SUBMITTED") return false;
      return !allFeedbacks.some((f: any) => f.submissionId === s.id);
    }).length;

    const notifs = notifsQuery.data?.content || (notifsQuery.data as any)?.data?.content || [];
    const recentActivities = notifs.slice(0, 4).map((n: any) => ({
      id: n.id,
      time: new Date(n.sentAt || n.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
      title: n.title,
      description: n.body,
    }));

    dashboard = {
      mentorName: profileQuery.data?.fullName || "Mentor",
      summaryCards: [
        { title: "Assigned Events", value: activeEventsCount, description: "Events you are mentoring", iconType: "event", color: "bg-blue-50 text-blue-600" },
        { title: "Assigned Tracks", value: myTrackInfo ? 1 : 0, description: "Tracks assigned to you", iconType: "track", color: "bg-indigo-50 text-indigo-600" },
        { title: "Teams in Track", value: teamList.length, description: "Teams under your mentoring scope", iconType: "team", color: "bg-emerald-50 text-emerald-600" },
        { title: "Pending Feedback", value: pendingReviewCount, description: "Submissions waiting for feedback", iconType: "feedback", color: "bg-amber-50 text-amber-600" },
        { title: "Upcoming Deadlines", value: 0, description: "Important deadlines ahead", iconType: "deadline", color: "bg-rose-50 text-rose-600" },
      ],
      assignedTrack: {
        eventName: myTrackInfo?.eventName || "No Active Event",
        trackName: myTrackInfo?.trackName || "No Assigned Track",
        teamCount: teamList.length,
        recentSubmissionCount: allSubmissions.length,
        pendingFeedbackCount: pendingReviewCount,
      },
      recentSubmissions: allSubmissions
        .sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
        .slice(0, 5)
        .map((s: any) => ({
          id: s.id,
          teamName: s.teamName || "Unknown Team",
          projectName: s.trackName || "No Project Title", 
          roundName: s.roundName,
          submittedAt: s.submittedAt ? new Date(s.submittedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Not submitted",
          feedbackStatus: allFeedbacks.some((f: any) => f.submissionId === s.id) ? "Given" : "Not Given",
        })),
      upcomingSchedule: recentActivities.slice(0, 2).map((a: any, i: number) => ({
        id: `sch-${i}`,
        date: a.time,
        title: a.title,
        context: "Recent Notification",
      })),
    };
  }

  const isFeedbacksLoading = feedbackQueries.some(q => q.isLoading);
  const isSubmissionsLoading = teamSubmissionQueries.some(q => q.isLoading);
  const isLoading = !USE_MOCK && (
    profileQuery.isLoading || myTracksQuery.isLoading || 
    trackTeamsQuery.isLoading || isSubmissionsLoading || 
    isFeedbacksLoading || notifsQuery.isLoading
  );

  const goToTeams = () => navigate("/mentor/teams");
  const goToSubmissions = () => navigate("/mentor/submissions");
  const goToSchedule = () => navigate("/mentor/schedule");
  const goToSubmissionDetail = (submissionId: string) => navigate(`/mentor/submissions/${submissionId}`);
  const goToFeedback = (submissionId: string) => navigate(`/mentor/submissions/${submissionId}/feedback`);

  return {
    isLoading,
    dashboard,
    myTrackId: myTrackInfo?.trackId ?? null,
    teamList,
    goToTeams,
    goToSubmissions,
    goToSchedule,
    goToSubmissionDetail,
    goToFeedback,
  };
}