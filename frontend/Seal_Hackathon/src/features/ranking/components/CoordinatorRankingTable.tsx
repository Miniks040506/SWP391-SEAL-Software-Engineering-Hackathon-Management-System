import { useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Tooltip } from "@mui/material";

import { DisqualificationStatusBadge } from "@/features/disqualification/components/DisqualificationStatusBadge";
import { DisqualifySubmissionDialog } from "@/features/disqualification/components/DisqualifySubmissionDialog";
import { useDisqualifySubmissionMutation } from "@/features/disqualification/hooks/useDisqualificationQueries";
import type { DisqualifyFormValues } from "@/features/disqualification/schemas/disqualification.schema";
import { WinnerPrizeBadge } from "@/features/events/components/WinnerPrizeBadge";
import type { PrizeResponse } from "@/types/prize.types";
import type { RankingResponse } from "@/types/ranking.types";
import { RankingStatusBadge } from "./RankingStatusBadge";

interface CoordinatorRankingTableProps {
  rankings: RankingResponse[];
  awardsByTeamId?: Map<string, PrizeResponse[]>;
  approvingRankingId?: string;
  onApproveTie?: (ranking: RankingResponse) => void;
}

type RowStatus =
  | "ADVANCED"
  | "FINAL_RESULT"
  | "ELIMINATED"
  | "DISQUALIFIED";

type RowAnimationStyle = CSSProperties & {
  "--row-index": number;
};

function getRowStatus(row: RankingResponse): RowStatus {
  if (
    row.advanceReason === "DISQUALIFIED" ||
    row.submissionStatus === "DISQUALIFIED"
  ) {
    return "DISQUALIFIED";
  }
  if (row.finalRound) {
    return "FINAL_RESULT";
  }
  return row.advanced ? "ADVANCED" : "ELIMINATED";
}

function StatusText({ status }: { status: RowStatus }) {
  if (status === "ADVANCED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckRoundedIcon style={{ fontSize: 14 }} />
        Advanced
      </span>
    );
  }
  if (status === "DISQUALIFIED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
        <BlockOutlinedIcon style={{ fontSize: 14 }} />
        Disqualified
      </span>
    );
  }
  if (status === "FINAL_RESULT") {
    return (
      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
        Final result
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
      Not advanced
    </span>
  );
}

function RankCell({ row }: { row: RankingResponse }) {
  const status = getRowStatus(row);
  if (status === "DISQUALIFIED") {
    return (
      <span className="text-lg font-extrabold tabular-nums text-gray-300 dark:text-slate-700">
        -
      </span>
    );
  }

  return (
    <span
      className={[
        "text-lg font-extrabold tabular-nums",
        row.rankPosition <= 3
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-300 dark:text-slate-600",
      ].join(" ")}
    >
      {row.rankPosition}
    </span>
  );
}

function CoordinatorBadges({
  row,
  status,
}: {
  row: RankingResponse;
  status: RowStatus;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusText status={status} />
      {status === "DISQUALIFIED" && row.appealStatus && (
        <DisqualificationStatusBadge appealStatus={row.appealStatus} />
      )}
      {row.published !== undefined && (
        <RankingStatusBadge
          type={row.published ? "PUBLISHED" : "UNPUBLISHED"}
        />
      )}
      {row.manualResolutionRequired && (
        <RankingStatusBadge type="MANUAL_REVIEW" />
      )}
    </div>
  );
}

