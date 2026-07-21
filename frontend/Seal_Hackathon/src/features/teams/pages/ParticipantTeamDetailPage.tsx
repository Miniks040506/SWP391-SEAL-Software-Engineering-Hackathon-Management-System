import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import type { UUID } from "@/types/common.types";
import type {
  TeamInvitationResponse,
  TeamJoinRequestResponse,
  TeamMemberResponse,
} from "@/types/team.types";
import { trackApi } from "@/api/track.api";

import { useTeamAdvancementStatusQuery } from "@/features/advancement/hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "@/features/advancement/components/TeamAdvancementStatusBanner";
import { useActiveTeamDisqualificationsQuery } from "@/features/disqualification/hooks/useDisqualificationQueries";
import { TeamStatusBadge } from "../components/TeamStatusBagde";
import { TeamRegisterTrackPanel } from "../components/TeamRegisterTrackPanel";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

import {
  inviteMemberSchema,
  updateTeamSchema,
  type InviteMemberFormValues,
  type UpdateTeamFormValues,
} from "../schemas/myTeams.schema";
import {
  useCancelTeamInvitationMutation,
  useDeleteTeamMutation,
  useInviteTeamMemberMutation,
  useLeaveTeamMutation,
  useMyTeamsQuery,
  useRemoveTeamMemberMutation,
  useTeamDetailQuery,
  useTeamInvitationsQuery,
  useToggleJoinCodeMutation,
  useTransferTeamLeaderMutation,
  useUpdateTeamMutation,
  useMyActiveCompetitionsQuery,
} from "../hooks/useParticipantTeams";
import {
  useAcceptJoinRequestMutation,
  useRejectJoinRequestMutation,
  useTeamJoinRequestsQuery,
} from "../hooks/useTeamJoinRequests";

type TeamDetailTab = "overview" | "members" | "track-registration";
type TeamConfirmAction =
  | { type: "cancel-invitation"; invitationId: UUID }
  | { type: "remove-member"; member: TeamMemberResponse }
  | { type: "leave-team" };

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  return value.replace("T", " ").slice(0, 16);
}

