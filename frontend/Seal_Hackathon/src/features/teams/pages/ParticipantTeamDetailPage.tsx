import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import type { UUID } from "@/types/common.types";
import type { TeamMemberResponse } from "@/types/team.types";

import { TeamStatusBadge } from "../components/TeamStatusBagde";
import {
  useLeaveTeamMutation,
  useMyTeamsQuery,
  useRemoveTeamMemberMutation,
  useTeamDetailQuery,
  useTransferTeamLeaderMutation,
} from "../hooks/useParticipantTeams";

type TeamDetailTab = "overview" | "members";

function formatDateTime(value?: string) {
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

  const [activeTab, setActiveTab] = useState<TeamDetailTab>("overview");

  const teamQuery = useTeamDetailQuery(teamId);
  const myTeamsQuery = useMyTeamsQuery();

  const removeMemberMutation = useRemoveTeamMemberMutation(teamId);
  const transferLeaderMutation = useTransferTeamLeaderMutation(teamId);
  const leaveTeamMutation = useLeaveTeamMutation(teamId);

  const team = teamQuery.data;

  const currentTeamSummary = useMemo(() => {
    return (myTeamsQuery.data ?? []).find((item) => item.id === teamId);
  }, [myTeamsQuery.data, teamId]);

  const currentUserIsLeader = isLeaderRole(currentTeamSummary?.roleInTeam);

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

  const handleRemoveMember = (member: TeamMemberResponse) => {
    if (!window.confirm(`Remove ${member.fullName} from this team?`)) return;

    removeMemberMutation.mutate({
      memberId: member.userId,
      payload: {
        reason: "Removed by team leader",
      },
    });
  };

  const handleTransferLeader = (member: TeamMemberResponse) => {
    if (!window.confirm(`Transfer leadership to ${member.fullName}?`)) return;

    transferLeaderMutation.mutate({
      newLeaderUserId: member.userId,
    });
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    await leaveTeamMutation.mutateAsync({
      reason: "Left by participant",
    });

    navigate("/participant/teams");
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

            <TeamStatusBadge status={team.status} />
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
            </Tabs>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6 pt-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoItem label="Team Name" value={team.name} />
                <InfoItem
                  label="Project Title"
                  value={team.projectTitle || "Not provided"}
                />
                <InfoItem
                  label="Description"
                  value={team.description || "Not provided"}
                />
                <InfoItem label="Leader" value={team.leaderName} />
                <InfoItem
                  label="Members"
                  value={`${team.members.length} member(s)`}
                />
                <InfoItem
                  label="Track"
                  value={team.trackId ? team.trackId : "Not assigned"}
                />
              </section>

              <div className="flex flex-wrap gap-3">
                {currentUserIsLeader ? (
                  <Button
                    variant="outlined"
                    onClick={() => setActiveTab("members")}
                    sx={{ fontWeight: 800, textTransform: "none" }}
                  >
                    Manage Members
                  </Button>
                ) : (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={handleLeaveTeam}
                    disabled={leaveTeamMutation.isPending}
                    sx={{ fontWeight: 800, textTransform: "none" }}
                  >
                    Leave Team
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                Members
              </h2>

              {team.members.map((member) => {
                const memberIsLeader = member.userId === team.leaderId;

                return (
                  <div
                    key={member.userId}
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
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          disabled={removeMemberMutation.isPending}
                          onClick={() => handleRemoveMember(member)}
                          sx={{ fontWeight: 800, textTransform: "none" }}
                        >
                          Remove
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          disabled={transferLeaderMutation.isPending}
                          onClick={() => handleTransferLeader(member)}
                          sx={{ fontWeight: 800, textTransform: "none" }}
                        >
                          Transfer Leader
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

type InfoItemProps = {
  label: string;
  value: string;
};

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