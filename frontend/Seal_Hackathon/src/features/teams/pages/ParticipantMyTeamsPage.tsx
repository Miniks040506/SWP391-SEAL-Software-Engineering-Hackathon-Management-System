import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import { usePublicEventDetailQuery } from "@/features/events";
import { TeamStatusBadge } from "../components/TeamStatusBagde";
import { BrowseTeamsSection } from "../components/BrowseTeamsSection";
import {
  useMyTeamsQuery,
  useMyInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
  usePreviewJoinCodeMutation,
  useJoinTeamByCodeMutation,
  useMyActiveCompetitionsQuery,
} from "../hooks/useParticipantTeams";
import { useCountUp } from "../hooks/useCountUp";
import type {
  TeamInvitationResponse,
  TeamJoinCodePreviewResponse,
} from "@/types/team.types";
import "../styles/participantTeams.css";

type TeamSummaryView = {
  id: string;
  name: string;
  projectTitle?: string;
  status: string;
  registrationStatus?: string | null;
  roleInTeam: string;
  memberCount?: number;
};

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-sky-600",
];

/* Softer pastel version for light mode, vivid version for dark mode. */
const BANNER_PLACEHOLDER_GRADIENTS = [
  "from-blue-100 via-sky-100 to-indigo-200 dark:from-blue-500 dark:via-blue-600 dark:to-indigo-600",
  "from-sky-100 via-blue-100 to-blue-200 dark:from-sky-500 dark:via-sky-600 dark:to-blue-600",
  "from-indigo-100 via-violet-100 to-violet-200 dark:from-indigo-500 dark:via-indigo-600 dark:to-violet-600",
  "from-cyan-100 via-sky-100 to-sky-200 dark:from-cyan-500 dark:via-cyan-600 dark:to-sky-600",
];

function getBannerPlaceholderGradient(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return BANNER_PLACEHOLDER_GRADIENTS[hash % BANNER_PLACEHOLDER_GRADIENTS.length];
}

function getTeamInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getAvatarGradient(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

type TeamCardBannerProps = {
  teamName: string;
  competition?: {
    eventId: string;
    eventName: string;
    trackName: string;
  };
};

function TeamCardBanner({ teamName, competition }: TeamCardBannerProps) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const eventQuery = usePublicEventDetailQuery(competition?.eventId);

  if (!competition || fallbackFailed) {
    return (
      <div
        className={`relative h-28 w-full overflow-hidden border-b border-slate-100 bg-linear-to-br dark:border-transparent ${getBannerPlaceholderGradient(teamName)}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.35),transparent_60%)]" />
        <GroupsOutlinedIcon
          className="absolute -bottom-4 -right-2 text-slate-900/10 dark:text-white/20"
          style={{ fontSize: 110 }}
        />
      </div>
    );
  }

  // Same source chain as EventCard so the image always matches the events page
  const bannerSrc =
    eventQuery.data?.bannerUrl && !bannerFailed
      ? eventQuery.data.bannerUrl
      : `https://picsum.photos/seed/seal-event-${competition.eventId}/640/280`;

  return (
    <div className="relative h-28 w-full overflow-hidden border-b border-slate-100 bg-slate-100 dark:border-transparent dark:bg-slate-900">
      {eventQuery.isLoading ? (
        <Skeleton variant="rectangular" width="100%" height="100%" />
      ) : (
        <img
          src={bannerSrc}
          alt={`${competition.eventName} banner`}
          loading="lazy"
          onError={() =>
            bannerSrc === eventQuery.data?.bannerUrl
              ? setBannerFailed(true)
              : setFallbackFailed(true)
          }
          className="h-full w-full object-cover"
        />
      )}

      {/* Light: melt into the white card; dark: melt into the dark card */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-white/70 to-transparent dark:h-1/2 dark:from-slate-950/60" />
    </div>
  );
}

const PRIMARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95";

const SECONDARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:text-blue-400";

export const MyTeamsPage = () => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [previewData, setPreviewData] =
    useState<TeamJoinCodePreviewResponse | null>(null);

  const myTeamsQuery = useMyTeamsQuery();
  const invitationsQuery = useMyInvitationsQuery();
  const activeCompetitionsQuery = useMyActiveCompetitionsQuery();

  const acceptMutation = useAcceptInvitationMutation();
  const rejectMutation = useRejectInvitationMutation();
  const previewMutation = usePreviewJoinCodeMutation();
  const joinMutation = useJoinTeamByCodeMutation();

  const teams = (myTeamsQuery.data ?? []) as TeamSummaryView[];
  const invitations = (
    (invitationsQuery.data ?? []) as TeamInvitationResponse[]
  ).filter((inv) => inv.status === "PENDING");
  const teamCount = useCountUp(teams.length);
  const competitionCount = useCountUp(
    (activeCompetitionsQuery.data ?? []).length,
  );
  const invitationCount = useCountUp(invitations.length);

  const showEmptyState =
    !myTeamsQuery.isLoading && (myTeamsQuery.isError || teams.length === 0);

  const handleOpenNotifications = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseNotifications = () => setAnchorEl(null);
  const isNotificationOpen = Boolean(anchorEl);

  const handleCloseJoinDialog = () => {
    setJoinDialogOpen(false);
    setTimeout(() => {
      setJoinCode("");
      setPreviewData(null);
      previewMutation.reset();
    }, 200);
  };

  const handlePreviewCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    previewMutation.mutate(joinCode, {
      onSuccess: (data) => setPreviewData(data),
    });
  };

  const handleConfirmJoin = () => {
    joinMutation.mutate(
      { joinCode },
      {
        onSuccess: () => {
          handleCloseJoinDialog();
        },
      },
    );
  };

  return (
    <div className="pt-page space-y-10">
      {/* ---------------------------------------------------------------- */}
      {/* Hero header                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="pt-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-blue-50/70 to-indigo-100/60 p-8 shadow-sm md:p-10 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:shadow-xl">
        {/* Decorative glows */}
        <div className="pt-glow-a pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/20" />
        <div className="pt-glow-b pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/15" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_55%)]" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              My Teams
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Team Management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your squads for the SEAL league — check status, competition
              progress, and manage members from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <IconButton
              onClick={handleOpenNotifications}
              aria-label="Open team invitations"
              className="border border-slate-200 bg-white transition-colors hover:border-blue-300 dark:border-white/15 dark:bg-white/5 dark:hover:border-blue-400/60 dark:hover:bg-white/10"
              sx={{ width: 44, height: 44, borderRadius: "12px" }}
            >
              <Badge
                badgeContent={invitations.length}
                color="error"
                sx={{ "& .MuiBadge-badge": { fontWeight: "bold" } }}
              >
                <NotificationsOutlinedIcon
                  style={{ fontSize: 22 }}
                  className="text-slate-600 dark:text-slate-200"
                />
              </Badge>
            </IconButton>

            <button
              type="button"
              onClick={() => setJoinDialogOpen(true)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-300 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:backdrop-blur-sm dark:hover:border-white/35 dark:hover:bg-white/10 dark:hover:text-slate-100"
            >
              <KeyOutlinedIcon style={{ fontSize: 17 }} />
              Join by Code
            </button>

            <button
              type="button"
              onClick={() => navigate("/participant/teams/create")}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95"
            >
              <AddOutlinedIcon style={{ fontSize: 18 }} />
              Create Team
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div style={{ "--i": 0 } as React.CSSProperties} className="pt-stat flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300">
              <GroupsOutlinedIcon style={{ fontSize: 19 }} />
            </div>
            <div>
              <p className="text-xl font-black tabular-nums leading-none text-slate-900 dark:text-white">
                {myTeamsQuery.isLoading ? "–" : Math.round(teamCount)}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                My teams
              </p>
            </div>
          </div>

          <div style={{ "--i": 1 } as React.CSSProperties} className="pt-stat flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-300">
              <RocketLaunchOutlinedIcon style={{ fontSize: 19 }} />
            </div>
            <div>
              <p className="text-xl font-black tabular-nums leading-none text-slate-900 dark:text-white">
                {activeCompetitionsQuery.isLoading
                  ? "–"
                  : Math.round(competitionCount)}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Competing now
              </p>
            </div>
          </div>

          <div style={{ "--i": 2 } as React.CSSProperties} className="pt-stat flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300">
              <NotificationsOutlinedIcon style={{ fontSize: 19 }} />
            </div>
            <div>
              <p className="text-xl font-black tabular-nums leading-none text-slate-900 dark:text-white">
                {invitationsQuery.isLoading ? "–" : Math.round(invitationCount)}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Pending invites
              </p>
            </div>
          </div>
        </div>

        {/* Brand accent */}
        <div className="pt-accent absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Invitations popover                                               */}
      {/* ---------------------------------------------------------------- */}
      <Popover
        open={isNotificationOpen}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className:
              "mt-2 w-full max-w-[360px] rounded-2xl border border-gray-100 shadow-xl dark:border-slate-700 dark:bg-slate-900",
          },
        }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-800">
          <h3 className="font-extrabold text-gray-900 dark:text-white">
            Invitations
          </h3>
          {invitations.length > 0 && (
            <Button
              size="small"
              onClick={() => {
                handleCloseNotifications();
                navigate("/participant/invitations");
              }}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            >
              View All
            </Button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {invitationsQuery.isLoading ? (
            <div className="flex justify-center p-4">
              <CircularProgress size={24} />
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <DraftsOutlinedIcon className="mb-2 text-4xl text-gray-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                No pending invitations.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {invitations.map((inv, index) => (
                <div
                  key={inv.id}
                  style={{ "--i": index } as React.CSSProperties}
                  className="pt-invite-row flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                      {inv.teamName}
                    </p>
                    <p className="truncate text-xs font-medium text-gray-500 dark:text-slate-400">
                      {inv.invitedEmail}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-1">
                    <Tooltip title="Decline">
                      <span>
                        <IconButton
                          color="error"
                          size="small"
                          disabled={
                            rejectMutation.isPending || acceptMutation.isPending
                          }
                          onClick={() => rejectMutation.mutate(inv.id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Accept">
                      <span>
                        <IconButton
                          color="primary"
                          size="small"
                          disabled={
                            rejectMutation.isPending || acceptMutation.isPending
                          }
                          onClick={() => {
                            acceptMutation.mutate(inv.id);
                            if (invitations.length === 1)
                              handleCloseNotifications();
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Popover>

      {/* ---------------------------------------------------------------- */}
      {/* Join by code dialog                                               */}
      {/* ---------------------------------------------------------------- */}
      <Dialog
        open={joinDialogOpen}
        onClose={handleCloseJoinDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            className: "rounded-2xl dark:bg-slate-900",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          <span className="text-gray-900 dark:text-slate-100">
            Join Team by Code
          </span>
        </DialogTitle>
        <DialogContent dividers className="space-y-4 dark:border-slate-800">
          {!previewData ? (
            <form
              id="preview-code-form"
              onSubmit={handlePreviewCode}
              className="pt-2"
            >
              <p className="text-sm text-gray-500 mb-4 dark:text-slate-400">
                Enter the unique code provided by the Team Leader to join their
                team.
              </p>
              <TextField
                autoFocus
                fullWidth
                label="Team Join Code"
                placeholder="e.g. SEAL-2026"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                disabled={previewMutation.isPending}
                autoComplete="off"
              />
            </form>
          ) : (
            <div className="space-y-4 pt-2">
              <Alert severity="success" sx={{ borderRadius: "12px" }}>
                Team found! Please confirm the details below before joining.
              </Alert>
              <div className="rounded-2xl border border-gray-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br text-sm font-black text-white ${getAvatarGradient(previewData.teamName)}`}
                  >
                    {getTeamInitials(previewData.teamName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                      {previewData.teamName}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      Leader: {previewData.leaderName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                      Status
                    </p>
                    <TeamStatusBadge status={previewData.status} />
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                      Members
                    </p>
                    <p className="font-bold tabular-nums text-gray-900 dark:text-white">
                      {previewData.memberCount} / {previewData.maxMembers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <button
            type="button"
            onClick={
              previewData ? () => setPreviewData(null) : handleCloseJoinDialog
            }
            className={SECONDARY_BUTTON}
          >
            {previewData ? "Back" : "Cancel"}
          </button>

          {!previewData ? (
            <button
              type="submit"
              form="preview-code-form"
              disabled={!joinCode.trim() || previewMutation.isPending}
              className={`${PRIMARY_BUTTON} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {previewMutation.isPending ? "Checking..." : "Verify Code"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmJoin}
              disabled={joinMutation.isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joinMutation.isPending ? "Joining..." : "Confirm Join"}
            </button>
          )}
        </DialogActions>
      </Dialog>

      {/* ---------------------------------------------------------------- */}
      {/* States                                                            */}
      {/* ---------------------------------------------------------------- */}
      {myTeamsQuery.isError && (
        <Alert severity="warning">Cannot connect right now. Try later.</Alert>
      )}
      {myTeamsQuery.isLoading && (
        <div className="flex justify-center py-24">
          <CircularProgress />
        </div>
      )}

      {showEmptyState && (
        <section className="pt-empty rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
            <GroupsOutlinedIcon style={{ fontSize: 30 }} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl dark:text-slate-100">
            You are not in any team yet.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-slate-400">
            Create a team to join a SEAL event or use a Join Code from another
            Team Leader.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/participant/teams/create")}
              className={PRIMARY_BUTTON}
            >
              <AddOutlinedIcon style={{ fontSize: 18 }} />
              Create Team
            </button>
            <button
              type="button"
              onClick={() => setJoinDialogOpen(true)}
              className={SECONDARY_BUTTON}
            >
              <KeyOutlinedIcon style={{ fontSize: 17 }} />
              Join by Code
            </button>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Team cards                                                        */}
      {/* ---------------------------------------------------------------- */}
      {!myTeamsQuery.isLoading && teams.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {teams.map((team, index) => {
            const activeCompetition = (activeCompetitionsQuery.data ?? []).find(
              (c) => c.teamId === team.id,
            );

            return (
              <article
                key={team.id}
                style={{ "--i": index } as React.CSSProperties}
                className="pt-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50"
              >
                {activeCompetitionsQuery.isLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={112} />
                ) : (
                  <TeamCardBanner
                    teamName={team.name}
                    competition={
                      activeCompetition
                        ? {
                            eventId: activeCompetition.eventId,
                            eventName: activeCompetition.eventName,
                            trackName: activeCompetition.trackName,
                          }
                        : undefined
                    }
                  />
                )}

                <div className="flex flex-1 flex-col gap-5 px-7 pb-6">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex min-w-0 items-end gap-4">
                      <div
                        className={`pt-avatar -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-base font-black text-white shadow-md ring-4 ring-white dark:ring-slate-900 ${getAvatarGradient(team.name)}`}
                      >
                        {getTeamInitials(team.name)}
                      </div>

                      <div className="min-w-0 pt-4">
                        <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {team.name}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                          {team.projectTitle || "No project title yet"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <TeamStatusBadge status={team.roleInTeam} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Team Status
                      </p>
                      <TeamStatusBadge status={team.status} />
                    </div>

                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Registration
                      </p>
                      {team.registrationStatus ? (
                        <TeamStatusBadge status={team.registrationStatus} />
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          Not registered
                        </span>
                      )}
                    </div>

                    {typeof team.memberCount === "number" && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Members
                        </p>
                        <TeamStatusBadge memberCount={team.memberCount} />
                      </div>
                    )}
                  </div>

                  {activeCompetition && (
                    <div className="pt-live flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/60 px-4 py-3 dark:border-blue-500/30 dark:from-blue-500/10 dark:to-indigo-500/10">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75 motion-reduce:animate-none" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                          </span>
                          Competing now
                        </p>
                        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {activeCompetition.eventName}
                          <span className="font-medium text-slate-500 dark:text-slate-400">
                            {" "}
                            · {activeCompetition.trackName}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/participant/events/${activeCompetition.eventId}/competing`,
                            { state: { fromInternal: true } },
                          )
                        }
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-600 active:scale-95"
                      >
                        <RocketLaunchOutlinedIcon style={{ fontSize: 15 }} />
                        Event Competing
                      </button>
                    </div>
                  )}
                </div>

                <footer className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-7 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => navigate(`/participant/teams/${team.id}`)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-blue-500 transition-all hover:gap-2.5 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    View Team
                    <ArrowForwardRoundedIcon style={{ fontSize: 16 }} />
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <BrowseTeamsSection />
    </div>
  );
};
