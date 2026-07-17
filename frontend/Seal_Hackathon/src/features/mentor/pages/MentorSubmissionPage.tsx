import { useCallback, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";

import { MentorSubmissionTable } from "../components/submission/MentorSubmissionTable";
import {
  MentorSubmissionFilterBar,
  type MentorSubmissionFilters,
} from "../components/submission/MentorSubmissionFilterBar";
import { useMentorSubmissions } from "../hooks/useMentorSubmission";
import type { GetMentorSubmissionsParams } from "@/types/submission.types";

const PAGE_SIZE = 20;

export const MentorSubmissionPage = () => {
  const [filters, setFilters] = useState<MentorSubmissionFilters>({});
  const [page, setPage] = useState(0);
  const params = useMemo<GetMentorSubmissionsParams>(() => ({
    ...filters,
    page,
    size: PAGE_SIZE,
  }), [filters, page]);
  const { trackSubmissionsQuery, goToSubmissionDetail } = useMentorSubmissions(params);
  const response = trackSubmissionsQuery.data;
  const submissions = useMemo(() => response?.content ?? [], [response?.content]);

  const handleFiltersChange = useCallback((nextFilters: MentorSubmissionFilters) => {
    setFilters(nextFilters);
    setPage(0);
  }, []);

  const availableRounds = useMemo(() => {
    const roundsMap = new Map<string, { id: string; name: string }>();
    submissions.forEach((sub) => {
      if (sub.roundId && sub.roundName && !roundsMap.has(sub.roundId)) {
        roundsMap.set(sub.roundId, { id: sub.roundId, name: sub.roundName });
      }
    });
    return Array.from(roundsMap.values());
  }, [submissions]);

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Track Submissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Review submitted deliverables from teams across your assigned tracks.
          </p>
        </div>

        {/* Thanh Filter Mới */}
        <MentorSubmissionFilterBar
          filters={filters}
          onChange={handleFiltersChange}
          rounds={availableRounds}
        />

        {trackSubmissionsQuery.isError && (
          <Alert severity="error">
            Unable to load assigned-track submissions. Please try again.
          </Alert>
        )}

        <MentorSubmissionTable
          isLoading={trackSubmissionsQuery.isLoading}
          submissions={submissions}
          emptyReason={response?.emptyReason}
          onRowClick={goToSubmissionDetail}
        />

        {response && response.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              page={response.page + 1}
              count={response.totalPages}
              onChange={(_, nextPage) => setPage(nextPage - 1)}
              color="primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};
