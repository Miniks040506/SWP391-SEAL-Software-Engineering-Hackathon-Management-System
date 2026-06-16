import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { JudgeSubmissionTable } from "../components/submission/JudgeSubmissionTable";
import { JudgeSubmissionFilterBar } from "../components/submission/JudgeSubmissionFilterBar";
import { useJudgeRoundSubmissionsQuery, useJudgeSubmissionsQuery } from "../hooks/useJudge";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

export const JudgeSubmissionsPage = () => {
  const { roundId } = useParams<{ roundId?: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetJudgeSubmissionsParams>({ page: 0, size: 10 });
  const apiFilters = useMemo(() => {
    const { search: _search, ...params } = filters;
    return params;
  }, [filters]);
  const roundFilters = useMemo(() => {
    const { roundId: _roundId, ...params } = apiFilters;
    return params;
  }, [apiFilters]);

  const roundQuery = useJudgeRoundSubmissionsQuery(roundId, roundFilters);
  const allQuery = useJudgeSubmissionsQuery(apiFilters);

  const query = roundId ? roundQuery : allQuery;
  const submissions = useMemo(() => {
    const content = query.data?.content ?? [];
    const searchText = filters.search?.trim().toLowerCase();

    if (!searchText) return content;

    return content.filter((submission) =>
      [
        submission.teamName,
        submission.projectTitle,
        submission.trackName,
        submission.roundName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchText)),
    );
  }, [filters.search, query.data?.content]);

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

      <JudgeSubmissionFilterBar filters={filters} onChange={setFilters} />

      {query.isError ? (
        <Alert severity="error">Failed to load assigned submissions.</Alert>
      ) : query.isLoading ? (
        <div className="flex justify-center py-24"><CircularProgress /></div>
      ) : (
        <JudgeSubmissionTable submissions={submissions} />
      )}
    </div>
  );
};
