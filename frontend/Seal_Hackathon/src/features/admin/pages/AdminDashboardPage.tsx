import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { DashboardRoleCards } from "../components/AdminDashboard/DashboardRoleCards";
import { DashboardPendingUsers } from "../components/AdminDashboard/DashboardPendingUsers";
import { DashboardAuditLogs } from "../components/AdminDashboard/DashboardAuditLogs";
import { DashboardSystemModules } from "../components/AdminDashboard/DashboardSystemModules";

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
    <div className="space-y-8 p-6 bg-slate-50 dark:bg-transparent min-h-[calc(100vh-64px)] transition-colors">
      <section className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-7 text-white shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
            System Administration
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Welcome back, Admin!
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            System overview, user management, and pending administrative tasks
            across the SEAL platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="contained"
            className="bg-white! text-blue-600! hover:bg-blue-50! normal-case! rounded-lg! font-semibold!"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </Button>
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
