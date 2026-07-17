import { useState } from "react";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
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

const BROWSE_AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-sky-600",
];

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getGradient(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return BROWSE_AVATAR_GRADIENTS[hash % BROWSE_AVATAR_GRADIENTS.length];
}

function MemberDots({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={[
            "h-2 w-2 rounded-full transition-colors",
            index < count
              ? "bg-blue-500"
              : "bg-gray-200 dark:bg-slate-700",
          ].join(" ")}
        />
      ))}
      <span className="ml-1.5 text-xs font-bold tabular-nums text-gray-500 dark:text-slate-400">
        {count}/{max}
      </span>
    </div>
  );
}

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
    <div className="mt-14 space-y-6 border-t border-gray-200 pt-12 dark:border-slate-800">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
          Still forming
        </p>

        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
          Find a Team
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center text-sm font-semibold text-gray-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
          No teams are currently forming.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <article
            key={team.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50"
          >
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-sm font-black text-white shadow-md ${getGradient(team.name)}`}
                >
                  {getInitials(team.name)}
                </div>

                <TeamStatusBadge status={team.status} />
              </div>

              <div className="mt-4">
                <h3 className="line-clamp-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {team.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {team.projectTitle || team.description || "Project details are not available yet."}
                </p>
              </div>

              {(team.eventName || team.trackName) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {team.eventName && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {team.eventName}
                    </span>
                  )}
                  {team.trackName && (
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                      {team.trackName}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Members
                </p>
                <MemberDots count={team.memberCount} max={team.maxMembers} />
              </div>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
                Leader: {team.leaderName}
              </p>

              <button
                type="button"
                disabled={!team.canRequestJoin}
                onClick={() => setSelectedTeam(team)}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                  team.canRequestJoin
                    ? "cursor-pointer bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:scale-95"
                    : "cursor-not-allowed border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500",
                ].join(" ")}
              >
                {team.canRequestJoin && (
                  <PersonAddOutlinedIcon style={{ fontSize: 14 }} />
                )}
                {requestButtonLabel(team)}
              </button>
            </footer>
          </article>
        ))}
      </div>

      <Dialog
        open={Boolean(selectedTeam)}
        onClose={closeDialog}
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
            Request to Join Team
          </span>
        </DialogTitle>
        <DialogContent dividers className="dark:border-slate-800">
          {selectedTeam && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
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
            sx={{
              bgcolor: "#3b82f6",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#2563eb", boxShadow: "none" },
            }}
          >
            {requestMutation.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
