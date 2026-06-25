import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Tooltip,
  Chip,
  Button,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useState } from "react";
import type {
  AdvancementPreviewResponse,
  AdvancementCandidateRow,
} from "@/types/advancement.types";

import {
  AdvancementStatusBadge,
  type AdvancementStatus,
} from "./AdvancementStatusBadge";
import { OverrideReasonDialog } from "./OverrideReasonDialog";

interface AdvancementPreviewTableProps {
  roundId: string;
  previewData: AdvancementPreviewResponse | undefined;
  isLoading: boolean;
  onOverride: (teamId: string, newStatus: string, reason: string) => void;
  onClearOverride?: (teamId: string) => void;
}

export function AdvancementPreviewTable({
  previewData,
  isLoading,
  onOverride,
  onClearOverride,
}: AdvancementPreviewTableProps) {
  const [overrideState, setOverrideState] = useState<{
    open: boolean;
    teamId: string;
    teamName: string;
    currentStatus: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
        <Skeleton variant="rectangular" height={40} className="mb-4 rounded" />
        <Skeleton variant="rectangular" height={300} className="rounded" />
      </div>
    );
  }

  if (!previewData) return null;

  const handleOpenDialog = (
    teamId: string,
    teamName: string,
    currentStatus: string,
  ) => {
    setOverrideState({
      open: true,
      teamId,
      teamName,
      currentStatus,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-300">
          Advancement Preview
        </h2>
        <Chip
          label="Suggested by system"
          color="primary"
          variant="outlined"
          size="small"
        />
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
        Rules applied for cutoff calculation. Teams matching rules advance
        automatically.
      </div>

      <TableContainer
        component={Paper}
        elevation={0}
        className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
      >
        <Table>
          <TableHead className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Rank
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Team
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Project Title
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Track
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Total Score
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Rule Matched
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Suggested Status
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Final Status
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Reason
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Override
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.candidates.map(
              (team: AdvancementCandidateRow, index: number) => {
                const teamId = team.teamId || `team-${index}`;
                const teamName = team.teamName || "Unknown Team";
                const currentStatus =
                  team.finalStatus ||
                  team.suggestedStatus ||
                  "PENDING_CONFIRMATION";
                const isOverridden = !!team.overrideReason;

                const isDisqualified =
                  (team.suggestedStatus as string) === "DISQUALIFIED" ||
                  (team.finalStatus as string) === "DISQUALIFIED";

                return (
                  <TableRow
                    key={teamId}
                    className={
                      isDisqualified
                        ? "bg-red-50 dark:bg-red-950/20 opacity-75"
                        : team.suggestedStatus === "ADVANCED"
                        ? "bg-green-50 dark:bg-green-950/20"
                        : ""
                    }
                    style={
                      isOverridden ? { borderLeft: "3px solid #f59e0b" } : {}
                    }
                  >
                    <TableCell>{team.rankPosition || index + 1}</TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center">
                        {teamName}
                        {isOverridden && (
                          <Tooltip title={`Overridden: ${team.overrideReason}`}>
                            <EditOutlinedIcon
                              fontSize="small"
                              className="ml-2 text-amber-500"
                            />
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {team.projectTitle || "—"}
                    </TableCell>
                    <TableCell>{team.trackName || "N/A"}</TableCell>
                    <TableCell>{team.totalScore || 0}</TableCell>
                    <TableCell>{team.ruleType || "-"}</TableCell>
                    <TableCell>
                      {(team.suggestedStatus as string) === "DISQUALIFIED" ? (
                        <Chip label="DISQUALIFIED" color="error" size="small" />
                      ) : (
                        <AdvancementStatusBadge
                          status={team.suggestedStatus as AdvancementStatus}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {team.finalStatus ? (
                        (team.finalStatus as string) === "DISQUALIFIED" ? (
                          <Chip label="DISQUALIFIED" color="error" size="small" />
                        ) : (
                          <AdvancementStatusBadge
                            status={team.finalStatus as AdvancementStatus}
                          />
                        )
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>{team.overrideReason || ""}</TableCell>
                    <TableCell>
                      {isDisqualified ? (
                        <span className="text-red-500 text-sm font-medium">
                          Disqualified
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleOpenDialog(teamId, teamName, currentStatus)
                            }
                          >
                            {isOverridden ? "Edit Override" : "Override"}
                          </Button>
                          {isOverridden && onClearOverride && (
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              onClick={() => onClearOverride(teamId)}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              },
            )}
            {previewData.candidates.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-slate-500"
                >
                  No teams found or ranking not yet calculated.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {overrideState && (
        <OverrideReasonDialog
          open={overrideState.open}
          teamName={overrideState.teamName}
          currentStatus={overrideState.currentStatus}
          initialStatus={
            overrideState.currentStatus === "ADVANCED"
              ? "ELIMINATED"
              : "ADVANCED"
          }
          onClose={() => setOverrideState(null)}
          onConfirm={(newStatus, reason) => {
            onOverride(overrideState.teamId, newStatus, reason);
            setOverrideState(null);
          }}
        />
      )}
    </div>
  );
}
