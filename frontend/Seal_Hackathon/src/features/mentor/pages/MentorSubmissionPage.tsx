import { useNavigate } from "react-router-dom";

import { MentorSubmissionTable } from "../components/submission/MentorSubmissionTable";
import { useMentorSubmissions } from "../hooks/useMentorSubmission";
import { useMentorDashboard } from "../hooks/useMentorDashboard";

export const MentorSubmissionPage = () => {
  const navigate = useNavigate();

  const { dashboard } = useMentorDashboard();

  const trackId = (dashboard?.assignedTrack as any)?.id;

  const { trackSubmissionsQuery, goToSubmissionDetail } =
    useMentorSubmissions(trackId);

  const { data: response, isLoading } = trackSubmissionsQuery;
  const submissions = response?.data || response || [];

  return (
    <div class="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Team Submissions History
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Review past and current deliverables submitted by the team.
          </p>
        </div>

        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          <MentorSubmissionTable
            isLoading={isLoading}
            submissions={submissions}
            onRowClick={goToSubmissionDetail}
          />
        </div>
      </div>
    </div>
  );
};
