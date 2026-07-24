import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { teamApi } from "@/api/team.api";
import { avatarColor } from "@/utils/avatarColor";
import type { UUID } from "@/types/common.types";
import type {
  CoordinatorTeamDetailResponse,
  CoordinatorTeamMemberResponse,
  CoordinatorTeamSubmissionProgressResponse,
} from "@/types/team.types";

import { DisqualifySubmissionDialog } from "@/features/disqualification/components/DisqualifySubmissionDialog";
import { useDisqualifySubmissionMutation } from "@/features/disqualification/hooks/useDisqualificationQueries";
import type { DisqualifyFormValues } from "@/features/disqualification/schemas/disqualification.schema";

import {
  formatTeamStatusLabel,
  getSubmissionStatusColor,
  getTeamRegistrationStatusColor,
  getTeamStatusColor,
} from "../schemas/teams.schema";
import { useCoordinatorRegistrationReview } from "../hooks/useCoordinatorRegistrationReview";
import { useCountUp } from "../hooks/useCountUp";
import "../styles/teamDetail.css";

type ReviewAction = "approve" | "reject";

/** Accent colour for the hero status ribbon, keyed on team lifecycle status. */
function statusRibbon(status?: string | null) {
  switch ((status || "").toUpperCase()) {
    case "WINNER":
      return "bg-amber-500";
    case "ELIMINATED":
    case "DISQUALIFIED":
      return "bg-rose-500";
    case "COMPETING":
    case "ADVANCED":
    case "REGISTERED":
      return "bg-blue-500";
    case "FORMING":
    case "INCOMPLETE":
    case "COMPLETE":
      return "bg-indigo-500";
    default:
      return "bg-slate-400";
  }
}

function fmtDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  return withTime ? d.toLocaleString() : d.toLocaleDateString();
}

/* ---------------------------------------------------------------- Sub-parts */

function MetaChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      {children}
    </span>
  );
}

function StatTile({
  label,
  value,
  tone,
  icon,
  delayMs,
}: {
  label: string;
  value: number;
  tone: "slate" | "blue" | "emerald" | "red";
  icon: React.ReactNode;
  delayMs: number;
}) {
  const animated = useCountUp(value);
  const toneMap = {
    slate: { text: "text-slate-900 dark:text-slate-100", accent: "bg-slate-300 dark:bg-slate-600", icon: "text-slate-400 dark:text-slate-500" },
    blue: { text: "text-blue-600 dark:text-blue-400", accent: "bg-blue-500", icon: "text-blue-500 dark:text-blue-400" },
    emerald: { text: "text-emerald-600 dark:text-emerald-400", accent: "bg-emerald-500", icon: "text-emerald-500 dark:text-emerald-400" },
    red: { text: "text-red-600 dark:text-red-400", accent: "bg-red-500", icon: "text-red-500 dark:text-red-400" },
  }[tone];

  return (
    <div
      className="td-rise td-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className={toneMap.icon}>{icon}</span>
      </div>
      <div className={`mt-1.5 text-3xl font-bold leading-none tabular-nums ${toneMap.text}`}>
        {Math.round(animated)}
      </div>
      <span
        className={`td-underline absolute bottom-0 left-0 h-[3px] w-full ${toneMap.accent}`}
        style={{ animationDelay: `${delayMs + 140}ms` }}
      />
    </div>
  );
}

function MemberRow({
  member,
  index,
}: {
  member: CoordinatorTeamMemberResponse;
  index: number;
}) {
  const name = member.fullName || "Unknown member";
  const initial = name.charAt(0) || "?";
  const isLeader = (member.role || "").toUpperCase() === "LEADER";

  return (
    <li
      className="td-stagger td-card flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-800/40"
      style={{ animationDelay: `${120 + index * 55}ms` }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(initial)}`}
      >
        {initial.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
            {name}
          </p>
          {isLeader && (
            <WorkspacePremiumOutlinedIcon
              sx={{ fontSize: 16 }}
              className="shrink-0 text-amber-500"
            />
          )}
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {member.email || "No email"}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-bold uppercase ${
          isLeader
            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        }`}
      >
        {member.role || "MEMBER"}
      </span>
    </li>
  );
}

