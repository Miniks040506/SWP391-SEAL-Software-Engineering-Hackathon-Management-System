import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Alert } from "@mui/material";

import {
  EventCriteriaDetailsDialog,
  EventCriteriaDialog,
  EventCriteriaFilters,
  EventCriteriaList,
  useEventCriteriaPanel,
} from "@/features/criteria";
import type { UUID } from "@/types/common.types";
import type { EventDetailResponse } from "@/types/event.types";
import type { RoundResponse } from "@/types/round.types";

import { TabShell } from "./TabShell";

type CriteriaTabProps = {
  eventId: UUID;
  event?: EventDetailResponse | null;
  rounds: RoundResponse[];
  canEdit: boolean;
  readonlyReason?: string;
};

export function CriteriaTab({
  eventId,
  event,
  rounds,
  canEdit,
  readonlyReason,
}: CriteriaTabProps) {
  const {
    activeFilter,
    technicalFilter,
    setActiveFilter,
    setTechnicalFilter,
    dialogState,
    setDialogState,
    viewCriteria,
    setViewCriteria,
    effectiveCanEdit,
    effectiveReason,
    criteriaQuery,
    deleteMutation,
    criteria,
    templateOptions,
    roundNameById,
    openCreateDialog,
  } = useEventCriteriaPanel({
    eventId,
    event,
    rounds,
    canEdit,
    readonlyReason,
  });

  return (
    <TabShell
      tab="CRITERIA"
      title="Scoring & Event Criteria"
      description="Manage the criteria that judges will use for this event. Use global templates or custom event-only criteria."
      headerActions={
        <>
          <button
            type="button"
            onClick={() => criteriaQuery.refetch()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
            Refresh
          </button>

          {effectiveCanEdit && (
            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-rose-600 to-pink-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-600/25 transition-all duration-200 hover:from-rose-500 hover:to-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 motion-reduce:transition-none"
            >
              <AddOutlinedIcon sx={{ fontSize: 17 }} />
              Add Criteria
            </button>
          )}
        </>
      }
      bodyClassName="space-y-5 px-7 py-6"
    >
      {!effectiveCanEdit && effectiveReason && (
        <Alert severity="info" sx={{ borderRadius: "14px" }}>
          {effectiveReason}
        </Alert>
      )}

      <EventCriteriaFilters
        activeFilter={activeFilter}
        technicalFilter={technicalFilter}
        onActiveFilterChange={setActiveFilter}
        onTechnicalFilterChange={setTechnicalFilter}
      />

      <EventCriteriaList
        criteria={criteria}
        roundNameById={roundNameById}
        canEdit={effectiveCanEdit}
        isLoading={criteriaQuery.isLoading}
        isError={criteriaQuery.isError}
        isDeleting={criteriaQuery.isPending}
        onCreate={openCreateDialog}
        onView={setViewCriteria}
        onEdit={setDialogState}
        onDelete={(criteriaId) => deleteMutation.mutate(criteriaId)}
      />

      {dialogState && (
        <EventCriteriaDialog
          open={Boolean(dialogState)}
          state={dialogState}
          eventId={eventId}
          rounds={rounds}
          templateOptions={templateOptions}
          onClose={() => setDialogState(null)}
        />
      )}

      <EventCriteriaDetailsDialog
        criteria={viewCriteria}
        onClose={() => setViewCriteria(null)}
      />
    </TabShell>
  );
}
