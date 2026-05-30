import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { CircularProgress, Pagination } from "@mui/material";
import { usePublicEventDetailQuery, usePublicEventsQuery } from "@/features/events/hooks/usePublicEventQueries";
import { isCompletedEvent } from "@/features/events/utils/publicEventView";
import { Podium } from "@/features/ranking/components/Podium";
import { StandingsTable } from "@/features/ranking/components/StandingsTable";
import { TransparencyBanner } from "@/features/ranking/components/TransparencyBanner";
import {
  usePublicCompletedEventRankingsQueries,
  usePublicEventRankingQuery,
} from "@/features/ranking/hooks/usePublicRankingQueries";
import { leaderboardQuerySchema } from "@/features/ranking/schemas/publicRanking.schema";
import {
  filterRankings,
  getRankingTrackOptions,
  sortRankings,
} from "@/features/ranking/utils/rankingView";
import {
  backBtnStyle,
  filterStyles,
  fullResultsBtnStyle,
  paginationSx,
} from "@/features/ranking/pages/LeaderboardPage.styles";
import type { EventSummaryResponse } from "@/types/event.types";

const EVENTS_PER_PAGE = 5;

function AllEventsStandings() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const eventsQuery = usePublicEventsQuery({
    page: 0,
    size: 50,
  });

  const completedEvents = useMemo(
    () =>
      (eventsQuery.data?.content ?? []).filter((event) =>
        isCompletedEvent(event.status),
      ),
    [eventsQuery.data],
  );

  const rankingQueries = usePublicCompletedEventRankingsQueries(completedEvents);

  const eventsWithResults = completedEvents.filter((_, index) => {
    const rankings = rankingQueries[index]?.data ?? [];
    return rankings.length > 0;
  });

  const pageCount = Math.ceil(eventsWithResults.length / EVENTS_PER_PAGE);

  const pagedEvents = eventsWithResults.slice(
    (page - 1) * EVENTS_PER_PAGE,
    page * EVENTS_PER_PAGE,
  );

  const getRankingForEvent = (event: EventSummaryResponse) => {
    const index = completedEvents.findIndex((item) => item.id === event.id);
    return sortRankings(rankingQueries[index]?.data ?? []);
  };

  if (eventsQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon style={{ fontSize: 22 }} className="text-blue-500" />

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Global Standings
          </h1>
        </div>

        <p className="text-sm font-medium text-gray-400">
          Official public results from concluded SEAL Hackathon events.
        </p>
      </div>

      {eventsWithResults.length === 0 ? (
        <div className="py-24 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
          No results published yet.
        </div>
      ) : (
        <>
          <div className="space-y-12">
            {pagedEvents.map((event) => {
              const rankings = getRankingForEvent(event);

              return (
                <div key={event.id} className="space-y-4">
                  <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                    <div className="space-y-0.5">
                      <h2 className="text-base font-bold text-gray-900">
                        {event.name}
                      </h2>

                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        {event.season} {event.year}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/standings?eventId=${event.id}`)}
                      className={fullResultsBtnStyle}
                    >
                      Full Results
                      <ArrowForwardIcon style={{ fontSize: 14 }} />
                    </button>
                  </div>

                  <StandingsTable rankings={rankings} variant="compact" />
                </div>
              );
            })}
          </div>

          {pageCount > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => {
                  setPage(value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="outlined"
                shape="rounded"
                sx={paginationSx}
              />
            </div>
          )}
        </>
      )}

      <TransparencyBanner />
    </div>
  );
}

function SingleEventLeaderboard({
  eventId,
  roundId,
  trackId,
}: {
  eventId: string;
  roundId?: string | null;
  trackId?: string | null;
}) {
  const navigate = useNavigate();

  const [filterTrack, setFilterTrack] = useState(trackId || "All");
  const [searchTerm, setSearchTerm] = useState("");

  const eventQuery = usePublicEventDetailQuery(eventId);

  const rankingQuery = usePublicEventRankingQuery({
    eventId,
    roundId,
    trackId: filterTrack === "All" ? undefined : filterTrack,
  });

  const event = eventQuery.data ?? null;

  const rankings = useMemo(
    () => sortRankings(rankingQuery.data ?? []),
    [rankingQuery.data],
  );

  const top3 = rankings.slice(0, 3);

  const trackOptions = useMemo(
    () => getRankingTrackOptions(rankings, event?.tracks ?? []),
    [rankings, event?.tracks],
  );

  const filteredRankings = useMemo(
    () => filterRankings(rankings, searchTerm, filterTrack),
    [rankings, searchTerm, filterTrack],
  );

  if (rankingQuery.isLoading || eventQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <button
        type="button"
        onClick={() =>
          event ? navigate(`/events/${event.id}`) : navigate("/events")
        }
        className={backBtnStyle}
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to {event ? event.name : "Events"}
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon style={{ fontSize: 22 }} className="text-blue-500" />

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {event?.name ?? "Event Results"}
          </h1>
        </div>

        {event && (
          <p className="text-sm font-semibold text-gray-400">
            {event.season} {event.year}
          </p>
        )}
      </div>

      <Podium top3={top3} />

      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-6 border-b border-gray-100 pb-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <VerifiedUserIcon
                style={{ fontSize: 18 }}
                className="text-blue-500"
              />

              <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900">
                Public Standings
              </h2>
            </div>

            <p className="text-sm font-medium text-gray-400">
              Verified results for {event?.name ?? "this event"}
            </p>
          </div>

          <div className={filterStyles.wrapper}>
            <div className={filterStyles.searchWrap}>
              <SearchIcon
                style={{ fontSize: 14 }}
                className={filterStyles.searchIcon}
              />

              <input
                type="text"
                placeholder="Search team name..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={filterStyles.searchInput}
              />
            </div>

            <select
              value={filterTrack}
              onChange={(event) => setFilterTrack(event.target.value)}
              className={filterStyles.select}
            >
              {trackOptions.map((track) => (
                <option key={track.value} value={track.value}>
                  {track.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <StandingsTable
          rankings={filteredRankings}
          variant="full"
          emptyMessage="No results found"
        />

        <TransparencyBanner />
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const [searchParams] = useSearchParams();

  const query = leaderboardQuerySchema.parse({
    eventId: searchParams.get("eventId"),
    roundId: searchParams.get("roundId"),
    trackId: searchParams.get("trackId"),
  });

  if (query.eventId) {
    return (
      <SingleEventLeaderboard
        eventId={query.eventId}
        roundId={query.roundId}
        trackId={query.trackId}
      />
    );
  }

  return <AllEventsStandings />;
}