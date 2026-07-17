import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { JudgeSubmissionTable } from "../components/submission/JudgeSubmissionTable";
import { JudgeSubmissionFilterBar } from "../components/submission/JudgeSubmissionFilterBar";
import { useJudgeRoundSubmissionsQuery, useJudgeSubmissionsQuery } from "../hooks/useJudge";
import { useJudgeSubmissionSummaryQuery } from "../hooks/useJudgeGradingQueries";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

export const JudgeSubmissionsPage = () => {
  const { roundId } = useParams<{ roundId?: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetJudgeSubmissionsParams>({ page: 0, size: 10 });
  const roundQuery = useJudgeRoundSubmissionsQuery(roundId, filters);
  const allQuery = useJudgeSubmissionsQuery(filters);
  const summaryQuery = useJudgeSubmissionSummaryQuery(roundId);

  const query = roundId ? roundQuery : allQuery;
  const submissions = useMemo(() => query.data?.content ?? [], [query.data?.content]);
  const progressSummary = summaryQuery.data ?? {
    totalAssigned: 0,
    pending: 0,
    draftSaved: 0,
    submitted: 0,
    locked: 0,
  };
  const hasActiveFilters = Boolean(filters.search || filters.status);

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
          Review submissions assigned to your judging queue.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 pr-4 sm:border-r border-gray-200 dark:border-slate-700">
          <span className="text-sm font-bold text-gray-500">Progress:</span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">{progressSummary.submitted} / {progressSummary.totalAssigned}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400"><span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>{progressSummary.pending} Pending</span>
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>{progressSummary.draftSaved} Draft Saved</span>
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400"><span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>{progressSummary.submitted} Submitted</span>
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>{progressSummary.locked} Locked</span>
        </div>
      </div>

      <JudgeSubmissionFilterBar filters={filters} onChange={setFilters} />

      {query.isError ? (
        <Alert severity="error">Failed to load assigned submissions.</Alert>
      ) : query.isLoading ? (
        <div className="flex justify-center py-24"><CircularProgress /></div>
      ) : (
        <>
          <JudgeSubmissionTable submissions={submissions} filtered={hasActiveFilters} />
          {query.data && query.data.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={(filters.page ?? 0) + 1}
                count={query.data.totalPages}
                onChange={(_, nextPage) => setFilters((current) => ({
                  ...current,
                  page: nextPage - 1,
                }))}
                color="primary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
