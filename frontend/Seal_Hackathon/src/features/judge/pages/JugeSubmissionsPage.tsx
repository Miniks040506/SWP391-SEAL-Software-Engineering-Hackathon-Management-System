import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { JudgeSubmissionTable } from "../components/submission/JudgeSubmissionTable";
import { JudgeSubmissionFilterBar } from "../components/submission/JudgeSubmissionFilterBar";
import {
  useJudgeSubmissionsQuery,
  useJudgeSubmissionSummaryQuery,
} from "../hooks/useJudge";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

export const JudgeSubmissionsPage = () => {
  const { roundId } = useParams<{ roundId?: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetJudgeSubmissionsParams>({
    page: 0,
    size: 10,
  });
  const query = useJudgeSubmissionsQuery({ ...filters, roundId });
  const summaryQuery = useJudgeSubmissionSummaryQuery(roundId);

  const submissions = useMemo(
    () => query.data?.content ?? [],
    [query.data?.content],
  );
  const progressSummary = summaryQuery.data;
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

      {summaryQuery.isError ? (
        <Alert severity="error">Failed to load grading progress.</Alert>
      ) : summaryQuery.isLoading || !progressSummary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <Skeleton width="100%" height={32} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 pr-4 sm:border-r sm:border-slate-200 dark:sm:border-slate-700">
            <span className="text-sm font-bold text-slate-500">Completed</span>
            <span className="text-xl font-extrabold tabular-nums text-slate-950 dark:text-white">
              {progressSummary.submitted + progressSummary.locked} /{" "}
              {progressSummary.totalAssigned}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <span className="text-amber-700 dark:text-amber-400">
              {progressSummary.pending} pending
            </span>
            <span className="text-blue-700 dark:text-blue-400">
              {progressSummary.draftSaved} draft saved
            </span>
            <span className="text-emerald-700 dark:text-emerald-400">
              {progressSummary.submitted} submitted
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {progressSummary.locked} locked
            </span>
          </div>
        </div>
      )}

      <JudgeSubmissionFilterBar filters={filters} onChange={setFilters} />

      {query.isError ? (
        <Alert severity="error">Failed to load assigned submissions.</Alert>
      ) : query.isLoading ? (
        <div className="flex justify-center py-24">
          <CircularProgress />
        </div>
      ) : (
        <>
          <JudgeSubmissionTable
            submissions={submissions}
            filtered={hasActiveFilters}
          />
          {query.data && query.data.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={(filters.page ?? 0) + 1}
                count={query.data.totalPages}
                onChange={(_, nextPage) =>
                  setFilters((current) => ({
                    ...current,
                    page: nextPage - 1,
                  }))
                }
                color="primary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
