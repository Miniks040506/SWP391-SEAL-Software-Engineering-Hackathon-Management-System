import { useMemo, useState, type ReactNode } from "react";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  isToday,
  startOfDay,
} from "date-fns";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

import type { ScheduleEntry, ScheduleEntryType } from "@/types/schedule.types";

const TYPE_LABELS: Record<ScheduleEntryType, string> = {
  EVENT: "Event",
  ROUND: "Round",
  DEADLINE: "Deadline",
  CALIBRATION: "Calibration",
  REMINDER: "Reminder",
  ANNOUNCEMENT: "Announcement",
};

const TYPE_STYLES: Record<ScheduleEntryType, string> = {
  EVENT: "border-blue-200 bg-blue-50/70 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  ROUND: "border-blue-200 bg-blue-50/70 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  DEADLINE: "border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  CALIBRATION: "border-amber-200 bg-amber-50/70 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  REMINDER: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ANNOUNCEMENT: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function typeIcon(type: ScheduleEntryType): ReactNode {
  const props = { sx: { fontSize: 16 } };
  if (type === "DEADLINE") return <FlagOutlinedIcon {...props} />;
  if (type === "CALIBRATION") return <FactCheckOutlinedIcon {...props} />;
  if (type === "REMINDER") return <NotificationsActiveOutlinedIcon {...props} />;
  if (type === "ANNOUNCEMENT") return <CampaignOutlinedIcon {...props} />;
  if (type === "ROUND") return <ScheduleRoundedIcon {...props} />;
  return <EventAvailableOutlinedIcon {...props} />;
}

function formatTime(entry: ScheduleEntry, rangeStartTime: number) {
  const start = new Date(entry.startAt);
  if (entry.endAt && start.getTime() < rangeStartTime) return "In progress";
  if (!entry.endAt) return format(start, "HH:mm");
  return `${format(start, "HH:mm")} - ${format(new Date(entry.endAt), "HH:mm")}`;
}

function isMultiDayWindow(entry: ScheduleEntry) {
  return Boolean(entry.endAt && !isSameDay(new Date(entry.startAt), new Date(entry.endAt)));
}

function formatWindow(entry: ScheduleEntry, rangeStart: Date, rangeEnd: Date) {
  const start = new Date(entry.startAt);
  const end = new Date(entry.endAt!);
  if (start < rangeStart && end > rangeEnd) return "Ongoing all week";
  if (start < rangeStart) return `Ongoing until ${format(end, "EEE, MMM d")}`;
  if (end > rangeEnd) return `Starts ${format(start, "EEE, MMM d")}`;
  return `${format(start, "EEE, MMM d")} - ${format(end, "EEE, MMM d")}`;
}

function overlapsDay(entry: ScheduleEntry, day: Date) {
  return new Date(entry.startAt) <= endOfDay(day) && new Date(entry.endAt!) >= startOfDay(day);
}

type ScheduleCardProps = {
  entry: ScheduleEntry;
  rangeStartTime: number;
  onOpen: (entry: ScheduleEntry) => void;
  highlight: boolean;
  columnIndex?: number;
  cardIndex?: number;
};

function ScheduleCard({
  entry,
  rangeStartTime,
  onOpen,
  highlight,
  columnIndex = 0,
  cardIndex = 0,
}: ScheduleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      aria-label={`Open ${entry.title}`}
      style={{ "--i": columnIndex, "--j": cardIndex } as React.CSSProperties}
      className={`ps-card group w-full rounded-xl border p-3 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${TYPE_STYLES[entry.type]}`}
    >
      <span className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <span className={highlight && entry.type === "DEADLINE" ? "ps-deadline inline-flex" : "inline-flex"}>
            {typeIcon(entry.type)}
          </span>
          {TYPE_LABELS[entry.type]}
        </span>
        <ArrowForwardRoundedIcon
          aria-hidden
          sx={{ fontSize: 15 }}
          className="opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </span>
      <span className="mt-2 block text-xs font-black text-slate-950 dark:text-white">
        {formatTime(entry, rangeStartTime)}
      </span>
      <span className="mt-1 block text-sm font-black leading-5 text-slate-950 dark:text-white">
        {entry.title}
      </span>
      <span className="mt-1 block truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {entry.eventName}
      </span>
    </button>
  );
}

function RoundWindowCard({
  entry,
  onOpen,
}: {
  entry: ScheduleEntry;
  onOpen: (entry: ScheduleEntry) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      aria-label={`Open ${entry.title}`}
      className="group w-full rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-left text-blue-700 transition duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:focus-visible:ring-offset-slate-950"
    >
      <span className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <ScheduleRoundedIcon sx={{ fontSize: 15 }} />
          Round live
        </span>
        <ArrowForwardRoundedIcon
          aria-hidden
          sx={{ fontSize: 15 }}
          className="opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </span>
      <span className="mt-2 block text-xs font-black text-slate-950 dark:text-white">
        All day
      </span>
      <span className="mt-1 block text-sm font-black leading-5 text-slate-950 dark:text-white">
        {entry.title}
      </span>
      <span className="mt-1 block truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {entry.eventName}
      </span>
    </button>
  );
}

type WeeklyTimetableProps = {
  entries: ScheduleEntry[];
  rangeStart: Date;
  rangeEnd: Date;
  onOpen: (entry: ScheduleEntry) => void;
  highlightEntryId?: string;
};

