import type { CSSProperties } from "react";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

import type { JudgeDashboardData } from "../../schemas/judgeDashboard.schema";

interface JudgeActionActivitySectionProps {
  pendingActions: JudgeDashboardData["pendingActions"];
  recentActivities: JudgeDashboardData["recentActivities"];
  onNavigate: (path: string) => void;
}

export const JudgeActionActivitySection = ({
  pendingActions,
  recentActivities,
  onNavigate,
}: JudgeActionActivitySectionProps) => {
  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div
        className="jd-fade-up rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700/80 dark:bg-slate-900"
        style={{ "--jd-stagger": 7 } as CSSProperties}
      >
        <h2 className="text-base font-black text-slate-950 dark:text-white">Pending Actions</h2>
        <div className="mt-4 space-y-3">
          {pendingActions.map((action, index) => {
            const isHigh = action.priority === "High";
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.path)}
                className={`jd-fade-up jd-lift jd-press w-full cursor-pointer rounded-xl border p-4 text-left ${
                  isHigh
                    ? "jd-glow-amber border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5"
                    : "border-slate-200 bg-slate-50/60 dark:border-slate-700/70 dark:bg-slate-800/40"
                }`}
                style={{ "--jd-stagger": 8 + index } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">{action.title}</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                      isHigh
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {action.priority}
                  </span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                  {action.actionLabel}
                  <ArrowForwardOutlinedIcon sx={{ fontSize: 15 }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="jd-fade-up rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700/80 dark:bg-slate-900"
        style={{ "--jd-stagger": 8 } as CSSProperties}
      >
        <h2 className="text-base font-black text-slate-950 dark:text-white">Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
            <NotificationsNoneOutlinedIcon
              className="text-slate-300 dark:text-slate-600"
              sx={{ fontSize: 36 }}
            />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No recent notifications
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Grading and calibration updates will appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentActivities.map((activity, index) => (
              <li
                key={activity.id}
                className="jd-fade-up rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700/70 dark:bg-slate-800/40"
                style={{ "--jd-stagger": 9 + index } as CSSProperties}
              >
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {activity.time}
                </p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{activity.title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {activity.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
