import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { Skeleton } from "@mui/material";
import type { ReactNode } from "react";

function StatCard({
  label,
  count,
  sub,
  icon,
  accent,
  iconWrap,
  isLoading,
}: {
  label: string;
  count: number;
  sub: string;
  icon: ReactNode;
  accent: string;
  iconWrap: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.12em] ${accent}`}
        >
          {label}
        </p>
        <p className="text-2xl font-black leading-tight text-slate-900 tabular-nums dark:text-white">
          {isLoading ? (
            <Skeleton
              variant="text"
              width={32}
              height={32}
              className="dark:bg-slate-700"
            />
          ) : (
            count
          )}
        </p>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Administrators"
        count={adminStats?.totalElements ?? 0}
        sub="Active"
        icon={<AdminPanelSettingsOutlinedIcon className="text-rose-500" />}
        iconWrap="bg-rose-50 dark:bg-rose-500/10"
        accent="text-rose-600 dark:text-rose-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Students"
        count={studentStats?.totalElements ?? 0}
        sub="Registered"
        icon={<SchoolOutlinedIcon className="text-emerald-500" />}
        iconWrap="bg-emerald-50 dark:bg-emerald-500/10"
        accent="text-emerald-600 dark:text-emerald-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Mentors"
        count={mentorStats?.totalElements ?? 0}
        sub="Assigned"
        icon={<SupervisorAccountOutlinedIcon className="text-pink-500" />}
        iconWrap="bg-pink-50 dark:bg-pink-500/10"
        accent="text-pink-600 dark:text-pink-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Judges"
        count={judgeStats?.totalElements ?? 0}
        sub="Invited"
        icon={<GavelOutlinedIcon className="text-amber-500" />}
        iconWrap="bg-amber-50 dark:bg-amber-500/10"
        accent="text-amber-600 dark:text-amber-400"
        isLoading={isLoading}
      />
      <StatCard
        label="Coordinators"
        count={coordinatorStats?.totalElements ?? 0}
        sub="Assigned"
        icon={<WorkspacePremiumOutlinedIcon className="text-violet-500" />}
        iconWrap="bg-violet-50 dark:bg-violet-500/10"
        accent="text-violet-600 dark:text-violet-400"
        isLoading={isLoading}
      />
    </div>
  );
}
