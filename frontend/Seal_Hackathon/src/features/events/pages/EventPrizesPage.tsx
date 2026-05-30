import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EventPrizesCard } from "@/features/events/components/EventPrizesCard";
import {
  usePublicEventDetailQuery,
  usePublicEventPrizesQuery,
} from "@/features/events/hooks/usePublicEventQueries";

export function EventPrizesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const eventQuery = usePublicEventDetailQuery(eventId);
  const prizesQuery = usePublicEventPrizesQuery(eventId);

  if (eventQuery.isLoading || prizesQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="py-32 text-center text-sm font-bold text-gray-400">
        Event not found.
      </div>
    );
  }

  const event = eventQuery.data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button
        type="button"
        onClick={() => navigate(`/events/${event.id}`)}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to event
      </button>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon style={{ fontSize: 24 }} className="text-blue-500" />

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {event.name} Prizes
          </h1>
        </div>

        <p className="mt-2 text-sm font-medium text-gray-400">
          Official prize information for this completed SEAL event.
        </p>
      </section>

      <EventPrizesCard
        prizes={prizesQuery.data ?? []}
        tracks={event.tracks ?? []}
      />
    </div>
  );
}