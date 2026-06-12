import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import { MentorSubmissionHistoryTable } from "../components/submission/MentorSubmissionHistoryTable";
import { useMentorSubmission } from "../hooks/useMentorSubmission";

export const MentorSubmissionPage = () => {
  const navigate = useNavigate();
  const { teamSubmissionQuery, goToSubmissionDetail } = useMentorSubmission();

  const { data: response, isLoading } = teamSubmissionQuery;
  // Dữ liệu API bọc trong property 'data' của axios, tùy chỉnh dựa trên axios instance thực tế
  const submissions = response?.data || []; 

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

      <MentorSubmissionHistoryTable
        isLoading={isLoading}
        submissions={submissions}
        onRowClick={goToSubmissionDetail}
      />
    </div>
  );
};