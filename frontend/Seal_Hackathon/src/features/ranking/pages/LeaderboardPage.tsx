import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { RANKINGS_BY_EVENT } from "../mocks/rankings.mock";
import { EVENTS } from "@/features/events/mocks/events.mock";
import type { RankingEntry } from "@/types/ranking.types";

// badge colors for top 3, ranks > 3 fall back to the default style via '??'
const RANK_BADGE_STYLES: Record<number, string> = {
  1: "bg-blue-500 text-white shadow-md",
  2: "bg-gray-400 text-white",
  3: "bg-amber-600 text-white",
};

// All-Events Standings Table
// Used when no ?eventId is present - shows results from every ended event
const AllEventsStandings = () => {
  const navigate = useNavigate();
  const endedEvents = EVENTS.filter((e) => e.status === "Ended");

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <EmojiEventsIcon style={{ fontSize: 22 }} className="text-blue-500" />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Global Standings
          </h1>
        </div>
        <p className="text-sm text-gray-400 font-medium">
          Official results from all concluded SEAL Hackathon events.
        </p>
      </div>

      {endedEvents.length === 0 ? (
        <div className="text-center py-24 text-gray-400 font-semibold text-sm uppercase tracking-widest">
          No concluded events yet.
        </div>
      ) : (
        endedEvents.map((event) => {
          const rankings = RANKINGS_BY_EVENT[event.id] ?? [];
          if (rankings.length === 0) return null;
          const top1 = rankings[0];

          return (
            <div key={event.id} className="space-y-4">
              {/* Event header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-gray-900">
                    {event.title}
                  </h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    {event.startDate} - {event.endDate}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/standings?eventId=${event.id}`)}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-500 text-gray-500 text-xs font-bold rounded-lg transition-all shadow-sm"
                >
                  Full Results
                </button>
              </div>

              {/* Mini table - top 5 */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-16 text-center">
                        #
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Team / Members
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">
                        Track
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rankings.map((team: RankingEntry) => (
                      <tr
                        key={team.rank}
                        className={`hover:bg-gray-50 transition-colors ${team.rank === 1 ? "bg-blue-50/30" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm ${
                              RANK_BADGE_STYLES[team.rank] ??
                              "text-gray-400 bg-gray-50"
                            }`}
                          >
                            {team.rank}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-gray-900">
                            {team.team}
                          </div>
                          <div className="text-xs text-gray-400 font-semibold italic mt-0.5">
                            {team.members}
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-100 rounded">
                            {team.track}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-base font-mono font-bold text-gray-900 tabular-nums">
                            {team.score.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Transparency banner */}
      <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4 shadow-sm">
        <VerifiedUserIcon
          style={{ fontSize: 20 }}
          className="text-blue-500 mt-0.5"
        />
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
            Transparency Protocol
          </p>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            All results displayed are official. Scores have been verified
            through Inter-Rater Reliability (IRR) analysis to ensure absolute
            fairness across all judging panels.
          </p>
        </div>
      </div>
    </div>
  );
};

// Single-Event Leaderboard
// Used when ?eventId=xxx is present - shows podium + full table for that event only
interface SingleEventLeaderboardProps {
  eventId: string;
}

const SingleEventLeaderboard = ({ eventId }: SingleEventLeaderboardProps) => {
  const navigate = useNavigate();
  const [filterTrack, setFilterTrack] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedEvent = EVENTS.find((e) => e.id === eventId) ?? null;
  const rankings: RankingEntry[] = RANKINGS_BY_EVENT[eventId] ?? [];

  const top3 = rankings.slice(0, 3);

  const trackOptions = useMemo(
    () => ["All", ...new Set(rankings.map((r) => r.track))],
    [rankings],
  );

  const filteredRankings: RankingEntry[] = useMemo(
    () =>
      rankings.filter(
        (r) =>
          (filterTrack === "All" || r.track === filterTrack) &&
          r.team.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [rankings, filterTrack, searchTerm],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Back button - matches the style from EventDetailPage */}
      <button
        onClick={() =>
          selectedEvent
            ? navigate(`/events/${selectedEvent.id}`)
            : navigate("/")
        }
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to {selectedEvent ? selectedEvent.title : "Dashboard"}
      </button>

      {/* Page title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {selectedEvent?.title ?? "Event Results"}
        </h1>
        {selectedEvent && (
          <p className="text-sm text-gray-400 font-semibold">
            {selectedEvent.startDate} - {selectedEvent.endDate}
          </p>
        )}
      </div>

      {/* Podium - display order on desktop: 2nd / 1st / 3rd */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
        {/* 2nd */}
        <div className="md:order-1 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl border-4 border-slate-50">
            2nd
          </div>
          <div className="space-y-1">
            <div className="font-bold text-gray-900 text-base">
              {top3[1]?.team}
            </div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {top3[1]?.track}
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-400">
            {top3[1]?.score.toFixed(1)}
          </div>
        </div>

        {/* 1st - elevated */}
        <div className="md:order-2 bg-white border-4 border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-5 relative shadow-2xl shadow-blue-100 transform md:-translate-y-6">
          <div className="absolute -top-4 px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
            GOLD WINNER
          </div>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold text-3xl border-4 border-blue-100">
            1st
          </div>
          <div className="space-y-1">
            <div className="font-bold text-gray-900 text-xl">
              {top3[0]?.team}
            </div>
            <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">
              {top3[0]?.track}
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-blue-500">
            {top3[0]?.score.toFixed(1)}
          </div>
        </div>

        {/* 3rd */}
        <div className="md:order-3 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl border-4 border-amber-50">
            3rd
          </div>
          <div className="space-y-1">
            <div className="font-bold text-gray-900 text-base">
              {top3[2]?.team}
            </div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {top3[2]?.track}
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-600">
            {top3[2]?.score.toFixed(1)}
          </div>
        </div>
      </section>

      {/* Full standings table */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <VerifiedUserIcon
                style={{ fontSize: 18 }}
                className="text-blue-500"
              />
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest">
                Public Standings
              </h2>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Verified results for {selectedEvent?.title ?? "this event"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon
                style={{ fontSize: 14 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-1 focus:ring-blue-400 w-56 shadow-inner"
              />
            </div>
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none shadow-sm min-w-35"
            >
              {trackOptions.map((track) => (
                <option key={track} value={track}>
                  {track === "All" ? "All Categories" : track}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest w-20 text-center">
                  Rank
                </th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Team / Members
                </th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Track
                </th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  Raw Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRankings.length > 0 ? (
                filteredRankings.map((team: RankingEntry) => (
                  <tr
                    key={team.rank}
                    className={`hover:bg-gray-50 transition-colors ${
                      team.rank <= 3 ? "bg-blue-50/10" : ""
                    }`}
                  >
                    <td className="p-5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm ${
                          RANK_BADGE_STYLES[team.rank] ??
                          "text-gray-400 bg-gray-50"
                        }`}
                      >
                        {team.rank}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-gray-900 tracking-tight">
                        {team.team}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold italic mt-0.5">
                        {team.members}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-100 rounded">
                        {team.track}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <span className="text-base font-mono font-bold text-gray-900 tracking-tight tabular-nums">
                        {team.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-24 text-center text-sm text-gray-400 font-bold uppercase tracking-widest"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Transparency banner */}
        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4 shadow-sm">
          <VerifiedUserIcon
            style={{ fontSize: 20 }}
            className="text-blue-500 mt-0.5"
          />
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              Transparency Protocol
            </p>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              All results displayed are official. Scores have been verified
              through Inter-Rater Reliability (IRR) analysis to ensure absolute
              fairness across all judging panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// LeaderboardPage (router)
// Delegates to SingleEventLeaderboard or AllEventsStandings based on ?eventId
export const LeaderboardPage = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  if (eventId) {
    return <SingleEventLeaderboard eventId={eventId} />;
  }

  return <AllEventsStandings />;
};
