import { useNavigate } from "react-router-dom";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import type { ReactNode } from "react";

import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { DashboardRoleCards } from "../components/AdminDashboard/DashboardRoleCards";
import { DashboardPendingUsers } from "../components/AdminDashboard/DashboardPendingUsers";
import { DashboardAuditLogs } from "../components/AdminDashboard/DashboardAuditLogs";
import { DashboardSystemModules } from "../components/AdminDashboard/DashboardSystemModules";

function OverviewChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
      <span className="text-white/80">{icon}</span>
      <div className="leading-tight">
        <p className="text-sm font-black text-white tabular-nums">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {label}
        </p>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const {
    isStatsLoading,
    isPendingLoading,
    isAuditLoading,
    stats,
    auditLogs,
    pendingRequests,
  } = useAdminDashboard();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-6 shadow-lg sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">
                System Administrator Dashboard
              </p>
              <h1 className="mt-3 flex items-center gap-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-[2.6rem]">
                <AdminPanelSettingsOutlinedIcon
                  sx={{ fontSize: 38 }}
                  className="text-blue-300"
                />
                Platform{" "}
                <span className="bg-linear-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  Control Center
                </span>
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-400 sm:text-base">
                Monitor accounts, resolve approval requests and manage system
                operations across the SEAL platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Manage Users
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/audit-logs")}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Review Audit Logs
                <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <OverviewChip
              icon={<GroupOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Total Accounts"
              value={stats.totalCount}
            />
            <OverviewChip
              icon={<PendingActionsOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Pending Approval"
              value={stats.pendingApprovalCount}
            />
            <OverviewChip
              icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Suspended"
              value={stats.suspendedCount}
            />
          </div>
        </div>
      </section>

      <DashboardRoleCards stats={stats} isLoading={isStatsLoading} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardPendingUsers
            pendingRequests={pendingRequests}
            isLoading={isPendingLoading}
          />
        </div>
        <DashboardAuditLogs auditLogs={auditLogs} isLoading={isAuditLoading} />
      </section>

      <DashboardSystemModules />
    </div>
  );
}

export default AdminDashboardPage;
