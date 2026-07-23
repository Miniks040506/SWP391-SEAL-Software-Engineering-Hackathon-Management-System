import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";

import { MentorSubmissionTable } from "../components/submission/MentorSubmissionTable";
import {
  MentorSubmissionFilterBar,
  type MentorSubmissionFilters,
} from "../components/submission/MentorSubmissionFilterBar";
import { MentorPageHero } from "../components/common/MentorPageHero";
import { useMentorSubmissions } from "../hooks/useMentorSubmission";
import type { GetMentorSubmissionsParams } from "@/types/submission.types";

import "../styles/mentor.css";

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
    <div className="space-y-6">
      <MentorPageHero
        eyebrow="Mentor · Submissions"
        title="Track Submissions"
        subtitle="Review submitted deliverables from teams across your assigned tracks."
        chips={
          !trackSubmissionsQuery.isLoading && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
              {response?.totalElements ?? submissions.length}{" "}
              {(response?.totalElements ?? submissions.length) === 1
                ? "submission"
                : "submissions"}
            </span>
          )
        }
      />

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
        <div
          className="mt-fade-up flex justify-center"
          style={{ "--mt-stagger": 3 } as CSSProperties}
        >
          <Pagination
            page={response.page + 1}
            count={response.totalPages}
            onChange={(_, nextPage) => setPage(nextPage - 1)}
            color="primary"
          />
        </div>
      )}
    </div>
  );
};
