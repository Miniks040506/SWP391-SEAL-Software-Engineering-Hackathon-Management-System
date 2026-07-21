import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { Tooltip } from "@mui/material";

import type { ScoringCriteriaDialogState } from "@/features/criteria/components/scoring/ScoringCriteriaDialog";
import { getCategoryTheme } from "@/features/criteria/constants/criteriaUi";
import type { UUID } from "@/types/common.types";
import type { ScoringCriteriaResponse } from "@/types/criteria.types";

type ScoringCriteriaCardProps = {
  criteria: ScoringCriteriaResponse;
  isActivating?: boolean;
  isDeleting?: boolean;
  onEdit: (state: ScoringCriteriaDialogState) => void;
  onToggleActive: (criteria: ScoringCriteriaResponse) => void;
  onDelete: (criteriaId: UUID) => void;
};

function formatWeight(weight: number) {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(2);
}

export function ScoringCriteriaCard({
  criteria,
  isActivating,
  isDeleting,
  onEdit,
  onToggleActive,
  onDelete,
}: ScoringCriteriaCardProps) {
  const theme = getCategoryTheme(criteria.category);

  return (
    <div
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        "border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5",
        "dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/30",
        criteria.isActive ? "" : "opacity-75 grayscale-[0.35]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      ].join(" ")}
    >
      {/* Category gradient accent bar */}
      <div className={["h-1.5 w-full bg-linear-to-r", theme.gradient].join(" ")} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset",
                  theme.badge,
                ].join(" ")}
              >
                <span className={["h-1.5 w-1.5 rounded-full", theme.dot].join(" ")} />
                {criteria.category}
              </span>
              {criteria.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                  <StarRoundedIcon sx={{ fontSize: 12 }} />
                  Default
                </span>
              )}
            </div>

            <h3 className="mt-3 truncate text-lg font-black tracking-tight text-slate-950 dark:text-white">
              {criteria.name}
            </h3>
          </div>

          {/* Status pill */}
          <span
            className={[
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
              criteria.isActive
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                criteria.isActive ? "bg-emerald-500 motion-safe:animate-pulse" : "bg-slate-400",
              ].join(" ")}
            />
            {criteria.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-slate-500 dark:text-slate-400">
          {criteria.description || "No description provided for this template."}
        </p>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ring-1 ring-inset",
              criteria.isTechnical
                ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30"
                : "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/30",
            ].join(" ")}
          >
            {criteria.isTechnical ? (
              <BoltOutlinedIcon sx={{ fontSize: 14 }} />
            ) : (
              <FavoriteBorderOutlinedIcon sx={{ fontSize: 14 }} />
            )}
            {criteria.isTechnical ? "Technical" : "Soft skill"}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <span className="text-slate-400">Max</span>
            <span className="tabular-nums">{criteria.maxScore}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <span className="text-slate-400">Weight</span>
            <span className="tabular-nums">{formatWeight(criteria.defaultWeight)}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Tooltip title="Edit template">
            <button
              type="button"
              onClick={() => onEdit({ mode: "EDIT", criteria })}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              <EditOutlinedIcon sx={{ fontSize: 19 }} />
            </button>
          </Tooltip>

          <Tooltip title={criteria.isActive ? "Deactivate" : "Activate"}>
            <button
              type="button"
              disabled={isActivating}
              onClick={() => onToggleActive(criteria)}
              className={[
                "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
                criteria.isActive
                  ? "text-amber-500 hover:bg-amber-50 focus-visible:outline-amber-400 dark:hover:bg-amber-500/10"
                  : "text-emerald-500 hover:bg-emerald-50 focus-visible:outline-emerald-400 dark:hover:bg-emerald-500/10",
              ].join(" ")}
            >
              <PowerSettingsNewOutlinedIcon sx={{ fontSize: 19 }} />
            </button>
          </Tooltip>

          <Tooltip title="Delete if unused, otherwise deactivate">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(criteria.id)}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 19 }} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
