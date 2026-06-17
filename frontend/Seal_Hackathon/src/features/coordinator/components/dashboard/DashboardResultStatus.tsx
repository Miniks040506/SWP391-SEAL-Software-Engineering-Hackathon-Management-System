import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

export type ResultStatusType = {
  round: string;
  rankingCalculated: number;
  awardsAssigned: number;
  published: number;
};

export function DashboardResultStatus({ status }: { status: ResultStatusType }) {
  return (
    <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent>
        <div className="mb-5 flex items-center gap-3">
          <EmojiEventsOutlinedIcon className="text-amber-500" />
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Result Status</h2>
        </div>

        <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{status.round}</p>

        <div className="mt-5 space-y-4">
          {[
            ["Ranking", status.rankingCalculated],
            ["Awards", status.awardsAssigned],
            ["Published", status.published],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{value}%</span>
              </div>
              <LinearProgress
                variant="determinate"
                value={value as number}
                sx={{ height: 7, borderRadius: 999, bgcolor: "#e5e7eb" }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}