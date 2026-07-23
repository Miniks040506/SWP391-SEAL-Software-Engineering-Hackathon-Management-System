import { useParams } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";
import { RefreshOutlined } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useAdvancementPreviewQuery } from "../hooks/useAdvancementQueries";
import {
  useConfirmAdvancementMutation,
} from "../hooks/useAdvancementMutations";
import { AdvancementPreviewTable } from "../components/AdvancementPreviewTable";
import { AdvancementConfirmDialog } from "../components/AdvancementConfirmDialog";
import { AdvancementSummaryCards } from "../components/AdvancementSummaryCards";
import type { AdvancementPreviewResponse } from "@/types/advancement.types";

export function EventAdvancementPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const validEventId = eventId || "";

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [overrides, setOverrides] = useState<
    Map<string, { status: string; reason: string }>
  >(new Map());

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useAdvancementPreviewQuery(validEventId);
  const previewData = response?.data;

  const confirmMutation = useConfirmAdvancementMutation();

  const handleRefresh = () => {
    refetch();
  };

  const handleOverride = (
    teamId: string,
    newStatus: string,
    reason: string,
  ) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(teamId, { status: newStatus, reason });
      return next;
    });
    enqueueSnackbar("Override applied. Note: not yet saved.", {
      variant: "info",
    });
  };

  const handleClearOverride = (teamId: string) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.delete(teamId);
      return next;
    });
    enqueueSnackbar("Override cleared. Note: not yet saved.", {
      variant: "info",
    });
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    try {
      await confirmMutation.mutateAsync({
        roundId: validEventId,
        payload: { overrideRows: [] },
      });
      enqueueSnackbar("Advancement confirmed successfully.", {
        variant: "success",
      });
      setConfirmDialogOpen(false);
      refetch();
    } catch {
      enqueueSnackbar("Failed to confirm advancement.", { variant: "error" });
    }
  };

  const advancedCount = previewData?.advancedCount ?? 0;
  const eliminatedCount = previewData?.eliminatedCount ?? 0;
  const totalCount = previewData?.candidates?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              Advancement review
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-900 dark:text-white md:text-5xl">
              {previewData?.eventName || "Event advancement"}
            </h1>
            {previewData && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {previewData.roundName}
              </p>
            )}
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Preview the event-wide outcome and confirm the next-round roster
              when the review is complete.
            </p>
          </div>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={handleRefresh}
            disabled={isLoading}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              height: 40,
              alignSelf: "flex-start",
            }}
          >
            Refresh
          </Button>
        </div>
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Advanced
            </dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {advancedCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Eliminated
            </dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {eliminatedCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Teams in preview
            </dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {totalCount}
            </dd>
          </div>
        </dl>
      </header>

      {isLoading && (
        <div className="flex justify-center py-12">
          <CircularProgress />
        </div>
      )}

      {isError && (
        <Alert severity="error" className="mb-4">
          Failed to load advancement preview.
        </Alert>
      )}

      {previewData && (
        <>
          {!previewData.gradingLocked && (
            <Alert severity="warning" className="mb-4">
              Lock grading before confirming advancement.
            </Alert>
          )}
          {!previewData.rankingCalculated && (
            <Alert severity="warning" className="mb-4">
              Calculate ranking before previewing advancement.
            </Alert>
          )}
          {previewData.advancementConfirmed && (
            <Alert severity="info" className="mb-4">
              Advancement has already been confirmed. Manual changes require
              override flow.
            </Alert>
          )}

          <AdvancementSummaryCards
            advancedCount={advancedCount}
            eliminatedCount={eliminatedCount}
            totalCount={totalCount}
            overrideCount={overrides.size}
          />

          <AdvancementPreviewTable
            roundId={validEventId}
            previewData={previewData as unknown as AdvancementPreviewResponse}
            isLoading={isLoading}
            onOverride={handleOverride}
            onClearOverride={handleClearOverride}
          />

          <div className="flex justify-end mt-4">
            <Button
              variant="contained"
              color="primary"
              disabled={
                previewData.advancementConfirmed || confirmMutation.isPending
              }
              onClick={() => setConfirmDialogOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                boxShadow: "none",
                height: 40,
              }}
            >
              Confirm Advancement
            </Button>
          </div>
        </>
      )}

      <AdvancementConfirmDialog
        open={confirmDialogOpen}
        advancedCount={advancedCount}
        eliminatedCount={eliminatedCount}
        overrideCount={overrides.size}
        onConfirm={handleConfirm}
        onClose={() => setConfirmDialogOpen(false)}
        isPending={confirmMutation.isPending}
      />
    </div>
  );
}
