import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";

export type PendingActionType = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  path: string;
  priority: "High" | "Medium" | "Low";
};

const getPriorityColor = (priority: PendingActionType["priority"]) => {
  switch (priority) {
    case "High": return "error";
    case "Medium": return "warning";
    default: return "default";
  }
};

export function DashboardPendingActions({ actions }: { actions: PendingActionType[] }) {
  const navigate = useNavigate();

  return (
    <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Pending Actions</h2>
        <div className="mt-5 space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => navigate(action.path)}
              className="w-full rounded-2xl border border-gray-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
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
  );
}