export function WeeklyTimetable({
  entries,
  rangeStart,
  rangeEnd,
  onOpen,
  highlightEntryId,
}: WeeklyTimetableProps) {
  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeEnd, rangeStart],
  );
  const [selectedDay, setSelectedDay] = useState(() => {
    const todayIndex = days.findIndex((day) => isToday(day));
    return todayIndex < 0 ? 0 : todayIndex;
  });
  const entriesByDay = useMemo(() => {
    const groups = new Map<string, ScheduleEntry[]>();
    entries.filter((entry) => !isMultiDayWindow(entry)).forEach((entry) => {
      const startTime = Math.max(new Date(entry.startAt).getTime(), rangeStart.getTime());
      const key = format(new Date(startTime), "yyyy-MM-dd");
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });
    return groups;
  }, [entries, rangeStart]);
  const roundWindows = entries.filter(
    (entry) => entry.type === "ROUND" && isMultiDayWindow(entry),
  );
  const activeWindows = entries.filter(
    (entry) => entry.type !== "ROUND" && isMultiDayWindow(entry),
  );
  const rangeStartTime = rangeStart.getTime();
  const entriesFor = (day: Date) => entriesByDay.get(format(day, "yyyy-MM-dd")) ?? [];
  const roundsFor = (day: Date) => roundWindows.filter((entry) => overlapsDay(entry, day));
  const selectedDayEntries = entriesFor(days[selectedDay]);
  const selectedDayRounds = roundsFor(days[selectedDay]);

  return (
    <>
      {activeWindows.length > 0 && (
        <section className="ps-band border-b border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <div className="shrink-0 lg:w-32">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                Active this week
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Multi-day windows
              </p>
            </div>
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              {activeWindows.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onOpen(entry)}
                  aria-label={`Open ${entry.title}`}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 ${
                    activeWindows.length === 1 ? "sm:col-span-2 sm:w-1/2 sm:justify-self-center" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
                      {typeIcon(entry.type)}
                      {TYPE_LABELS[entry.type]}
                    </span>
                    <span className="mt-1 block truncate text-sm font-black text-slate-950 dark:text-white">
                      {entry.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {formatWindow(entry, rangeStart, rangeEnd)}
                    </span>
                  </span>
                  <ArrowForwardRoundedIcon
                    aria-hidden
                    sx={{ fontSize: 17 }}
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="border-b border-slate-200 p-3 dark:border-slate-800 lg:hidden">
        <div className="grid grid-cols-7 gap-1" aria-label="Choose schedule day">
          {days.map((day, index) => {
            const active = index === selectedDay;
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(index)}
                aria-pressed={active}
                className={`rounded-xl py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  active
                    ? "ps-daypill bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span className="block text-[10px] font-black uppercase">{format(day, "EEE")}</span>
                <span className="mt-0.5 block text-sm font-black">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>

        <div className="px-1 pb-2 pt-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                {isToday(days[selectedDay]) ? "Today" : format(days[selectedDay], "EEEE")}
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                {format(days[selectedDay], "MMMM d")}
              </h3>
            </div>
            <p className="text-xs font-bold text-slate-400">
              {selectedDayEntries.length + selectedDayRounds.length} items
            </p>
          </div>

          <div className="space-y-2">
            {selectedDayRounds.map((entry) => (
              <RoundWindowCard key={entry.id} entry={entry} onOpen={onOpen} />
            ))}
            {selectedDayEntries.length ? (
              selectedDayEntries.map((entry) => (
                <ScheduleCard
                  key={entry.id}
                  entry={entry}
                  rangeStartTime={rangeStartTime}
                  highlight={entry.id === highlightEntryId}
                  onOpen={onOpen}
                />
              ))
            ) : selectedDayRounds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
                No scheduled items
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-7 lg:grid">
        {days.map((day, dayIndex) => {
          const dayEntries = entriesFor(day);
          const dayRounds = roundsFor(day);
          const today = isToday(day);
          return (
            <section
              key={day.toISOString()}
              aria-label={format(day, "EEEE, MMMM d")}
              style={{ "--i": dayIndex } as React.CSSProperties}
              className={`ps-col min-w-0 border-r border-slate-200 last:border-r-0 dark:border-slate-800 ${
                today ? "bg-blue-50/40 dark:bg-blue-500/5" : ""
              }`}
            >
              <header className={`border-b px-3 py-4 text-center ${today ? "ps-today" : ""} ${
                today
                  ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                  : "border-slate-200 dark:border-slate-800"
              }`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                  today ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                }`}>
                  {today ? "Today" : format(day, "EEE")}
                </p>
                <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                  {format(day, "d")}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                  {dayEntries.length + dayRounds.length} items
                </p>
              </header>

              <div className="min-h-80 space-y-2 p-2">
                {dayRounds.map((entry) => (
                  <RoundWindowCard key={entry.id} entry={entry} onOpen={onOpen} />
                ))}
                {dayEntries.length ? (
                  dayEntries.map((entry, cardIndex) => (
                    <ScheduleCard
                      key={entry.id}
                      entry={entry}
                      rangeStartTime={rangeStartTime}
                      highlight={entry.id === highlightEntryId}
                      columnIndex={dayIndex}
                      cardIndex={cardIndex}
                      onOpen={onOpen}
                    />
                  ))
                ) : dayRounds.length === 0 ? (
                  <p className="py-8 text-center text-[11px] font-semibold text-slate-300 dark:text-slate-600">
                    Open
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