export const CoordinatorRankingTable = ({
  rankings,
  awardsByTeamId,
  approvingRankingId,
  onApproveTie,
}: CoordinatorRankingTableProps) => {
  const disqualifyMutation = useDisqualifySubmissionMutation();
  const [disqualifyDialogOpen, setDisqualifyDialogOpen] = useState(false);
  const [
    selectedSubmissionIdToDisqualify,
    setSelectedSubmissionIdToDisqualify,
  ] = useState<string | null>(null);

  const handleOpenDisqualify = (submissionId: string) => {
    setSelectedSubmissionIdToDisqualify(submissionId);
    setDisqualifyDialogOpen(true);
  };

  const handleCloseDisqualify = () => {
    setDisqualifyDialogOpen(false);
    setSelectedSubmissionIdToDisqualify(null);
  };

  const handleConfirmDisqualify = async (values: DisqualifyFormValues) => {
    if (!selectedSubmissionIdToDisqualify) return undefined;
    return disqualifyMutation.mutateAsync({
      submissionId: selectedSubmissionIdToDisqualify,
      payload: values,
    });
  };

  if (rankings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No rankings available yet.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-900 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-slate-200 dark:text-slate-500">
              <th scope="col" className="w-16 py-3 pr-4">
                Rank
              </th>
              <th scope="col" className="py-3 pr-4">
                Team
              </th>
              <th scope="col" className="py-3 pr-4">
                Track
              </th>
              <th scope="col" className="py-3 pr-4">
                Round
              </th>
              <th scope="col" className="py-3 pr-4 text-center">
                Judges
              </th>
              <th scope="col" className="py-3 pr-4">
                Status
              </th>
              <th scope="col" className="w-28 py-3 pr-4 text-right">
                <span className="inline-flex items-center gap-1">
                  Score
                  <Tooltip
                    title="Weighted average from final judge scores"
                    arrow
                    placement="top"
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                  </Tooltip>
                </span>
              </th>
              <th scope="col" className="py-3 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {rankings.map((row, index) => {
              const status = getRowStatus(row);
              const disqualified = status === "DISQUALIFIED";
              const rowStyle: RowAnimationStyle = { "--row-index": index };

              return (
                <tr
                  key={row.id}
                  style={rowStyle}
                  className="rankrow-enter transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/60"
                >
                  <td className="py-4 pr-4">
                    <RankCell row={row} />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="min-w-0">
                        <p
                          className={[
                            "truncate text-[15px] font-bold",
                            disqualified
                              ? "text-gray-400 line-through decoration-1 dark:text-slate-500"
                              : "text-gray-900 dark:text-white",
                          ].join(" ")}
                        >
                          {row.teamName}
                        </p>
                        {row.projectTitle && (
                          <p className="truncate text-xs font-medium text-gray-400 dark:text-slate-500">
                            {row.projectTitle}
                          </p>
                        )}
                      </div>
                      {awardsByTeamId?.get(row.teamId)?.map((prize) => (
                        <WinnerPrizeBadge
                          key={prize.id}
                          prizeTitle={prize.title || ""}
                          className="h-6 w-6 shrink-0"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-medium text-gray-500 dark:text-slate-400">
                    {row.trackName || "-"}
                  </td>
                  <td className="py-4 pr-4 font-medium text-gray-500 dark:text-slate-400">
                    {row.roundName || "-"}
                  </td>
                  <td className="py-4 pr-4 text-center font-semibold tabular-nums text-gray-500 dark:text-slate-400">
                    {row.judgeCount || 0}
                  </td>
                  <td className="py-4 pr-4">
                    <CoordinatorBadges row={row} status={status} />
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span
                      className={[
                        "text-lg font-extrabold tabular-nums",
                        disqualified
                          ? "text-gray-300 dark:text-slate-700"
                          : "text-gray-900 dark:text-white",
                      ].join(" ")}
                    >
                      {Number(row.totalScore).toFixed(2)}
                    </span>
                    {row.tied && (
                      <Tooltip
                        title={`Tied score group${row.tieGroupSize ? ` (${row.tieGroupSize} teams)` : ""}`}
                        arrow
                        placement="top"
                      >
                        <p className="flex items-center justify-end gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <ReportProblemOutlinedIcon sx={{ fontSize: 13 }} />
                          Tie {row.tieGroupSize ? `x${row.tieGroupSize}` : ""}
                        </p>
                      </Tooltip>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/coordinator/submissions/${row.submissionId}`}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                        View submission
                      </Link>
                      {row.manualResolutionRequired && onApproveTie && (
                        <button
                          type="button"
                          onClick={() => onApproveTie(row)}
                          disabled={Boolean(approvingRankingId)}
                          className="min-h-9 cursor-pointer rounded-lg bg-amber-500 px-3 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                        >
                          {approvingRankingId === row.id
                            ? "Approving..."
                            : "Approve tie"}
                        </button>
                      )}
                      {!disqualified && (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDisqualify(row.submissionId)
                          }
                          className="min-h-9 cursor-pointer rounded-lg bg-red-600 px-3 text-xs font-bold text-white transition-colors hover:bg-red-700 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                          Disqualify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rankings.map((row, index) => {
          const status = getRowStatus(row);
          const disqualified = status === "DISQUALIFIED";
          const rowStyle: RowAnimationStyle = { "--row-index": index };

          return (
            <article
              key={row.id}
              style={rowStyle}
              className="rankrow-enter rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <RankCell row={row} />
                  <div className="min-w-0">
                    <p
                      className={[
                        "truncate font-bold",
                        disqualified
                          ? "text-slate-400 line-through dark:text-slate-500"
                          : "text-slate-900 dark:text-white",
                      ].join(" ")}
                    >
                      {row.teamName}
                    </p>
                    <p className="truncate text-xs font-medium text-slate-400 dark:text-slate-500">
                      {row.projectTitle || "Untitled submission"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
                    {Number(row.totalScore).toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Score
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{row.trackName || "No track"}</span>
                <span aria-hidden>·</span>
                <span>{row.roundName || "No round"}</span>
                <span aria-hidden>·</span>
                <span>{row.judgeCount || 0} judges</span>
                {row.tied && (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <ReportProblemOutlinedIcon sx={{ fontSize: 13 }} />
                    Tie {row.tieGroupSize ? `x${row.tieGroupSize}` : ""}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CoordinatorBadges row={row} status={status} />
                {awardsByTeamId?.get(row.teamId)?.map((prize) => (
                  <WinnerPrizeBadge
                    key={prize.id}
                    prizeTitle={prize.title || ""}
                    className="h-6 w-6"
                  />
                ))}
              </div>

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Link
                  to={`/coordinator/submissions/${row.submissionId}`}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300"
                >
                  <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                  View submission
                </Link>
                {row.manualResolutionRequired && onApproveTie && (
                  <button
                    type="button"
                    onClick={() => onApproveTie(row)}
                    disabled={Boolean(approvingRankingId)}
                    className="min-h-10 flex-1 cursor-pointer rounded-lg bg-amber-500 px-3 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    {approvingRankingId === row.id
                      ? "Approving..."
                      : "Approve tie"}
                  </button>
                )}
                {!disqualified && (
                  <button
                    type="button"
                    onClick={() => handleOpenDisqualify(row.submissionId)}
                    className="min-h-10 flex-1 cursor-pointer rounded-lg bg-red-600 px-3 text-xs font-bold text-white transition-colors hover:bg-red-700 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Disqualify
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selectedSubmissionIdToDisqualify && (
        <DisqualifySubmissionDialog
          open={disqualifyDialogOpen}
          onClose={handleCloseDisqualify}
          submissionId={selectedSubmissionIdToDisqualify}
          isPending={disqualifyMutation.isPending}
          onConfirm={handleConfirmDisqualify}
        />
      )}
    </>
  );
};
