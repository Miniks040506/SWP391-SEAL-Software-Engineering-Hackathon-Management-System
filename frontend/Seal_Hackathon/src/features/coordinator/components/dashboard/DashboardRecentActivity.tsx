import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export type RecentActivityType = {
  id: string;
  time: string;
  title: string;
  description: string;
};

export function DashboardRecentActivity({ activities }: { activities: RecentActivityType[] }) {
  return (
    <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="mt-5 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{activity.time}</p>
              <p className="mt-1 font-bold text-gray-900 dark:text-white">{activity.title}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{activity.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}