import { useNavigate } from "react-router-dom";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

function SystemMenuCard({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="group flex min-h-28 cursor-pointer flex-col items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10"
      onClick={onClick}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition-colors group-hover:text-blue-600 dark:bg-slate-900 dark:text-slate-500 dark:group-hover:text-blue-400">
        {icon}
      </div>
      <span className="flex w-full items-end justify-between gap-2 text-sm font-bold text-slate-700 transition-colors group-hover:text-blue-700 dark:text-slate-300 dark:group-hover:text-blue-400">
        {title}
        <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
      </span>
    </button>
  );
}

export function DashboardSystemModules() {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10">
          <GridViewOutlinedIcon
            className="text-cyan-600 dark:text-cyan-400"
            sx={{ fontSize: 20 }}
          />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            System Tools
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administrative tools and system configurations.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SystemMenuCard
          title="Audit Logs"
          icon={<ManageSearchOutlinedIcon fontSize="medium" />}
          onClick={() => navigate("/admin/audit-logs")}
        />
        <SystemMenuCard
          title="System Config"
          icon={<SettingsOutlinedIcon fontSize="medium" />}
          onClick={() => navigate("/admin/system-config")}
        />
        <SystemMenuCard
          title="Health"
          icon={<HealthAndSafetyOutlinedIcon fontSize="medium" />}
          onClick={() => navigate("/admin/health")}
        />
        <SystemMenuCard
          title="Criteria"
          icon={<FactCheckOutlinedIcon fontSize="medium" />}
          onClick={() => navigate("/admin/criteria")}
        />
        <SystemMenuCard
          title="Exports"
          icon={<AssessmentOutlinedIcon fontSize="medium" />}
          onClick={() => navigate("/admin/exports")}
        />
      </div>
    </section>
  );
}
