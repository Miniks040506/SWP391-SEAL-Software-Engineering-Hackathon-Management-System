import type { CSSProperties } from "react";

import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import Button from "@mui/material/Button";

export type MentorScheduleItem = {
  id: string;
  date: string;
  title: string;
  context: string;
};

type MentorScheduleCardProps = {
  scheduleItems: MentorScheduleItem[];
  onViewSchedule: () => void;
};

/**
 * Upcoming schedule as a compact vertical timeline: left rail of dots,
 * the next entry breathing with the live-dot pulse.
 */
export const MentorScheduleCard = ({ scheduleItems, onViewSchedule }: MentorScheduleCardProps) => {
  return (
    <section
      className="mt-fade-up rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--mt-stagger": 6 } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
          Upcoming Schedule
        </h2>
        <Button
          variant="text"
          size="small"
          onClick={onViewSchedule}
          sx={{ fontWeight: 700, textTransform: "none" }}
        >
          View All
        </Button>
      </div>

      <div className="mt-5">
        {scheduleItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700">
            <EventOutlinedIcon className="mt-pop text-slate-400 dark:text-slate-500" />
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No deadlines in the next 30 days.
            </p>
          </div>
        )}

        {scheduleItems.length > 0 && (
          <ol className="relative space-y-6 border-l border-slate-200 pl-5 dark:border-slate-700/80">
            {scheduleItems.map((item, index) => (
              <li
                key={item.id}
                className="mt-fade-up relative"
                style={{ "--mt-stagger": 7 + index } as CSSProperties}
              >
                <span
                  className={`absolute -left-[26.5px] top-1 inline-block h-2.5 w-2.5 rounded-full ${
                    index === 0
                      ? "mt-live-dot bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {item.date}
                </p>
                <p className="mt-1 font-extrabold text-slate-950 dark:text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.context}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};
