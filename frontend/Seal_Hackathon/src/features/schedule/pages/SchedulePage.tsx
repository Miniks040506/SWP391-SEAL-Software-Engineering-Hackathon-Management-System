import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { addWeeks, endOfWeek, format, isToday, startOfWeek } from "date-fns";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

import { scheduleApi } from "@/api/schedule.api";
import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/auth.types";
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
  EVENT: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30",
  ROUND: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
  DEADLINE: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  CALIBRATION: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30",
  REMINDER: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  ANNOUNCEMENT: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
};

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function typeIcon(type: ScheduleEntryType): ReactNode {
  const props = { sx: { fontSize: 19 } };
  if (type === "DEADLINE") return <FlagOutlinedIcon {...props} />;
  if (type === "CALIBRATION") return <FactCheckOutlinedIcon {...props} />;
  if (type === "REMINDER") return <NotificationsActiveOutlinedIcon {...props} />;
  if (type === "ANNOUNCEMENT") return <CampaignOutlinedIcon {...props} />;
  if (type === "ROUND") return <ScheduleRoundedIcon {...props} />;
  return <EventAvailableOutlinedIcon {...props} />;
}

function entryPath(role: UserRole | undefined, entry: ScheduleEntry) {
  if (role === "JUDGE") {
    if (entry.type === "EVENT") return `/events/${entry.eventId}`;
    return entry.type === "CALIBRATION"
      ? `/judge/calibrations/${entry.sourceId}`
      : `/judge/rounds/${entry.roundId ?? entry.sourceId}/submissions`;
  }
  if (role === "MENTOR") return "/mentor/submissions";
  if (entry.type === "CALIBRATION") return `/coordinator/calibrations/${entry.sourceId}`;
  if (entry.type === "REMINDER") return `/coordinator/events/${entry.eventId}/reminders`;
  if (entry.type === "ANNOUNCEMENT") return "/coordinator/announcement";
  return `/coordinator/events/${entry.eventId}/view`;
}

function formatTime(entry: ScheduleEntry, rangeStart: number) {
  const startDate = new Date(entry.startAt);
  if (entry.endAt && startDate.getTime() < rangeStart) return "In progress";
  const start = format(startDate, "HH:mm");
  if (!entry.endAt) return start;
  return `${start} - ${format(new Date(entry.endAt), "HH:mm")}`;
}

function roleCopy(role: UserRole | undefined) {
  if (role === "JUDGE") {
    return {
      eyebrow: "Judging operations",
      title: "Your",
      accentTitle: "Schedule",
      description: "Assigned rounds, scoring deadlines, and calibration windows in one place.",
    };
  }
  if (role === "MENTOR") {
    return {
      eyebrow: "Mentor operations",
      title: "Team",
      accentTitle: "Schedule",
      description: "Competition windows and submission deadlines for your assigned tracks.",
    };
  }
  return {
    eyebrow: "Event operations",
    title: "Master",
    accentTitle: "Schedule",
    description: "Event milestones, round deadlines, reminders, and scheduled announcements.",
  };
}

