import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { scheduleApi } from "@/api/schedule.api";
import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import { WeeklyTimetable } from "@/features/schedule/components/WeeklyTimetable";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/auth.types";
import type { ScheduleEntry, ScheduleEntryType } from "@/types/schedule.types";
import "../styles/schedule.css";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function entryPath(role: UserRole | undefined, entry: ScheduleEntry) {
  if (role === "STUDENT" || role === "PARTICIPANT") {
    return `/events/${entry.eventId}/competing`;
  }
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

function roleCopy(role: UserRole | undefined) {
  if (role === "STUDENT" || role === "PARTICIPANT") {
    return {
      eyebrow: "Competition planning",
      title: "Team",
      accentTitle: "Schedule",
      description: "Registration windows, competition rounds, and submission deadlines for your active teams.",
    };
  }
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
  const [weekDir, setWeekDir] = useState<"next" | "prev">("next");
  const [now] = useState(() => Date.now());
  const [eventId, setEventId] = useState("ALL");
  const [type, setType] = useState<ScheduleEntryType | "ALL">("ALL");

  const rangeStart = startOfWeek(week, { weekStartsOn: 1 });
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

  const nextEntry = filteredEntries.find((entry) => new Date(entry.startAt).getTime() >= now);

  return (
    <div className="space-y-6 pb-10">
      <div className="ps-head">
        <AdminOperationsHeader
          {...copy}
          icon={<CalendarMonthOutlinedIcon fontSize="inherit" />}
          actions={
            <Button
              variant="contained"
              onClick={() => {
                const today = startOfWeek(new Date(), { weekStartsOn: 1 });
                setWeekDir(today < rangeStart ? "prev" : "next");
                setWeek(today);
              }}
              sx={{ borderRadius: 2.5, px: 2.25, fontWeight: 800, textTransform: "none" }}
            >
              Today
            </Button>
          }
        />
      </div>

      <section className="ps-panel overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous week"
                  onClick={() => {
                    setWeekDir("prev");
                    setWeek((value) => addWeeks(value, -1));
                  }}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10"
                >
                  <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
                </button>
                <h2
                  aria-live="polite"
                  className="min-w-52 text-center text-lg font-black text-slate-950 dark:text-white sm:min-w-60 sm:text-xl"
                >
                  {format(rangeStart, "MMM d")} - {format(rangeEnd, "MMM d, yyyy")}
                </h2>
                <button
                  type="button"
                  aria-label="Next week"
                  onClick={() => {
                    setWeekDir("next");
                    setWeek((value) => addWeeks(value, 1));
                  }}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/10"
                >
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                <span>{filteredEntries.length} items</span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>{filteredEntries.filter((entry) => entry.type === "DEADLINE").length} deadlines</span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>{nextEntry ? `Next ${format(new Date(nextEntry.startAt), "EEE, HH:mm")}` : "Week clear"}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Filter by event
                <select
                  value={eventId}
                  onChange={(event) => setEventId(event.target.value)}
                  className="mt-1.5 h-10 w-full min-w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="ALL">All events</option>
                  {events.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Filter by type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as ScheduleEntryType | "ALL")}
                  className="mt-1.5 h-10 w-full min-w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="ALL">All types</option>
                  <option value="EVENT">Event</option>
                  <option value="ROUND">Round</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="CALIBRATION">Calibration</option>
                  <option value="REMINDER">Reminder</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                </select>
              </label>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-400">
            Times shown in {TIMEZONE}. Select any timetable item to open its source page.
          </p>
        </div>

        {scheduleQuery.isLoading ? (
          <div className="ps-skeleton grid min-h-96 grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800 sm:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }, (_, day) => (
              <div key={day} className="space-y-3 p-3">
                <Skeleton width="70%" height={42} />
                <Skeleton variant="rounded" height={112} />
                <Skeleton variant="rounded" height={88} />
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
        ) : (
          <div
            key={rangeStart.toISOString()}
            className={weekDir === "next" ? "ps-week-next" : "ps-week-prev"}
          >
            <WeeklyTimetable
              entries={filteredEntries}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              highlightEntryId={nextEntry?.id}
              onOpen={(entry) => navigate(entryPath(role, entry))}
            />
          </div>
        )}
      </section>
    </div>
  );
}
