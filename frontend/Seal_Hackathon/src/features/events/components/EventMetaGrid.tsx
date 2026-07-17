import type { ElementType } from "react";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { formatShortDate } from "@/features/events/utils/publicEventView";
import type { EventDetailResponse } from "@/types/event.types";

type EventMetaGridProps = {
  event: EventDetailResponse;
};

type MetaAccent = {
  bar: string;
  chip: string;
  hover: string;
};

const ACCENTS: Record<string, MetaAccent> = {
  emerald: {
    bar: "bg-linear-to-r from-emerald-400 to-teal-400",
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    hover: "hover:border-emerald-300 dark:hover:border-emerald-500/50",
  },
  blue: {
    bar: "bg-linear-to-r from-blue-500 to-cyan-400",
    chip: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
    hover: "hover:border-blue-300 dark:hover:border-blue-500/50",
  },
  violet: {
    bar: "bg-linear-to-r from-violet-500 to-indigo-400",
    chip: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    hover: "hover:border-violet-300 dark:hover:border-violet-500/50",
  },
  amber: {
    bar: "bg-linear-to-r from-amber-400 to-orange-400",
    chip: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    hover: "hover:border-amber-300 dark:hover:border-amber-500/50",
  },
};

type MetaItem = {
  label: string;
  value: string;
  hint?: string;
  Icon: ElementType;
  accent: MetaAccent;
};

export function EventMetaGrid({ event }: EventMetaGridProps) {
  const trackCount = event.tracks?.length ?? 0;
  const roundCount = event.rounds?.length ?? 0;

  const items: MetaItem[] = [
    {
      label: "Registration",
      value: `${formatShortDate(event.registrationStartAt)} – ${formatShortDate(
        event.registrationEndAt,
      )}`,
      hint: "Team sign-up window",
      Icon: HowToRegOutlinedIcon,
      accent: ACCENTS.emerald,
    },
    {
      label: "Competition",
      value: `${formatShortDate(event.competitionStartAt)} – ${formatShortDate(
        event.competitionEndAt,
      )}`,
      hint: "Build and submit period",
      Icon: CalendarMonthOutlinedIcon,
      accent: ACCENTS.blue,
    },
    {
      label: "Format",
      value: `${trackCount} ${trackCount === 1 ? "track" : "tracks"} · ${roundCount} ${
        roundCount === 1 ? "round" : "rounds"
      }`,
      hint: "Blind, criterion-based judging",
      Icon: AccountTreeOutlinedIcon,
      accent: ACCENTS.violet,
    },
    {
      label: "Venue",
      value: "FPT University HCM",
      hint: "SE Department & PDP",
      Icon: LocationOnOutlinedIcon,
      accent: ACCENTS.amber,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, hint, Icon, accent }) => (
        <div
          key={label}
          className={`relative flex items-start gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 pt-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 ${accent.hover}`}
        >
          <div className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} />

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}
          >
            <Icon style={{ fontSize: 19 }} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              {label}
            </p>

            <p className="mt-1 text-sm font-bold leading-snug text-gray-900 dark:text-slate-100">
              {value}
            </p>

            {hint && (
              <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                {hint}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
