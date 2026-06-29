import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import type { UUID } from "@/types/common.types";
import type { TeamMemberResponse } from "@/types/team.types";

import { useTeamAdvancementStatusQuery } from "@/features/advancement/hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "@/features/advancement/components/TeamAdvancementStatusBanner";
import { TeamStatusBadge } from "../components/TeamStatusBagde";
import { TeamRegisterTrackPanel } from "../components/TeamRegisterTrackPanel";
import { TeamJoinRequestsPanel } from "../components/TeamJoinRequestsPanel";
import { DisqualificationStatusBadge } from "@/features/disqualification/components/DisqualificationStatusBadge";

import {
  inviteMemberSchema,
  updateTeamSchema,
  type InviteMemberFormValues,
  type UpdateTeamFormValues,
} from "../schemas/myTeams.schema";
import {
  useCancelTeamInvitationMutation,
  useInviteTeamMemberMutation,
  useLeaveTeamMutation,
  useMyTeamsQuery,
  useRemoveTeamMemberMutation,
  useTeamDetailQuery,
  useTeamInvitationsQuery,
  useToggleJoinCodeMutation,
  useTransferTeamLeaderMutation,
  useUpdateTeamMutation,
} from "../hooks/useParticipantTeams";

type TeamDetailTab = "overview" | "members" | "track-registration";

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  return value.replace("T", " ").slice(0, 16);
}

function isLeaderRole(role?: string) {
  if (!role) return false;
  return role.toUpperCase().includes("LEADER");
}

