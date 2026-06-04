import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import type { JudgeCalibration } from "../../schemas/judgeDashboard.schema";

type JudgeCalibrationCardProps = {
  calibration: JudgeCalibration;
  onStartCalibration: () => void;
  onStartGrading: () => void;
};

export const JudgeCalibrationCard = ({
  calibration,
  onStartCalibration,
  onStartGrading,
}: JudgeCalibrationCardProps) => {
  const shouldShowRequiredState = calibration.required && !calibration.completed;

  return (
    <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent>
        <div className="mb-5 flex items-center gap-3">
          <ScienceOutlinedIcon
            className={
              calibration.completed ? "text-emerald-500" : "text-amber-500"
            }
          />

          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Calibration
          </h2>
        </div>

        {shouldShowRequiredState ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="font-extrabold text-amber-800 dark:text-amber-200">
                  Calibration Required
                </h3>

                <p className="mt-2 text-sm text-amber-700 dark:text-amber-200/80">
                  You must complete the calibration round before official
                  grading.
                </p>

                <p className="mt-4 text-sm font-bold text-amber-800 dark:text-amber-200">
                    Status: {calibration.status}
                </p>

                <Button
                  variant="contained"
                  onClick={onStartCalibration}
                  sx={{
                    mt: 3,
                    bgcolor: "#d97706",
                    textTransform: "none",
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: "#b45309",
                    },
                  }}
                >
                  Start Calibration
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex items-start gap-3">
              <CheckCircleOutlineOutlinedIcon className="text-emerald-600" />

              <div>
                <h3 className="font-extrabold text-emerald-800 dark:text-emerald-200">
                  Calibration Completed
                </h3>

                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200/80">
                  You can now start official grading.
                </p>

                <p className="mt-4 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Status: Completed
                </p>

                <Button
                  variant="contained"
                  onClick={onStartGrading}
                  sx={{
                    mt: 3,
                    bgcolor: "#059669",
                    textTransform: "none",
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: "#047857",
                    },
                  }}
                >
                  Start Grading
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};