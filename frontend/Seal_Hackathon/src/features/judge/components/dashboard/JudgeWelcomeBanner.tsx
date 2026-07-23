import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";

import { JudgePageHero } from "../common/JudgePageHero";
import { JudgeProgressRing } from "../common/JudgeProgressRing";

interface JudgeWelcomeBannerProps {
  judgeName: string;
  gradingProgressPercent: number;
  totalScorecards: number;
  completedScorecards: number;
  calibrationBlocked: boolean;
  onStartGrading: () => void;
  onStartCalibration: () => void;
}

export const JudgeWelcomeBanner = ({
  judgeName,
  gradingProgressPercent,
  totalScorecards,
  completedScorecards,
  calibrationBlocked,
  onStartGrading,
  onStartCalibration,
}: JudgeWelcomeBannerProps) => {
  return (
    <JudgePageHero
      eyebrow="Judging cockpit"
      title={`Welcome back, ${judgeName}`}
      subtitle={
        totalScorecards > 0
          ? `${completedScorecards} of ${totalScorecards} scorecards completed. Keep the momentum going.`
          : "No scorecards assigned yet. You will see your grading queue here once assigned."
      }
      chips={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <GavelOutlinedIcon sx={{ fontSize: 14 }} />
          Judge workspace
        </span>
      }
      actions={
        <div className="flex items-center gap-5">
          <JudgeProgressRing percent={gradingProgressPercent} size={88} />
          <button
            type="button"
            onClick={calibrationBlocked ? onStartCalibration : onStartGrading}
            className="jd-press inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlayArrowOutlinedIcon sx={{ fontSize: 18 }} />
            {calibrationBlocked ? "Complete Calibration First" : "Start Grading"}
          </button>
        </div>
      }
    />
  );
};
