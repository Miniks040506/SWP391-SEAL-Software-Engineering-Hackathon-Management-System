import { Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
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

export function DashboardSystemModules() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">System</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Administrative tools and system configurations.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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