function SubmissionRow({
  sub,
  index,
  teamStatus,
  onView,
  onDisqualify,
}: {
  sub: CoordinatorTeamSubmissionProgressResponse;
  index: number;
  teamStatus?: string | null;
  onView: (id: UUID) => void;
  onDisqualify: (id: UUID) => void;
}) {
  const hasSubmission = Boolean(sub.submissionId);
  const isScorable =
    sub.submissionStatus === "SUBMITTED" || sub.submissionStatus === "LATE";
  const isEliminated =
    teamStatus === "ELIMINATED" || teamStatus === "DISQUALIFIED";
  const dqDisabled = !isScorable || isEliminated;

  return (
    <div
      className="td-stagger td-card rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/60 dark:bg-slate-800/40"
      style={{ animationDelay: `${120 + index * 70}ms` }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {sub.roundOrderIndex ?? index + 1}
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {sub.roundName || "Round"}
          </span>
        </div>
        {sub.submissionStatus ? (
          <span
            className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-bold ${getSubmissionStatusColor(sub.submissionStatus)}`}
          >
            {sub.submissionStatus}
          </span>
        ) : (
          <span className="text-xs italic text-slate-400">No submission</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Attempt
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            {sub.submissionNumber ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Submitted
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            {sub.submittedAt ? fmtDate(sub.submittedAt, true) : "Not yet"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Links
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            <LinkOutlinedIcon sx={{ fontSize: 15 }} className="text-slate-400" />
            {sub.linkCount}
          </p>
        </div>
      </div>

      {sub.note && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
          <StickyNote2OutlinedIcon
            sx={{ fontSize: 16 }}
            className="mt-0.5 shrink-0 text-amber-500"
          />
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-100/90">
            {sub.note}
          </p>
        </div>
      )}

      {hasSubmission && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-700/60">
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={() => onView(sub.submissionId as UUID)}
            sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
          >
            View submission
          </Button>
          {dqDisabled ? (
            <Tooltip
              arrow
              placement="top"
              title={
                isEliminated
                  ? "This team has already been disqualified."
                  : "Only submitted submissions can be disqualified."
              }
            >
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled
                  startIcon={<GavelOutlinedIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  Disqualify
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<GavelOutlinedIcon />}
              onClick={() => onDisqualify(sub.submissionId as UUID)}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              Disqualify
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- Page */

export function CoordinatorTeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [detail, setDetail] = useState<CoordinatorTeamDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { approve, reject, reviewingTeamId, error, clearError } =
    useCoordinatorRegistrationReview();

  const [disqualifySubmissionId, setDisqualifySubmissionId] =
    useState<UUID | null>(null);
  const disqualifyMutation = useDisqualifySubmissionMutation();

  const load = useCallback(() => {
    if (!teamId) return;
    setLoading(true);
    setLoadError(false);
    teamApi
      .getCoordinatorTeamSummary(teamId)
      .then((res) => setDetail(res))
      .catch(() => {
        setDetail(null);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  useEffect(() => {
    // Initial load sets a loading flag synchronously; this mirrors the
    // existing coordinator data-load pattern (see TeamDetailDrawer).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const isReviewing = Boolean(detail && reviewingTeamId === detail.teamId);
  const canReviewRegistration =
    detail?.registrationStatus?.toUpperCase() === "PENDING_APPROVAL";

  const handleOpenReview = (action: ReviewAction) => {
    clearError();
    setRejectReason("");
    setReviewAction(action);
  };

  const handleCloseReview = () => {
    clearError();
    setRejectReason("");
    setReviewAction(null);
  };

  const handleSubmitReview = async () => {
    if (!detail || !reviewAction) return;
    try {
      const updated =
        reviewAction === "approve"
          ? await approve(detail.teamId)
          : await reject(detail.teamId, rejectReason);
      setDetail(updated);
      queryClient.invalidateQueries({
        queryKey: ["pending-team-approval-count"],
      });
      enqueueSnackbar(
        reviewAction === "approve"
          ? "Team registration approved."
          : "Team registration rejected.",
        { variant: reviewAction === "approve" ? "success" : "info" },
      );
      handleCloseReview();
    } catch {
      // Hook surfaces the displayable error inside the dialog.
    }
  };

  const handleDisqualify = async (values: DisqualifyFormValues) => {
    if (!disqualifySubmissionId) return;
    const res = await disqualifyMutation.mutateAsync({
      submissionId: disqualifySubmissionId,
      payload: values,
    });
    load();
    queryClient.invalidateQueries({ queryKey: ["coordinator-team-detail"] });
    return res;
  };

  /* ------------------------------------------------------------ Loading */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (loadError || !detail) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={() => navigate("/coordinator/teams")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowBackOutlinedIcon fontSize="small" /> Back to teams
        </button>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            Team not found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This team could not be loaded. It may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const leaderName =
    detail.leaderName ||
    detail.members?.find((m) => (m.role || "").toUpperCase() === "LEADER")
      ?.fullName ||
    "Unassigned";

  /* --------------------------------------------------------------- Render */
  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] bg-slate-50 p-6 dark:bg-transparent">
      {/* Breadcrumb + back */}
      <div className="td-fade mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/coordinator/teams")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowBackOutlinedIcon fontSize="small" /> Teams
        </button>
        <nav className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
          <span>Team Management</span>
          <span>/</span>
          <span className="max-w-[240px] truncate text-slate-600 dark:text-slate-300">
            {detail.teamName}
          </span>
        </nav>
      </div>

      {/* Hero */}
      <div className="td-rise relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <span
          className={`td-ribbon absolute inset-y-0 left-0 w-1.5 ${statusRibbon(detail.status)}`}
        />
        <div className="flex flex-col gap-5 pl-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {detail.teamName}
              </h1>
              {detail.status && (
                <span
                  className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${getTeamStatusColor(detail.status)}`}
                >
                  {formatTeamStatusLabel(detail.status)}
                </span>
              )}
              {detail.registrationStatus && (
                <span
                  className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${getTeamRegistrationStatusColor(detail.registrationStatus)}`}
                >
                  {formatTeamStatusLabel(detail.registrationStatus)}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MetaChip icon={<EventOutlinedIcon sx={{ fontSize: 16 }} />}>
                {detail.eventName || "No event"}
              </MetaChip>
              <MetaChip icon={<CategoryOutlinedIcon sx={{ fontSize: 16 }} />}>
                {detail.trackName || "No track"}
              </MetaChip>
              <MetaChip
                icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
              >
                {leaderName}
              </MetaChip>
              {detail.joinCode && (
                <MetaChip icon={<VpnKeyOutlinedIcon sx={{ fontSize: 15 }} />}>
                  <span className="font-mono text-xs">{detail.joinCode}</span>
                </MetaChip>
              )}
              <MetaChip icon={<TagOutlinedIcon sx={{ fontSize: 15 }} />}>
                <span className="font-mono text-xs">
                  {detail.teamId.substring(0, 8)}
                </span>
              </MetaChip>
            </div>
          </div>

          {/* Primary action — pending approval is the decision the coordinator
              is here to make, so it lives in the hero with a live pulse. */}
          {canReviewRegistration && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => handleOpenReview("approve")}
                disabled={isReviewing}
                className="td-live-dot"
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  boxShadow: "none",
                  fontWeight: 700,
                }}
              >
                Approve registration
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ReportGmailerrorredOutlinedIcon />}
                onClick={() => handleOpenReview("reject")}
                disabled={isReviewing}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Members"
          value={detail.memberCount}
          tone="blue"
          icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />}
          delayMs={40}
        />
        <StatTile
          label="Rounds"
          value={detail.submissionCount}
          tone="slate"
          icon={<AssignmentOutlinedIcon sx={{ fontSize: 18 }} />}
          delayMs={90}
        />
        <StatTile
          label="Submitted"
          value={detail.submittedSubmissionCount}
          tone="emerald"
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
          delayMs={140}
        />
        <StatTile
          label="Missing"
          value={detail.missingSubmissionCount}
          tone={detail.missingSubmissionCount > 0 ? "red" : "slate"}
          icon={<ReportGmailerrorredOutlinedIcon sx={{ fontSize: 18 }} />}
          delayMs={190}
        />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Members */}
          <section
            className="td-rise rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
            style={{ animationDelay: "80ms" }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <GroupsOutlinedIcon fontSize="small" /> Members (
              {detail.members?.length ?? 0})
            </h2>
            {detail.members?.length ? (
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {detail.members.map((member, i) => (
                  <MemberRow key={member.memberId} member={member} index={i} />
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-slate-500 dark:text-slate-400">
                No members found.
              </p>
            )}
          </section>

          {/* Submission progress */}
          <section
            className="td-rise rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
            style={{ animationDelay: "140ms" }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <AssignmentOutlinedIcon fontSize="small" /> Submission progress
            </h2>
            {detail.submissions?.length ? (
              <div className="space-y-3">
                {detail.submissions.map((sub, i) => (
                  <SubmissionRow
                    key={sub.submissionId ?? sub.roundId ?? i}
                    sub={sub}
                    index={i}
                    teamStatus={detail.status}
                    onView={(id) => navigate(`/coordinator/submissions/${id}`)}
                    onDisqualify={(id) => setDisqualifySubmissionId(id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-500 dark:text-slate-400">
                No submissions recorded for this team.
              </p>
            )}
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Project overview */}
          <section
            className="td-rise rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
            style={{ animationDelay: "110ms" }}
          >
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <DescriptionOutlinedIcon fontSize="small" /> Project
            </h2>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {detail.projectTitle || "Untitled project"}
            </p>
            {detail.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {detail.description}
              </p>
            )}
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <ScheduleOutlinedIcon sx={{ fontSize: 15 }} /> Registered
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {fmtDate(detail.registeredAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <ScheduleOutlinedIcon sx={{ fontSize: 15 }} /> Created
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {fmtDate(detail.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <ScheduleOutlinedIcon sx={{ fontSize: 15 }} /> Updated
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {fmtDate(detail.updatedAt)}
                </span>
              </div>
            </div>
          </section>

          {/* Registration review */}
          {detail.registrationStatus && (
            <section
              className="td-rise rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
              style={{ animationDelay: "160ms" }}
            >
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <HowToRegOutlinedIcon fontSize="small" /> Registration review
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${getTeamRegistrationStatusColor(detail.registrationStatus)}`}
                >
                  {formatTeamStatusLabel(detail.registrationStatus)}
                </span>
              </div>

              {detail.registrationReviewedAt && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Reviewed by{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {detail.registrationReviewedByName || "Coordinator"}
                  </span>{" "}
                  at {fmtDate(detail.registrationReviewedAt, true)}
                </p>
              )}

              {detail.registrationRejectionReason && (
                <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  Reason: {detail.registrationRejectionReason}
                </p>
              )}

              {canReviewRegistration && (
                <div className="mt-4 flex gap-2">
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => handleOpenReview("approve")}
                    disabled={isReviewing}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      boxShadow: "none",
                      fontWeight: 700,
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => handleOpenReview("reject")}
                    disabled={isReviewing}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Registration review dialog */}
      <Dialog
        open={Boolean(reviewAction)}
        onClose={isReviewing ? undefined : handleCloseReview}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {reviewAction === "approve"
            ? "Approve registration"
            : "Reject registration"}
        </DialogTitle>
        <DialogContent dividers className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {reviewAction === "approve"
              ? `Approve ${detail.teamName} for the ${detail.trackName || "selected"} track?`
              : `Reject ${detail.teamName} and provide a reason shown to the team later.`}
          </p>
          {reviewAction === "reject" && (
            <TextField
              autoFocus
              required
              fullWidth
              multiline
              minRows={3}
              label="Rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={isReviewing}
            />
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseReview}
            disabled={isReviewing}
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewAction === "reject" ? "error" : "success"}
            onClick={handleSubmitReview}
            disabled={
              isReviewing || (reviewAction === "reject" && !rejectReason.trim())
            }
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            {isReviewing
              ? "Saving..."
              : reviewAction === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disqualify dialog */}
      {disqualifySubmissionId && (
        <DisqualifySubmissionDialog
          open={Boolean(disqualifySubmissionId)}
          onClose={() => setDisqualifySubmissionId(null)}
          submissionId={disqualifySubmissionId}
          isPending={disqualifyMutation.isPending}
          onConfirm={handleDisqualify}
        />
      )}
    </div>
  );
}
