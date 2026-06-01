import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";

// Icons
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

import { useAdminDashboard, type PendingRequest } from "../hooks/useAdminDashboard";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isLoading, stats, auditLogs, pendingRequests } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-transparent">
        <CircularProgress />
      </div>
    );
  }

  const getSoftBadgeStyle = (type: PendingRequest["type"]) => {
    switch (type) {
      case "STUDENT_REGISTRATION":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "ROLE_UPGRADE":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 dark:bg-transparent min-h-[calc(100vh-64px)] transition-colors">
      {/* ─── Header Section ───────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-7 text-white shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
            System Administration
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Welcome back, Admin!
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            System overview, user management, and pending administrative tasks across the SEAL platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="contained"
            className="!bg-white !text-blue-600 hover:!bg-blue-50 !normal-case !rounded-lg !font-semibold"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </Button>
        </div>
      </section>

      {/* ─── Users by Role Breakdown ──────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">Users by Role</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Distribution of {stats.totalCount} registered accounts across the system.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <RoleCard title="ADMINISTRATORS" count={stats.adminCount} subtitle="Active" colorClass="text-red-600 dark:text-red-400" />
          <RoleCard title="STUDENTS" count={stats.studentCount} subtitle="Registered" colorClass="text-green-600 dark:text-green-400" />
          <RoleCard title="MENTORS" count={stats.mentorCount} subtitle="Assigned" colorClass="text-pink-600 dark:text-pink-400" />
          <RoleCard title="JUDGES" count={stats.judgeCount} subtitle="Invited" colorClass="text-amber-600 dark:text-amber-400" />
          <RoleCard title="EVENT COORDINATORS" count={stats.coordinatorCount} subtitle="Assigned" colorClass="text-indigo-600 dark:text-indigo-400" />
        </div>
      </section>

      {/* ─── Pending Users & Audit Logs Grid ──────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* Left Column (Span 2) - Pending Users */}
        <div className="xl:col-span-2 space-y-6">
          <Card variant="outlined" className="border-slate-100 dark:border-slate-700 !bg-white dark:!bg-slate-800 shadow-sm rounded-xl h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">
                    Pending Users
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Users waiting for approval. Read-only view.
                  </p>
                </div>
                <Button 
                  variant="text" 
                  size="small"
                  endIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
                  className="!text-slate-500 dark:!text-slate-400 hover:!bg-slate-50 dark:hover:!bg-slate-700/50 !font-semibold !normal-case !tracking-normal"
                  onClick={() => navigate('/admin/users?status=PENDING_APPROVAL')}
                >
                  Manage Users
                </Button>
              </div>

              <div className="flex-1 flex flex-col">
                {pendingRequests.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No pending users. You're all caught up!
                  </div>
                ) : (
                  pendingRequests.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${
                        index !== pendingRequests.length - 1 ? "border-b border-slate-100 dark:border-slate-700/50" : ""
                      }`}
                    >
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[15px]">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
                          Submitted on {item.submittedAt}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-[4px] text-[10px] font-extrabold uppercase tracking-widest shrink-0 ${getSoftBadgeStyle(
                          item.type
                        )}`}
                      >
                        {item.type.replace("_", " ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Span 1) - Audit Logs */}
        <Card variant="outlined" className="border-slate-100 dark:border-slate-700 !bg-white dark:!bg-slate-800 shadow-sm rounded-xl h-full">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">
                  Audit Logs
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Recent system events.
                </p>
              </div>
              <Button 
                variant="text" 
                size="small"
                endIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
                className="!text-slate-500 dark:!text-slate-400 hover:!bg-slate-50 dark:hover:!bg-slate-700/50 !font-semibold !normal-case !tracking-normal"
                onClick={() => navigate('/admin/audit-logs')}
              >
                View Full Logs
              </Button>
            </div>

            <div className="flex-1 space-y-6">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No audit logs available.</p>
              ) : (
                auditLogs.slice(0, 2).map((log) => (
                  <div key={log.id} className="relative border-l border-slate-200 dark:border-slate-700 pl-4">
                    <div className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ${
                      log.type === 'AUTH' ? 'bg-blue-500' :
                      log.type === 'SYSTEM' ? 'bg-purple-500' :
                      log.type === 'UPDATE' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.actor}
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {log.action}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </section>

      {/* ─── System Modules Quick Access ──────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">System</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Administrative tools and system configurations.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <SystemMenuCard 
            title="Audit Logs" 
            icon={<ManageSearchOutlinedIcon fontSize="medium" />} 
            onClick={() => navigate('/admin/audit-logs')} 
          />
          <SystemMenuCard 
            title="System Config" 
            icon={<SettingsOutlinedIcon fontSize="medium" />} 
            onClick={() => navigate('/admin/system-config')} 
          />
          <SystemMenuCard 
            title="Health" 
            icon={<HealthAndSafetyOutlinedIcon fontSize="medium" />} 
            onClick={() => navigate('/admin/health')} 
          />
          <SystemMenuCard 
            title="Criteria" 
            icon={<FactCheckOutlinedIcon fontSize="medium" />} 
            onClick={() => navigate('/admin/criteria')} 
          />
          <SystemMenuCard 
            title="Exports" 
            icon={<AssessmentOutlinedIcon fontSize="medium" />} 
            onClick={() => navigate('/admin/exports')} 
          />
        </div>
      </section>

    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function RoleCard({ title, count, subtitle, colorClass }: { title: string; count: number; subtitle: string; colorClass: string }) {
  return (
    <Card variant="outlined" className="border-slate-100 dark:border-slate-700 !bg-white dark:!bg-slate-800 shadow-sm rounded-xl">
      <CardContent className="p-5">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${colorClass}`}>
          {title}
        </p>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{count}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function SystemMenuCard({ title, icon, onClick }: { title: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Card 
      variant="outlined" 
      className="border-slate-100 dark:border-slate-700 !bg-white dark:!bg-slate-800 shadow-sm rounded-xl cursor-pointer hover:!bg-slate-50 dark:hover:!bg-slate-700/50 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-full">
        <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </span>
      </CardContent>
    </Card>
  );
}