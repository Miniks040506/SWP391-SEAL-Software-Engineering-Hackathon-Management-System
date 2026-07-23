import "../styles/judge.css";

import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";

import { JudgePageHero } from "../components/common/JudgePageHero";
import { JudgeQueueProgressBand } from "../components/submission/JudgeQueueProgressBand";
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
    <div className="space-y-5">
      <JudgePageHero
        eyebrow="Grading queue"
        title={roundId ? "Round Submissions" : "Assigned Grading Queue"}
        subtitle="Review and score the submissions assigned to you. Click a card for details, or jump straight into scoring."
        backTo={
          roundId
            ? { label: "Back to Dashboard", onClick: () => navigate("/judge/dashboard") }
            : undefined
        }
      />

      {summaryQuery.isError ? (
        <Alert severity="error">Failed to load grading progress.</Alert>
      ) : summaryQuery.isLoading || !progressSummary ? (
        <div className="jd-shimmer h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
      ) : (
        <JudgeQueueProgressBand summary={progressSummary} />
      )}

      <JudgeSubmissionFilterBar filters={filters} onChange={setFilters} />

      {query.isError ? (
        <Alert severity="error">Failed to load assigned submissions.</Alert>
      ) : query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="jd-shimmer h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60"
            />
          ))}
        </div>
      ) : (
        <>
          <JudgeSubmissionTable submissions={submissions} filtered={hasActiveFilters} />
          {query.data && query.data.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={(filters.page ?? 0) + 1}
                count={query.data.totalPages}
                onChange={(_, nextPage) =>
                  setFilters((current) => ({ ...current, page: nextPage - 1 }))
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
