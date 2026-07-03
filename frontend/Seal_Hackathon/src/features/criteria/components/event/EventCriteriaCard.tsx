import type { UUID } from "@/types/common.types";
import type { EventCriteriaDialogState, EventCriteriaResponse } from "@/types/criteria.types";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { roundScopeText } from "../../utils/criteriaView";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

type EventCriteriaCardProps = {
    criteria: EventCriteriaResponse;
    canEdit: boolean;
    roundNameById: Map<UUID, string>;
    isDeleting?: boolean;
    onView: (criteria: EventCriteriaResponse) => void;
    onEdit: (state: EventCriteriaDialogState) => void;
    onDelete: (criteriaId: UUID) => void;
};

export function EventCriteriaCard({
    criteria,
    canEdit,
    roundNameById,
    isDeleting,
    onView,
    onEdit,
    onDelete
}: EventCriteriaCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-slate-950 dark:text-white">
                            {criteria.displayOrder ?? "-"}. {criteria.effectiveName}
                        </p>
                        <Chip 
                            size="small"
                            label={criteria.effectiveIsTechnical ? "Technical" : "Soft"}
                            color={criteria.effectiveIsTechnical ? "primary" : "secondary"}
                            sx={{ fontWeight: 800 }}
                        />                          
                        <Chip
                            size="small"
                            label={criteria.isActive ? "Active" : "Inactive"}
                            color={criteria.isActive ? "success" : "default"}
                            sx={{ fontWeight: 800 }}
                        />
                        <Chip
                            size="small"
                            label={criteria.isCustom ? "Custom" : "Template"}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                        />
                    </div>
                    
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        {criteria.effectiveDescription || "No description."}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
                            Max score: {criteria.effectiveMaxScore}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
                            Weight: {criteria.effectiveWeight}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
                            Rounds: {roundScopeText(criteria.appliesToRoundIds, roundNameById)}
                        </span>
                        {criteria.templateName && (
                            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">
                                Template: {criteria.templateName}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex shrink-0 items-center gap-1">
                    <Tooltip title="View">
                        <IconButton onClick={() => onView(criteria)}>
                            <VisibilityOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    
                    {canEdit && (
                        <>
                            <Tooltip title="Edit">
                                <IconButton
                                    color="primary"
                                    onClick={() => onEdit({ mode: "EDIT", criteria })}
                                > 
                                    <EditOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete or deactivate">
                                <IconButton
                                    color="error"
                                    disabled={isDeleting}
                                    onClick={() => onDelete(criteria.id)}
                                >
                                    <DeleteOutlineOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
