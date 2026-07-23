import type { CSSProperties } from "react";
import Button from "@mui/material/Button";

type MentorWelcomeBannerProps = {
  mentorName: string;
  onViewTeams: () => void;
  onViewSubmissions: () => void;
};

/**
 * Mentor cockpit hero: gradient surface + blurred orb, live-mentoring
 * cluster and the two primary navigation CTAs.
 */
export const MentorWelcomeBanner = ({
  mentorName,
  onViewTeams,
  onViewSubmissions,
}: MentorWelcomeBannerProps) => {
  return (
    <header
      className="mt-fade-up relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6 md:p-8 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40"
      style={{ "--mt-stagger": 0 } as CSSProperties}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-indigo-500/10" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Mentor Cockpit
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Welcome back, {mentorName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
            Here&apos;s what your teams have been up to.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 lg:flex-col lg:items-end lg:gap-3">
          <div className="flex items-center gap-2.5">
            <span className="mt-live-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Mentoring active
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="contained"
              onClick={onViewTeams}
              sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
            >
              View Teams
            </Button>
            <Button
              variant="outlined"
              onClick={onViewSubmissions}
              sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
            >
              View Submissions
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
