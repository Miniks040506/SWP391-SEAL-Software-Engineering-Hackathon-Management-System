import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";

import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";

import { TeamStatusBadge } from "../components/TeamStatusBagde";
import {
  useMyTeamsQuery,
  useMyInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from "../hooks/useParticipantTeams";

type TeamSummaryView = {
  id: string;
  name: string;
  projectTitle?: string;
  status: string;
  roleInTeam: string;
  memberCount?: number;
};

export const MyTeamsPage = () => {
  const navigate = useNavigate();

  // State cho Popover (Menu chuông thông báo)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const myTeamsQuery = useMyTeamsQuery();
  const invitationsQuery = useMyInvitationsQuery();

  const acceptMutation = useAcceptInvitationMutation();
  const rejectMutation = useRejectInvitationMutation();

  const teams = (myTeamsQuery.data ?? []) as TeamSummaryView[];
  const invitations = invitationsQuery.data ?? [];

  const showEmptyState =
    !myTeamsQuery.isLoading && (myTeamsQuery.isError || teams.length === 0);

  // Handlers cho Chuông thông báo
  const handleOpenNotifications = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };
  const isNotificationOpen = Boolean(anchorEl);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-500">
            My Teams
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            Team Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            View your teams and manage team members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <IconButton
            onClick={handleOpenNotifications}
            className="border border-gray-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            sx={{ width: 44, height: 44, borderRadius: "12px" }}
          >
            <Badge
              badgeContent={invitations.length}
              color="error"
              sx={{ "& .MuiBadge-badge": { fontWeight: "bold" } }}
            >
              <NotificationsOutlinedIcon className="text-gray-700 dark:text-slate-200" />
            </Badge>
          </IconButton>

          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => navigate("/participant/teams/create")}
            sx={{
              height: 44,
              bgcolor: "#2563eb",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "12px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
            }}
          >
            Create Team
          </Button>
        </div>
      </section>

      <Popover
        open={isNotificationOpen}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          className: "mt-2 w-full max-w-[360px] rounded-2xl border border-gray-100 shadow-xl dark:border-slate-700 dark:bg-slate-800",
        }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
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
              sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.75rem" }}
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
              {invitations.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                          disabled={rejectMutation.isPending || acceptMutation.isPending}
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
                          disabled={rejectMutation.isPending || acceptMutation.isPending}
                          onClick={() => {
                            acceptMutation.mutate(inv.id);
                            if (invitations.length === 1) handleCloseNotifications(); // Đóng menu nếu là lời mời cuối cùng
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

      {myTeamsQuery.isError && (
        <Alert severity="warning">Cannot connect right now. Try later.</Alert>
      )}

      {myTeamsQuery.isLoading && (
        <div className="flex justify-center py-24"><CircularProgress /></div>
      )}

      {showEmptyState && (
        <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
            <GroupsOutlinedIcon />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            You are not in any team yet.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-slate-400">
            Create a team to join a SEAL event or wait for an invitation from another Team Leader.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => navigate("/participant/teams/create")}
              sx={{ bgcolor: "#2563eb", fontWeight: 800, textTransform: "none", borderRadius: "12px", "&:hover": { bgcolor: "#1d4ed8" } }}
            >
              Create Team
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExploreOutlinedIcon />}
              onClick={() => navigate("/events")}
              sx={{ fontWeight: 800, textTransform: "none", borderRadius: "12px" }}
            >
              Explore Events
            </Button>
          </div>
        </section>
      )}

      {!myTeamsQuery.isLoading && teams.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id} variant="outlined" className="overflow-hidden rounded-2xl dark:border-slate-700 dark:bg-slate-800">
              <CardContent>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                        <GroupsOutlinedIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-2xl font-extrabold text-gray-900 dark:text-white">
                          {team.name}
                        </h2>
                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-slate-400">
                          {team.projectTitle || "No project title yet"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                        <p className="text-sm font-semibold text-gray-500">Role</p>
                        <div className="mt-2"><TeamStatusBadge status={team.roleInTeam} /></div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                        <p className="text-sm font-semibold text-gray-500">Status</p>
                        <div className="mt-2"><TeamStatusBadge status={team.status} /></div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                        <p className="text-sm font-semibold text-gray-500">Members</p>
                        <div className="mt-2"><TeamStatusBadge memberCount={team.memberCount} /></div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    onClick={() => navigate(`/participant/teams/${team.id}`)}
                    sx={{
                      bgcolor: "#2563eb",
                      fontWeight: 800,
                      textTransform: "none",
                      borderRadius: "10px",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                    }}
                  >
                    View Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};