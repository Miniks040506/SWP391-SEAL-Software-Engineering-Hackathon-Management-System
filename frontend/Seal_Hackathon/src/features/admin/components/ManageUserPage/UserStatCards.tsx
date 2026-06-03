import { Skeleton } from "@mui/material";

function StatCard({
  label,
  count,
  sub,
  accent,
  isLoading,
}: {
  label: string;
  count: number;
  sub: string;
  accent: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <div className={`text-xs font-bold uppercase tracking-widest ${accent}`}>
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-300">
        {isLoading ? (
          <Skeleton
            variant="text"
            width={40}
            height={44}
            className="dark:bg-slate-600"
          />
        ) : (
          count
        )}
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-300">{sub}</div>
    </div>
  );
}

export function UserStatCards({
  adminStats,
  studentStats,
  mentorStats,
  judgeStats,
  coordinatorStats,
  isLoading,
}: {
  adminStats: { totalElements: number } | undefined;
  studentStats: { totalElements: number } | undefined;
  mentorStats: { totalElements: number } | undefined;
  judgeStats: { totalElements: number } | undefined;
  coordinatorStats: { totalElements: number } | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
      <StatCard
        label="Administrators"
        count={adminStats?.totalElements ?? 0}
        sub="Active"
        accent="text-red-600 dark:text-red-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Students"
        count={studentStats?.totalElements ?? 0}
        sub="Registered"
        accent="text-green-600 dark:text-green-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Mentors"
        count={mentorStats?.totalElements ?? 0}
        sub="Assigned"
        accent="text-pink-600 dark:text-pink-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Judges"
        count={judgeStats?.totalElements ?? 0}
        sub="Invited"
        accent="text-yellow-600 dark:text-yellow-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Event Coordinators"
        count={coordinatorStats?.totalElements ?? 0}
        sub="Assigned"
        accent="text-indigo-600 dark:text-indigo-400"
        isLoading={isLoading}
      />
    </div>
  );
}
