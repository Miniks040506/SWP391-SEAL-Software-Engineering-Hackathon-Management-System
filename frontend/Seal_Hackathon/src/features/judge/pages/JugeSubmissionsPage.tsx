import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { JudgeSubmissionTable } from "../components/submission/JudgeSubmissionTable";
import { JudgeSubmissionFilterBar } from "../components/submission/JudgeSubmissionFilterBar";
import { useJudgeRoundSubmissionsQuery, useJudgeSubmissionsQuery } from "../hooks/useJudge";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

export const JudgeSubmissionsPage = () => {
  const { roundId } = useParams<{ roundId?: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetJudgeSubmissionsParams>({ page: 1, size: 10 });

  const roundQuery = useJudgeRoundSubmissionsQuery(roundId);
  const allQuery = useJudgeSubmissionsQuery(filters);

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
          {roundId ? "Round Submissions" : "Assigned Grading Queue"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Review and grade the submissions assigned to you.
        </p>
      </div>

      <JudgeSubmissionFilterBar filters={filters} onChange={setFilters} />

      {query.isLoading ? (
        <div className="flex justify-center py-24"><CircularProgress /></div>
      ) : (
        <JudgeSubmissionTable submissions={submissions} />
      )}
    </div>
  );
};