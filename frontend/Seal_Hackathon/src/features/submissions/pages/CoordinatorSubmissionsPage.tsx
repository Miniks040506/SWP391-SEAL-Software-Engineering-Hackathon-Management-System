import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { useCoordinatorSubmissionsQuery } from "../hooks/useCoordinatorSubmissionMutations";
import { SubmissionFilterBar } from "../components/SubmissionFilterBar";
import { SubmissionTable } from "../components/SubmissionTable";
import { SubmissionDetailDrawer } from "../components/SubmissionDetailDrawer";
import { paginationSx } from "../schemas/submissions.schema";
import type { CoordinatorSubmissionListParams } from "@/types/submission.types";

const PAGE_SIZE = 20;

export function CoordinatorSubmissionsPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<CoordinatorSubmissionListParams>({
    page: 1,
    size: PAGE_SIZE,
  });

  const { data, loading } = useCoordinatorSubmissionsQuery(filters);

  const handleCloseDrawer = () => {
    navigate("/coordinator/submissions");
  };

  const items = (data as any)?.content || (data as any)?.items || (data as any)?.data || [];
  const total = (data as any)?.totalElements ?? 0;
  const totalPages = (data as any)?.totalPages ?? 0;

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Submission Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor and review all team submissions across events, tracks, and rounds.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
        <SubmissionFilterBar filters={filters} onChange={setFilters} />

        <SubmissionTable submissions={items} loading={loading} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-5 py-3 bg-white dark:bg-slate-800">
            <span className="text-xs text-slate-400">
              Showing {(filters.page! - 1) * filters.size! + 1}–
              {Math.min(filters.page! * filters.size!, total)} of {total} submissions
            </span>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={(_, p) => setFilters({ ...filters, page: p })}
              size="small"
              shape="rounded"
              variant="outlined"
              sx={paginationSx}
            />
          </div>
        )}
      </div>

      {submissionId && (
        <SubmissionDetailDrawer
          submissionId={submissionId}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}