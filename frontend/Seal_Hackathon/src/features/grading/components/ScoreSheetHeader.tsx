import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

type Props = {
  submission: any;
  isLocked: boolean;
};

export const ScoreSheetHeader = ({ submission, isLocked }: Props) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
          <span>{submission.eventName}</span>
          <span className="text-gray-300 dark:text-slate-700">•</span>
          <span>{submission.roundName}</span>
          <span className="text-gray-300 dark:text-slate-700">•</span>
          <span>{submission.trackName}</span>
        </div>
        <Typography variant="h4" className="font-extrabold text-gray-900 dark:text-white">
          {submission.title}
        </Typography>
        <Typography variant="subtitle1" className="mt-1 font-medium text-gray-500 dark:text-slate-400">
          Team: {submission.teamName}
        </Typography>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip label={submission.submissionStatus} size="small" color="primary" variant="outlined" sx={{ fontWeight: "bold" }} />
        <Chip label={submission.gradingStatus} size="small" color="secondary" variant="outlined" sx={{ fontWeight: "bold" }} />
        {isLocked && <Chip label="Locked" size="small" color="error" sx={{ fontWeight: "bold" }} />}
      </div>
    </div>
  );
};
