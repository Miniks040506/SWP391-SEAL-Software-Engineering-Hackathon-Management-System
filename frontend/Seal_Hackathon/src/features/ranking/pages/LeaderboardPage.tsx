import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import { RANKINGS } from "../mocks/rankings.mock";
import { EVENTS } from "@/features/events/mocks/events.mock";
// TODO: remove cross-feature import once rankings API returns event title directly
import type { RankingEntry } from "@/types/ranking.types";

// badge colors for top 3, ranks > 3 fall back to the default style via '??'
const RANK_BADGE_STYLES: Record<number, string> = {
  1: "bg-blue-500 text-white shadow-md",
  2: "bg-gray-400 text-white",
  3: "bg-amber-600 text-white",
};

// TODO: when API is connected, replace RANKINGS with:
//   const { data: rankings } = useQuery({
//     queryKey: ['rankings', eventId],
//     queryFn: () => rankingApi.getByEvent(eventId),
//   });
export const LeaderboardPage = () => {
  // ?eventId=seal-spring-24 -> drives the event title shown above the table
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const selectedEvent = eventId
    ? (EVENTS.find((e) => e.id === eventId) ?? null)
    : EVENTS[0]; // default to first event when no query param is present

  const [filterTrack, setFilterTrack] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // top3 is used exclusively for the podium and is never affected by filters
  const top3 = RANKINGS.slice(0, 3);

  // Derive track options dynamically so the filter stays in sync with mock/API data
  const trackOptions = useMemo(
    () => ["All", ...new Set(RANKINGS.map((r) => r.track))],
    [],
  );

  // auto get data from track list
  const filteredRankings: RankingEntry[] = useMemo(
    () =>
      RANKINGS.filter(
        (r) =>
          (filterTrack === "All" || r.track === filterTrack) &&
          r.team.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [filterTrack, searchTerm],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Podium - display order on desktop: 2nd / 1st / 3rd */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
        {/* 2nd - md:order-1 pushes it to the left on desktop */}
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

        {/* 1st - elevated with md:-translate-y-6 */}
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
            {/* selectedEvent is null when no eventId query param is provided */}
            <p className="text-sm text-gray-400 font-medium">
              Verified results for {selectedEvent?.title ?? "all events"}
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
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none shadow-sm min-w-35">
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
                    className={`hover:bg-gray-50 transition-colors ${team.rank <= 3 ? "bg-blue-50/10" : ""}`}>
                    <td className="p-5 text-center">
                      {/* RANK_BADGE_STYLES[team.rank] returns undefined for rank > 3; ?? applies the fallback */}
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm ${
                          RANK_BADGE_STYLES[team.rank] ?? "text-gray-400 bg-gray-50"}
                        `}>
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