function isLeaderRole(role?: string) {
  if (!role) return false;
  return role.toUpperCase().includes("LEADER");
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-sky-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
];

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getAvatarGradient(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInviteeDisplayName(invitation: TeamInvitationResponse) {
  const profile = invitation as TeamInvitationResponse & {
    invitedName?: string | null;
    fullName?: string | null;
  };
  if (profile.invitedName?.trim()) return profile.invitedName.trim();
  if (profile.fullName?.trim()) return profile.fullName.trim();

  const emailName = invitation.invitedEmail.split("@")[0] ?? "Invited student";
  const readableName = emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
  return readableName || "Invited student";
}

function getInvitationAvatar(invitation: TeamInvitationResponse) {
  const profile = invitation as TeamInvitationResponse & {
    avatarUrl?: string | null;
    invitedAvatarUrl?: string | null;
  };
  return profile.avatarUrl ?? profile.invitedAvatarUrl;
}

const PRIMARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400";

const SECONDARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-300 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:text-blue-400";

const DANGER_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 transition-all hover:border-rose-400 hover:bg-rose-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10";

type MemberAvatarProps = {
  name: string;
  src?: string | null;
  size?: "md" | "lg";
};

/**
 * Renders the member photo when an avatar URL is available; the team
 * detail API currently returns no avatarUrl, so this falls back to
 * gradient initials.
 */
function MemberAvatar({ name, src, size = "md" }: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);
  const sizeClasses =
    size === "lg"
      ? "h-14 w-14 text-lg rounded-2xl"
      : "h-11 w-11 text-sm rounded-xl";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${sizeClasses} shrink-0 object-cover ring-2 ring-white shadow-md dark:ring-slate-800`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center bg-linear-to-br font-black text-white shadow-md ${getAvatarGradient(name)}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

function JoinRequestsProfilePanel({ teamId }: { teamId: UUID }) {
  const requestsQuery = useTeamJoinRequestsQuery(teamId);
  const acceptMutation = useAcceptJoinRequestMutation(teamId);
  const rejectMutation = useRejectJoinRequestMutation(teamId);
  const requests = requestsQuery.data ?? [];
  const [rejectRequest, setRejectRequest] =
    useState<TeamJoinRequestResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const closeRejectDialog = () => {
    if (rejectMutation.isPending) return;
    setRejectRequest(null);
    setRejectReason("");
  };

  const confirmReject = () => {
    if (!rejectRequest) return;
    rejectMutation.mutate(
      {
        requestId: rejectRequest.id,
        reason: rejectReason.trim() || undefined,
      },
      { onSuccess: closeRejectDialog },
    );
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <PersonAddAltOutlinedIcon
              className="text-blue-500"
              style={{ fontSize: 20 }}
            />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Join Requests
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review students who want to join this team.
          </p>
        </div>
        {!requestsQuery.isLoading && (
          <span className="text-xs font-bold tabular-nums text-slate-400 dark:text-slate-500">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </span>
        )}
      </div>

      {requestsQuery.isLoading && (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {[0, 1].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              height={150}
              sx={{ borderRadius: "16px" }}
            />
          ))}
        </div>
      )}
      {requestsQuery.isError && (
        <div className="p-5">
          <Alert severity="warning">Cannot load join requests right now.</Alert>
        </div>
      )}
      {!requestsQuery.isLoading &&
        !requestsQuery.isError &&
        requests.length === 0 && (
          <div className="px-5 py-9 text-center">
            <PersonAddAltOutlinedIcon className="text-slate-300 dark:text-slate-600" />
            <p className="mt-2 font-bold text-slate-700 dark:text-slate-200">
              No join requests
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Student profiles will appear here when they request access.
            </p>
          </div>
        )}

      {requests.length > 0 && (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {requests.map((request) => {
            const pending = request.status.toUpperCase() === "PENDING";
            const mutating =
              acceptMutation.isPending || rejectMutation.isPending;
            const profile = request as TeamJoinRequestResponse & {
              requesterAvatarUrl?: string | null;
              avatarUrl?: string | null;
            };

            return (
              <article
                key={request.id}
                className="flex min-h-44 flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-950/30"
              >
                <div className="flex items-start gap-4">
                  <MemberAvatar
                    name={request.requesterName}
                    src={profile.requesterAvatarUrl ?? profile.avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-extrabold text-slate-900 dark:text-white">
                        {request.requesterName}
                      </p>
                      <TeamStatusBadge status={request.status} />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
                      <MailOutlinedIcon style={{ fontSize: 14 }} />
                      {request.requesterEmail}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <CalendarMonthOutlinedIcon style={{ fontSize: 13 }} />
                      Requested {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <p className="mt-4 line-clamp-2 rounded-xl bg-white px-3 py-2 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                    {request.message}
                  </p>
                )}

                {pending && (
                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      type="button"
                      disabled={mutating}
                      onClick={() => {
                        setRejectRequest(request);
                        setRejectReason("");
                      }}
                      className={`${DANGER_BUTTON} flex-1 px-3 py-2 text-xs`}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={mutating}
                      onClick={() => acceptMutation.mutate(request.id)}
                      className={`${PRIMARY_BUTTON} flex-1 px-3 py-2 text-xs`}
                    >
                      {acceptMutation.isPending ? "Accepting..." : "Accept"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={rejectRequest !== null}
        onClose={rejectMutation.isPending ? undefined : closeRejectDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "rounded-2xl dark:bg-slate-900" } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Reject join request?</DialogTitle>
        <DialogContent dividers className="space-y-4">
          <Alert severity="warning">
            {rejectRequest?.requesterName ?? "This student"} will not be added
            to the team.
          </Alert>
          <TextField
            label="Reason (optional)"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            disabled={rejectMutation.isPending}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeRejectDialog}
            disabled={rejectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmReject}
            disabled={rejectMutation.isPending}
            color="error"
            variant="contained"
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject request"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export const TeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<TeamDetailTab>("overview");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [transferCandidate, setTransferCandidate] =
    useState<TeamMemberResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<TeamConfirmAction | null>(
    null,
  );

  const teamQuery = useTeamDetailQuery(teamId);
  const myTeamsQuery = useMyTeamsQuery();
  const activeCompetitionsQuery = useMyActiveCompetitionsQuery();
  const invitationsQuery = useTeamInvitationsQuery(teamId);
  const disqualificationsQuery = useActiveTeamDisqualificationsQuery(
    teamQuery.data?.status === "ELIMINATED" ? teamId : undefined,
  );

  const updateTeamMutation = useUpdateTeamMutation(teamId);
  const deleteTeamMutation = useDeleteTeamMutation(teamId);
  const inviteMemberMutation = useInviteTeamMemberMutation(teamId);
  const cancelInvitationMutation = useCancelTeamInvitationMutation(teamId);
  const removeMemberMutation = useRemoveTeamMemberMutation(teamId);
  const transferLeaderMutation = useTransferTeamLeaderMutation(teamId);
  const leaveTeamMutation = useLeaveTeamMutation(teamId);
  const toggleJoinCodeMutation = useToggleJoinCodeMutation(teamId);

  const team = teamQuery.data;
  const registeredTrackQuery = useQuery({
    queryKey: ["track", team?.trackId],
    queryFn: () => trackApi.getTrackById(team!.trackId!),
    enabled: Boolean(team?.trackId),
  });
  const advancementQuery = useTeamAdvancementStatusQuery(teamId ?? "");
  const advancementData = advancementQuery.data?.data;
  const members = team?.members ?? [];
  const invitations = invitationsQuery.data ?? [];
  const registeredTrackName =
    registeredTrackQuery.data?.name ||
    (team as (typeof team & { trackName?: string | null }) | undefined)
      ?.trackName;

  const currentTeamSummary = useMemo(() => {
    return (myTeamsQuery.data ?? []).find((item) => item.id === teamId);
  }, [myTeamsQuery.data, teamId]);

  const activeCompetition = useMemo(() => {
    return (activeCompetitionsQuery.data ?? []).find(
      (comp) => comp.teamId === teamId,
    );
  }, [activeCompetitionsQuery.data, teamId]);

  const currentUserIsLeader = isLeaderRole(currentTeamSummary?.roleInTeam);

  const isTeamRegistered = team?.status?.toUpperCase() !== "FORMING";
  const canDeleteTeam =
    currentUserIsLeader && team?.status?.toUpperCase() === "FORMING";

  const {
    register: registerUpdateTeam,
    handleSubmit: handleSubmitUpdateTeam,
    reset: resetUpdateTeam,
    formState: { errors: updateErrors, isDirty },
  } = useForm<UpdateTeamFormValues>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: { name: "", projectTitle: "", description: "" },
  });

  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    reset: resetInvite,
    formState: { errors: inviteErrors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", message: "" },
  });

  useEffect(() => {
    if (!team) return;
    resetUpdateTeam({
      name: team.name,
      projectTitle: team.projectTitle ?? "",
      description: team.description ?? "",
    });
  }, [team, resetUpdateTeam]);

  if (teamQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  if (teamQuery.isError || !team) {
    return (
      <div className="space-y-4 py-32 text-center">
        <p className="font-semibold text-slate-400">Team not found.</p>
        <button
          type="button"
          onClick={() => navigate("/participant/teams")}
          className="text-sm font-bold text-blue-500 hover:underline"
        >
          Back to My Teams
        </button>
      </div>
    );
  }

  const handleOpenEditDialog = () => {
    resetUpdateTeam({
      name: team.name,
      projectTitle: team.projectTitle ?? "",
      description: team.description ?? "",
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (updateTeamMutation.isPending) return;
    setEditDialogOpen(false);
  };

  const handleSaveTeamDetail = async (values: UpdateTeamFormValues) => {
    await updateTeamMutation.mutateAsync({
      name: values.name.trim(),
      projectTitle: values.projectTitle?.trim() ?? "",
      description: values.description?.trim() ?? "",
    });
    resetUpdateTeam(values);
    setEditDialogOpen(false);
  };

  const handleInviteMember = async (values: InviteMemberFormValues) => {
    await inviteMemberMutation.mutateAsync({
      email: values.email.trim(),
      message: values.message?.trim() || undefined,
    });
    resetInvite();
    setInviteDialogOpen(false);
  };

  const handleCancelInvitation = (invitationId: UUID) => {
    setConfirmAction({ type: "cancel-invitation", invitationId });
  };

  const handleRemoveMember = (member: TeamMemberResponse) => {
    setConfirmAction({ type: "remove-member", member });
  };

  const handleTransferLeader = (member: TeamMemberResponse) => {
    transferLeaderMutation.reset();
    setTransferCandidate(member);
  };

  const handleCloseTransferDialog = () => {
    if (transferLeaderMutation.isPending) return;
    setTransferCandidate(null);
    transferLeaderMutation.reset();
  };

  const handleConfirmTransfer = () => {
    if (!transferCandidate || isTeamRegistered) return;

    transferLeaderMutation.mutate(
      { newLeaderUserId: transferCandidate.userId },
      { onSuccess: () => setTransferCandidate(null) },
    );
  };

  const handleLeaveTeam = () => setConfirmAction({ type: "leave-team" });

  const confirmTeamAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "cancel-invitation") {
      cancelInvitationMutation.mutate(confirmAction.invitationId, {
        onSuccess: () => setConfirmAction(null),
      });
      return;
    }
    if (confirmAction.type === "remove-member") {
      removeMemberMutation.mutate(
        {
          memberId: confirmAction.member.memberId,
          payload: { reason: "Removed by team leader" },
        },
        { onSuccess: () => setConfirmAction(null) },
      );
      return;
    }
    leaveTeamMutation.mutate(
      { reason: "Left by participant" },
      {
        onSuccess: () => {
          setConfirmAction(null);
          navigate("/participant/teams");
        },
      },
    );
  };

  const confirmActionPending =
    cancelInvitationMutation.isPending ||
    removeMemberMutation.isPending ||
    leaveTeamMutation.isPending;
  const confirmActionContent =
    confirmAction?.type === "cancel-invitation"
      ? {
          title: "Cancel invitation?",
          description: "The pending invitation will no longer be usable.",
          label: "Cancel invitation",
        }
      : confirmAction?.type === "remove-member"
        ? {
            title: "Remove team member?",
            description: `${confirmAction.member.fullName} will lose access to this team and its participant workflows.`,
            label: "Remove member",
          }
        : {
            title: "Leave this team?",
            description:
              "Your active membership and access to this team will be removed.",
            label: "Leave team",
          };

  const handleDeleteTeam = async () => {
    await deleteTeamMutation.mutateAsync({
      reason: deleteReason.trim() || undefined,
    });
    setDeleteDialogOpen(false);
    setDeleteReason("");
    navigate("/participant/teams");
  };

  const handleCopyJoinCode = async () => {
    if (!team.joinCode) return;
    await navigator.clipboard.writeText(team.joinCode);
    enqueueSnackbar("Join code copied to clipboard.", { variant: "success" });
  };

  const handleToggleJoinCode = () => {
    toggleJoinCodeMutation.mutate(!team.joinCodeEnabled);
  };

  const tabs: {
    key: TeamDetailTab;
    label: string;
    icon: ReactNode;
    badge?: number;
  }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: <SpaceDashboardOutlinedIcon style={{ fontSize: 18 }} />,
    },
    {
      key: "members",
      label: "Members",
      icon: <GroupsOutlinedIcon style={{ fontSize: 18 }} />,
      badge: members.length,
    },
    ...(currentUserIsLeader
      ? [
          {
            key: "track-registration" as const,
            label: "Track Registration",
            icon: <RouteOutlinedIcon style={{ fontSize: 18 }} />,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate("/participant/teams")}
        className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackOutlinedIcon style={{ fontSize: 16 }} />
        Back to My Teams
      </button>

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-blue-50/60 to-indigo-50/40 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />

        <div className="relative flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-xl font-black text-white shadow-lg shadow-blue-500/20 ${getAvatarGradient(team.name)}`}
            >
              {getInitials(team.name)}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
                Team Workspace
              </p>
              <h1 className="mt-1 break-words text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {team.name}
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                {team.projectTitle || "No project title yet"}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TeamStatusBadge status={team.status} />
                {team.registrationStatus && (
                  <TeamStatusBadge status={team.registrationStatus} />
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                  <GroupsOutlinedIcon style={{ fontSize: 14 }} />
                  {members.length}/5 members
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            {activeCompetitionsQuery.isLoading ? (
              <>
                <Skeleton
                  variant="rounded"
                  width={160}
                  height={42}
                  sx={{ borderRadius: "12px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={42}
                  sx={{ borderRadius: "12px" }}
                />
              </>
            ) : activeCompetition ? (
              <>
                <button
                  type="button"
                  className={PRIMARY_BUTTON}
                  onClick={() =>
                    navigate(
                      `/participant/events/${activeCompetition.eventId}/competing`,
                      { state: { fromInternal: true } },
                    )
                  }
                >
                  <RocketLaunchOutlinedIcon style={{ fontSize: 18 }} />
                  Event Competing
                </button>
                <button
                  type="button"
                  className={SECONDARY_BUTTON}
                  onClick={() =>
                    navigate(`/participant/teams/${teamId}/submissions`)
                  }
                >
                  Submissions
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />
      </header>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <nav
        className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-900"
        aria-label="Team detail sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                isActive
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
              ].join(" ")}
            >
              {tab.icon}
              {tab.label}
              {typeof tab.badge === "number" && (
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                  ].join(" ")}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Overview tab ────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {team.status === "ELIMINATED" &&
            !disqualificationsQuery.isLoading &&
            (disqualificationsQuery.data?.length ?? 0) > 0 && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() =>
                      navigate(`/participant/teams/${team.id}/disqualification`)
                    }
                    sx={{ fontWeight: 800 }}
                  >
                    View Details
                  </Button>
                }
              >
                <strong>Team Eliminated.</strong> If your team was disqualified,
                click here to view the reason and appeal status.
              </Alert>
            )}

          {advancementData && (
            <TeamAdvancementStatusBanner
              status={advancementData.status}
              message={advancementData.message}
              nextRoundId={advancementData.nextRoundId}
              nextRoundName={advancementData.nextRoundName}
              canAccessNextRound={advancementData.canAccessNextRound}
              eventId={advancementData.eventId}
            />
          )}

          <section
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="competition-outcomes-heading"
          >
            <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:px-7">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
                Event progress
              </p>
              <h2
                id="competition-outcomes-heading"
                className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
              >
                Competition outcomes
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Follow your team&apos;s progression and review judge feedback as
                soon as results are published.
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-slate-800">
              <button
                type="button"
                onClick={() =>
                  navigate(`/participant/teams/${team.id}/advancement`)
                }
                className="group flex min-h-36 cursor-pointer items-center gap-4 bg-white px-6 py-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50/70 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-500 active:translate-y-0 active:bg-blue-100/70 dark:bg-slate-900 dark:hover:bg-blue-500/10 dark:active:bg-blue-500/15 md:px-7"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500/20">
                  <MilitaryTechOutlinedIcon style={{ fontSize: 25 }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-slate-900 dark:text-white">
                    Advancement details
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    See the current round decision and what comes next.
                  </span>
                </span>
                <EastOutlinedIcon
                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-slate-600"
                  style={{ fontSize: 20 }}
                />
              </button>

              <button
                type="button"
                onClick={() => navigate(`/participant/teams/${team.id}/scores`)}
                className="group flex min-h-36 cursor-pointer items-center gap-4 bg-white px-6 py-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50/70 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-indigo-500 active:translate-y-0 active:bg-indigo-100/70 dark:bg-slate-900 dark:hover:bg-indigo-500/10 dark:active:bg-indigo-500/15 md:px-7"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/20">
                  <QueryStatsOutlinedIcon style={{ fontSize: 25 }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-slate-900 dark:text-white">
                    Published scores
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Review round scores and open the detailed breakdown.
                  </span>
                </span>
                <EastOutlinedIcon
                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-slate-600"
                  style={{ fontSize: 20 }}
                />
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Main dossier: description and facts ledger, static read-only */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
                      About This Team
                    </p>
                    <h2 className="mt-1.5 break-words text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {team.projectTitle || "Untitled project"}
                    </h2>
                  </div>

                  {currentUserIsLeader && (
                    <button
                      type="button"
                      onClick={handleOpenEditDialog}
                      className={`${SECONDARY_BUTTON} shrink-0 px-4 py-2`}
                    >
                      <EditOutlinedIcon style={{ fontSize: 16 }} />
                      Edit
                    </button>
                  )}
                </div>

                <p className="mt-4 max-w-[65ch] whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {team.description ||
                    "No description yet. The team leader can add one with Edit."}
                </p>
              </div>

              <dl className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                <div className="grid grid-cols-[8.5rem_1fr] items-center gap-4 px-6 py-3.5 md:px-7">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Leader
                  </dt>
                  <dd className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                    <WorkspacePremiumOutlinedIcon
                      className="text-amber-500"
                      style={{ fontSize: 16 }}
                    />
                    {team.leaderName}
                  </dd>
                </div>

                <div className="grid grid-cols-[8.5rem_1fr] items-center gap-4 px-6 py-3.5 md:px-7">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Team Status
                  </dt>
                  <dd>
                    <TeamStatusBadge status={team.status} />
                  </dd>
                </div>

                <div className="grid grid-cols-[8.5rem_1fr] items-center gap-4 px-6 py-3.5 md:px-7">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Registration
                  </dt>
                  <dd>
                    {team.registrationStatus ? (
                      <TeamStatusBadge status={team.registrationStatus} />
                    ) : (
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                        Not registered yet
                      </span>
                    )}
                  </dd>
                </div>

                <div className="grid grid-cols-[8.5rem_1fr] items-center gap-4 px-6 py-3.5 md:px-7">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Track
                  </dt>
                  <dd className="text-sm font-bold text-slate-900 dark:text-white">
                    {team.trackId
                      ? registeredTrackQuery.isLoading
                        ? "Loading track..."
                        : registeredTrackName || "Track unavailable"
                      : "Not assigned"}
                  </dd>
                </div>

                <div className="grid grid-cols-[8.5rem_1fr] items-center gap-4 px-6 py-3.5 md:px-7">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Members
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={[
                          "h-2 w-2 rounded-full",
                          index < members.length
                            ? "bg-blue-500"
                            : "bg-slate-200 dark:bg-slate-700",
                        ].join(" ")}
                      />
                    ))}
                    <span className="ml-1.5 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {members.length}/5
                    </span>
                  </dd>
                </div>

                <div className="grid grid-cols-[8.5rem_1fr] items-center gap-4 px-6 py-3.5 md:px-7">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Team ID
                  </dt>
                  <dd className="break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                    {team.id}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Sidebar: join code and danger zone */}
            <aside className="flex flex-col gap-5">
              <section className="rounded-3xl border border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50/60 p-6 shadow-sm dark:border-blue-500/30 dark:from-blue-500/10 dark:to-indigo-500/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                      <KeyOutlinedIcon style={{ fontSize: 18 }} />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Join Code
                    </h3>
                  </div>
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 text-[11px] font-black uppercase",
                      team.joinCodeEnabled
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400",
                    ].join(" ")}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${team.joinCodeEnabled ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    {team.joinCodeEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <code className="mt-4 block rounded-2xl bg-white px-4 py-3 text-center text-xl font-black tracking-[0.35em] text-slate-900 ring-1 ring-blue-100 dark:bg-slate-950 dark:text-white dark:ring-blue-500/20">
                  {team.joinCode || "------"}
                </code>

                <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Share this code with approved members, or disable it and use
                  email invitations only.
                </p>

                {currentUserIsLeader && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={!team.joinCode}
                      onClick={handleCopyJoinCode}
                      className={`${SECONDARY_BUTTON} flex-1 px-4 py-2`}
                    >
                      <ContentCopyOutlinedIcon style={{ fontSize: 15 }} />
                      Copy
                    </button>
                    <button
                      type="button"
                      disabled={toggleJoinCodeMutation.isPending}
                      onClick={handleToggleJoinCode}
                      className={
                        team.joinCodeEnabled
                          ? `${SECONDARY_BUTTON} flex-1 px-4 py-2`
                          : `${PRIMARY_BUTTON} flex-1 px-4 py-2`
                      }
                    >
                      {team.joinCodeEnabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-rose-200/70 bg-white p-6 dark:border-rose-500/20 dark:bg-slate-900">
                {currentUserIsLeader ? (
                  <>
                    <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      Danger zone
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Deleting removes active memberships and cancels pending
                      invitations. Only forming teams can be deleted.
                    </p>
                    <Tooltip
                      title={
                        canDeleteTeam
                          ? ""
                          : "Only forming teams can be deleted."
                      }
                    >
                      <span className="mt-4 block">
                        <button
                          type="button"
                          disabled={
                            !canDeleteTeam || deleteTeamMutation.isPending
                          }
                          onClick={() => setDeleteDialogOpen(true)}
                          className={`${DANGER_BUTTON} w-full`}
                        >
                          <DeleteOutlineOutlinedIcon style={{ fontSize: 16 }} />
                          Delete Team
                        </button>
                      </span>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      Danger zone
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Leaving removes your active membership and access to this
                      team.
                    </p>
                    <Tooltip
                      title={
                        isTeamRegistered
                          ? "Cannot leave the team because it is already registered."
                          : ""
                      }
                    >
                      <span className="mt-4 block">
                        <button
                          type="button"
                          disabled={
                            leaveTeamMutation.isPending || isTeamRegistered
                          }
                          onClick={handleLeaveTeam}
                          className={`${DANGER_BUTTON} w-full`}
                        >
                          <LogoutOutlinedIcon style={{ fontSize: 16 }} />
                          Leave Team
                        </button>
                      </span>
                    </Tooltip>
                  </>
                )}
              </section>
            </aside>
          </div>
        </div>
      )}

      {/* ── Members tab ─────────────────────────────────────────────── */}
      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
                Roster
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Members
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage current members and invite new members to your team.
              </p>
            </div>

            <Tooltip
              title={
                isTeamRegistered
                  ? "Cannot invite members because the team is already registered."
                  : ""
              }
            >
              <span>
                <button
                  type="button"
                  disabled={
                    members.length >= 5 ||
                    inviteMemberMutation.isPending ||
                    isTeamRegistered
                  }
                  onClick={() => setInviteDialogOpen(true)}
                  className={PRIMARY_BUTTON}
                >
                  <GroupAddOutlinedIcon style={{ fontSize: 18 }} />
                  Invite Member
                </button>
              </span>
            </Tooltip>
          </div>

          {members.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <GroupsOutlinedIcon className="text-slate-400" />
              <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
                No members yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Invite members to start building your team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {members.map((member) => {
                const memberIsLeader = member.userId === team.leaderId;
                return (
                  <article
                    key={member.memberId}
                    className={[
                      "relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-slate-900",
                      memberIsLeader
                        ? "border-amber-200 hover:border-amber-300 dark:border-amber-500/30 dark:hover:border-amber-500/50"
                        : "border-slate-200 hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-500/50",
                    ].join(" ")}
                  >
                    {memberIsLeader && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400 to-orange-400" />
                    )}

                    <div className="flex items-start gap-4">
                      <MemberAvatar name={member.fullName} size="lg" />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-extrabold text-slate-900 dark:text-white">
                            {member.fullName}
                          </p>
                          {memberIsLeader ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                              <WorkspacePremiumOutlinedIcon
                                style={{ fontSize: 12 }}
                              />
                              Leader
                            </span>
                          ) : (
                            <TeamStatusBadge status={member.memberRole} />
                          )}
                        </div>

                        <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
                          <MailOutlinedIcon style={{ fontSize: 14 }} />
                          {member.email}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          <CalendarMonthOutlinedIcon style={{ fontSize: 13 }} />
                          Joined {formatDateTime(member.joinedAt)}
                        </p>
                      </div>
                    </div>

                    {currentUserIsLeader && !memberIsLeader && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <Tooltip
                          title={
                            isTeamRegistered
                              ? "Cannot remove members because the team is already registered."
                              : ""
                          }
                        >
                          <span>
                            <button
                              type="button"
                              disabled={
                                removeMemberMutation.isPending ||
                                isTeamRegistered
                              }
                              onClick={() => handleRemoveMember(member)}
                              className={`${DANGER_BUTTON} px-3 py-1.5 text-xs`}
                            >
                              Remove
                            </button>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            isTeamRegistered
                              ? "Cannot transfer leadership because the team is already registered."
                              : ""
                          }
                        >
                          <span>
                            <button
                              type="button"
                              disabled={
                                transferLeaderMutation.isPending ||
                                isTeamRegistered
                              }
                              onClick={() => handleTransferLeader(member)}
                              className={`${SECONDARY_BUTTON} px-3 py-1.5 text-xs`}
                            >
                              <SwapHorizOutlinedIcon style={{ fontSize: 14 }} />
                              Transfer Leader
                            </button>
                          </span>
                        </Tooltip>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <MailOutlinedIcon
                    className="text-blue-500"
                    style={{ fontSize: 20 }}
                  />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Pending Invitations
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Students invited to join the current roster.
                </p>
              </div>
              {!invitationsQuery.isLoading && (
                <span className="text-xs font-bold tabular-nums text-slate-400 dark:text-slate-500">
                  {invitations.length}{" "}
                  {invitations.length === 1 ? "invitation" : "invitations"}
                </span>
              )}
            </div>
            {invitationsQuery.isLoading && (
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {[0, 1].map((item) => (
                  <Skeleton
                    key={item}
                    variant="rounded"
                    height={150}
                    sx={{ borderRadius: "16px" }}
                  />
                ))}
              </div>
            )}
            {invitationsQuery.isError && (
              <div className="p-5">
                <Alert severity="warning">
                  Cannot load team invitations right now.
                </Alert>
              </div>
            )}
            {!invitationsQuery.isLoading &&
              !invitationsQuery.isError &&
              invitations.length === 0 && (
                <div className="px-5 py-9 text-center">
                  <MailOutlinedIcon className="text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">
                    No pending invitations
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Invited members will appear here.
                  </p>
                </div>
              )}
            {invitations.length > 0 && (
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {invitations.map((invitation) => {
                  const inviteeName = getInviteeDisplayName(invitation);
                  return (
                    <article
                      key={invitation.id}
                      className="flex min-h-44 flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-950/30"
                    >
                      <div className="flex items-start gap-4">
                        <MemberAvatar
                          name={inviteeName}
                          src={getInvitationAvatar(invitation)}
                          size="lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-extrabold text-slate-900 dark:text-white">
                              {inviteeName}
                            </p>
                            <TeamStatusBadge status={invitation.status} />
                          </div>
                          <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
                            <MailOutlinedIcon style={{ fontSize: 14 }} />
                            {invitation.invitedEmail}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                            <CalendarMonthOutlinedIcon
                              style={{ fontSize: 13 }}
                            />
                            Expires {formatDateTime(invitation.expiresAt)}
                          </p>
                        </div>
                      </div>

                      {currentUserIsLeader &&
                        invitation.status.toUpperCase() === "PENDING" && (
                          <div className="mt-auto pt-4">
                            <button
                              type="button"
                              disabled={cancelInvitationMutation.isPending}
                              onClick={() =>
                                handleCancelInvitation(invitation.id)
                              }
                              className={`${DANGER_BUTTON} w-full px-3 py-2 text-xs`}
                            >
                              {cancelInvitationMutation.isPending
                                ? "Cancelling..."
                                : "Cancel invitation"}
                            </button>
                          </div>
                        )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {currentUserIsLeader && <JoinRequestsProfilePanel teamId={team.id} />}
        </div>
      )}

      {/* ── Track registration tab ──────────────────────────────────── */}
      {activeTab === "track-registration" && (
        <TeamRegisterTrackPanel team={team} />
      )}

      {/* ── Edit team modal (leader only) ───────────────────────────── */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "rounded-2xl dark:bg-slate-900" } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          <span className="text-slate-900 dark:text-slate-100">Edit Team</span>
          <p className="mt-0.5 text-xs font-semibold normal-case text-slate-400 dark:text-slate-500">
            Update the team name, project title, and description.
          </p>
        </DialogTitle>
        <form onSubmit={handleSubmitUpdateTeam(handleSaveTeamDetail)}>
          <DialogContent dividers className="space-y-4 dark:border-slate-800">
            <TextField
              label="Team Name"
              required
              fullWidth
              disabled={updateTeamMutation.isPending}
              error={Boolean(updateErrors.name)}
              helperText={updateErrors.name?.message}
              {...registerUpdateTeam("name")}
            />
            <TextField
              label="Project Title"
              fullWidth
              disabled={updateTeamMutation.isPending}
              error={Boolean(updateErrors.projectTitle)}
              helperText={updateErrors.projectTitle?.message}
              {...registerUpdateTeam("projectTitle")}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={5}
              disabled={updateTeamMutation.isPending}
              error={Boolean(updateErrors.description)}
              helperText={updateErrors.description?.message}
              {...registerUpdateTeam("description")}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <button
              type="button"
              onClick={handleCloseEditDialog}
              disabled={updateTeamMutation.isPending}
              className={`${SECONDARY_BUTTON} px-4 py-2`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateTeamMutation.isPending}
              className={`${PRIMARY_BUTTON} px-5 py-2`}
            >
              {updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Invite member modal ─────────────────────────────────────── */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "rounded-2xl dark:bg-slate-900" } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          <span className="text-slate-900 dark:text-slate-100">
            Invite Member
          </span>
          <p className="mt-0.5 text-xs font-semibold normal-case text-slate-400 dark:text-slate-500">
            An email invitation will be sent to the address below.
          </p>
        </DialogTitle>
        <form onSubmit={handleSubmitInvite(handleInviteMember)}>
          <DialogContent dividers className="space-y-4 dark:border-slate-800">
            <TextField
              label="Email address"
              type="email"
              required
              fullWidth
              disabled={inviteMemberMutation.isPending}
              error={Boolean(inviteErrors.email)}
              helperText={inviteErrors.email?.message}
              {...registerInvite("email")}
            />
            <TextField
              label="Message (optional)"
              fullWidth
              multiline
              minRows={3}
              placeholder="Tell them why you want them on the team."
              disabled={inviteMemberMutation.isPending}
              error={Boolean(inviteErrors.message)}
              helperText={inviteErrors.message?.message}
              {...registerInvite("message")}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <button
              type="button"
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviteMemberMutation.isPending}
              className={`${SECONDARY_BUTTON} px-4 py-2`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMemberMutation.isPending}
              className={`${PRIMARY_BUTTON} px-5 py-2`}
            >
              <GroupAddOutlinedIcon style={{ fontSize: 16 }} />
              {inviteMemberMutation.isPending
                ? "Sending..."
                : "Send Invitation"}
            </button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Transfer leadership modal ───────────────────────────────── */}
      <Dialog
        open={Boolean(transferCandidate)}
        onClose={handleCloseTransferDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="transfer-leader-dialog-title"
        slotProps={{ paper: { className: "rounded-2xl dark:bg-slate-900" } }}
      >
        <DialogTitle id="transfer-leader-dialog-title" sx={{ fontWeight: 900 }}>
          <span className="text-slate-900 dark:text-slate-100">
            Transfer Team Leadership
          </span>
        </DialogTitle>
        <DialogContent dividers className="space-y-4 dark:border-slate-800">
          <Alert severity="warning">
            The new leader will receive all team-management permissions. You
            will remain on the team as a regular member.
          </Alert>

          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Current leader
              </p>
              <div className="mt-2 flex justify-center">
                <MemberAvatar name={team.leaderName} />
              </div>
              <p className="mt-2 truncate text-sm font-extrabold text-slate-900 dark:text-white">
                {team.leaderName}
              </p>
            </div>

            <EastOutlinedIcon className="shrink-0 text-blue-500" />

            <div className="flex-1 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                New leader
              </p>
              <div className="mt-2 flex justify-center">
                <MemberAvatar name={transferCandidate?.fullName ?? "?"} />
              </div>
              <p className="mt-2 truncate text-sm font-extrabold text-slate-900 dark:text-white">
                {transferCandidate?.fullName ?? "Not selected"}
              </p>
            </div>
          </div>

          {transferLeaderMutation.isError && (
            <Alert severity="error">
              Leadership could not be transferred. Confirm the selected user is
              still an active member and the team is still forming.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <button
            type="button"
            disabled={transferLeaderMutation.isPending}
            onClick={handleCloseTransferDialog}
            className={`${SECONDARY_BUTTON} px-4 py-2`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              transferLeaderMutation.isPending ||
              !transferCandidate ||
              isTeamRegistered
            }
            onClick={handleConfirmTransfer}
            className={`${PRIMARY_BUTTON} px-5 py-2`}
          >
            {transferLeaderMutation.isPending
              ? "Transferring..."
              : "Confirm Transfer"}
          </button>
        </DialogActions>
      </Dialog>

      {/* ── Delete team modal ───────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleteTeamMutation.isPending) {
            setDeleteDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "rounded-2xl dark:bg-slate-900" } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          <span className="text-slate-900 dark:text-slate-100">
            Delete Team
          </span>
        </DialogTitle>
        <DialogContent dividers className="space-y-4 dark:border-slate-800">
          <Alert severity="warning">
            This marks the team as incomplete, removes active memberships, and
            cancels pending invitations. This action is only allowed before the
            team is admitted to competition.
          </Alert>
          <TextField
            label="Reason"
            fullWidth
            multiline
            minRows={3}
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            disabled={deleteTeamMutation.isPending}
            placeholder="Optional reason for deleting this team"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <button
            type="button"
            disabled={deleteTeamMutation.isPending}
            onClick={() => setDeleteDialogOpen(false)}
            className={`${SECONDARY_BUTTON} px-4 py-2`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleteTeamMutation.isPending}
            onClick={handleDeleteTeam}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition-all hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DeleteOutlineOutlinedIcon style={{ fontSize: 16 }} />
            {deleteTeamMutation.isPending ? "Deleting..." : "Delete Team"}
          </button>
        </DialogActions>
      </Dialog>

      <ActionConfirmDialog
        open={confirmAction !== null}
        title={confirmActionContent.title}
        description={confirmActionContent.description}
        confirmLabel={confirmActionContent.label}
        severity="error"
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmTeamAction}
        isPending={confirmActionPending}
      />
    </div>
  );
};
