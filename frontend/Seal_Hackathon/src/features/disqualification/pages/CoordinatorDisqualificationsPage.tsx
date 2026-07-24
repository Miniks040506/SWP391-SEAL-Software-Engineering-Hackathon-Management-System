import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { DisqualificationStatusBadge } from "../components/DisqualificationStatusBadge";
import { DisqualificationStatTile } from "../components/DisqualificationStatTile";
import { OverturnDisqualificationDialog } from "../components/OverturnDisqualificationDialog";
import { DisqualifySubmissionDialog } from "../components/DisqualifySubmissionDialog";
import {
  useEventDisqualificationsQuery,
  useOverturnDisqualificationMutation,
  useDisqualifySubmissionMutation,
} from "../hooks/useDisqualificationQueries";
import type {
  DisqualifyFormValues,
  OverturnFormValues,
} from "../schemas/disqualification.schema";
import type { DisqualificationResponse } from "@/types/disqualification.types";
import {
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventTracksQuery,
} from "../../coordinator/hooks/useCoordinatorEventQueries";
import "../styles/disqualifications.css";

/** Row status dot colour driven by appeal status. */
function statusDot(appealStatus?: string) {
  switch (appealStatus) {
    case "PENDING":
      return "bg-amber-500";
    case "OVERTURNED":
      return "bg-emerald-500";
    case "UPHELD":
      return "bg-red-500";
    default:
      return "bg-red-400";
  }
}

/** Small neutral status pill used for submission / team status. */
function StatusPill({ value }: { value: string }) {
  const tone =
    value === "DISQUALIFIED"
      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30"
      : value === "COMPETING"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600";
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        tone,
      ].join(" ")}
    >
      {value}
    </span>
  );
}

