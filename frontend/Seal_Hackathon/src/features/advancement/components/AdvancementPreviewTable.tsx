import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  MenuItem,
  Select,
  Tooltip,
  Chip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useState } from "react";
import type { AdvancementPreviewResponse } from "@/types/round.types";
import type { RankingResponse } from "@/types/ranking.types";

import {
  AdvancementStatusBadge,
  type AdvancementStatus,
} from "./AdvancementStatusBadge";
import { OverrideReasonDialog } from "./OverrideReasonDialog";

type LocalPreviewTeam = RankingResponse & {
  teamId?: string;
  teamName?: string;
  name?: string;
  rank?: number;
  trackName?: string;
  totalScore?: number;
  ruleMatched?: string;
  status?: string;
  overrideReason?: string;
};

interface AdvancementPreviewTableProps {
  roundId: string;
  previewData: AdvancementPreviewResponse | undefined;
  isLoading: boolean;
  onOverride: (teamId: string, newStatus: string, reason: string) => void;
}

export function AdvancementPreviewTable({
  previewData,
  isLoading,
  onOverride,
}: AdvancementPreviewTableProps) {
  const [overrideState, setOverrideState] = useState<{
    open: boolean;
    teamId: string;
    teamName: string;
    currentStatus: string;
    newStatus: string;
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

  const handleSelectChange = (
    teamId: string,
    teamName: string,
    currentStatus: string,
    newStatus: string
  ) => {
    if (currentStatus !== newStatus) {
      setOverrideState({
        open: true,
        teamId,
        teamName,
        currentStatus,
        newStatus,
      });
    }
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

      {previewData.warnings && previewData.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {previewData.warnings.map((warning, idx) => (
            <Typography key={idx} color="warning.main" variant="body2">
              Warning: {warning}
            </Typography>
          ))}
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
        Rules applied for cutoff calculation. Teams matching rules advance automatically.
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
                Reason
              </TableCell>
              <TableCell className="font-semibold text-slate-600 dark:text-slate-300">
                Override
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.suggestedAdvancedTeams.map((team: LocalPreviewTeam, index: number) => {
              const teamId = team.teamId || team.id || `team-${index}`;
              const teamName = team.teamName || team.name || "Unknown Team";
              const currentStatus = team.status || "PENDING_CONFIRMATION";
              const isOverridden = !!team.overrideReason;

              return (
                <TableRow
                  key={teamId}
                  style={
                    isOverridden ? { borderLeft: "3px solid #f59e0b" } : {}
                  }
                >
                  <TableCell>{team.rank || index + 1}</TableCell>
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
                  <TableCell>{team.trackName || "N/A"}</TableCell>
                  <TableCell>{team.totalScore || 0}</TableCell>
                  <TableCell>{team.ruleMatched || "-"}</TableCell>
                  <TableCell>
                    <AdvancementStatusBadge
                      status={currentStatus as AdvancementStatus}
                    />
                  </TableCell>
                  <TableCell>{team.overrideReason || ""}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={currentStatus}
                      onChange={(e) =>
                        handleSelectChange(
                          teamId,
                          teamName,
                          currentStatus,
                          e.target.value as string
                        )
                      }
                      className="min-w-[140px]"
                    >
                      <MenuItem value="ADVANCED">Advanced</MenuItem>
                      <MenuItem value="ELIMINATED">Eliminated</MenuItem>
                      <MenuItem value="WILDCARD">Wildcard</MenuItem>
                      <MenuItem value="PENDING_CONFIRMATION" disabled>
                        Pending
                      </MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {previewData.suggestedAdvancedTeams.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
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
          newStatus={overrideState.newStatus}
          onClose={() => setOverrideState(null)}
          onConfirm={(reason) => {
            onOverride(overrideState.teamId, overrideState.newStatus, reason);
            setOverrideState(null);
          }}
        />
      )}
    </div>
  );
}
