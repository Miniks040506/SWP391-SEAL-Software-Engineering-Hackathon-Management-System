import { useState } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import type { FormingTeamResponse } from "@/types/team.types";
import {
  useFormingTeamsQuery,
  useRequestToJoinTeamMutation,
} from "../hooks/useTeamJoinRequests";
import { TeamStatusBadge } from "./TeamStatusBagde";

const requestButtonLabel = (team: FormingTeamResponse) => {
  if (team.alreadyMember) return "Already a Member";
  if (team.pendingJoinRequest) return "Request Pending";
  if (team.memberCount >= team.maxMembers) return "Team Full";
  return "Request to Join";
};

export function BrowseTeamsSection() {
  const [selectedTeam, setSelectedTeam] = useState<FormingTeamResponse | null>(null);
  const [message, setMessage] = useState("");
  const formingTeamsQuery = useFormingTeamsQuery({ page: 0, size: 100 });
  const requestMutation = useRequestToJoinTeamMutation();
  const teams = formingTeamsQuery.data?.content ?? [];

  const closeDialog = () => {
    if (requestMutation.isPending) return;
    setSelectedTeam(null);
    setMessage("");
    requestMutation.reset();
  };

  const sendRequest = () => {
    if (!selectedTeam) return;
    requestMutation.mutate(
      {
        teamId: selectedTeam.id,
        payload: { message: message.trim() || undefined },
      },
      { onSuccess: closeDialog },
    );
  };

  return (
    <div className="mt-12 space-y-6 border-t border-slate-200 pt-10 dark:border-slate-800">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
          Find a Team
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Discover teams that are still forming and send a request directly to their leader.
        </p>
      </div>

      {formingTeamsQuery.isLoading && (
        <div className="flex min-h-40 items-center justify-center">
          <CircularProgress size={32} />
        </div>
      )}

      {formingTeamsQuery.isError && (
        <Alert severity="error">Forming teams could not be loaded.</Alert>
      )}

      {!formingTeamsQuery.isLoading && !formingTeamsQuery.isError && teams.length === 0 && (
        <Alert severity="info">No teams are currently forming.</Alert>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <Card
            key={team.id}
            variant="outlined"
            className="flex flex-col overflow-hidden rounded-2xl transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <CardContent className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
                  <GroupsOutlinedIcon />
                </div>
                <TeamStatusBadge
                  memberCount={team.memberCount}
                  maxMembers={team.maxMembers}
                  status={team.status}
                />
              </div>

              <div className="mt-4">
                <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
                  {team.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-500">
                  {team.projectTitle || team.description || "Project details are not available yet."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {team.eventName && <Chip label={team.eventName} size="small" variant="outlined" />}
                {team.trackName && <Chip label={team.trackName} size="small" variant="outlined" />}
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <p className="truncate text-xs font-semibold text-gray-400">
                  Leader: {team.leaderName}
                </p>
                <Button
                  variant={team.canRequestJoin ? "contained" : "outlined"}
                  size="small"
                  disabled={!team.canRequestJoin}
                  startIcon={team.canRequestJoin ? <PersonAddOutlinedIcon /> : undefined}
                  onClick={() => setSelectedTeam(team)}
                  sx={{
                    flexShrink: 0,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                    bgcolor: team.canRequestJoin ? "#4f46e5" : undefined,
                    "&:hover": { bgcolor: team.canRequestJoin ? "#4338ca" : undefined, boxShadow: "none" },
                  }}
                >
                  {requestButtonLabel(team)}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selectedTeam)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>Request to Join Team</DialogTitle>
        <DialogContent dividers>
          {selectedTeam && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Requesting to join <strong className="text-gray-900 dark:text-white">{selectedTeam.name}</strong>
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                  Leader: <strong className="text-gray-900 dark:text-white">{selectedTeam.leaderName}</strong>
                </p>
              </div>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message to Leader (Optional)"
                placeholder="Introduce yourself and explain how you can contribute."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={requestMutation.isPending}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                helperText={`${message.length}/1000`}
              />
              {requestMutation.isError && (
                <Alert severity="error">The request could not be sent. Review the message and try again.</Alert>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={requestMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={sendRequest}
            disabled={requestMutation.isPending}
            sx={{ bgcolor: "#4f46e5", fontWeight: 800, textTransform: "none" }}
          >
            {requestMutation.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
