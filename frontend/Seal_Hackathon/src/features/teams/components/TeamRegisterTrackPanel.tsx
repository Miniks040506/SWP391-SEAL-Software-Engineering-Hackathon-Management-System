import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Skeleton from "@mui/material/Skeleton";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

import { trackApi } from "@/api/track.api";
import type { UUID } from "@/types/common.types";
import type { TeamDetailResponse } from "@/types/team.types";
import type { TrackAvailabilityResponse } from "@/types/track.types";
import { useTrackRegistration } from "../hooks/useTrackRegistration";

type TeamRegisterTrackPanelProps = {
  team: TeamDetailResponse;
};

const REGISTER_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:bg-blue-500 dark:hover:bg-blue-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400";

function getTrackAvailability(
  track: TrackAvailabilityResponse,
  memberCount: number,
) {
  const full =
    track.full ||
    (track.maxTeams != null && track.registeredTeamCount >= track.maxTeams);
  const eligible =
    (track.minMembers == null || memberCount >= track.minMembers) &&
    (track.maxMembers == null || memberCount <= track.maxMembers);

  return {
    full,
    eligible,
    disabled: full || !eligible,
  };
}

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

  const [selectedTrackId, setSelectedTrackId] = useState<UUID | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const memberCount = team.members?.length ?? 0;
  const hasMinMembers = memberCount >= 3;
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const selectedTrack = availableTracksQuery.data?.find(
    (track) => track.id === selectedTrackId,
  );

  const registeredTrackQuery = useQuery({
    queryKey: ["track", team.trackId],
    queryFn: () => trackApi.getTrackById(team.trackId!),
    enabled: Boolean(team.trackId),
  });

  const registeredTrackName =
    registeredTrackQuery.data?.name ||
    (team as TeamDetailResponse & { trackName?: string | null }).trackName;
  const registeredTrackDescription = registeredTrackQuery.data?.description;

  const handleRegister = async () => {
    if (!selectedTrackId) return;
    await registerMutation.mutateAsync({ trackId: selectedTrackId });
    setConfirmOpen(false);
  };

  const chooseEvent = (eventId: UUID) => {
    setSelectedEventId(eventId);
    setSelectedTrackId(null);
  };

  const registrationTone =
    team.registrationStatus === "APPROVED"
      ? {
          panel:
            "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10",
          iconClass:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
          icon: <CheckCircleOutlinedIcon style={{ fontSize: 24 }} />,
          headline: "Registration approved",
          detail: "Your team is confirmed for this competition track.",
        }
      : team.registrationStatus === "REJECTED"
        ? {
            panel:
              "border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-500/10",
            iconClass:
              "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
            icon: <ErrorOutlineOutlinedIcon style={{ fontSize: 24 }} />,
            headline: "Registration rejected",
            detail: "The coordinator did not approve this registration.",
          }
        : {
            panel:
              "border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10",
            iconClass:
              "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
            icon: <PendingOutlinedIcon style={{ fontSize: 24 }} />,
            headline: "Awaiting approval",
            detail: "The coordinator is reviewing your track registration.",
          };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="grid gap-6 border-b border-slate-100 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8 dark:border-slate-800">
        <div className="max-w-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <RouteOutlinedIcon style={{ fontSize: 22 }} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Track Registration
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Choose the event and track that best fit your project. Track
            selection is final after submission.
          </p>
        </div>

        <div className="flex min-w-52 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-700">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              hasMinMembers
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
            }`}
          >
            <GroupsOutlinedIcon style={{ fontSize: 20 }} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Team readiness
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
              {memberCount} members, {hasMinMembers ? "eligible" : "3 required"}
            </p>
          </div>
        </div>
      </header>

      {team.trackId ? (
        <div className="p-6 md:p-8">
          <div
            className={`rounded-2xl border p-5 md:p-6 ${registrationTone.panel}`}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${registrationTone.iconClass}`}
                >
                  {registrationTone.icon}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {registrationTone.headline}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {registrationTone.detail}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/60 dark:text-slate-200 dark:ring-slate-700">
                <LockOutlinedIcon style={{ fontSize: 13 }} />
                Selection locked
              </span>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-950/60 dark:ring-slate-700">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                Registered track
              </p>
              {registeredTrackQuery.isLoading ? (
                <div className="mt-3 space-y-2">
                  <Skeleton variant="text" width="45%" height={34} />
                  <Skeleton variant="text" width="75%" />
                </div>
              ) : (
                <>
                  <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                    {registeredTrackName || "Track unavailable"}
                  </h3>
                  {registeredTrackDescription && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {registeredTrackDescription}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-[17rem_1fr]">
          <aside className="border-b border-slate-100 bg-slate-50/70 p-6 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-950/30">
            <h3 className="font-extrabold text-slate-900 dark:text-white">
              Before you register
            </h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <TaskAltOutlinedIcon
                  className={
                    hasMinMembers
                      ? "text-blue-600"
                      : "text-slate-300 dark:text-slate-600"
                  }
                  style={{ fontSize: 20 }}
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Eligible team size
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    At least 3 members are required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TaskAltOutlinedIcon
                  className={
                    selectedEventId
                      ? "text-blue-600"
                      : "text-slate-300 dark:text-slate-600"
                  }
                  style={{ fontSize: 20 }}
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Event selected
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Pick an event accepting registrations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TaskAltOutlinedIcon
                  className={
                    selectedTrackId
                      ? "text-blue-600"
                      : "text-slate-300 dark:text-slate-600"
                  }
                  style={{ fontSize: 20 }}
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Track selected
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Check team limits before choosing.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              <LockOutlinedIcon className="mb-2" style={{ fontSize: 17 }} />
              Registration cannot be moved to another track after confirmation.
            </div>
          </aside>

          <div className="min-w-0 space-y-8 p-6 md:p-8">
            {!hasMinMembers && (
              <Alert severity="warning">
                Add {3 - memberCount} more{" "}
                {3 - memberCount === 1 ? "member" : "members"} before
                registering for a track.
              </Alert>
            )}

            {hasMinMembers && eventsQuery.isLoading && (
              <div
                className="space-y-3"
                aria-label="Loading registration events"
              >
                <Skeleton variant="text" width={160} height={30} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton
                    variant="rounded"
                    height={92}
                    sx={{ borderRadius: "16px" }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={92}
                    sx={{ borderRadius: "16px" }}
                  />
                </div>
              </div>
            )}

            {hasMinMembers && eventsQuery.isError && (
              <Alert severity="error">
                Failed to load registration events.
              </Alert>
            )}

            {hasMinMembers && eventsQuery.isSuccess && events.length === 0 && (
              <Alert severity="info">
                No events are currently accepting team registrations.
              </Alert>
            )}

            {hasMinMembers && eventsQuery.isSuccess && events.length > 0 && (
              <section aria-labelledby="event-choice-title">
                <h3
                  id="event-choice-title"
                  className="text-lg font-extrabold text-slate-900 dark:text-white"
                >
                  Choose an event
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Only events with open registration are shown.
                </p>
                <div
                  className="mt-4 grid gap-3 sm:grid-cols-2"
                  role="radiogroup"
                >
                  {events.map((event) => {
                    const selected = selectedEventId === event.id;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => chooseEvent(event.id)}
                        className={[
                          "flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                          selected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/15 dark:border-blue-400 dark:bg-blue-500/10"
                            : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/60",
                        ].join(" ")}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-blue-600 text-white dark:bg-blue-500"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <EventOutlinedIcon style={{ fontSize: 18 }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {event.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {[event.season, event.year]
                              .filter(Boolean)
                              .join(" ") || "Registration open"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {hasMinMembers &&
              selectedEventId &&
              availableTracksQuery.isLoading && (
                <section
                  className="space-y-3"
                  aria-label="Loading competition tracks"
                >
                  <Skeleton variant="text" width={180} height={30} />
                  <div className="grid gap-4 md:grid-cols-2">
                    {[0, 1, 2, 3].map((item) => (
                      <Skeleton
                        key={item}
                        variant="rounded"
                        height={210}
                        sx={{ borderRadius: "16px" }}
                      />
                    ))}
                  </div>
                </section>
              )}

            {hasMinMembers &&
              selectedEventId &&
              availableTracksQuery.isError && (
                <Alert severity="error">
                  Failed to load tracks for this event.
                </Alert>
              )}

            {hasMinMembers &&
              selectedEventId &&
              availableTracksQuery.isSuccess &&
              availableTracksQuery.data.length === 0 && (
                <Alert severity="info">
                  No tracks are available in this event.
                </Alert>
              )}

            {hasMinMembers &&
              selectedEventId &&
              availableTracksQuery.isSuccess &&
              availableTracksQuery.data.length > 0 && (
                <section aria-labelledby="track-choice-title">
                  <div>
                    <h3
                      id="track-choice-title"
                      className="text-lg font-extrabold text-slate-900 dark:text-white"
                    >
                      Choose a competition track
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {selectedEvent?.name
                        ? `Available for ${selectedEvent.name}`
                        : "Compare eligibility and remaining capacity."}
                    </p>
                  </div>

                  <div
                    className="mt-4 grid gap-4 md:grid-cols-2"
                    role="radiogroup"
                  >
                    {availableTracksQuery.data.map((track) => {
                      const availability = getTrackAvailability(
                        track,
                        memberCount,
                      );
                      const selected = selectedTrackId === track.id;
                      const remainingSlots =
                        track.remainingSlots ??
                        (track.maxTeams != null
                          ? Math.max(
                              0,
                              track.maxTeams - track.registeredTeamCount,
                            )
                          : null);

                      return (
                        <button
                          key={track.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={availability.disabled}
                          onClick={() => setSelectedTrackId(track.id)}
                          className={[
                            "group flex min-h-52 flex-col rounded-2xl border p-5 text-left transition-all",
                            selected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/15 dark:border-blue-400 dark:bg-blue-500/10"
                              : availability.disabled
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-800/40"
                                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/60",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {selected ? (
                                <RadioButtonCheckedOutlinedIcon
                                  className="text-blue-600 dark:text-blue-400"
                                  style={{ fontSize: 20 }}
                                />
                              ) : (
                                <RouteOutlinedIcon style={{ fontSize: 19 }} />
                              )}
                            </div>
                            {availability.full ? (
                              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                                Track full
                              </span>
                            ) : !availability.eligible ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                Team size mismatch
                              </span>
                            ) : selected ? (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                Selected
                              </span>
                            ) : null}
                          </div>

                          <h4 className="mt-4 text-base font-extrabold text-slate-900 dark:text-white">
                            {track.name}
                          </h4>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            {track.description ||
                              "No track description is available."}
                          </p>

                          <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                Team size
                              </p>
                              <p className="mt-1 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                                {track.minMembers ?? 1}-
                                {track.maxMembers ?? "Any"} members
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                Capacity
                              </p>
                              <p className="mt-1 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                                {remainingSlots == null
                                  ? `${track.registeredTeamCount} registered`
                                  : `${remainingSlots} ${remainingSlots === 1 ? "slot" : "slots"} left`}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        Your selection
                      </p>
                      <p className="mt-1 truncate font-extrabold text-slate-900 dark:text-white">
                        {selectedTrack?.name || "Choose a track to continue"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!selectedTrackId || registerMutation.isPending}
                      onClick={() => setConfirmOpen(true)}
                      className={REGISTER_BUTTON}
                    >
                      Review registration
                    </button>
                  </div>
                </section>
              )}
          </div>
        </div>
      )}

      <Dialog
        open={confirmOpen}
        onClose={
          registerMutation.isPending ? undefined : () => setConfirmOpen(false)
        }
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "rounded-2xl dark:bg-slate-900" } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          <span className="text-slate-900 dark:text-slate-100">
            Confirm Track Registration
          </span>
        </DialogTitle>
        <DialogContent className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Review the final selection for <strong>{team.name}</strong>.
          </p>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-700">
            <div className="flex items-start gap-3">
              <RouteOutlinedIcon className="mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {selectedTrack?.name || "No track selected"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedEvent?.name || "Selected event"}
                </p>
              </div>
            </div>
          </div>
          <Alert severity="warning">
            This selection is final and cannot be changed after confirmation.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            disabled={registerMutation.isPending}
            sx={{
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "10px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            disabled={registerMutation.isPending || !selectedTrackId}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
            }}
          >
            {registerMutation.isPending
              ? "Submitting..."
              : "Confirm registration"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};
