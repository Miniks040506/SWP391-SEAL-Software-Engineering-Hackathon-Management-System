import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Pagination from '@mui/material/Pagination';
import { StandingsTable } from '@/components/common/StandingsTable';
import { TransparencyBanner } from '@/components/common/TransparencyBanner';
import { RANKINGS_BY_EVENT } from '../mocks/rankings.mock';
import { EVENTS } from '@/features/events/mocks/events.mock';
import {
  podiumStyles,
  filterStyles,
  backBtnStyle,
  fullResultsBtnStyle,
  paginationSx,
} from './LeaderboardPage.styles';
import type { RankingEntry } from '@/types/ranking.types';

const EVENTS_PER_PAGE = 5;

// Podium

interface PodiumProps { top3: RankingEntry[] }

const Podium = ({ top3 }: PodiumProps) => (
  <section className={podiumStyles.wrapper}>
    {/* 2nd place */}
    <div className={`md:order-1 ${podiumStyles.sideCard}`}>
      <div className={podiumStyles.secondDot}>2nd</div>
      <div className="space-y-1">
        <div className="font-bold text-gray-900 text-base">{top3[1]?.team}</div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{top3[1]?.track}</div>
      </div>
      <div className="text-2xl font-mono font-bold text-slate-400">{top3[1]?.score.toFixed(1)}</div>
    </div>

    {/* 1st place */}
    <div className={podiumStyles.firstCard}>
      <div className={podiumStyles.goldBadge}>GOLD WINNER</div>
      <div className={podiumStyles.firstDot}>1st</div>
      <div className="space-y-1">
        <div className="font-bold text-gray-900 text-xl">{top3[0]?.team}</div>
        <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">{top3[0]?.track}</div>
      </div>
      <div className="text-3xl font-mono font-bold text-blue-500">{top3[0]?.score.toFixed(1)}</div>
    </div>

    {/* 3rd place */}
    <div className={`md:order-3 ${podiumStyles.sideCard}`}>
      <div className={podiumStyles.thirdDot}>3rd</div>
      <div className="space-y-1">
        <div className="font-bold text-gray-900 text-base">{top3[2]?.team}</div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{top3[2]?.track}</div>
      </div>
      <div className="text-2xl font-mono font-bold text-amber-600">{top3[2]?.score.toFixed(1)}</div>
    </div>
  </section>
);

// AllEventsStandings

const AllEventsStandings = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Only include ended events that have rankings published - avoids empty pages.
  const eventsWithResults = EVENTS.filter(
    (e) => e.status === 'Ended' && (RANKINGS_BY_EVENT[e.id]?.length ?? 0) > 0,
  );
  const pageCount   = Math.ceil(eventsWithResults.length / EVENTS_PER_PAGE);
  const pagedEvents = eventsWithResults.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon style={{ fontSize: 22 }} className="text-blue-500" />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Global Standings</h1>
        </div>
        <p className="text-sm text-gray-400 font-medium">
          Official results from all concluded SEAL Hackathon events.
        </p>
      </div>

      {eventsWithResults.length === 0 ? (
        <div className="text-center py-24 text-gray-400 font-semibold text-sm uppercase tracking-widest">
          No results published yet.
        </div>
      ) : (
        <>
          <div className="space-y-12">
            {pagedEvents.map((event) => {
              const rankings = RANKINGS_BY_EVENT[event.id]!;
              return (
                <div key={event.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="space-y-0.5">
                      <h2 className="text-base font-bold text-gray-900">{event.title}</h2>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                        {event.startDate} – {event.endDate}
                      </p>
                    </div>
                    <button onClick={() => navigate(`/standings?eventId=${event.id}`)} className={fullResultsBtnStyle}>
                      Full Results <ArrowForwardIcon style={{ fontSize: 14 }} />
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
                  window.scrollTo({ top: 0, behavior: 'smooth' });
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
};

// SingleEventLeaderboard

interface SingleEventLeaderboardProps { eventId: string }

const SingleEventLeaderboard = ({ eventId }: SingleEventLeaderboardProps) => {
  const navigate = useNavigate();
  const [filterTrack, setFilterTrack] = useState('All');
  const [searchTerm, setSearchTerm]   = useState('');

  const selectedEvent = EVENTS.find((e) => e.id === eventId) ?? null;
  const rankings: RankingEntry[] = RANKINGS_BY_EVENT[eventId] ?? [];
  const top3 = rankings.slice(0, 3);

  const trackOptions = useMemo(
    () => ['All', ...new Set(rankings.map((r) => r.track))],
    [rankings],
  );

  const filteredRankings = useMemo(() => rankings.filter(
    (r) => (
      filterTrack === 'All' || r.track === filterTrack) &&
      r.team.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    [rankings, filterTrack, searchTerm],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <button
        onClick={() => (selectedEvent ? navigate(`/events/${selectedEvent.id}`) : navigate('/'))}
        className={backBtnStyle}>
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to {selectedEvent ? selectedEvent.title : 'Dashboard'}
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon style={{ fontSize: 22 }} className="text-blue-500" />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {selectedEvent?.title ?? 'Event Results'}
          </h1>
        </div>
        {selectedEvent && (
          <p className="text-sm text-gray-400 font-semibold">
            {selectedEvent.startDate} – {selectedEvent.endDate}
          </p>
        )}
      </div>

      <Podium top3={top3} />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <VerifiedUserIcon style={{ fontSize: 18 }} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Public Standings</h2>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Verified results for {selectedEvent?.title ?? 'this event'}
            </p>
          </div>

          <div className={filterStyles.wrapper}>
            <div className={filterStyles.searchWrap}>
              <SearchIcon style={{ fontSize: 14 }} className={filterStyles.searchIcon} />
              <input
                type="text"
                placeholder="Search team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={filterStyles.searchInput}
              />
            </div>
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className={filterStyles.select}
            >
              {trackOptions.map((track) => (
                <option key={track} value={track}>
                  {track === 'All' ? 'All Categories' : track}
                </option>
              ))}
            </select>
          </div>
        </div>

        <StandingsTable rankings={filteredRankings} variant="full" emptyMessage="No results found" />
        <TransparencyBanner />
      </div>
    </div>
  );
};

// LeaderboardPage
export const LeaderboardPage = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  if (eventId) return <SingleEventLeaderboard eventId={eventId} />;
  return <AllEventsStandings />;
};