export const TeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<TeamDetailTab>("overview");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const teamQuery = useTeamDetailQuery(teamId);
  const myTeamsQuery = useMyTeamsQuery();
  const invitationsQuery = useTeamInvitationsQuery(teamId);

  const updateTeamMutation = useUpdateTeamMutation(teamId);
  const inviteMemberMutation = useInviteTeamMemberMutation(teamId);
  const cancelInvitationMutation = useCancelTeamInvitationMutation(teamId);
  const removeMemberMutation = useRemoveTeamMemberMutation(teamId);
  const transferLeaderMutation = useTransferTeamLeaderMutation(teamId);
  const leaveTeamMutation = useLeaveTeamMutation(teamId);
  const toggleJoinCodeMutation = useToggleJoinCodeMutation(teamId);

  const team = teamQuery.data;
  const advancementQuery = useTeamAdvancementStatusQuery(teamId ?? "");
  const advancementData = advancementQuery.data?.data;
  const members = team?.members ?? [];
  const invitations = invitationsQuery.data ?? [];

  const currentTeamSummary = useMemo(() => {
    return (myTeamsQuery.data ?? []).find((item) => item.id === teamId);
  }, [myTeamsQuery.data, teamId]);

  const currentUserIsLeader = isLeaderRole(currentTeamSummary?.roleInTeam);

  const isTeamRegistered = team?.status?.toUpperCase() !== "FORMING";

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
        <p className="font-semibold text-gray-400">Team not found.</p>
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

  const handleSaveTeamDetail = async (values: UpdateTeamFormValues) => {
    await updateTeamMutation.mutateAsync({
      name: values.name.trim(),
      projectTitle: values.projectTitle?.trim() ?? "",
      description: values.description?.trim() ?? "",
    });
    resetUpdateTeam(values);
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
    if (!window.confirm("Cancel this invitation?")) return;
    cancelInvitationMutation.mutate(invitationId);
  };

  const handleRemoveMember = (member: TeamMemberResponse) => {
    if (!window.confirm(`Remove ${member.fullName} from this team?`)) return;
    removeMemberMutation.mutate({
      memberId: member.memberId,
      payload: { reason: "Removed by team leader" },
    });
  };

  const handleTransferLeader = (member: TeamMemberResponse) => {
    if (!window.confirm(`Transfer leadership to ${member.fullName}?`)) return;
    transferLeaderMutation.mutate({ newLeaderUserId: member.userId });
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    await leaveTeamMutation.mutateAsync({ reason: "Left by participant" });
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

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate("/participant/teams")}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackOutlinedIcon style={{ fontSize: 16 }} />
        Back to My Teams
      </button>

      <Card
        variant="outlined"
        className="dark:border-slate-700 dark:bg-slate-800"
      >
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-500">
                Team Detail
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                {team.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                {team.projectTitle || "No project title yet"}
              </p>
            </div>

            {team.status === "DISQUALIFIED" ? (
              <DisqualificationStatusBadge appealStatus={(team as any).appealStatus} />
            ) : (
              <TeamStatusBadge
                status={team.status}
                memberCount={members.length}
              />
            )}
          </div>

          <div className="mt-6 border-b border-gray-100 dark:border-slate-700">
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="overview" label="Overview" />
              <Tab value="members" label="Members" />
              {currentUserIsLeader && (
                <Tab value="track-registration" label="Track Registration" />
              )}
            </Tabs>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6 pt-6">
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
              <section className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                      Team Information
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      Leader can edit only Team Name, Project Title, and
                      Description.
                    </p>
                  </div>
                  {!currentUserIsLeader && (
                    <Tooltip title={isTeamRegistered ? "Cannot leave the team because it is already registered." : ""}>
                      <span>
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={handleLeaveTeam}
                          disabled={leaveTeamMutation.isPending || isTeamRegistered}
                          sx={{ fontWeight: 800, textTransform: "none" }}
                        >
                          Leave Team
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                </div>

                <form
                  className="space-y-5"
                  onSubmit={handleSubmitUpdateTeam(handleSaveTeamDetail)}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField
                      label="Team Name"
                      required
                      fullWidth
                      disabled={!currentUserIsLeader}
                      error={Boolean(updateErrors.name)}
                      helperText={updateErrors.name?.message}
                      {...registerUpdateTeam("name")}
                    />
                    <TextField
                      label="Project Title"
                      fullWidth
                      disabled={!currentUserIsLeader}
                      error={Boolean(updateErrors.projectTitle)}
                      helperText={updateErrors.projectTitle?.message}
                      {...registerUpdateTeam("projectTitle")}
                    />
                    <div className="md:col-span-2">
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        minRows={5}
                        disabled={!currentUserIsLeader}
                        error={Boolean(updateErrors.description)}
                        helperText={updateErrors.description?.message}
                        {...registerUpdateTeam("description")}
                      />
                    </div>
                  </div>
                  {currentUserIsLeader && (
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!isDirty || updateTeamMutation.isPending}
                        sx={{
                          bgcolor: "#2563eb",
                          fontWeight: 800,
                          textTransform: "none",
                          "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                      >
                        {updateTeamMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </form>
              </section>

              <section className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-blue-500">
                      Team Join Code
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Share this code with approved members, or disable it and use email invitations only.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <code className="rounded-lg bg-white px-4 py-2 text-base font-black tracking-widest text-slate-900 ring-1 ring-blue-100 dark:bg-slate-950 dark:text-white dark:ring-blue-500/20">
                        {team.joinCode || "Not generated"}
                      </code>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-black",
                          team.joinCodeEnabled
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        ].join(" ")}
                      >
                        {team.joinCodeEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {currentUserIsLeader && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyOutlinedIcon />}
                        disabled={!team.joinCode}
                        onClick={handleCopyJoinCode}
                        sx={{ fontWeight: 800, textTransform: "none" }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleToggleJoinCode}
                        disabled={toggleJoinCodeMutation.isPending}
                        sx={{
                          bgcolor: team.joinCodeEnabled ? "#64748b" : "#2563eb",
                          fontWeight: 800,
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: team.joinCodeEnabled ? "#475569" : "#1d4ed8",
                          },
                        }}
                      >
                        {team.joinCodeEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoItem label="Leader" value={team.leaderName} />
                <InfoItem label="Team Status" value={team.status} />

                <InfoItem
                  label="Track"
                  value={team.trackId ? team.trackId : "Not assigned"}
                />
                <InfoItem
                  label="Members"
                  value={`${members.length}/5 member(s)`}
                />

                <InfoItem label="Team ID" value={team.id} />
              </section>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-5 pt-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    Members
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Manage current members and invite new members to your team.
                  </p>
                </div>

                <Tooltip title={isTeamRegistered ? "Cannot invite members because the team is already registered." : ""}>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<GroupAddOutlinedIcon />}
                      disabled={members.length >= 5 || inviteMemberMutation.isPending || isTeamRegistered}
                      onClick={() => setInviteDialogOpen(true)}
                      sx={{
                        bgcolor: "#2563eb",
                        fontWeight: 800,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#1d4ed8" },
                        "&.Mui-disabled": { bgcolor: "rgba(0, 0, 0, 0.12)" } 
                      }}
                    >
                      Invite Member
                    </Button>
                  </span>
                </Tooltip>
              </div>

              {members.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <GroupsOutlinedIcon className="text-gray-400" />
                  <p className="mt-3 font-bold text-gray-700 dark:text-slate-200">
                    No members yet.
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Invite members to start building your team.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => {
                    const memberIsLeader = member.userId === team.leaderId;
                    return (
                      <div
                        key={member.memberId}
                        className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                            <GroupsOutlinedIcon fontSize="small" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-extrabold text-gray-900 dark:text-white">
                                {member.fullName}
                              </p>
                              <TeamStatusBadge status={member.memberRole} />
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                              {member.email}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-gray-400">
                              Joined at: {formatDateTime(member.joinedAt)}
                            </p>
                          </div>
                        </div>
                        {currentUserIsLeader && !memberIsLeader && (
                          <div className="flex flex-wrap gap-2">
                            <Tooltip title={isTeamRegistered ? "Cannot remove members because the team is already registered." : ""}>
                              <span>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  disabled={removeMemberMutation.isPending || isTeamRegistered}
                                  onClick={() => handleRemoveMember(member)}
                                  sx={{ fontWeight: 800, textTransform: "none" }}
                                >
                                  Remove
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title={isTeamRegistered ? "Cannot transfer leadership because the team is already registered." : ""}>
                              <span>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  disabled={transferLeaderMutation.isPending || isTeamRegistered}
                                  onClick={() => handleTransferLeader(member)}
                                  sx={{ fontWeight: 800, textTransform: "none" }}
                                >
                                  Transfer Leader
                                </Button>
                              </span>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Pending Invitations
                </h3>
                {invitationsQuery.isError && (
                  <Alert severity="warning">
                    Cannot load team invitations right now.
                  </Alert>
                )}
                {!invitationsQuery.isLoading && invitations.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="font-bold text-gray-700 dark:text-slate-200">
                      No pending invitations.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Invited members will appear here.
                    </p>
                  </div>
                )}
                {invitations.length > 0 && (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700"
                      >
                        <div>
                          <p className="font-extrabold text-gray-900 dark:text-white">
                            {invitation.invitedEmail}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Expires at: {formatDateTime(invitation.expiresAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <TeamStatusBadge status={invitation.status} />
                          {currentUserIsLeader &&
                            invitation.status.toUpperCase() === "PENDING" && (
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                disabled={cancelInvitationMutation.isPending}
                                onClick={() =>
                                  handleCancelInvitation(invitation.id)
                                }
                                sx={{ fontWeight: 800, textTransform: "none" }}
                              >
                                Cancel
                              </Button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              {currentUserIsLeader && <TeamJoinRequestsPanel teamId={team.id} />}
            </div>
          )}

          {activeTab === "track-registration" && (
            <TeamRegisterTrackPanel team={team} />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Invite Member</DialogTitle>
        <form onSubmit={handleSubmitInvite(handleInviteMember)}>
          <DialogContent dividers className="space-y-4">
            <TextField
              label="Email address"
              required
              fullWidth
              error={Boolean(inviteErrors.email)}
              helperText={inviteErrors.email?.message}
              {...registerInvite("email")}
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={3}
              error={Boolean(inviteErrors.message)}
              helperText={inviteErrors.message?.message}
              {...registerInvite("message")}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setInviteDialogOpen(false)}
              sx={{ fontWeight: 800, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={inviteMemberMutation.isPending}
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {inviteMemberMutation.isPending
                ? "Sending..."
                : "Send Invitation"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

type InfoItemProps = { label: string; value: string };
const InfoItem = ({ label, value }: InfoItemProps) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-words font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};
