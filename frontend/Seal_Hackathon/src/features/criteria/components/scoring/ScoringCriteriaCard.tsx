import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { Chip, IconButton, Tooltip } from "@mui/material";

import type { ScoringCriteriaDialogState } from "@/features/criteria/components/scoring/ScoringCriteriaDialog";
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

export function ScoringCriteriaCard({
  criteria,
  isActivating,
  isDeleting,
  onEdit,
  onToggleActive,
  onDelete,
}: ScoringCriteriaCardProps) {
  return (
    <div className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              {criteria.name}
            </h3>
            <Chip size="small" label={criteria.category} sx={{ fontWeight: 800 }} />
            <Chip
              size="small"
              label={criteria.isTechnical ? "Technical" : "Soft"}
              color={criteria.isTechnical ? "primary" : "secondary"}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              size="small"
              label={criteria.isActive ? "Active" : "Inactive"}
              color={criteria.isActive ? "success" : "default"}
              sx={{ fontWeight: 800 }}
            />
            {criteria.isDefault && (
              <Chip size="small" label="Default" variant="outlined" sx={{ fontWeight: 800 }} />
            )}
          </div>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {criteria.description || "No description."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              Max score: {criteria.maxScore}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              Default weight: {criteria.defaultWeight}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              onClick={() => onEdit({ mode: "EDIT", criteria })}
            >
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={criteria.isActive ? "Deactivate" : "Activate"}>
            <IconButton
              color={criteria.isActive ? "warning" : "success"}
              disabled={isActivating}
              onClick={() => onToggleActive(criteria)}
            >
              <PowerSettingsNewOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete if unused, otherwise deactivate">
            <IconButton
              color="error"
              disabled={isDeleting}
              onClick={() => onDelete(criteria.id)}
            >
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
