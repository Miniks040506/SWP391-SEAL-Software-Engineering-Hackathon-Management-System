import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

import {
  formatShortDate,
  getSeasonLabel,
} from "@/features/events/utils/publicEventView";
import type { EventDetailResponse } from "@/types/event.types";

interface LeaderboardHeaderProps {
  event: EventDetailResponse;
  publishedDate?: string | null;
  roundCount: number;
  trackCount: number;
  teamCount: number;
}

export const LeaderboardHeader = ({
  event,
  publishedDate,
  roundCount,
  trackCount,
  teamCount,
}: LeaderboardHeaderProps) => {
  const stats = [
    { value: roundCount, label: "Rounds" },
    { value: trackCount, label: "Tracks" },
    { value: teamCount, label: "Teams ranked" },
  ];

  return (
    <header className="border-b border-gray-200 pb-10 dark:border-slate-800">
      <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-8">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            Official leaderboard
          </p>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-gray-900 dark:text-white md:text-6xl">
            {event.name}
          </h1>

          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {getSeasonLabel(event.season, event.year)} ·{" "}
            {formatShortDate(event.competitionStartAt)} -{" "}
            {formatShortDate(event.competitionEndAt)}
          </p>

          {publishedDate ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircleOutlinedIcon style={{ fontSize: 16 }} />
              Results published {formatShortDate(publishedDate)}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
              <ScheduleOutlinedIcon style={{ fontSize: 16 }} />
              Results not published yet
            </p>
          )}
        </div>

        <dl className="flex gap-12 pb-1.5">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <dd className="text-4xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-white">
                {stat.value}
              </dd>
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
};
