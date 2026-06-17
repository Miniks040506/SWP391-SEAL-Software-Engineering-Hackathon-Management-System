import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export type MentorScheduleItem = {
  id: string;
  date: string;
  title: string;
  context: string;
};

type MentorScheduleCardProps = {
  scheduleItems: MentorScheduleItem[];
  onViewSchedule: () => void;
};

export const MentorScheduleCard = ({ scheduleItems, onViewSchedule }: MentorScheduleCardProps) => {
  return (
    <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Upcoming Schedule
          </h2>
          <Button variant="text" size="small" onClick={onViewSchedule} sx={{ fontWeight: 800, textTransform: "none" }}>
            View All
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {scheduleItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <EventOutlinedIcon />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{item.date}</p>
                  <p className="mt-1 font-bold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{item.context}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};