/** One segment inside the unified action toolbar. */
function SegBtn({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: "slate" | "blue" | "red";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const hover =
    tone === "blue"
      ? "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/15 dark:hover:text-blue-300"
      : tone === "red"
        ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-300"
        : "hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-100";
  return (
    <Tooltip title={label} arrow>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={[
          "flex h-9 w-10 cursor-pointer items-center justify-center text-slate-500 transition-colors active:scale-90 dark:text-slate-400",
          hover,
        ].join(" ")}
      >
        {children}
      </button>
    </Tooltip>
  );
}

const selectSx = {
  minWidth: 150,
  borderRadius: "10px",
  ".dark & .MuiInputBase-input": { color: "#e2e8f0" },
  ".dark & .MuiSvgIcon-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
};

export function CoordinatorDisqualificationsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [roundId, setRoundId] = useState<string>("all");
  const [trackId, setTrackId] = useState<string>("all");
  const [appealStatus, setAppealStatus] = useState<string>("all");

  const [overturnDialogOpen, setOverturnDialogOpen] = useState(false);
  const [selectedDisqualificationId, setSelectedDisqualificationId] = useState<
    string | null
  >(null);

  const [disqualifyDialogOpen, setDisqualifyDialogOpen] = useState(false);
  const [
    selectedSubmissionIdToDisqualify,
    setSelectedSubmissionIdToDisqualify,
  ] = useState<string | null>(null);

  const [viewAppealDialogOpen, setViewAppealDialogOpen] = useState(false);
  const [selectedAppealDisqualification, setSelectedAppealDisqualification] =
    useState<DisqualificationResponse | null>(null);

  const { data: rounds = [] } = useCoordinatorEventRoundsQuery(eventId);
  const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);

  const {
    data: disqualifications = [],
    isLoading,
    error,
    refetch,
  } = useEventDisqualificationsQuery(eventId, {
    roundId: roundId !== "all" ? roundId : undefined,
    trackId: trackId !== "all" ? trackId : undefined,
    appealStatus: appealStatus !== "all" ? appealStatus : undefined,
  });

  const overturnMutation = useOverturnDisqualificationMutation();
  const disqualifyMutation = useDisqualifySubmissionMutation();

  const stats = useMemo(() => {
    const pending = disqualifications.filter(
      (d) => d.appealStatus === "PENDING",
    ).length;
    const overturned = disqualifications.filter(
      (d) => d.appealStatus === "OVERTURNED",
    ).length;
    const active = disqualifications.filter(
      (d) => d.submissionStatus === "DISQUALIFIED",
    ).length;
    return {
      total: disqualifications.length,
      pending,
      overturned,
      active,
    };
  }, [disqualifications]);

  const handleOpenOverturn = (id: string) => {
    setSelectedDisqualificationId(id);
    setOverturnDialogOpen(true);
  };

  const handleCloseOverturn = () => {
    setOverturnDialogOpen(false);
    setSelectedDisqualificationId(null);
  };

  const handleConfirmOverturn = async (values: OverturnFormValues) => {
    if (!selectedDisqualificationId) return;
    const res = await overturnMutation.mutateAsync({
      disqualificationId: selectedDisqualificationId,
      payload: { reason: values.overturnReason },
    });

    refetch();
    return res;
  };

  const handleOpenDisqualify = (submissionId: string) => {
    setSelectedSubmissionIdToDisqualify(submissionId);
    setDisqualifyDialogOpen(true);
  };

  const handleCloseDisqualify = () => {
    setDisqualifyDialogOpen(false);
    setSelectedSubmissionIdToDisqualify(null);
  };

  const handleConfirmDisqualify = async (values: DisqualifyFormValues) => {
    if (!selectedSubmissionIdToDisqualify) return;
    const res = await disqualifyMutation.mutateAsync({
      submissionId: selectedSubmissionIdToDisqualify,
      payload: values,
    });
    refetch();
    return res;
  };

  const handleOpenViewAppeal = (disqualification: DisqualificationResponse) => {
    setSelectedAppealDisqualification(disqualification);
    setViewAppealDialogOpen(true);
  };

  const handleCloseViewAppeal = () => {
    setViewAppealDialogOpen(false);
    setSelectedAppealDisqualification(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert severity="error">Failed to load disqualifications.</Alert>
      </div>
    );
  }

  const filtersActive =
    roundId !== "all" || trackId !== "all" || appealStatus !== "all";
  // Re-key the table body on any filter change so the swap animation re-runs.
  const swapKey = `${roundId}|${trackId}|${appealStatus}`;

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      {/* Console header */}
      <div className="dqx-rise mb-5 flex items-center gap-3 border-b-2 border-red-500/70 pb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm shadow-red-600/30">
          <ShieldOutlinedIcon />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Integrity Console
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Disqualifications &amp; appeals — review flags and keep the
            leaderboard fair.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DisqualificationStatTile
          label="Total cases"
          value={stats.total}
          tone="slate"
          delayMs={40}
          icon={<GavelOutlinedIcon fontSize="small" />}
        />
        <DisqualificationStatTile
          label="Awaiting review"
          value={stats.pending}
          tone="amber"
          active={stats.pending > 0}
          delayMs={100}
          icon={<PendingActionsOutlinedIcon fontSize="small" />}
        />
        <DisqualificationStatTile
          label="Currently DQ'd"
          value={stats.active}
          tone="red"
          delayMs={160}
          icon={<BlockOutlinedIcon fontSize="small" />}
        />
        <DisqualificationStatTile
          label="Overturned"
          value={stats.overturned}
          tone="emerald"
          delayMs={220}
          icon={<RestoreOutlinedIcon fontSize="small" />}
        />
      </div>

      {/* Priority alert — only when appeals await a decision */}
      {stats.pending > 0 && (
        <button
          type="button"
          onClick={() => setAppealStatus("PENDING")}
          className="dqx-alert mb-5 flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 px-5 py-3 text-left dark:border-red-500/40 dark:bg-red-500/10"
        >
          <div className="flex items-center gap-3">
            <span className="dqx-ping relative flex h-2.5 w-2.5 text-red-500">
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-800 dark:text-red-200">
              {stats.pending} appeal{stats.pending > 1 ? "s" : ""} awaiting your
              review
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-300">
            Review →
          </span>
        </button>
      )}

      {/* Filter toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <span className="flex items-center gap-1.5 pl-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <FilterAltOutlinedIcon fontSize="small" /> Filters
        </span>
        <FormControl size="small" sx={selectSx}>
          <InputLabel>Round</InputLabel>
          <Select
            value={roundId}
            label="Round"
            onChange={(e) => setRoundId(e.target.value)}
          >
            <MenuItem value="all">All Rounds</MenuItem>
            {rounds.map((r: { id: string; name: string }) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={selectSx}>
          <InputLabel>Track</InputLabel>
          <Select
            value={trackId}
            label="Track"
            onChange={(e) => setTrackId(e.target.value)}
          >
            <MenuItem value="all">All Tracks</MenuItem>
            {tracks.map((t: { id: string; name: string }) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={selectSx}>
          <InputLabel>Appeal Status</InputLabel>
          <Select
            value={appealStatus}
            label="Appeal Status"
            onChange={(e) => setAppealStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="UPHELD">Upheld</MenuItem>
            <MenuItem value="OVERTURNED">Overturned</MenuItem>
          </Select>
        </FormControl>

        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setRoundId("all");
              setTrackId("all");
              setAppealStatus("all");
            }}
            className="cursor-pointer text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}

        <span className="ml-auto pr-1 text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
          {disqualifications.length} case
          {disqualifications.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Data table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">Case</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Appeal</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Issued</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody key={swapKey} className="dqx-swap">
              {disqualifications.length > 0 ? (
                disqualifications.map(
                  (d: DisqualificationResponse, index: number) => (
                    <tr
                      key={d.id}
                      className="dqx-row group border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/40"
                      style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}
                    >
                      {/* Case */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-2">
                          <span
                            className={[
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              statusDot(d.appealStatus),
                            ].join(" ")}
                            title={d.appealStatus || "Disqualified"}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {d.teamName}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>{d.roundName}</span>
                              <span className="text-slate-300 dark:text-slate-600">
                                •
                              </span>
                              <span>{d.trackName || "No track"}</span>
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                              #{d.submissionId.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="max-w-[280px] px-4 py-3 align-top">
                        <p className="line-clamp-2 text-slate-700 dark:text-slate-300">
                          {d.reason}
                        </p>
                        {d.evidenceUrl && (
                          <a
                            href={d.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />
                            Evidence
                          </a>
                        )}
                      </td>

                      {/* Appeal */}
                      <td className="px-4 py-3 align-top">
                        <DisqualificationStatusBadge
                          appealStatus={
                            d.appealStatus as
                              | "PENDING"
                              | "UPHELD"
                              | "OVERTURNED"
                              | undefined
                          }
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <StatusPill value={d.submissionStatus} />
                          <StatusPill value={d.teamStatus} />
                        </div>
                      </td>

                      {/* Issued */}
                      <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-slate-500 dark:text-slate-400">
                        <div className="font-medium text-slate-600 dark:text-slate-300">
                          {new Date(d.issuedAt).toLocaleDateString()}
                        </div>
                        <div className="mt-0.5">{d.issuedByName || "System"}</div>
                      </td>

                      {/* Actions — unified segmented toolbar */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end">
                          <div className="inline-flex items-center divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
                            <SegBtn
                              label="View details"
                              tone="slate"
                              onClick={() =>
                                navigate(
                                  `/coordinator/submissions/${d.submissionId}?dq=${d.id}`,
                                )
                              }
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </SegBtn>
                            {d.appealNote && (
                              <SegBtn
                                label="View appeal"
                                tone="blue"
                                onClick={() => handleOpenViewAppeal(d)}
                              >
                                <ForumOutlinedIcon sx={{ fontSize: 18 }} />
                              </SegBtn>
                            )}
                            {d.submissionStatus !== "DISQUALIFIED" && (
                              <SegBtn
                                label="Disqualify submission"
                                tone="red"
                                onClick={() =>
                                  handleOpenDisqualify(d.submissionId)
                                }
                              >
                                <GavelOutlinedIcon sx={{ fontSize: 18 }} />
                              </SegBtn>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <ShieldOutlinedIcon />
                      </span>
                      <p className="mt-3 text-base font-bold text-slate-700 dark:text-slate-200">
                        No disqualifications found
                      </p>
                      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        {filtersActive
                          ? "No cases match the current filters. Try clearing them."
                          : "The competition is running clean — no integrity flags for this event."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDisqualificationId && (
        <OverturnDisqualificationDialog
          open={overturnDialogOpen}
          onClose={handleCloseOverturn}
          disqualificationId={selectedDisqualificationId}
          isPending={overturnMutation.isPending}
          onConfirm={handleConfirmOverturn}
        />
      )}

      {selectedSubmissionIdToDisqualify && (
        <DisqualifySubmissionDialog
          open={disqualifyDialogOpen}
          onClose={handleCloseDisqualify}
          submissionId={selectedSubmissionIdToDisqualify}
          isPending={disqualifyMutation.isPending}
          onConfirm={handleConfirmDisqualify}
        />
      )}

      {selectedAppealDisqualification && (
        <Dialog
          open={viewAppealDialogOpen}
          onClose={handleCloseViewAppeal}
          maxWidth="sm"
          fullWidth
          classes={{
            paper: "bg-white dark:bg-slate-900 dark:text-slate-200 dqx-pop",
          }}
          slotProps={{
            backdrop: {
              sx: {
                backdropFilter: "blur(3px)",
                backgroundColor: "rgba(15, 23, 42, 0.55)",
              },
            },
          }}
          sx={{
            "& .MuiDialog-paper": {
              backgroundImage: "none",
              borderRadius: "20px",
              overflow: "hidden",
            },
          }}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5 text-white">
            <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ForumOutlinedIcon />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
                  Team appeal
                </p>
                <p className="truncate text-xl font-extrabold tracking-tight">
                  {selectedAppealDisqualification.teamName}
                </p>
              </div>
            </div>
            <div className="relative mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-blue-100">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1">
                <EventOutlinedIcon sx={{ fontSize: 14 }} />
                {selectedAppealDisqualification.roundName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1">
                <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
                {selectedAppealDisqualification.trackName || "No track"}
              </span>
            </div>
          </div>

          <DialogContent className="space-y-4 px-6 py-5">
            {/* Why flagged */}
            <div
              className="dqx-section rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
              style={{ animationDelay: "40ms" }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <FlagOutlinedIcon sx={{ fontSize: 16 }} />
                  Why they were flagged
                </span>
                <DisqualificationStatusBadge
                  appealStatus={
                    selectedAppealDisqualification.appealStatus as
                      | "PENDING"
                      | "UPHELD"
                      | "OVERTURNED"
                      | undefined
                  }
                />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedAppealDisqualification.reason}
              </p>
            </div>

            {/* The appeal */}
            <div
              className="dqx-section rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-500/10"
              style={{ animationDelay: "120ms" }}
            >
              <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                <RecordVoiceOverOutlinedIcon sx={{ fontSize: 16 }} />
                The team&apos;s appeal
              </span>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {selectedAppealDisqualification.appealNote}
              </p>
            </div>
          </DialogContent>

          <DialogActions className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
            <Button
              onClick={handleCloseViewAppeal}
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<RestoreOutlinedIcon />}
              onClick={() => {
                handleCloseViewAppeal();
                handleOpenOverturn(selectedAppealDisqualification.id);
              }}
              disabled={
                selectedAppealDisqualification.appealStatus === "OVERTURNED"
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                boxShadow: "none",
              }}
            >
              Overturn disqualification
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
