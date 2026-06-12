import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import { MentorSubmissionTable } from "../components/submission/MentorSubmissionTable";
import { useMentorSubmission } from "../hooks/useMentorSubmission";
import { useMentorDashboard } from "../hooks/useMentorDashboard";


export const MentorSubmissionPage = () => {
  const navigate = useNavigate();

  const { dashboard } = useMentorDashboard();

  const trackId = (dashboard?.assignedTrack as any)?.id;
  
  const { trackSubmissionQuery, goToSubmissionDetail } = useMentorSubmission(trackId);

  const { data: response, isLoading } = trackSubmissionQuery;
  const submissions = response?.data || response || []; 

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/mentor/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Team Submissions History
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Review past and current deliverables submitted by the team.
        </p>
      </div>

      <MentorSubmissionTable
        isLoading={isLoading}
        submissions={submissions}
        onRowClick={goToSubmissionDetail}
      />
    </div>
  );
};