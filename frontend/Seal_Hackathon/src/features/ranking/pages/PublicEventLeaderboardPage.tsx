import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Tooltip } from "@mui/material";

import {
  usePublicEventAwardsQuery,
  usePublicEventDetailQuery,
  usePublicEventRoundsQuery,
  usePublicEventTracksQuery,
} from "../../events/hooks/usePublicEventQueries";
import {
  usePublicEventLeaderboardQuery,
  usePublicTrackLeaderboardQuery,
} from "../hooks/useRankingQueries";
import { LeaderboardHeader } from "../components/LeaderboardHeader";
import { LeaderboardEmptyState } from "../components/LeaderboardEmptyState";
import { WinnerPrizeBadge } from "@/features/events/components/WinnerPrizeBadge";
import type { PrizeResponse } from "@/types/prize.types";
import type { RankingResponse } from "@/types/ranking.types";

/* ------------------------------------------------------------------ */
/* Row status helpers                                                   */
/* ------------------------------------------------------------------ */

type RowStatus = "ADVANCED" | "ELIMINATED" | "DISQUALIFIED";

function getRowStatus(row: RankingResponse): RowStatus {
  if (
    row.advanceReason === "DISQUALIFIED" ||
    row.submissionStatus === "DISQUALIFIED"
  ) {
    return "DISQUALIFIED";
  }
  return row.advanced ? "ADVANCED" : "ELIMINATED";
}

