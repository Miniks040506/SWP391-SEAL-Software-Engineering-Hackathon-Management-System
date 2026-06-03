import { Card, CardContent, Skeleton } from "@mui/material";
import type { AdminUserStats } from "@/types/user.types";

function RoleCard({
  title,
  count,
  subtitle,
  colorClass,
  isLoading,
}: {
  title: string;
  count: number;
  subtitle: string;
  colorClass: string;
  isLoading?: boolean;
}) {
  return (
    <Card
      variant="outlined"
      className="border-slate-100 dark:border-slate-700 bg-white! dark:bg-slate-800! shadow-sm rounded-xl"
    >
      <CardContent className="p-5">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${colorClass}`}>
          {title}
        </p>
        {isLoading ? (
          <Skeleton variant="text" width={40} height={44} />
        ) : (
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{count}</h2>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardRoleCards({
  stats,
  isLoading,
}: {
  stats: AdminUserStats;
  isLoading?: boolean;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">Users by Role</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {isLoading
            ? "Distribution of users across the system."
            : `Distribution of ${stats.totalCount} registered accounts across the system.`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <RoleCard title="ADMINISTRATORS" count={stats.adminCount} subtitle="Active" colorClass="text-red-600 dark:text-red-400" isLoading={isLoading} />
        <RoleCard title="STUDENTS" count={stats.studentCount} subtitle="Registered" colorClass="text-green-600 dark:text-green-400" isLoading={isLoading} />
        <RoleCard title="MENTORS" count={stats.mentorCount} subtitle="Assigned" colorClass="text-pink-600 dark:text-pink-400" isLoading={isLoading} />
        <RoleCard title="JUDGES" count={stats.judgeCount} subtitle="Invited" colorClass="text-amber-600 dark:text-amber-400" isLoading={isLoading} />
        <RoleCard title="EVENT COORDINATORS" count={stats.coordinatorCount} subtitle="Assigned" colorClass="text-indigo-600 dark:text-indigo-400" isLoading={isLoading} />
      </div>
    </section>
  );
}