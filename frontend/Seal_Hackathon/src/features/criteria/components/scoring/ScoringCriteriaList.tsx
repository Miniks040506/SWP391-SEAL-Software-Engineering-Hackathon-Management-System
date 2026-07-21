import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import type { UUID } from "@/types/common.types";
import type {
  ScoringCriteriaDialogState,
  ScoringCriteriaResponse,
} from "@/types/criteria.types";
import { ScoringCriteriaCard } from "./ScoringCriteriaCard";

type ScoringCriteriaListProps = {
  criteria: ScoringCriteriaResponse[];
  isLoading: boolean;
  isError: boolean;
  isActivating?: boolean;
  isDeleting?: boolean;
  onEdit: (state: ScoringCriteriaDialogState) => void;
  onToggleActive: (criteria: ScoringCriteriaResponse) => void;
  onDelete: (criteriaId: UUID) => void;
};

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800" />
      <div className="animate-pulse space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export function ScoringCriteriaList({
  criteria,
  isLoading,
  isError,
  isActivating,
  isDeleting,
  onEdit,
  onToggleActive,
  onDelete,
}: ScoringCriteriaListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 30 }} />
        </div>
        <p className="text-base font-black text-slate-700 dark:text-slate-200">
          Failed to load scoring criteria
        </p>
        <p className="max-w-sm text-sm font-medium text-slate-400">
          Something went wrong while fetching the templates. Please refresh and try again.
        </p>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <FactCheckOutlinedIcon sx={{ fontSize: 30 }} />
        </div>
        <p className="text-base font-black text-slate-700 dark:text-slate-200">
          No scoring criteria found
        </p>
        <p className="max-w-sm text-sm font-medium text-slate-400">
          Try adjusting your filters, or create a new template to start scoring events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
      {criteria.map((item) => (
        <ScoringCriteriaCard
          key={item.id}
          criteria={item}
          isActivating={isActivating}
          isDeleting={isDeleting}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