function StatusText({ status }: { status: RowStatus }) {
  if (status === "ADVANCED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckRoundedIcon style={{ fontSize: 14 }} />
        Advanced
      </span>
    );
  }
  if (status === "DISQUALIFIED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
        <BlockOutlinedIcon style={{ fontSize: 14 }} />
        Disqualified
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
      Not advanced
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Results head: champion strip, asymmetric 6/3/3                       */
/* ------------------------------------------------------------------ */

/** Optical gap between the visible cup and the card corner, in px. */
const TROPHY_CORNER_GAP = 10;

/**
 * Faint trophy tucked into the lower-right corner of a podium card.
 *
 * The icon's painted glyph fills only 18 of its 24 viewBox units, so an eighth
 * of the rendered size is transparent padding on each side. Positioning by the
 * icon box therefore pushed the cup ~25px inward and made it look like it was
 * drifting toward the middle. Offsetting by that padding lands the *glyph* a
 * consistent distance from the corner at any size, and stays non-clipping
 * because the offset never exceeds the padding itself.
 */
function TrophyWatermark({
  size,
  tone,
}: {
  size: number;
  tone: string;
}) {
  const glyphPadding = size / 8; // 3 of 24 viewBox units
  const offset = TROPHY_CORNER_GAP - glyphPadding;

  return (
    <EmojiEventsRoundedIcon
      aria-hidden
      className={`pointer-events-none absolute select-none ${tone}`}
      style={{ fontSize: size, right: offset, bottom: offset }}
    />
  );
}

function ResultsHead({ rankings }: { rankings: RankingResponse[] }) {
  // Rankings are per track/round, so rank positions repeat. Keep each
  // team's best score and order by score.
  const bestByTeam = new Map<string, RankingResponse>();
  for (const row of rankings) {
    if (getRowStatus(row) === "DISQUALIFIED") continue;
    const current = bestByTeam.get(row.teamId);
    if (!current || Number(row.totalScore) > Number(current.totalScore)) {
      bestByTeam.set(row.teamId, row);
    }
  }
  const top3 = [...bestByTeam.values()]
    .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
    .slice(0, 3);

  if (top3.length === 0) return null;

  const [first, second, third] = top3;

  const runnerUps = [
    second && {
      row: second,
      rank: 2,
      label: "2nd place",
      span: "md:col-span-4",
      border: "border-t-2 border-slate-400 dark:border-slate-500",
      surface: "bg-slate-100/70 dark:bg-slate-400/8",
      medal:
        "h-7 w-7 bg-linear-to-br from-slate-200 to-slate-400 text-slate-800 shadow-sm shadow-slate-400/40",
      labelColor: "text-slate-500 dark:text-slate-400",
      nameSize: "text-2xl",
      scoreSize: "text-5xl",
      scoreColor: "text-slate-500 dark:text-slate-300",
      trophySize: 120,
      trophyTone: "text-slate-400/30 dark:text-slate-400/18",
    },
    third && {
      row: third,
      rank: 3,
      label: "3rd place",
      span: "md:col-span-3",
      border: "border-t border-orange-600/60 dark:border-orange-500/50",
      surface: "bg-orange-50/70 dark:bg-orange-500/8",
      medal:
        "h-6 w-6 bg-linear-to-br from-orange-500 to-orange-700 text-orange-50 shadow-sm shadow-orange-700/40",
      labelColor: "text-orange-700 dark:text-orange-500",
      nameSize: "text-lg",
      scoreSize: "text-3xl",
      scoreColor: "text-orange-700 dark:text-orange-500",
      trophySize: 96,
      trophyTone: "text-orange-600/25 dark:text-orange-500/18",
    },
  ].filter(Boolean) as Array<{
    row: RankingResponse;
    rank: number;
    label: string;
    span: string;
    border: string;
    surface: string;
    medal: string;
    labelColor: string;
    nameSize: string;
    scoreSize: string;
    scoreColor: string;
    trophySize: number;
    trophyTone: string;
  }>;

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-12 md:items-end">
      <div className="relative overflow-hidden rounded-b-2xl border-t-2 border-amber-500 bg-amber-50/70 px-5 pt-5 pb-6 md:col-span-5 dark:border-amber-400 dark:bg-amber-400/8">
        <TrophyWatermark
          size={148}
          tone="text-amber-500/22 dark:text-amber-400/16"
        />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-300 to-amber-500 text-sm font-extrabold text-amber-950 shadow-sm shadow-amber-500/40">
              1
            </span>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              Champion
            </p>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {first.teamName}
          </p>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {first.trackName || "General"}
            {first.projectTitle ? ` · ${first.projectTitle}` : ""}
          </p>
          <p className="text-6xl font-extrabold tracking-tight tabular-nums text-amber-500 md:text-7xl dark:text-amber-400">
            {Number(first.totalScore).toFixed(2)}
          </p>
        </div>
      </div>

      {runnerUps.map(
        ({
          row,
          rank,
          label,
          span,
          border,
          surface,
          medal,
          labelColor,
          nameSize,
          scoreSize,
          scoreColor,
          trophySize,
          trophyTone,
        }) => (
          <div
            key={row.id}
            className={`relative overflow-hidden rounded-b-2xl px-5 pt-5 pb-6 ${span} ${border} ${surface}`}
          >
            <TrophyWatermark size={trophySize} tone={trophyTone} />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex items-center justify-center rounded-lg text-sm font-extrabold ${medal}`}
                >
                  {rank}
                </span>
                <p className={`text-sm font-bold ${labelColor}`}>{label}</p>
              </div>
              <p
                className={`font-bold tracking-tight text-gray-900 dark:text-white ${nameSize}`}
              >
                {row.teamName}
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                {row.trackName || "General"}
              </p>
              <p
                className={`font-extrabold tracking-tight tabular-nums ${scoreSize} ${scoreColor}`}
              >
                {Number(row.totalScore).toFixed(2)}
              </p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Underline tab filters                                                */
/* ------------------------------------------------------------------ */

type FilterOption = { id: string; name: string };

function TabGroup({
  options,
  selected,
  onChange,
  allLabel,
}: {
  options: FilterOption[];
  selected: string;
  onChange: (id: string) => void;
  allLabel: string;
}) {
  return (
    <div className="flex flex-wrap">
      {[{ id: "all", name: allLabel }, ...options].map((option) => {
        const active = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              "relative -mb-px cursor-pointer px-4 py-3 text-sm transition-colors",
              active
                ? "border-b-2 border-blue-600 font-bold text-gray-900 dark:border-blue-500 dark:text-white"
                : "border-b-2 border-transparent font-semibold text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300",
            ].join(" ")}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ranking table                                                        */
/* ------------------------------------------------------------------ */

function RankCell({ row }: { row: RankingResponse }) {
  const status = getRowStatus(row);
  if (status === "DISQUALIFIED") {
    return (
      <span className="text-lg font-extrabold tabular-nums text-gray-300 dark:text-slate-700">
        -
      </span>
    );
  }
  const top3 = row.rankPosition <= 3;
  return (
    <span
      className={[
        "text-lg font-extrabold tabular-nums",
        top3
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-300 dark:text-slate-600",
      ].join(" ")}
    >
      {row.rankPosition}
    </span>
  );
}

function RankingTable({
  rankings,
  awardsByTeamId,
}: {
  rankings: RankingResponse[];
  awardsByTeamId: Map<string, PrizeResponse[]>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-900 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-slate-200 dark:text-slate-500">
            <th scope="col" className="w-16 py-3 pr-4">
              Rank
            </th>
            <th scope="col" className="py-3 pr-4">
              Team
            </th>
            <th scope="col" className="py-3 pr-4">
              Track
            </th>
            <th scope="col" className="py-3 pr-4">
              Round
            </th>
            <th scope="col" className="py-3 pr-4 text-center">
              Judges
            </th>
            <th scope="col" className="py-3 pr-4">
              Status
            </th>
            <th scope="col" className="w-28 py-3 text-right">
              <span className="inline-flex items-center gap-1">
                Score
                <Tooltip
                  title="Weighted average from final judge scores"
                  arrow
                  placement="top"
                >
                  <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                </Tooltip>
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {rankings.map((row) => {
            const status = getRowStatus(row);
            const disqualified = status === "DISQUALIFIED";

            return (
              <tr
                key={row.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/60"
              >
                <td className="py-4 pr-4">
                  <RankCell row={row} />
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="min-w-0">
                      <p
                        className={[
                          "truncate text-[15px] font-bold",
                          disqualified
                            ? "text-gray-400 line-through decoration-1 dark:text-slate-500"
                            : "text-gray-900 dark:text-white",
                        ].join(" ")}
                      >
                        {row.teamName}
                      </p>
                      {row.projectTitle && (
                        <p className="truncate text-xs font-medium text-gray-400 dark:text-slate-500">
                          {row.projectTitle}
                        </p>
                      )}
                    </div>
                    {awardsByTeamId.get(row.teamId)?.map((prize) => (
                      <WinnerPrizeBadge
                        key={prize.id}
                        prizeTitle={prize.title || ""}
                        className="h-6 w-6 shrink-0"
                      />
                    ))}
                  </div>
                </td>
                <td className="py-4 pr-4 font-medium text-gray-500 dark:text-slate-400">
                  {row.trackName || "-"}
                </td>
                <td className="py-4 pr-4 font-medium text-gray-500 dark:text-slate-400">
                  {row.roundName || "-"}
                </td>
                <td className="py-4 pr-4 text-center font-semibold tabular-nums text-gray-500 dark:text-slate-400">
                  {row.judgeCount || 0}
                </td>
                <td className="py-4 pr-4">
                  <StatusText status={status} />
                </td>
                <td className="py-4 text-right">
                  <span
                    className={[
                      "text-lg font-extrabold tabular-nums",
                      disqualified
                        ? "text-gray-300 dark:text-slate-700"
                        : "text-gray-900 dark:text-white",
                    ].join(" ")}
                  >
                    {Number(row.totalScore).toFixed(2)}
                  </span>
                  {row.tied && (
                    <Tooltip
                      title={`Tied score group${row.tieGroupSize ? ` (${row.tieGroupSize} teams)` : ""}`}
                      arrow
                      placement="top"
                    >
                      <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        Tie {row.tieGroupSize ? `x${row.tieGroupSize}` : ""}
                      </p>
                    </Tooltip>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export const PublicEventLeaderboardPage = () => {
  const { eventId, trackId } = useParams<{
    eventId: string;
    trackId?: string;
  }>();
  const navigate = useNavigate();

  const [selectedRoundId, setSelectedRoundId] = useState<string>("all");
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    trackId || "all",
  );

  useEffect(() => {
    if (selectedTrackId === "all" && trackId) {
      navigate(`/events/${eventId}/leaderboard`, { replace: true });
    } else if (selectedTrackId !== "all" && selectedTrackId !== trackId) {
      navigate(`/events/${eventId}/tracks/${selectedTrackId}/leaderboard`, {
        replace: true,
      });
    }
  }, [selectedTrackId, eventId, trackId, navigate]);

  const { data: event, isLoading: isLoadingEvent } =
    usePublicEventDetailQuery(eventId);
  const { data: rounds = [] } = usePublicEventRoundsQuery(eventId);
  const { data: tracks = [] } = usePublicEventTracksQuery(eventId);

  const roundParams = useMemo(
    () => ({
      roundId: selectedRoundId !== "all" ? selectedRoundId : undefined,
    }),
    [selectedRoundId],
  );

  const isAllTracks = selectedTrackId === "all";
  const eventLeaderboardQuery = usePublicEventLeaderboardQuery(
    isAllTracks ? eventId : undefined,
    roundParams,
  );
  const trackLeaderboardQuery = usePublicTrackLeaderboardQuery(
    isAllTracks ? undefined : eventId,
    isAllTracks ? undefined : selectedTrackId,
    roundParams,
  );

  const rankings = useMemo(
    () =>
      (isAllTracks ? eventLeaderboardQuery.data : trackLeaderboardQuery.data) ??
      [],
    [isAllTracks, eventLeaderboardQuery.data, trackLeaderboardQuery.data],
  );
  const isLoadingRankings = isAllTracks
    ? eventLeaderboardQuery.isLoading
    : trackLeaderboardQuery.isLoading;

  const { data: awards = [] } = usePublicEventAwardsQuery(eventId);
  const awardsByTeamId = useMemo(() => {
    const map = new Map<string, PrizeResponse[]>();
    for (const award of awards) {
      if (award.awardedTeamId) {
        const teamAwards = map.get(award.awardedTeamId) || [];
        teamAwards.push(award);
        map.set(award.awardedTeamId, teamAwards);
      }
    }
    return map;
  }, [awards]);

  const teamCount = useMemo(
    () => new Set(rankings.map((row) => row.teamId)).size,
    [rankings],
  );

  // The dedicated public rounds/tracks endpoints reject anonymous users,
  // so fall back to the copies embedded in the event detail response.
  const sortedRounds = useMemo(() => {
    const source = rounds.length > 0 ? rounds : (event?.rounds ?? []);
    return [...source]
      .sort((a, b) => Number(a.orderIndex ?? 0) - Number(b.orderIndex ?? 0))
      .map((round) => ({ id: round.id, name: round.name }));
  }, [rounds, event]);
  const trackOptions = useMemo(() => {
    const source = tracks.length > 0 ? tracks : (event?.tracks ?? []);
    return source.map((track) => ({ id: track.id, name: track.name }));
  }, [tracks, event]);

  if (isLoadingEvent) {
    return (
      <div className="animate-in space-y-10 fade-in duration-500">
        <div className="h-56 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none" />
        <div className="h-72 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-24">
        <div className="max-w-xl space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Event not found.
          </h2>
          <p className="text-base leading-relaxed text-gray-500 dark:text-slate-400">
            This event may have been removed, or the link is out of date.
          </p>
          <Link
            to="/standings"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 active:translate-y-0.5"
          >
            <ArrowBackRoundedIcon style={{ fontSize: 16 }} />
            Back to standings
          </Link>
        </div>
      </div>
    );
  }

  const isPublished = rankings.length > 0;
  const publishedDate =
    event.resultPublishedAt ?? (isPublished ? rankings[0].calculatedAt : null);

  return (
    <div className="animate-in space-y-12 fade-in duration-500">
      <nav>
        <Link
          to="/standings"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowBackRoundedIcon
            style={{ fontSize: 17 }}
            className="transition-transform group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0"
          />
          All standings
        </Link>
      </nav>

      <LeaderboardHeader
        event={event}
        publishedDate={publishedDate}
        roundCount={sortedRounds.length}
        trackCount={trackOptions.length}
        teamCount={teamCount}
      />

      {!isLoadingRankings && isPublished && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 motion-reduce:animate-none">
          <ResultsHead rankings={rankings} />
        </div>
      )}

      <section className="space-y-0">
        {(sortedRounds.length > 0 || trackOptions.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-x-10 border-b border-gray-200 dark:border-slate-800">
            {sortedRounds.length > 0 && (
              <TabGroup
                options={sortedRounds}
                selected={selectedRoundId}
                onChange={setSelectedRoundId}
                allLabel="All rounds"
              />
            )}
            {trackOptions.length > 0 && (
              <TabGroup
                options={trackOptions}
                selected={selectedTrackId}
                onChange={setSelectedTrackId}
                allLabel="All tracks"
              />
            )}
          </div>
        )}

        <div className="pt-2">
          {isLoadingRankings ? (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="py-4">
                  <div className="h-8 animate-pulse rounded bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          ) : !isPublished ? (
            <LeaderboardEmptyState />
          ) : (
            <RankingTable rankings={rankings} awardsByTeamId={awardsByTeamId} />
          )}
        </div>
      </section>
    </div>
  );
};
