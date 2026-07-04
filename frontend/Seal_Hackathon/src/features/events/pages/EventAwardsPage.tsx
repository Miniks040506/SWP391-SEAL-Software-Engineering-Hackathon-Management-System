import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { PublicEventAwardsSection } from "../components/PublicEventAwardsSection";
import { usePublicEventDetailQuery } from "../hooks/usePublicEventQueries";

export const EventAwardsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = usePublicEventDetailQuery(eventId);

  if (!eventId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert severity="error">Event ID is required.</Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert severity="error">Event not found.</Alert>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button
            component={Link}
            to={`/events/${eventId}`}
            color="inherit"
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ mb: 2, textTransform: "none", fontWeight: 700 }}
          >
            Back to Event
          </Button>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            {event.name} Awards
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Official prizes awarded to the event winners.
          </p>
        </div>

        <Button
          component={Link}
          to={`/events/${eventId}/leaderboard`}
          variant="outlined"
          startIcon={<LeaderboardOutlinedIcon />}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
        >
          View Leaderboard
        </Button>
      </div>

      <PublicEventAwardsSection eventId={eventId} />
    </main>
  );
};
