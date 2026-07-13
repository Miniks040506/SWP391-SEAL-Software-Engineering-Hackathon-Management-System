import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Radio from "@mui/material/Radio";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import type { TeamDetailResponse } from "@/types/team.types";
import { useTrackRegistration } from "../hooks/useTrackRegistration";
import { useQuery } from "@tanstack/react-query";
import { trackApi } from "@/api/track.api";

type TeamRegisterTrackPanelProps = {
  team: TeamDetailResponse;
};

export const TeamRegisterTrackPanel = ({
  team,
}: TeamRegisterTrackPanelProps) => {
  const {
    eventsQuery,
    events,
    selectedEventId,
    setSelectedEventId,
    availableTracksQuery,
    registerMutation,
  } = useTrackRegistration(team.id);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const memberCount = (team.members ?? []).length;

  const hasMinMembers = (team.members ?? []).length >= 3;

  const handleRegister = async () => {
    if (!selectedTrackId) return;
    await registerMutation.mutateAsync({ trackId: selectedTrackId });
    setConfirmOpen(false);
  };

  const registeredTrackQuery = useQuery({
    queryKey: ["track", team.trackId],
    queryFn: () => trackApi.getTrackById(team.trackId!),
    enabled: Boolean(team.trackId),
  });

  return (
    <Card
      variant="outlined"
      className="mt-6 border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-slate-800/50"
    >
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Track Registration
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Select an event and a competition track for your team. You cannot
            change this once registered.
          </p>
        </div>

        {team.trackId ? (
          <Alert severity={team.registrationStatus === "REJECTED" ? "error" : "success"}>
            <strong>Registration submitted!</strong>
            <br />
            Registered Track: {registeredTrackQuery.data?.name || availableTracksQuery.data?.find((t) => t.id === team.trackId)?.name || (team as any).trackName || team.trackId}
            <br />
            Status: {team.registrationStatus === "APPROVED" ? "APPROVED. Registration approved." : team.registrationStatus === "REJECTED" ? "REJECTED. Registration rejected." : "PENDING_APPROVAL. Awaiting coordinator approval."}
          </Alert>
        ) : (
          <>
            {!hasMinMembers && (
              <Alert severity="warning">
                Registration blocked: Your team must have at least 3 members to
                register for a track.
              </Alert>
            )}

            {hasMinMembers && eventsQuery.isLoading && (
              <div className="flex justify-center py-4">
                <CircularProgress size={24} />
              </div>
            )}

            {hasMinMembers && eventsQuery.isError && (
              <Alert severity="error">Failed to load registration events.</Alert>
            )}

            {hasMinMembers && eventsQuery.isSuccess && events.length === 0 && (
              <Alert severity="warning">
                Registration blocked: No events are currently open for registration.
              </Alert>
            )}

            {hasMinMembers && eventsQuery.isSuccess && events.length > 1 && (
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel id="event-select-label">Select Event</InputLabel>
                <Select
                  labelId="event-select-label"
                  value={selectedEventId || ""}
                  label="Select Event"
                  onChange={(e) => {
                    setSelectedEventId(e.target.value as string);
                    setSelectedTrackId(null);
                  }}
                >
                  {events.map((evt) => (
                    <MenuItem key={evt.id} value={evt.id}>
                      {evt.name} ({evt.season} {evt.year})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {hasMinMembers && selectedEventId && availableTracksQuery.isLoading && (
              <div className="flex justify-center py-4">
                <CircularProgress size={24} />
              </div>
            )}

            {hasMinMembers && selectedEventId && availableTracksQuery.isError && (
              <Alert severity="error">Failed to load available tracks.</Alert>
            )}

            {hasMinMembers &&
              selectedEventId &&
              availableTracksQuery.isSuccess &&
              availableTracksQuery.data.length === 0 && (
                <Alert severity="warning">
                  Registration blocked: No tracks available in this event.
                </Alert>
              )}

            {hasMinMembers &&
              selectedEventId &&
              availableTracksQuery.isSuccess &&
              availableTracksQuery.data.length > 0 && (
                <div className="space-y-3">
                  {availableTracksQuery.data.map((track) => {
                    const isFull =
                      track.maxTeams != null &&
                      track.registeredTeamCount >= track.maxTeams;
                    const notEligible =
                      (track.minMembers != null &&
                        memberCount < track.minMembers) ||
                      (track.maxMembers != null && memberCount > track.maxMembers);
                    const isDisabled = isFull || notEligible;

                    return (
                      <div
                        key={track.id}
                        onClick={() => !isDisabled && setSelectedTrackId(track.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                          selectedTrackId === track.id
                            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                            : isDisabled
                              ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-slate-700 dark:bg-slate-800/40"
                              : "border-gray-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Radio
                            checked={selectedTrackId === track.id}
                            disabled={isDisabled}
                            color="primary"
                            sx={{ p: 0, mt: 0.5 }}
                          />
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {track.name}
                            </h3>
                            {track.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                {track.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${isDisabled ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
                          >
                            {track.registeredTeamCount} / {track.maxTeams ?? "∞"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Teams
                          </p>
                          {(track.minMembers || track.maxMembers) && (
                            <p className="text-xs text-gray-400 mt-1">
                              {track.minMembers ?? 1}–{track.maxMembers ?? "∞"}{" "}
                              members required
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="contained"
                      disabled={!selectedTrackId || registerMutation.isPending}
                      onClick={() => setConfirmOpen(true)}
                      sx={{
                        bgcolor: "#2563eb",
                        fontWeight: 800,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#1d4ed8" },
                      }}
                    >
                      Register Team
                    </Button>
                  </div>
                </div>
              )}
          </>
        )}
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 900 }}>Confirm Registration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to register your team for this track? This
            action cannot be undone and you cannot change the track later.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            disabled={registerMutation.isPending}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            {registerMutation.isPending ? "Submitting..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
