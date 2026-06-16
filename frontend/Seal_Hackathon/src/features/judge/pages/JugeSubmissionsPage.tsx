import { useParams, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { JudgeSubmissionTable } from "../components/submission/JudgeSubmissionTable";
import { useJudgeRoundSubmissionsQuery, useJudgeSubmissionsQuery } from "../hooks/useJudge";

export const JudgeSubmissionsPage = () => {
  const { roundId } = useParams<{ roundId?: string }>();
  const navigate = useNavigate();

  const roundQuery = useJudgeRoundSubmissionsQuery(roundId);
  const allQuery = useJudgeSubmissionsQuery();

  const query = roundId ? roundQuery : allQuery;
  const submissions = query.data?.data?.content || query.data?.content || [];

  return (
    <div className="space-y-6 p-6 animate-in slide-in-from-bottom-4 duration-500">
      {roundId && (
        <button
          onClick={() => navigate("/judge/dashboard")}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-blue-500"
        >
          <ArrowBackOutlinedIcon fontSize="small" /> Back to Dashboard
        </button>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {roundId ? "Round Submissions" : "All Assigned Submissions"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Only submissions assigned to your grading queue are visible here.
        </p>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-24"><CircularProgress /></div>
      ) : (
        <JudgeSubmissionTable submissions={submissions} />
      )}
    </div>
  );
};