import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Alert, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
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
  rankingCalculatedAt?: string;
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

  const handleConfirm = async () => {
    if (!displayPreviewData) return;

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
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Typography variant="body2" className="text-slate-500 mb-1">
            Coordinator / Rounds /{" "}
            {roundDetail ? roundDetail.name : validRoundId} / Advancement
          </Typography>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300 mb-1">
            Round Advancement
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Preview and confirm which teams advance to the next round.
          </p>
        </div>
        <div className="flex gap-2">
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
            disabled={!displayPreviewData || confirmMutation.isPending}
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

      {/* Section 1 - Round context card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-300">
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
                {roundDetail.gradingLockedAt ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Ranking Calculation:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {(roundDetail as LocalRoundDetail).rankingCalculatedAt
                  ? "Calculated"
                  : "Not Calculated"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 font-medium">
                Advancement Confirmed:
              </span>{" "}
              <span className="text-slate-800 dark:text-slate-200">
                {(roundDetail as any).advancementConfirmed ? "Yes" : "No"}
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

        {roundDetail && !roundDetail.gradingLockedAt && (
          <Alert severity="warning" className="mb-2">
            Lock grading before confirming advancement.
          </Alert>
        )}
        {roundDetail &&
          !(roundDetail as LocalRoundDetail).rankingCalculatedAt && (
            <Alert severity="warning" className="mb-2">
              Calculate ranking before previewing advancement.
            </Alert>
          )}
        {roundDetail && (roundDetail as any).advancementConfirmed && (
          <Alert severity="info" className="mb-2">
            Advancement has already been confirmed. Manual changes require
            override flow.
          </Alert>
        )}
      </div>

      {/* Section 2 - Advance rule panel */}
      <AdvanceRulePanel
        roundId={validRoundId}
        isLocked={!!roundDetail?.gradingLockedAt || !!previewData?.advancementConfirmed}
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
