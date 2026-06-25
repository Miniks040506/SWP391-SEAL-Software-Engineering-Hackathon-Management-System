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
import type { AdvancementPreviewResponse, RoundDetailResponse } from "@/types/round.types";
import type { RankingResponse } from "@/types/ranking.types";

type LocalRoundDetail = RoundDetailResponse & {
  eventName?: string;
  trackName?: string;
  rankingCalculatedAt?: string;
};

type LocalPreviewTeam = RankingResponse & {
  teamId?: string;
  status?: string;
  overrideReason?: string;
};

export function RoundAdvancementPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const validRoundId = roundId || "";

  const { data: roundDetail, isLoading: isRoundLoading } = useQuery({
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
      const result = (await previewMutation.mutateAsync(validRoundId)) as
        | AdvancementPreviewResponse
        | { data: AdvancementPreviewResponse };
      // Depending on axios response format, it might be nested in data or direct
      const responseData = "data" in result ? result.data : result;
      setPreviewData(responseData);
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
    reason: string
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

  // Merge overrides into preview data for display
  const displayPreviewData = previewData
    ? {
        ...previewData,
        suggestedAdvancedTeams: previewData.suggestedAdvancedTeams.map(
          (team: LocalPreviewTeam) => {
            const teamId = team.teamId || team.id;
            const override = overrides.get(teamId!);
            if (override) {
              return {
                ...team,
                status: override.status,
                overrideReason: override.reason,
              };
            }
            // Default status if not present
            return { ...team, status: team.status || "ADVANCED" };
          }
        ),
      }
    : undefined;

  const handleConfirm = async () => {
    if (!displayPreviewData) return;

    // Build the list of advanced team IDs based on the display data
    const advancedTeamIds = displayPreviewData.suggestedAdvancedTeams
      .filter(
        (t: LocalPreviewTeam) => t.status === "ADVANCED" || t.status === "WILDCARD"
      )
      .map((t: LocalPreviewTeam) => t.teamId || t.id) as string[];

    try {
      await confirmMutation.mutateAsync({
        roundId: validRoundId,
        payload: {
          advancedTeamIds,
          note: overrides.size > 0 ? JSON.stringify(Object.fromEntries(overrides)) : "System advancement",
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
    displayPreviewData?.suggestedAdvancedTeams.filter(
      (t: LocalPreviewTeam) => t.status === "ADVANCED" || t.status === "WILDCARD"
    ).length || 0;

  const eliminatedCount =
    displayPreviewData?.suggestedAdvancedTeams.filter(
      (t: LocalPreviewTeam) => t.status === "ELIMINATED"
    ).length || 0;

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300 mb-6">
        Round Advancement
      </h1>

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
                {(roundDetail as LocalRoundDetail).rankingCalculatedAt ? "Calculated" : "Not Calculated"}
              </span>
            </div>
          </div>
        ) : (
          <Typography color="error">Failed to load round context.</Typography>
        )}

        {roundDetail && !roundDetail.gradingLockedAt && (
          <Alert severity="warning" className="mb-2">
            Advancement preview should be run after grading is locked.
          </Alert>
        )}
        {roundDetail && !(roundDetail as LocalRoundDetail).rankingCalculatedAt && (
          <Alert severity="warning" className="mb-2">
            Ranking is required before confirming advancement.
          </Alert>
        )}
      </div>

      {/* Section 2 - Advance rule panel */}
      <AdvanceRulePanel
        roundId={validRoundId}
        onPreview={handlePreview}
        isPreviewing={previewMutation.isPending}
      />

      {/* Section 3 - Advancement preview table */}
      {previewData && (
        <>
          <AdvancementPreviewTable
            roundId={validRoundId}
            previewData={displayPreviewData as AdvancementPreviewResponse}
            isLoading={previewMutation.isPending}
            onOverride={handleOverride}
          />
          <div className="flex justify-end mt-4">
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
                height: 40,
              }}
            >
              Confirm advancement
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
