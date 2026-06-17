import { MentorAssignedTrackCard } from "../components/dashboard/MentorAssignedTrackCard";
import { MentorScheduleCard } from "../components/dashboard/MentorScheduleCard";
import { MentorSummaryCards } from "../components/dashboard/MentorSummaryCards";
import { MentorWelcomeBanner } from "../components/dashboard/MentorWelcomeBanner";

import { useMentorDashboard } from "../hooks/useMentorDashboard";

export const MentorDashboardPage = () => {
  const {
    dashboard,
    goToTeams,
    goToSubmissions,
    goToSchedule,
    goToSubmissionDetail,
    goToFeedback,
  } = useMentorDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <MentorWelcomeBanner
        mentorName={dashboard.mentorName}
        onViewTeams={goToTeams}
        onViewSubmissions={goToSubmissions}
      />

      <MentorSummaryCards cards={dashboard.summaryCards} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MentorAssignedTrackCard
          assignedTrack={dashboard.assignedTrack}
          recentSubmissions={dashboard.recentSubmissions}
          onViewTeams={goToTeams}
          onViewSubmissions={goToSubmissions}
          onViewSubmission={goToSubmissionDetail}
          onGiveFeedback={goToFeedback}
        />

        <MentorScheduleCard
          scheduleItems={dashboard.upcomingSchedule}
          onViewSchedule={goToSchedule}
        />
      </section>
    </div>
  );
};