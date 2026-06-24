interface JudgeSubmissionProgressCellProps {
  confirmedScoreCount: number;
  criteriaCount: number;
  gradingStatus: string;
}

export const JudgeSubmissionProgressCell = ({
  confirmedScoreCount,
  criteriaCount,
  gradingStatus,
}: JudgeSubmissionProgressCellProps) => {
  const progress = criteriaCount > 0 ? (confirmedScoreCount / criteriaCount) * 100 : 0;

  let progressColor = "bg-blue-600";
  if (gradingStatus === "GRADED" || progress === 100) {
    progressColor = "bg-green-500";
  } else if (gradingStatus === "READY") {
    progressColor = "bg-amber-500";
  }

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-[140px]">
      <span className="text-xs text-gray-600 font-medium">
        {confirmedScoreCount} / {criteriaCount} criteria completed
      </span>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`${progressColor} h-1.5 rounded-full transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
