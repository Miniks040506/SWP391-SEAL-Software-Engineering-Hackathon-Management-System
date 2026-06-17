import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/api/user.api";
import { eventApi } from "@/api/event.api";
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

  const eventsQuery = useQuery({
    queryKey: ["mentor-dashboard-events"],
    queryFn: () => eventApi.getPublicEvents({ page: 0, size: 100 }),
    enabled: !USE_MOCK,
  });

  const myUserId = profileQuery.data?.id;
  const apiEvents = eventsQuery.data?.content || (eventsQuery.data as any)?.data?.content || [];
  const currentEvent = apiEvents.find((e: any) => ["ONGOING", "REGISTRATION"].includes((e.status || "").toUpperCase())) || apiEvents[0];
  const activeEventsCount = apiEvents.filter((e: any) => ["ONGOING", "REGISTRATION"].includes((e.status || "").toUpperCase())).length;

  const tracksQuery = useQuery({
    queryKey: ["mentor-dashboard-tracks", currentEvent?.id],
    queryFn: () => trackApi.getTracksByEvent(currentEvent!.id),
    enabled: !USE_MOCK && Boolean(currentEvent?.id),
  });

  const tracks = tracksQuery.data || [];

  const assignmentsQueries = useQueries({
    queries: tracks.map((track) => ({
      queryKey: ["mentor-assignments", track.id],
      queryFn: () => trackApi.getMentorAssignments(track.id),
      enabled: !USE_MOCK && Boolean(track.id),
    })),
  });

  const myTrackInfo = useMemo(() => {
    if (USE_MOCK || !myUserId) return null;
    for (let i = 0; i < tracks.length; i++) {
      const assignments = assignmentsQueries[i].data || [];
      const isMyTrack = assignments.some((a) => a.mentorUserId === myUserId);
      if (isMyTrack) return tracks[i];
    }
    return null;
  }, [myUserId, tracks, assignmentsQueries, USE_MOCK]);

  const trackTeamsQuery = useQuery({
    queryKey: ["mentor-dashboard-teams", myTrackInfo?.id],
    queryFn: () => trackApi.getTrackTeams(myTrackInfo!.id, { page: 0, size: 1000 } as any),
    enabled: !USE_MOCK && Boolean(myTrackInfo?.id),
  });

  const trackSubmissionsQuery = useQuery({
    queryKey: ["mentor-dashboard-submissions", myTrackInfo?.id],
    queryFn: () => submissionApi.getTrackSubmissions(myTrackInfo!.id),
    enabled: !USE_MOCK && Boolean(myTrackInfo?.id),
  });

  const teamList = trackTeamsQuery.data?.content || (trackTeamsQuery.data as any)?.data?.content || [];
  
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
    const allSubmissions = trackSubmissionsQuery.data || [];
    const allFeedbacks = feedbackQueries.map((q) => q.data || []).flat();
    
    const pendingReviewCount = allSubmissions.filter(s => {
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
        eventName: currentEvent ? currentEvent.name : "No Active Event",
        trackName: myTrackInfo ? myTrackInfo.name : "No Assigned Track",
        teamCount: teamList.length,
        recentSubmissionCount: allSubmissions.length,
        pendingFeedbackCount: pendingReviewCount,
      },
      recentSubmissions: allSubmissions
        .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
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

  const isAssignmentsLoading = assignmentsQueries.some(q => q.isLoading);
  const isFeedbacksLoading = feedbackQueries.some(q => q.isLoading);
  const isLoading = !USE_MOCK && (
    profileQuery.isLoading || eventsQuery.isLoading || tracksQuery.isLoading || 
    isAssignmentsLoading || trackTeamsQuery.isLoading || trackSubmissionsQuery.isLoading || 
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
    goToTeams,
    goToSubmissions,
    goToSchedule,
    goToSubmissionDetail,
    goToFeedback,
  };
}