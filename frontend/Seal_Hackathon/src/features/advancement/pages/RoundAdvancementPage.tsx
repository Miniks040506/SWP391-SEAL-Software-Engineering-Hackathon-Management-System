import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Alert, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
import { useCoordinatorEventTracksQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import {
  usePreviewAdvanceRulesMutation,
  useConfirmAdvancementMutation,
} from "../hooks/useAdvancementMutations";
import { AdvanceRulePanel } from "../components/AdvanceRulePanel";
import { AdvancementPreviewTable } from "../components/AdvancementPreviewTable";
import { AdvancementConfirmDialog } from "../components/AdvancementConfirmDialog";
import type { RoundDetailResponse } from "@/types/round.types";
import type {
  AdvancementCandidateRow,
  AdvancementPreviewResponse,
  FinalAdvancementStatus,
} from "@/types/advancement.types";

type LocalRoundDetail = RoundDetailResponse & {
  eventName?: string;
  trackName?: string;
};

export function RoundAdvancementPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const validRoundId = roundId || "";

  const {
    data: roundDetail,
    isLoading: isRoundLoading,
    refetch,
  } = useQuery({
    queryKey: ["roundDetail", validRoundId],
    queryFn: () => roundApi.getRoundById(validRoundId),
    enabled: !!validRoundId,
  });
  const { data: tracks = [] } = useCoordinatorEventTracksQuery(roundDetail?.eventId);

  const previewMutation = usePreviewAdvanceRulesMutation();
  const confirmMutation = useConfirmAdvancementMutation();

  const [previewData, setPreviewData] = useState<
    AdvancementPreviewResponse | undefined
  >();
  const [overrides, setOverrides] = useState<
    Map<string, { status: string; reason: string }>
  >(new Map());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handlePreview = async () => {
    try {
      const result = await previewMutation.mutateAsync(validRoundId);
      setPreviewData(result.data);
      // Clear previous overrides when getting new preview
      setOverrides(new Map());
      enqueueSnackbar("Preview generated successfully.", {
        variant: "success",
      });
    } catch {
      enqueueSnackbar("Failed to generate preview.", { variant: "error" });
    }
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

  // Merge overrides into preview data for display
  const displayPreviewData = previewData
    ? {
        ...previewData,
        candidates: previewData.candidates.map(
          (team: AdvancementCandidateRow) => {
            const override = overrides.get(team.teamId);
            if (override) {
              return {
                ...team,
                finalStatus: override.status as FinalAdvancementStatus,
                overrideReason: override.reason,
              };
            }
            return team;
          },
        ),
      }
    : undefined;

  const gradingLocked = previewData?.gradingLocked ?? !!roundDetail?.gradingLockedAt;
  const rankingCalculated = previewData?.rankingCalculated;
  const advancementConfirmed =
    previewData?.advancementConfirmed ?? !!roundDetail?.advancementConfirmedAt;
  const canConfirmAdvancement =
    !!displayPreviewData &&
    displayPreviewData.gradingLocked &&
    displayPreviewData.rankingCalculated &&
    !displayPreviewData.advancementConfirmed &&
    !confirmMutation.isPending;

  const handleConfirm = async () => {
    if (!displayPreviewData) return;
    if (
      !displayPreviewData.gradingLocked ||
      !displayPreviewData.rankingCalculated ||
      displayPreviewData.advancementConfirmed
    ) {
      enqueueSnackbar(
        "Cannot confirm advancement until grading is locked, ranking is calculated, and advancement is not already confirmed.",
        { variant: "error" },
      );
      return;
    }

    try {
      await confirmMutation.mutateAsync({
        roundId: validRoundId,
        payload: {
          overrideRows: Array.from(overrides.entries()).map(
            ([teamId, override]) => ({
              teamId,
              finalStatus: override.status as "ADVANCED" | "ELIMINATED",
              reason: override.reason,
            }),
          ),
          confirmNote:
            overrides.size > 0 ? "Manual overrides applied" : undefined,
        },
      });
      enqueueSnackbar("Advancement confirmed successfully.", {
        variant: "success",
      });
      setConfirmDialogOpen(false);
      // Refetch preview to reflect confirmed status
      handlePreview();
    } catch {
      enqueueSnackbar("Failed to confirm advancement.", {
        variant: "error",
      });
    }
  };

  const advancedCount =
    displayPreviewData?.candidates.filter((t: AdvancementCandidateRow) => {
      const activeStatus = t.finalStatus || t.suggestedStatus;
      return activeStatus === "ADVANCED" || activeStatus === "WILDCARD";
    }).length || 0;

  const eliminatedCount =
    displayPreviewData?.candidates.filter((t: AdvancementCandidateRow) => {
      const activeStatus = t.finalStatus || t.suggestedStatus;
      return activeStatus === "ELIMINATED";
    }).length || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              Advancement review
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-900 dark:text-white md:text-5xl">
              {roundDetail?.name || "Round advancement"}
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Preview the rule outcome, record any exceptions, and confirm the next-round roster.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Coordinator</span>
              <span>/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Rounds</span>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-white">Advancement</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
          <Button
            variant="outlined"
            onClick={() => refetch()}
            disabled={isRoundLoading}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePreview}
            disabled={previewMutation.isPending || isRoundLoading}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            Preview Advancement
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!canConfirmAdvancement}
            onClick={() => setConfirmDialogOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            Confirm Advancement
          </Button>
          </div>
        </div>
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
          <div>
            <dd className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{advancedCount}</dd>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Advanced</dt>
          </div>
          <div>
            <dd className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{eliminatedCount}</dd>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Eliminated</dt>
          </div>
          <div>
            <dd className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{displayPreviewData?.candidates.length || 0}</dd>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Teams in preview</dt>
          </div>
        </dl>
      </header>

      <section className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <h2 className="mb-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Round Context
        </h2>
        {isRoundLoading ? (
          <Typography>Loading round details...</Typography>
        ) : roundDetail ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <span className="text-slate-500 font-medium">Event Name:</span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {(roundDetail as LocalRoundDetail).eventName || "Unknown Event"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">Round Name:</span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {roundDetail.name}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">Track Filter:</span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {(roundDetail as LocalRoundDetail).trackName || "All Tracks"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">Round Status:</span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {roundDetail.status}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Submission Locked:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {roundDetail.submissionLockedAt ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Grading Locked:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {gradingLocked ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Ranking Calculation:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {rankingCalculated == null
                  ? "Run Preview to check"
                  : rankingCalculated
                    ? "Calculated"
                    : "Not Calculated"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Advancement Confirmed:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {advancementConfirmed ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Advanced Count:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {advancedCount}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Eliminated Count:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {eliminatedCount}
              </span>
            </div>
          </div>
        ) : (
          <Typography color="error">Failed to load round context.</Typography>
        )}

        {roundDetail && !gradingLocked && (
          <Alert severity="warning" className="mb-2">
            Lock grading before confirming advancement.
          </Alert>
        )}
        {previewData && !previewData.rankingCalculated && (
          <Alert severity="warning" className="mb-2">
            Calculate ranking before previewing advancement.
          </Alert>
        )}
        {advancementConfirmed && (
          <Alert severity="info" className="mb-2">
            Advancement has already been confirmed. Manual changes require
            override flow.
          </Alert>
        )}
      </section>

      {/* Section 2 - Advance rule panel */}
      <AdvanceRulePanel
        roundId={validRoundId}
        tracks={tracks}
        isLocked={gradingLocked || advancementConfirmed}
      />

      {/* Section 3 - Advancement preview table */}
      {previewData && (
        <>
          <AdvancementPreviewTable
            roundId={validRoundId}
            previewData={displayPreviewData as AdvancementPreviewResponse | undefined}
            isLoading={previewMutation.isPending}
            onOverride={handleOverride}
            onClearOverride={handleClearOverride}
          />
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
