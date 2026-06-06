import { Pagination } from "@mui/material";

type ScoringCriteriaPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ScoringCriteriaPagination({
  page,
  totalPages,
  onPageChange,
}: ScoringCriteriaPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-700">
      <span className="text-xs font-medium text-slate-400">
        Page {page + 1} of {totalPages}
      </span>
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(_, value) => onPageChange(value - 1)}
        size="small"
        shape="rounded"
      />
    </div>
  );
}
