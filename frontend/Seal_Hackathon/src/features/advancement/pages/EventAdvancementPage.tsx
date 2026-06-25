import { useParams } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";
import { RefreshOutlined } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useAdvancementPreviewQuery } from "../hooks/useAdvancementQueries";
import {
  useConfirmAdvancementMutation,
  useOverrideAdvancementMutation,
} from "../hooks/useAdvancementMutations";
import { AdvancementPreviewTable } from "../components/AdvancementPreviewTable";
import { AdvancementConfirmDialog } from "../components/AdvancementConfirmDialog";
import { AdvancementSummaryCards } from "../components/AdvancementSummaryCards";
import type {
  AdvancementOverrideRequest,
  AdvancementPreviewResponse,
} from "@/types/advancement.types";

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
  const overrideMutation = useOverrideAdvancementMutation(validEventId);

  const handleRefresh = () => {
    refetch();
  };

  const handleOverride = (
    teamId: string,
    newStatus: string,
    reason: string,
  ) => {
    const payload: AdvancementOverrideRequest = {
      teamId,
      finalStatus: newStatus as "ADVANCED" | "ELIMINATED",
      reason,
    };
    overrideMutation.mutate(payload, {
      onSuccess: () => {
        setOverrides((prev) => {
          const next = new Map(prev);
          next.set(teamId, { status: newStatus, reason });
          return next;
        });
        enqueueSnackbar("Override applied. Note: not yet saved.", {
          variant: "info",
        });
      },
      onError: () => {
        enqueueSnackbar("Failed to apply override.", { variant: "error" });
      },
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
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Event Advancement
          </h1>
          {previewData && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {previewData.eventName} — {previewData.roundName}
            </p>
          )}
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
          }}
        >
          Refresh
        </Button>
      </div>

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
