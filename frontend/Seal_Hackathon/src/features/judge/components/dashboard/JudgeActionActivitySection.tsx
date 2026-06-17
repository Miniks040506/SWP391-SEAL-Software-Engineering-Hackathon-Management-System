import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";

export type DashboardPriority = "High" | "Medium" | "Low";

export type JudgePendingAction = {
  id: string;
  title: string;
  description: string;
  priority: DashboardPriority;
  actionLabel: string;
  path: string;
};

export type JudgeRecentActivity = {
  id: string;
  time: string;
  title: string;
  description: string;
};

type JudgeActionActivitySectionProps = {
  pendingActions: JudgePendingAction[];
  recentActivities: JudgeRecentActivity[];
  onNavigate: (path: string) => void;
};

function getPriorityColor(priority: DashboardPriority) {
  switch (priority) {
    case "High": return "error";
    case "Medium": return "warning";
    case "Low": return "success";
    default: return "default";
  }
}

export const JudgeActionActivitySection = ({
  pendingActions,
  recentActivities,
  onNavigate,
}: JudgeActionActivitySectionProps) => {
  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
        <CardContent>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Pending Actions</h2>
          <div className="mt-5 space-y-3">
            {pendingActions.map((action) => (
              <button key={action.id} type="button" onClick={() => onNavigate(action.path)} className="w-full rounded-2xl border border-gray-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:bg-slate-800/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{action.title}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{action.description}</p>
                  </div>
                  <Chip size="small" color={getPriorityColor(action.priority)} label={action.priority} />
                </div>
                <p className="mt-3 text-sm font-bold text-blue-600">{action.actionLabel}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
        <CardContent>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-5 space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{activity.time}</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">{activity.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{activity.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};