export function SchedulePage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const [week, setWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [now] = useState(() => Date.now());
  const [eventId, setEventId] = useState("ALL");
  const [type, setType] = useState<ScheduleEntryType | "ALL">("ALL");

  const rangeStart = startOfWeek(week, { weekStartsOn: 1 });
  const rangeStartTime = rangeStart.getTime();
  const rangeEnd = endOfWeek(week, { weekStartsOn: 1 });
  const from = format(rangeStart, "yyyy-MM-dd'T'HH:mm:ss");
  const to = format(rangeEnd, "yyyy-MM-dd'T'HH:mm:ss");
  const copy = roleCopy(role);

  const scheduleQuery = useQuery({
    queryKey: ["schedule", from, to],
    queryFn: () => scheduleApi.getMySchedule({ from, to }),
  });

  const entries = useMemo(() => scheduleQuery.data ?? [], [scheduleQuery.data]);
  const events = useMemo(
    () => Array.from(new Map(entries.map((entry) => [entry.eventId, entry.eventName])).entries()),
    [entries],
  );
  const filteredEntries = useMemo(
    () => entries.filter((entry) =>
      (eventId === "ALL" || entry.eventId === eventId) &&
      (type === "ALL" || entry.type === type)),
    [entries, eventId, type],
  );
  const groupedEntries = (() => {
    const groups = new Map<string, ScheduleEntry[]>();
    filteredEntries.forEach((entry) => {
      const key = format(new Date(Math.max(new Date(entry.startAt).getTime(), rangeStartTime)), "yyyy-MM-dd");
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });
    return Array.from(groups.entries());
  })();

  const nextEntry = filteredEntries.find((entry) => new Date(entry.startAt).getTime() >= now);

  return (
    <div className="space-y-6 pb-10">
      <AdminOperationsHeader
        {...copy}
        icon={<CalendarMonthOutlinedIcon fontSize="inherit" />}
        actions={
          <Button
            variant="contained"
            onClick={() => setWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            sx={{ borderRadius: 2.5, px: 2.25, fontWeight: 800, textTransform: "none" }}
          >
            Today
          </Button>
        }
      />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Weekly agenda
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous week"
                  onClick={() => setWeek((value) => addWeeks(value, -1))}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-700 active:scale-95 dark:border-slate-700 dark:text-slate-300"
                >
                  <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
                </button>
                <h2 className="min-w-56 text-center text-lg font-black text-slate-950 dark:text-white sm:text-xl">
                  {format(rangeStart, "MMM d")} - {format(rangeEnd, "MMM d, yyyy")}
                </h2>
                <button
                  type="button"
                  aria-label="Next week"
                  onClick={() => setWeek((value) => addWeeks(value, 1))}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-700 active:scale-95 dark:border-slate-700 dark:text-slate-300"
                >
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Times shown in {TIMEZONE}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Event
                <select
                  value={eventId}
                  onChange={(event) => setEventId(event.target.value)}
                  className="mt-1.5 h-11 min-w-52 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="ALL">All events</option>
                  {events.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as ScheduleEntryType | "ALL")}
                  className="mt-1.5 h-11 min-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="ALL">All types</option>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="grid border-b border-slate-200 dark:border-slate-800 sm:grid-cols-3">
          {[
            ["Scheduled", filteredEntries.length.toString()],
            ["Deadlines", filteredEntries.filter((entry) => entry.type === "DEADLINE").length.toString()],
            ["Next up", nextEntry ? format(new Date(nextEntry.startAt), "EEE, HH:mm") : "Clear"],
          ].map(([label, value], index) => (
            <div key={label} className={`px-5 py-4 ${index ? "border-t border-slate-200 dark:border-slate-800 sm:border-l sm:border-t-0" : ""}`}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {scheduleQuery.isLoading ? (
          <div className="space-y-6 p-6">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-3">
                <Skeleton width={180} height={28} />
                <Skeleton variant="rounded" height={104} />
              </div>
            ))}
          </div>
        ) : scheduleQuery.isError ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div>
              <p className="text-lg font-black text-slate-950 dark:text-white">Schedule could not be loaded</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check your connection and try again.</p>
              <Button
                startIcon={<RefreshRoundedIcon />}
                onClick={() => scheduleQuery.refetch()}
                sx={{ mt: 2, fontWeight: 800, textTransform: "none" }}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : groupedEntries.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <CalendarMonthOutlinedIcon />
              </div>
              <p className="mt-4 text-lg font-black text-slate-950 dark:text-white">No scheduled work this week</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Change the filters or move to another week.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {groupedEntries.map(([date, dayEntries]) => {
              const day = new Date(`${date}T00:00:00`);
              return (
                <article key={date} className="grid lg:grid-cols-[190px_1fr]">
                  <div className="bg-slate-50 px-5 py-5 dark:bg-slate-950/40 sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                      {isToday(day) ? "Today" : format(day, "EEEE")}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{format(day, "MMMM d")}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{dayEntries.length} scheduled</p>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:px-6">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{formatTime(entry, rangeStartTime)}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">{entry.endAt ? "Window" : "Due time"}</p>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ring-inset ${TYPE_STYLES[entry.type]}`}>
                              {typeIcon(entry.type)}
                              {TYPE_LABELS[entry.type]}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{entry.eventName}</span>
                          </div>
                          <h3 className="mt-2 font-black text-slate-950 dark:text-white">{entry.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{entry.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(entryPath(role, entry))}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-blue-500/10"
                        >
                          Open
                          <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
