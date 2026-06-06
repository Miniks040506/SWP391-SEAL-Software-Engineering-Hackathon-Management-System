import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Button } from "@mui/material";

import { criteriaButtonSx } from "@/features/criteria/constants/criteriaUi";
import { ScoringCriteriaDialog } from "@/features/criteria/components/scoring/ScoringCriteriaDialog";
import { ScoringCriteriaFilterBar } from "@/features/criteria/components/scoring/ScoringCriteriaFilterBar";
import { ScoringCriteriaList } from "@/features/criteria/components/scoring/ScoringCriteriaList";
import { ScoringCriteriaPagination } from "@/features/criteria/components/scoring/ScoringCriteriaPagination";
import { ScoringCriteriaStats } from "@/features/criteria/components/scoring/ScoringCriteriaStats";
import { useScoringCriteriaManagement } from "@/features/criteria/hooks/useScoringCriteriaManagement";

export function ScoringCriteriaManagementPage() {
  const {
    category,
    active,
    technical,
    page,
    dialogState,
    setPage,
    setDialogState,
    setCategory,
    setActive,
    setTechnical,
    criteria,
    pageData,
    totals,
    criteriaQuery,
    activateMutation,
    deleteMutation,
  } = useScoringCriteriaManagement();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Scoring Criteria Templates
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Global scoring templates used by events. Backend allows ADMIN and
            COORDINATOR to create, update, activate, deactivate, and delete them.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={() => criteriaQuery.refetch()}
            sx={criteriaButtonSx}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setDialogState({ mode: "CREATE" })}
            sx={criteriaButtonSx}
          >
            Create Criteria
          </Button>
        </div>
      </div>

      <ScoringCriteriaStats {...totals} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <ScoringCriteriaFilterBar
          category={category}
          active={active}
          technical={technical}
          onCategoryChange={setCategory}
          onActiveChange={setActive}
          onTechnicalChange={setTechnical}
        />

        <ScoringCriteriaList
          criteria={criteria}
          isLoading={criteriaQuery.isLoading}
          isError={criteriaQuery.isError}
          isActivating={activateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onEdit={setDialogState}
          onToggleActive={(item) => activateMutation.mutate(item)}
          onDelete={(criteriaId) => deleteMutation.mutate(criteriaId)}
        />

        <ScoringCriteriaPagination
          page={page}
          totalPages={pageData?.totalPages ?? 0}
          onPageChange={setPage}
        />
      </section>

      <ScoringCriteriaDialog
        state={dialogState}
        onClose={() => setDialogState(null)}
      />
    </div>
  );
}
